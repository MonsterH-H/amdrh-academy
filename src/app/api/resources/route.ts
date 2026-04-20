import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-helpers";
const RESOURCE_TYPES = ["VIDEO", "PDF", "IMAGE", "DOCUMENT", "AUDIO", "ARCHIVE", "AUTRE"] as const;
const RESOURCE_CATEGORIES = ["SUPPORT_COURS", "RESSOURCE_ANNEXE", "EVALUATION", "MEDIA_COURS", "AUTRE"] as const;

// ─────────────────────────────────────────────────────────────
// GET /api/resources — List resources with filters & pagination
// ─────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const courseId = searchParams.get("courseId");
    const type = searchParams.get("type");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const uploadedById = searchParams.get("uploadedById");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    // Build where clause
    const where: Record<string, unknown> = {};

    if (courseId) where.courseId = courseId;
    if (type && RESOURCE_TYPES.includes(type as typeof RESOURCE_TYPES[number])) {
      where.fileType = type;
    }
    if (category && RESOURCE_CATEGORIES.includes(category as typeof RESOURCE_CATEGORIES[number])) {
      where.category = category;
    }
    if (uploadedById) where.uploadedById = uploadedById;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    // Execute queries in parallel
    const [resources, total, sizeAgg, typeAgg, categoryAgg] = await Promise.all([
      db.resource.findMany({
        where,
        include: {
          uploadedBy: {
            select: { id: true, prenom: true, nom: true, role: true },
          },
          course: {
            select: { id: true, title: true },
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

    // Build stats object
    const byType: Record<string, number> = {};
    for (const row of typeAgg) {
      byType[row.fileType] = row._count.id;
    }

    const byCategory: Record<string, number> = {};
    for (const row of categoryAgg) {
      byCategory[row.category] = row._count.id;
    }

    const stats = {
      totalSize: sizeAgg._sum.fileSize || 0,
      byType,
      byCategory,
    };

    return NextResponse.json({
      resources,
      total,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      stats,
    });
  } catch (error) {
    console.error("Resources list error:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement des ressources" },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────────────────────
// POST /api/resources — Create resource metadata (external URL)
// ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    // ── Auth check ──────────────────────────────────────────────
    const auth = await requireRole(req, ["ADMIN", "FORMATEUR"]);
    if (!auth.authorized) return auth.response;

    const userId = auth.userId;

    // ── Parse body ──────────────────────────────────────────────
    const body = await req.json();

    const {
      title,
      description,
      filePath,
      fileName,
      fileSize,
      fileType,
      mimeType,
      category,
      courseId,
      sectionId,
      lessonId,
      isDownloadable,
      order,
    } = body;

    // Validate required fields
    if (!title || !filePath || !fileName) {
      return NextResponse.json(
        { error: "Les champs title, filePath et fileName sont obligatoires" },
        { status: 400 }
      );
    }

    // Validate enums if provided
    const resolvedFileType = fileType
      ? RESOURCE_TYPES.includes(fileType as typeof RESOURCE_TYPES[number])
        ? fileType
        : "AUTRE"
      : "AUTRE";

    const resolvedCategory = category
      ? RESOURCE_CATEGORIES.includes(category as typeof RESOURCE_CATEGORIES[number])
        ? category
        : "AUTRE"
      : "AUTRE";

    // Create resource
    const resource = await db.resource.create({
      data: {
        title,
        description: description || null,
        fileName,
        filePath,
        fileSize: fileSize || 0,
        fileType: resolvedFileType,
        mimeType: mimeType || null,
        category: resolvedCategory,
        isDownloadable: isDownloadable !== false,
        downloadCount: 0,
        order: order || 0,
        courseId: courseId || null,
        sectionId: sectionId || null,
        lessonId: lessonId || null,
        uploadedById: userId,
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

    return NextResponse.json({ resource }, { status: 201 });
  } catch (error) {
    console.error("Resource creation error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la ressource" },
      { status: 500 }
    );
  }
}
