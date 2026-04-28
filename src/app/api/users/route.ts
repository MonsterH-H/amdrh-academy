import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-helpers";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

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

    // Hash password if provided, otherwise generate a temporary one
    const passwordHash = password
      ? await bcrypt.hash(password, 12)
      : await bcrypt.hash(crypto.randomUUID().slice(0, 16), 12);

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

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error("User create error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
