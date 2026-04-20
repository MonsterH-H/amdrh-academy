import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-helpers";

// GET /api/admin/certificates/[id] — get single certificate
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole(req, ["ADMIN"]);
  if (!auth.authorized) return auth.response;
  try {
    const { id } = await params;
    const certificate = await db.certificate.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, nom: true, prenom: true, email: true, role: true } },
      },
    });
    if (!certificate) {
      return NextResponse.json({ error: "Certificat introuvable" }, { status: 404 });
    }
    return NextResponse.json({ certificate });
  } catch (error) {
    console.error("Admin certificate GET error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PATCH /api/admin/certificates/[id] — revoke/reactivate
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole(req, ["ADMIN"]);
  if (!auth.authorized) return auth.response;
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, revokeReason } = body;

    const certificate = await db.certificate.findUnique({ where: { id } });
    if (!certificate) {
      return NextResponse.json({ error: "Certificat introuvable" }, { status: 404 });
    }

    const validStatuses = ["ACTIVE", "REVOKED", "SUSPENDED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = { status };
    if (status === "REVOKED") {
      updateData.revokedAt = new Date();
      updateData.revokeReason = revokeReason || null;
    }
    if (status === "ACTIVE") {
      updateData.revokedAt = null;
      updateData.revokeReason = null;
    }

    const updated = await db.certificate.update({
      where: { id },
      data: updateData,
    });

    // Create notification if revoked
    if (status === "REVOKED") {
      await db.notification.create({
        data: {
          userId: certificate.userId,
          type: "CERTIFICAT",
          title: "Certificat révoqué",
          message: `Votre certificat ${certificate.code} a été révoqué. Raison: ${revokeReason || "Non spécifiée"}`,
        },
      });
    }

    if (status === "ACTIVE" && certificate.status === "REVOKED") {
      await db.notification.create({
        data: {
          userId: certificate.userId,
          type: "CERTIFICAT",
          title: "Certificat réactivé",
          message: `Votre certificat ${certificate.code} a été réactivé.`,
        },
      });
    }

    return NextResponse.json({ certificate: updated });
  } catch (error) {
    console.error("Admin certificate PATCH error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

