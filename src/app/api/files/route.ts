import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole, getUserFromRequest } from "@/lib/auth-helpers";
import { writeFile, mkdir, unlink } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

const RESOURCE_TYPES = [
  "VIDEO", "PDF", "IMAGE", "DOCUMENT", "AUDIO", "ARCHIVE", "AUTRE",
] as const;
const RESOURCE_CATEGORIES = [
  "SUPPORT_COURS", "RESSOURCE_ANNEXE", "EVALUATION", "MEDIA_COURS", "AUTRE",
] as const;

const UPLOAD_DIR = join(process.cwd(), "uploads");

function getFileType(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  if (["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "avif"].includes(ext)) return "IMAGE";
  if (["mp4", "webm", "mov", "avi", "mkv"].includes(ext)) return "VIDEO";
  if (["mp3", "wav", "ogg", "m4a", "flac"].includes(ext)) return "AUDIO";
  if (["pdf"].includes(ext)) return "PDF";
  if (["doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "csv", "rtf"].includes(ext)) return "DOCUMENT";
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return "ARCHIVE";
  return "AUTRE";
}

function getMimeType(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  const mimeMap: Record<string, string> = {
    pdf: "application/pdf", jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
    gif: "image/gif", webp: "image/webp", svg: "image/svg+xml", mp4: "video/mp4",
    webm: "video/webm", mov: "video/quicktime", mp3: "audio/mpeg", wav: "audio/wav",
    doc: "application/msword", docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel", xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ppt: "application/vnd.ms-powerpoint", pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    zip: "application/zip", csv: "text/csv", txt: "text/plain",
  };
  return mimeMap[ext] || "application/octet-stream";
}

/** GET /api/files — List files with filtering & pagination */
export async function GET(req: NextRequest) {
  try {
    const userInfo = await getUserFromRequest(req);
    if (!userInfo) {
      return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
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

    const where: Record<string, unknown> = {};
    if (courseId) where.courseId = courseId;
    if (userId) where.uploadedById = userId;
    if (hasFileKey) where.fileKey = { not: null };

    if (type && RESOURCE_TYPES.includes(type as (typeof RESOURCE_TYPES)[number])) {
      where.fileType = type;
    }
    if (category && RESOURCE_CATEGORIES.includes(category as (typeof RESOURCE_CATEGORIES)[number])) {
      where.category = category;
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { fileName: { contains: search, mode: "insensitive" } },
      ];
    }

    const [files, total, sizeAgg, typeAgg, categoryAgg] = await Promise.all([
      db.resource.findMany({
        where,
        include: {
          uploadedBy: { select: { id: true, prenom: true, nom: true, role: true, avatar: true } },
          course: { select: { id: true, title: true, slug: true } },
        },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.resource.count({ where }),
      db.resource.aggregate({ where, _sum: { fileSize: true } }),
      db.resource.groupBy({ by: ["fileType"], where, _count: { id: true } }),
      db.resource.groupBy({ by: ["category"], where, _count: { id: true } }),
    ]);

    const byType: Record<string, number> = {};
    for (const row of typeAgg) byType[row.fileType] = row._count.id;

    const byCategory: Record<string, number> = {};
    for (const row of categoryAgg) byCategory[row.category] = row._count.id;

    return NextResponse.json({
      files, total,
      pagination: { page, limit, totalPages: Math.ceil(total / limit) },
      stats: { totalSize: sizeAgg._sum.fileSize || 0, byType, byCategory },
    });
  } catch (error) {
    console.error("[Files] List error:", error);
    return NextResponse.json({ error: "Erreur lors du chargement des fichiers" }, { status: 500 });
  }
}

/** POST /api/files — Upload file(s) via FormData */
export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(req, ["ADMIN", "FORMATEUR"]);
    if (!auth.authorized) return auth.response;

    const formData = await req.formData();
    const title = (formData.get("title") as string) || "Ressource sans titre";
    const description = (formData.get("description") as string) || null;
    const category = (formData.get("category") as string) || "AUTRE";
    const courseId = (formData.get("courseId") as string) || null;

    const resolvedCategory = RESOURCE_CATEGORIES.includes(category as typeof RESOURCE_CATEGORIES[number])
      ? category : "AUTRE";

    const files: File[] = [];
    const singleFile = formData.get("file");
    if (singleFile && singleFile instanceof File) files.push(singleFile);
    for (const [key, value] of formData.entries()) {
      if (key === "files" && value instanceof File) files.push(value);
    }

    if (files.length === 0) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
    }

    // Ensure upload directory exists
    await mkdir(UPLOAD_DIR, { recursive: true });

    const createdResources = [];

    for (const file of files) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Generate unique file ID to avoid collisions
        const fileId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const savedName = `${fileId}-${safeName}`;
        const localPath = join(UPLOAD_DIR, savedName);

        // Save to local filesystem
        await writeFile(localPath, buffer);

        const fileType = getFileType(file.name);

        const resource = await db.resource.create({
          data: {
            title: files.length === 1 ? title : `${title} — ${file.name}`,
            description,
            fileName: file.name,
            filePath: savedName,
            fileKey: savedName, // Use as local file key
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
            uploadedBy: { select: { id: true, prenom: true, nom: true, role: true } },
            course: { select: { id: true, title: true } },
          },
        });

        createdResources.push(resource);
      } catch (fileError) {
        console.error(`[Files] Failed to upload ${file.name}:`, fileError);
      }
    }

    if (createdResources.length === 0) {
      return NextResponse.json({ error: "Échec du téléchargement de tous les fichiers" }, { status: 500 });
    }

    return NextResponse.json({ resources: createdResources, count: createdResources.length }, { status: 201 });
  } catch (error) {
    console.error("[Files] Upload error:", error);
    return NextResponse.json({ error: "Erreur lors du téléchargement du fichier" }, { status: 500 });
  }
}

/** GET /api/files/serve-local — Serve locally uploaded files */
export async function serveLocal(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const file = searchParams.get("file");
    if (!file || file.includes("..")) {
      return NextResponse.json({ error: "Fichier invalide" }, { status: 400 });
    }
    const filePath = join(UPLOAD_DIR, file);
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: "Fichier introuvable" }, { status: 404 });
    }
    const { readFile } = await import("fs/promises");
    const buffer = await readFile(filePath);
    const mimeType = getMimeType(file);
    return new NextResponse(buffer, {
      headers: { "Content-Type": mimeType, "Content-Disposition": `inline; filename="${file.split("-").slice(1).join("-")}"` },
    });
  } catch (error) {
    console.error("[Files] Serve local error:", error);
    return NextResponse.json({ error: "Erreur de lecture" }, { status: 500 });
  }
}

/** DELETE /api/files — Delete a file */
export async function DELETE(req: NextRequest) {
  try {
    const auth = await requireRole(req, ["ADMIN", "FORMATEUR"]);
    if (!auth.authorized) return auth.response;

    const { searchParams } = new URL(req.url);
    const resourceId = searchParams.get("id");
    if (!resourceId) {
      return NextResponse.json({ error: "L'ID de la ressource est requis" }, { status: 400 });
    }

    const resource = await db.resource.findUnique({
      where: { id: resourceId },
      include: { uploadedBy: { select: { id: true, role: true } } },
    });
    if (!resource) {
      return NextResponse.json({ error: "Ressource introuvable" }, { status: 404 });
    }
    if (auth.role === "FORMATEUR" && resource.uploadedById !== auth.userId) {
      return NextResponse.json({ error: "Vous ne pouvez supprimer que vos propres ressources" }, { status: 403 });
    }

    // Delete local file if it exists
    if (resource.fileKey) {
      const localPath = join(UPLOAD_DIR, resource.fileKey);
      if (existsSync(localPath)) {
        try { await unlink(localPath); } catch { /* ignore */ }
      }
      // Also try UploadThing cleanup
      try {
        const { getUTApi } = await import("@/lib/uploadthing/server");
        const utapi = getUTApi();
        await utapi.deleteFiles(resource.fileKey);
      } catch { /* UploadThing not configured, ignore */ }
    }

    await db.resource.delete({ where: { id: resourceId } });
    return NextResponse.json({ message: `La ressource "${resource.title}" a été supprimée` });
  } catch (error) {
    console.error("[Files] Delete error:", error);
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}
