import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-helpers";
import { generateUniqueCertCode } from "@/lib/certificate-utils";

// GET /api/admin/certificates — list all certificates
export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(req, ["ADMIN"]);
    if (!auth.authorized) return auth.response;
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get("limit") || "20")));
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { code: { contains: search } },
        { userName: { contains: search } },
        { courseTitle: { contains: search } },
        { user: { nom: { contains: search } } },
        { user: { prenom: { contains: search } } },
      ];
    }

    if (dateFrom || dateTo) {
      where.issuedAt = {};
      if (dateFrom) {
        (where.issuedAt as Record<string, unknown>).gte = new Date(dateFrom);
      }
      if (dateTo) {
        (where.issuedAt as Record<string, unknown>).lte = new Date(dateTo);
      }
    }

    const [certificates, total] = await Promise.all([
      db.certificate.findMany({
        where,
        include: {
          user: {
            select: { id: true, nom: true, prenom: true, email: true, role: true },
          },
        },
        orderBy: { issuedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.certificate.count({ where }),
    ]);

    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Stats
    const [statsTotal, statsThisMonth, statsValid, statsExpired] = await Promise.all([
      db.certificate.count(),
      db.certificate.count({ where: { issuedAt: { gte: thisMonthStart } } }),
      db.certificate.count({
        where: {
          OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        },
      }),
      db.certificate.count({
        where: { expiresAt: { lt: now } },
      }),
    ]);

    return NextResponse.json({
      certificates,
      pagination: {
        page,
        totalPages: Math.ceil(total / limit),
        total,
        limit,
      },
      stats: {
        total: statsTotal,
        thisMonth: statsThisMonth,
        valid: statsValid,
        expired: statsExpired,
      },
    });
  } catch (error) {
    console.error("Admin certificates GET error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST /api/admin/certificates — create certificate manually
export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(req, ["ADMIN"]);
    if (!auth.authorized) return auth.response;
    const body = await req.json();
    const {
      userId,
      courseId,
      score,
      maxScore,
      expiryDate,
      type,
    } = body;

    if (!userId || !courseId || score === undefined || maxScore === undefined) {
      return NextResponse.json(
        { error: "userId, courseId, score et maxScore sont requis" },
        { status: 400 }
      );
    }

    // Validate type if provided
    const validTypes = ["ATTESTATION", "CERTIFICAT_COMPLETION", "DIPLOME", "CERTIFICAT"];
    const certType = type && validTypes.includes(type) ? type : "CERTIFICAT";

    // Fetch user and course
    const [user, course] = await Promise.all([
      db.user.findUnique({ where: { id: userId } }),
      db.course.findUnique({ where: { id: courseId } }),
    ]);

    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }
    if (!course) {
      return NextResponse.json({ error: "Cours introuvable" }, { status: 404 });
    }

    // Generate unique certificate code
    const certCode = await generateUniqueCertCode();

    const certificate = await db.certificate.create({
      data: {
        code: certCode,
        type: certType,
        status: "ACTIVE",
        userId,
        courseId,
        courseTitle: course.title,
        userName: `${user.prenom} ${user.nom}`,
        userLicence: user.licenceNumber,
        score,
        maxScore,
        expiresAt: expiryDate ? new Date(expiryDate) : null,
        qrCodeUrl: `/verify/${certCode}`,
      },
    });

    // Create notification
    const typeLabels: Record<string, string> = {
      ATTESTATION: "attestation de réussite",
      CERTIFICAT_COMPLETION: "certificat de complétion",
      DIPLOME: "diplôme",
      CERTIFICAT: "certificat",
    };
    await db.notification.create({
      data: {
        userId,
        type: "CERTIFICAT",
        title: `Nouveau ${typeLabels[certType] || "certificat"} délivré`,
        message: `Vous avez reçu un(e) ${typeLabels[certType] || "certificat"} pour le cours "${course.title}". Code : ${certCode}`,
      },
    });

    return NextResponse.json({ certificate }, { status: 201 });
  } catch (error) {
    console.error("Admin certificates POST error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
