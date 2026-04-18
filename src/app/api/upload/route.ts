import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-helpers";
import { ResourceType, ResourceCategory } from "@prisma/client";

/**
 * Auto-detect ResourceType from a MIME type string.
 */
function detectFileType(mimeType: string): ResourceType {
  if (mimeType.startsWith("video/")) return ResourceType.VIDEO;
  if (mimeType === "application/pdf") return ResourceType.PDF;
  if (mimeType.startsWith("image/")) return ResourceType.IMAGE;
  if (mimeType.startsWith("audio/")) return ResourceType.AUDIO;
  if (
    mimeType === "application/zip" ||
    mimeType === "application/x-rar-compressed" ||
    mimeType === "application/x-zip-compressed" ||
    mimeType === "application/x-7z-compressed"
  )
    return ResourceType.ARCHIVE;
  if (
    mimeType.startsWith("application/vnd.openxmlformats-officedocument.") ||
    mimeType === "application/msword" ||
    mimeType.startsWith("text/")
  )
    return ResourceType.DOCUMENT;
  return ResourceType.AUTRE;
}

/**
 * Helper to process a single uploaded file: save to disk + create DB record.
 */
async function processFile(
  file: File,
  userId: string,
  title: string,
  opts?: {
    description?: string;
    courseId?: string;
    sectionId?: string;
    lessonId?: string;
    category?: string;
    isDownloadable?: boolean;
    order?: number;
  }
) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const uniqueFileName = `${timestamp}_${safeName}`;

  const uploadDir = join(process.cwd(), "public", "uploads", "resources");
  await mkdir(uploadDir, { recursive: true });

  const filePath = join(uploadDir, uniqueFileName);
  await writeFile(filePath, buffer);

  const mimeType = file.type || "application/octet-stream";
  const fileType = detectFileType(mimeType);
  const dbFilePath = `/uploads/resources/${uniqueFileName}`;

  const resource = await db.resource.create({
    data: {
      title,
      description: opts?.description || null,
      fileName: file.name,
      filePath: dbFilePath,
      fileSize: buffer.length,
      fileType,
      mimeType,
      category: (opts?.category as ResourceCategory) || ResourceCategory.AUTRE,
      isDownloadable: opts?.isDownloadable !== false,
      courseId: opts?.courseId || null,
      sectionId: opts?.sectionId || null,
      lessonId: opts?.lessonId || null,
      order: opts?.order || 0,
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

  return resource;
}

export async function POST(req: NextRequest) {
  try {
    // ── Auth check ──────────────────────────────────────────────
    const auth = await requireRole(req, ["ADMIN", "FORMATEUR"]);
    if (!auth.authorized) return auth.response;

    const userId = auth.userId;

    // ── Parse multipart form data ───────────────────────────────
    const formData = await req.formData();

    // Common metadata fields
    const title = (formData.get("title") as string) || "Ressource sans titre";
    const description = formData.get("description") as string | null;
    const courseId = (formData.get("courseId") as string) || null;
    const sectionId = (formData.get("sectionId") as string) || null;
    const lessonId = (formData.get("lessonId") as string) || null;
    const category = (formData.get("category") as string) || ResourceCategory.AUTRE;
    const isDownloadable = formData.get("isDownloadable") !== "false";
    const order = parseInt((formData.get("order") as string) || "0", 10);

    // ── Collect files ───────────────────────────────────────────
    const files: File[] = [];

    // Single file field
    const singleFile = formData.get("file");
    if (singleFile instanceof File) {
      files.push(singleFile);
    }

    // Multiple files field
    const multiFiles = formData.getAll("files");
    for (const f of multiFiles) {
      if (f instanceof File) {
        files.push(f);
      }
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: "Aucun fichier fourni" },
        { status: 400 }
      );
    }

    // ── Validate user exists ────────────────────────────────────
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, isActive: true },
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: "Utilisateur introuvable ou inactif" },
        { status: 403 }
      );
    }

    // ── Process each file ───────────────────────────────────────
    const opts = {
      description: description || undefined,
      courseId: courseId || undefined,
      sectionId: sectionId || undefined,
      lessonId: lessonId || undefined,
      category,
      isDownloadable,
      order,
    };

    if (files.length === 1) {
      const resource = await processFile(files[0], userId, title, opts);
      return NextResponse.json({ resource }, { status: 201 });
    }

    // Multiple files — process in parallel
    const resources = await Promise.all(
      files.map((file, idx) =>
        processFile(
          file,
          userId,
          files.length > 1 ? `${title} (${idx + 1})` : title,
          { ...opts, order: order + idx }
        )
      )
    );

    return NextResponse.json({ resources }, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Erreur lors du téléchargement du fichier" },
      { status: 500 }
    );
  }
}
