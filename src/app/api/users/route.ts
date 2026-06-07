import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-helpers";
import { ROLE_LABELS } from "@/lib/constants";
import bcrypt from "bcryptjs";

function generateSecurePassword(length = 12): string {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const digits = "0123456789";
  const special = "!@#$%&*?+-=";
  const all = upper + lower + digits + special;
  let password = "";
  // Guarantee at least one of each required type
  password += upper[Math.floor(Math.random() * upper.length)];
  password += lower[Math.floor(Math.random() * lower.length)];
  password += digits[Math.floor(Math.random() * digits.length)];
  password += special[Math.floor(Math.random() * special.length)];
  // Fill the rest
  for (let i = password.length; i < length; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }
  // Shuffle
  return password.split("").sort(() => Math.random() - 0.5).join("");
}

export async function GET(req: NextRequest) {
  try {
    // Auth required: only ADMIN can list users
    const auth = await requireRole(req, ["ADMIN"]);
    if (!auth.authorized) return auth.response;

    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);

    const where: Record<string, unknown> = {};
    if (role && role !== "ALL") where.role = role;
    if (status === "active") where.isActive = true;
    if (status === "inactive") where.isActive = false;
    if (search) {
      where.OR = [
        { nom: { contains: search } },
        { prenom: { contains: search } },
        { email: { contains: search } },
        { licenceNumber: { contains: search } },
      ];
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          nom: true,
          prenom: true,
          role: true,
          telephone: true,
          club: true,
          region: true,
          licenceNumber: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          _count: { select: { enrollments: true, certificates: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.user.count({ where }),
    ]);

    return NextResponse.json({
      users,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Users list error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Only ADMIN can create users
    const auth = await requireRole(req, ["ADMIN"]);
    if (!auth.authorized) return auth.response;

    const body = await req.json();
    const { email, nom, prenom, password, role, telephone, club, region, licenceNumber } = body;

    // Validate required fields
    if (!email || !nom || !prenom || !role) {
      return NextResponse.json(
        { error: "Email, nom, prénom et rôle sont requis" },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ["ADMIN", "FORMATEUR", "ARBITRE", "ENTRAINEUR", "JOUEUR"];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: `Rôle invalide. Valeurs acceptées: ${validRoles.join(", ")}` },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Un utilisateur avec cet email existe déjà" },
        { status: 409 }
      );
    }

    // Generate or use provided password
    const plainPassword = password || generateSecurePassword(12);
    const passwordHash = await bcrypt.hash(plainPassword, 12);

    const user = await db.user.create({
      data: {
        email,
        nom,
        prenom,
        role,
        telephone: telephone || null,
        club: club || null,
        region: region || null,
        licenceNumber: licenceNumber || null,
        passwordHash,
        isActive: true,
      },
      select: { id: true, email: true, nom: true, prenom: true, role: true },
    });

    // Build credentials summary
    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://amdrh-academy.ma"}/login`;
    const roleLabel = ROLE_LABELS[role] || role;
    const summaryMessage = [
      `🎓 *Compte AMDRH Academy créé*`,
      ``,
      `Bonjour ${prenom} ${nom},`,
      ``,
      `Votre compte a été créé avec succès.`,
      ``,
      `📧 *Email* : ${email}`,
      `🔑 *Mot de passe* : ${plainPassword}`,
      `📋 *Rôle* : ${roleLabel}`,
      `🔗 *Connexion* : ${loginUrl}`,
      ``,
      `Veuillez changer votre mot de passe après la première connexion.`,
    ].join("\n");

    const credentials = {
      email,
      password: plainPassword,
      role,
      roleLabel,
      loginUrl,
      summaryMessage,
    };

    return NextResponse.json({ user, credentials }, { status: 201 });
  } catch (error) {
    console.error("User create error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
