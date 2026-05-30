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
 * POST /api/files — Upload file(s) via FormData and create resource record(s)
 *
 * Accepts multipart/form-data with:
 *   - file: single File (or files: multiple Files)
 *   - userId: uploader ID (from auth)
 *   - role: uploader role (from auth)
 *   - title: resource title (required)
 *   - description: optional description
 *   - category: SUPPORT_COURS | RESSOURCE_ANNEXE | EVALUATION | MEDIA_COURS | AUTRE
 *   - courseId: optional course ID
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(req, ["ADMIN", "FORMATEUR"]);
    if (!auth.authorized) return auth.response;

    const formData = await req.formData();

    // Extract metadata fields
    const title = (formData.get("title") as string) || "Ressource sans titre";
    const description = (formData.get("description") as string) || null;
    const category = (formData.get("category") as string) || "AUTRE";
    const courseId = (formData.get("courseId") as string) || null;

    // Validate category
    const resolvedCategory = RESOURCE_CATEGORIES.includes(category as typeof RESOURCE_CATEGORIES[number])
      ? category
      : "AUTRE";

    // Extract files — support both "file" (single) and "files" (multi) field names
    const files: File[] = [];
    const singleFile = formData.get("file");
    if (singleFile && singleFile instanceof File) {
      files.push(singleFile);
    }
    for (const [key, value] of formData.entries()) {
      if (key === "files" && value instanceof File) {
        files.push(value);
      }
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: "Aucun fichier fourni" },
        { status: 400 }
      );
    }

    // Upload each file via UploadThing server-side and create resource records
    const { getUTApi } = await import("@/lib/uploadthing/server");
    const { getFileType, getMimeType } = await import("@/lib/uploadthing/utils");
    const utapi = getUTApi();

    const createdResources = [];

    for (const file of files) {
      try {
        // Convert File to Buffer for server-side upload
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload to UploadThing
        const uploadResult = await utapi.uploadFiles(
          new File([buffer], file.name, { type: file.type })
        );

        const uploadedFile = uploadResult.data;
        if (!uploadedFile) {
          console.error(`[Files] UploadThing returned no data for ${file.name}`);
          continue;
        }

        // Determine file type from extension
        const fileType = getFileType(file.name);

        // Create resource record in database
        const resource = await db.resource.create({
          data: {
            title: files.length === 1 ? title : `${title} — ${file.name}`,
            description,
            fileName: file.name,
            filePath: uploadedFile.ufsUrl || uploadedFile.url || "",
            fileKey: uploadedFile.key || null,
            fileSize: file.size,
            fileType,
            mimeType: getMimeType(file.name),
            category: resolvedCategory,
            isDownloadable: true,
            downloadCount: 0,
            order: 0,
            courseId,
            uploadedById: auth.userId,
          },
          include: {
            uploadedBy: {
              select: { id: true, prenom: true, nom: true, role: true },
            },
            course: {
              select: { id: true, title: true },
            },
          },
        });

        createdResources.push(resource);
      } catch (fileError) {
        console.error(`[Files] Failed to upload ${file.name}:`, fileError);
      }
    }

    if (createdResources.length === 0) {
      return NextResponse.json(
        { error: "Échec du téléchargement de tous les fichiers" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { resources: createdResources, count: createdResources.length },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Files] Upload error:", error);
    return NextResponse.json(
      { error: "Erreur lors du téléchargement du fichier" },
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
