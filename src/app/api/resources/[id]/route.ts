import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole, getUserFromRequest } from "@/lib/auth-helpers";
import { deleteFile } from "@/lib/uploadthing/utils";
const RESOURCE_CATEGORIES = ["SUPPORT_COURS", "RESSOURCE_ANNEXE", "EVALUATION", "MEDIA_COURS", "AUTRE"] as const;

// ─────────────────────────────────────────────────────────────
// GET /api/resources/[id] — Fetch single resource, redirect for download
// ─────────────────────────────────────────────────────────────
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const download = searchParams.get("download") === "true";

    // Fetch resource with uploader info
    const resource = await db.resource.findUnique({
      where: { id },
      include: {
        uploadedBy: {
          select: { id: true, prenom: true, nom: true, role: true },
        },
        course: {
          select: { id: true, title: true },
        },
      },
    });

    if (!resource) {
      return NextResponse.json(
        { error: "Ressource introuvable" },
        { status: 404 }
      );
    }

    // ── Download mode: redirect to UploadThing URL ─────────────
    if (download) {
      // Increment download count
      await db.resource.update({
        where: { id },
        data: { downloadCount: { increment: 1 } },
      });

      return NextResponse.redirect(resource.filePath);
    }

    // ── Normal mode: return JSON resource data ──────────────────
    return NextResponse.json({ resource });
  } catch (error) {
    console.error("Resource detail error:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement de la ressource" },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────────────────────
// PATCH /api/resources/[id] — Update resource metadata
// ─────────────────────────────────────────────────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    // ── Auth check (ADMIN, FORMATEUR, or original uploader) ─────
    const auth = await requireRole(req, ["ADMIN", "FORMATEUR"]);
    if (!auth.authorized) {
      // Check if user is the original uploader (any role)
      const user = await getUserFromRequest(req);
      if (!user) {
        return NextResponse.json(
          { error: "Accès non autorisé" },
          { status: 403 }
        );
      }

      const resource = await db.resource.findUnique({
        where: { id },
        select: { uploadedById: true },
      });

      if (!resource || resource.uploadedById !== user.userId) {
        return NextResponse.json(
          { error: "Accès non autorisé" },
          { status: 403 }
        );
      }
    }

    // ── Check resource exists ───────────────────────────────────
    const existing = await db.resource.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Ressource introuvable" },
        { status: 404 }
      );
    }

    // ── Build update data ───────────────────────────────────────
    const updateData: Record<string, unknown> = {};
    const allowedFields = [
      "title",
      "description",
      "category",
      "isDownloadable",
      "courseId",
      "sectionId",
      "lessonId",
      "order",
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        // Validate category enum
        if (field === "category" && body[field]) {
          if (!RESOURCE_CATEGORIES.includes(body[field] as typeof RESOURCE_CATEGORIES[number])) {
            return NextResponse.json(
              { error: `Catégorie invalide: ${body[field]}` },
              { status: 400 }
            );
          }
        }
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "Aucun champ à mettre à jour" },
        { status: 400 }
      );
    }

    // ── Update resource ─────────────────────────────────────────
    const resource = await db.resource.update({
      where: { id },
      data: updateData,
      include: {
        uploadedBy: {
          select: { id: true, prenom: true, nom: true, role: true },
        },
        course: {
          select: { id: true, title: true },
        },
      },
    });

    return NextResponse.json({ resource });
  } catch (error) {
    console.error("Resource update error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la ressource" },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────────────────────
// DELETE /api/resources/[id] — Delete resource (cloud file + DB)
// ─────────────────────────────────────────────────────────────
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // ── Auth check ──────────────────────────────────────────────
    const auth = await requireRole(req, ["ADMIN", "FORMATEUR"]);

    if (!auth.authorized) {
      return NextResponse.json(
        { error: "Accès non autorisé", details: "Seuls les administrateurs et formateurs peuvent supprimer des ressources" },
        { status: 403 }
      );
    }

    // ── Check resource exists ───────────────────────────────────
    const existing = await db.resource.findUnique({
      where: { id },
      include: {
        uploadedBy: {
          select: { id: true, role: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Ressource introuvable" },
        { status: 404 }
      );
    }

    // Permission check: ADMIN can delete any, FORMATEUR can only delete own resources
    if (auth.role === "FORMATEUR" && existing.uploadedById !== auth.userId) {
      return NextResponse.json(
        { error: "Accès non autorisé", details: "Vous ne pouvez supprimer que vos propres ressources" },
        { status: 403 }
      );
    }

    // ── Delete file from UploadThing cloud (non-blocking) ──────
    if (existing.fileKey) {
      try {
        await deleteFile(existing.fileKey);
      } catch (fileError) {
        console.error("UploadThing file deletion error (non-blocking):", fileError);
        // Don't fail the entire operation if cloud deletion fails
      }
    }

    // ── Delete from database ────────────────────────────────────
    await db.resource.delete({
      where: { id },
    });

    return NextResponse.json({
      message: `La ressource "${existing.title}" a été supprimée avec succès`,
    });
  } catch (error) {
    console.error("Resource delete error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la ressource" },
      { status: 500 }
    );
  }
}
