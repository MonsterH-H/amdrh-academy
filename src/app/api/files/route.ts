import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole, getUserFromRequest } from "@/lib/auth-helpers";

const RESOURCE_TYPES = [
  "VIDEO",
  "PDF",
  "IMAGE",
  "DOCUMENT",
  "AUDIO",
  "ARCHIVE",
  "AUTRE",
] as const;
const RESOURCE_CATEGORIES = [
  "SUPPORT_COURS",
  "RESSOURCE_ANNEXE",
  "EVALUATION",
  "MEDIA_COURS",
  "AUTRE",
] as const;

/**
 * GET /api/files — List files with filtering & pagination
 *
 * Query params:
 *   - userId: filter by uploader
 *   - courseId: filter by course
 *   - category: filter by category
 *   - type: filter by file type
 *   - search: search in title/description
 *   - page: page number (default 1)
 *   - limit: items per page (default 20)
 *   - hasFileKey: "true" to filter only UploadThing files
 */
export async function GET(req: NextRequest) {
  try {
    const userInfo = await getUserFromRequest(req);
    if (!userInfo) {
      return NextResponse.json(
        { error: "Authentification requise" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);

    const courseId = searchParams.get("courseId");
    const userId = searchParams.get("userId");
    const category = searchParams.get("category");
    const type = searchParams.get("type");
    const search = searchParams.get("search");
    const hasFileKey = searchParams.get("hasFileKey") === "true";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    // Build where clause
    const where: Record<string, unknown> = {};

    if (courseId) where.courseId = courseId;
    if (userId) where.uploadedById = userId;
    if (hasFileKey) where.fileKey = { not: null };

    if (type && RESOURCE_TYPES.includes(type as (typeof RESOURCE_TYPES)[number])) {
      where.fileType = type;
    }
    if (
      category &&
      RESOURCE_CATEGORIES.includes(category as (typeof RESOURCE_CATEGORIES)[number])
    ) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { fileName: { contains: search, mode: "insensitive" } },
      ];
    }

    // Execute queries in parallel
    const [files, total, sizeAgg, typeAgg, categoryAgg] = await Promise.all([
      db.resource.findMany({
        where,
        include: {
          uploadedBy: {
            select: { id: true, prenom: true, nom: true, role: true, avatar: true },
          },
          course: {
            select: { id: true, title: true, slug: true },
          },
        },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.resource.count({ where }),
      db.resource.aggregate({
        where,
        _sum: { fileSize: true },
      }),
      db.resource.groupBy({
        by: ["fileType"],
        where,
        _count: { id: true },
      }),
      db.resource.groupBy({
        by: ["category"],
        where,
        _count: { id: true },
      }),
    ]);

    // Build stats
    const byType: Record<string, number> = {};
    for (const row of typeAgg) {
      byType[row.fileType] = row._count.id;
    }

    const byCategory: Record<string, number> = {};
    for (const row of categoryAgg) {
      byCategory[row.category] = row._count.id;
    }

    return NextResponse.json({
      files,
      total,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        totalSize: sizeAgg._sum.fileSize || 0,
        byType,
        byCategory,
      },
    });
  } catch (error) {
    console.error("[Files] List error:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement des fichiers" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/files — Delete a file (both from UploadThing and DB)
 *
 * Query params:
 *   - id: resource ID
 *   - fileKey: UploadThing file key (optional, will be fetched from DB)
 */
export async function DELETE(req: NextRequest) {
  try {
    // Only ADMIN and FORMATEUR can delete files
    const auth = await requireRole(req, ["ADMIN", "FORMATEUR"]);
    if (!auth.authorized) return auth.response;

    const { searchParams } = new URL(req.url);
    const resourceId = searchParams.get("id");

    if (!resourceId) {
      return NextResponse.json(
        { error: "L'ID de la ressource est requis" },
        { status: 400 }
      );
    }

    // Find resource
    const resource = await db.resource.findUnique({
      where: { id: resourceId },
      include: {
        uploadedBy: { select: { id: true, role: true } },
      },
    });

    if (!resource) {
      return NextResponse.json(
        { error: "Ressource introuvable" },
        { status: 404 }
      );
    }

    // Permission check: FORMATEUR can only delete own resources
    if (auth.role === "FORMATEUR" && resource.uploadedById !== auth.userId) {
      return NextResponse.json(
        { error: "Vous ne pouvez supprimer que vos propres ressources" },
        { status: 403 }
      );
    }

    // Delete from UploadThing if fileKey exists
    if (resource.fileKey) {
      try {
        const { getUTApi } = await import("@/lib/uploadthing/server");
        const utapi = getUTApi();
        await utapi.deleteFiles(resource.fileKey);
      } catch (utError) {
        console.error(
          `[Files] UploadThing delete failed (non-blocking):`,
          utError
        );
        // Continue with DB deletion even if UT fails
      }
    }

    // Delete from database
    await db.resource.delete({
      where: { id: resourceId },
    });

    return NextResponse.json({
      message: `La ressource "${resource.title}" a été supprimée avec succès`,
    });
  } catch (error) {
    console.error("[Files] Delete error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du fichier" },
      { status: 500 }
    );
  }
}
