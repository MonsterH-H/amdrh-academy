import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-helpers";

// GET /api/admin/certificates — list all certificates
export async function GET(req: NextRequest) {
  const auth = await requireRole(req, ["ADMIN"]);
  if (!auth.authorized) return auth.response;
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get("limit") || "20")));
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { code: { contains: search, mode: "insensitive" } },
        { userName: { contains: search, mode: "insensitive" } },
        { courseTitle: { contains: search, mode: "insensitive" } },
        { user: { nom: { contains: search, mode: "insensitive" } } },
        { user: { prenom: { contains: search, mode: "insensitive" } } },
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
          course: {
            select: { id: true, title: true },
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
  const auth = await requireRole(req, ["ADMIN"]);
  if (!auth.authorized) return auth.response;
  try {
    const body = await req.json();
    const { userId, courseId, score, maxScore, expiryDate } = body;

    if (!userId || !courseId || score === undefined || maxScore === undefined) {
      return NextResponse.json(
        { error: "userId, courseId, score et maxScore sont requis" },
        { status: 400 }
      );
    }

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

    // Generate certificate code: AMDRH-2026-XXXXX
    const year = new Date().getFullYear();
    const count = await db.certificate.count();
    const seq = String(count + 1).padStart(5, "0");
    const code = `AMDRH-${year}-${seq}`;

    // Check uniqueness
    const existing = await db.certificate.findUnique({ where: { code } });
    const finalCode = existing ? `AMDRH-${year}-${String(count + 2).padStart(5, "0")}` : code;

    const certificate = await db.certificate.create({
      data: {
        code: finalCode,
        userId,
        courseId,
        courseTitle: course.title,
        userName: `${user.prenom} ${user.nom}`,
        userLicence: user.licenceNumber,
        score,
        maxScore,
        expiresAt: expiryDate ? new Date(expiryDate) : null,
      },
    });

    // Create notification
    await db.notification.create({
      data: {
        userId,
        type: "CERTIFICAT",
        title: "Nouveau certificat délivré",
        message: `Vous avez reçu un certificat pour le cours "${course.title}". Code : ${finalCode}`,
      },
    });

    return NextResponse.json({ certificate }, { status: 201 });
  } catch (error) {
    console.error("Admin certificates POST error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
