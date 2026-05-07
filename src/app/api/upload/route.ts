import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-helpers";

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

/** Determine resource type from MIME type */
function getFileType(mimeType: string): string {
  if (mimeType.startsWith("video/")) return "VIDEO";
  if (mimeType === "application/pdf") return "PDF";
  if (mimeType.startsWith("image/")) return "IMAGE";
  if (mimeType.startsWith("audio/")) return "AUDIO";
  if (
    [
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "text/plain",
      "application/rtf",
    ].includes(mimeType)
  ) {
    return "DOCUMENT";
  }
  if (
    [
      "application/zip",
      "application/x-rar-compressed",
      "application/x-7z-compressed",
      "application/gzip",
      "application/x-tar",
    ].includes(mimeType)
  ) {
    return "ARCHIVE";
  }
  return "AUTRE";
}

/** Strip file extension to produce a clean base name */
function fileBaseName(name: string): string {
  return name.replace(/\.[^.]+$/, "");
}

// ─────────────────────────────────────────────────────────────
// POST /api/upload — Upload file(s) and create Resource records
// Supports both single file ("file") and multiple files ("files")
// ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    // ── Parse FormData ────────────────────────────────────────
    const formData = await req.formData();

    const userId = formData.get("userId") as string | null;
    const title = (formData.get("title") as string) || "";
    const description = (formData.get("description") as string) || null;
    const category = (formData.get("category") as string) || "AUTRE";
    const courseId = (formData.get("courseId") as string) || null;

    // ── Auth check ────────────────────────────────────────────
    // requireRole reads userId from searchParams, so we build a
    // compatible URL from the FormData value.
    if (!userId) {
      return NextResponse.json(
        { error: "Authentification requise" },
        { status: 401 }
      );
    }

    const authUrl = new URL(req.url);
    authUrl.searchParams.set("userId", userId);
    const authReq = new NextRequest(authUrl, req);
    const auth = await requireRole(authReq, ["ADMIN", "FORMATEUR"]);
    if (!auth.authorized) return auth.response;

    // ── Extract files ─────────────────────────────────────────
    const singleFile = formData.get("file") as File | null;
    const multipleFiles = formData.getAll("files") as File[];

    let files: File[] = [];
    if (singleFile) {
      files = [singleFile];
    } else if (multipleFiles.length > 0) {
      files = multipleFiles;
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: "Aucun fichier fourni" },
        { status: 400 }
      );
    }

    // ── Create Resource records ──────────────────────────────
    const resources = await Promise.all(
      files.map(async (file, index) => {
        const fileType = getFileType(file.type || "application/octet-stream");

        // For multiple files, append an index suffix to the title
        const resourceTitle =
          files.length === 1
            ? title || fileBaseName(file.name)
            : title
              ? `${title} (${index + 1})`
              : fileBaseName(file.name);

        return db.resource.create({
          data: {
            title: resourceTitle,
            description: description || null,
            fileType,
            category,
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type || "application/octet-stream",
            filePath: `/uploads/${Date.now()}-${file.name}`,
            courseId: courseId && courseId !== "NONE" ? courseId : null,
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
      })
    );

    // ── Response ──────────────────────────────────────────────
    if (files.length === 1) {
      return NextResponse.json({ resource: resources[0] }, { status: 200 });
    }
    return NextResponse.json({ resources }, { status: 200 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Erreur lors du téléchargement du fichier" },
      { status: 500 }
    );
  }
}
