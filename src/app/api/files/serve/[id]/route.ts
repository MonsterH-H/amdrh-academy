import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { existsSync, createReadStream, statSync } from "fs";
import { join, normalize } from "path";
import { createHash } from "crypto";

const UPLOAD_DIR = join(process.cwd(), "uploads");

// Allowed MIME types whitelist for security
const ALLOWED_MIME_PREFIXES: Record<string, string[]> = {
  VIDEO: ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo", "video/x-matroska"],
  PDF: ["application/pdf"],
  IMAGE: ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml", "image/avif"],
  DOCUMENT: [
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/rtf",
    "text/plain",
  ],
  AUDIO: ["audio/mpeg", "audio/wav", "audio/ogg", "audio/mp4", "audio/aac", "audio/flac"],
  ARCHIVE: ["application/zip", "application/x-rar-compressed", "application/x-7z-compressed", "application/gzip", "application/x-tar"],
};

const ALL_ALLOWED_MIME = Object.values(ALLOWED_MIME_PREFIXES).flat();

/** Generate ETag from file size + modification time */
function generateETag(size: number, mtime: Date): string {
  const hash = createHash("md5")
    .update(size + "-" + mtime.getTime())
    .digest("hex")
    .slice(0, 16);
  return 'W/"' + hash + '"';
}

/** Validate file path does not escape the upload directory */
function isPathSafe(filePath: string): boolean {
  const normalized = normalize(filePath);
  const resolved = join(UPLOAD_DIR, normalized);
  return resolved.startsWith(UPLOAD_DIR + "/") || resolved === UPLOAD_DIR;
}

/** Sanitize file path components to prevent path injection */
function sanitizeFilePath(filePath: string): string {
  let sanitized = filePath.replace(/\0/g, "");
  sanitized = normalize(sanitized);
  sanitized = sanitized.replace(/^[/\\]+/, "");
  return sanitized;
}

/** Validate MIME type against whitelist */
function isMimeAllowed(mimeType: string | null): boolean {
  if (!mimeType) return false;
  return ALL_ALLOWED_MIME.includes(mimeType);
}

/** Format file size for human-readable display */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
}

/** Build standard cache headers with ETag and Last-Modified */
function buildCacheHeaders(etag: string, lastModified: string): Record<string, string> {
  return {
    ETag: etag,
    "Cache-Control": "public, max-age=31536000, immutable",
    "Last-Modified": lastModified,
  };
}

// ─────────────────────────────────────────────────────────────
// GET /api/files/serve/[id] - Serve file by resource ID
// Supports range requests for video streaming, ETag, and caching
// ─────────────────────────────────────────────────────────────
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Auth check — accept userId from x-user-id header or query param
    const { searchParams } = new URL(req.url);
    const userId = req.headers.get("x-user-id") || searchParams.get("userId") || "";

    if (!userId) {
      return NextResponse.json(
        { error: "Authentification requise" },
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, isActive: true },
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: "Utilisateur non trouve ou inactif" },
        { status: 401 }
      );
    }

    // Fetch resource metadata
    const resource = await db.resource.findUnique({
      where: { id },
      select: {
        fileName: true,
        filePath: true,
        fileType: true,
        mimeType: true,
        isDownloadable: true,
        downloadCount: true,
        fileSize: true,
        updatedAt: true,
      },
    });

    if (!resource) {
      return NextResponse.json(
        { error: "Fichier introuvable" },
        { status: 404 }
      );
    }

    // Security: Validate MIME type
    if (!isMimeAllowed(resource.mimeType)) {
      console.error("[SECURITY] Blocked serving file with disallowed MIME type:", resource.mimeType);
      return NextResponse.json(
        { error: "Type de fichier non autorise" },
        { status: 403 }
      );
    }

    // Security: Sanitize and validate file path
    const sanitizedPath = sanitizeFilePath(resource.filePath);
    if (!isPathSafe(sanitizedPath)) {
      console.error("[SECURITY] Path traversal attempt detected:", resource.filePath);
      return NextResponse.json(
        { error: "Chemin de fichier invalide" },
        { status: 403 }
      );
    }

    const fullPath = join(UPLOAD_DIR, sanitizedPath);

    // Check file exists on disk
    if (!existsSync(fullPath)) {
      return NextResponse.json(
        { error: "Fichier non trouve sur le serveur" },
        { status: 404 }
      );
    }

    const fileStat = statSync(fullPath);

    // Security: Validate file size (max 500MB)
    const MAX_FILE_SIZE = 500 * 1024 * 1024;
    if (fileStat.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Fichier trop volumineux" },
        { status: 413 }
      );
    }

    // Generate ETag and Last-Modified
    const etag = generateETag(fileStat.size, fileStat.mtime);
    const lastModified = fileStat.mtime.toUTCString();
    const cacheHeaders = buildCacheHeaders(etag, lastModified);

    // Check If-None-Match (ETag cache validation)
    const ifNoneMatch = req.headers.get("if-none-match");
    const weakETag = "W/" + etag.replace("W/", "");
    if (ifNoneMatch && (ifNoneMatch === etag || ifNoneMatch === weakETag || ifNoneMatch.includes(etag))) {
      return new NextResponse(null, { status: 304, headers: cacheHeaders });
    }

    // Check If-Modified-Since
    const ifModifiedSince = req.headers.get("if-modified-since");
    if (ifModifiedSince) {
      const sinceDate = new Date(ifModifiedSince);
      if (!isNaN(sinceDate.getTime()) && fileStat.mtime <= sinceDate) {
        return new NextResponse(null, { status: 304, headers: cacheHeaders });
      }
    }

    const range = req.headers.get("range");
    const contentType = resource.mimeType || "application/octet-stream";

    // Increment download count (fire and forget)
    db.resource.update({
      where: { id },
      data: { downloadCount: { increment: 1 } },
    }).catch(() => {});

    // Handle range requests for video/audio streaming
    if (range) {
      const rangeMatch = range.match(/^bytes=(\d*)-(\d*)$/);
      if (!rangeMatch) {
        return new NextResponse(null, {
          status: 416,
          headers: { "Content-Range": "bytes */" + fileStat.size, ETag: etag },
        });
      }

      const start = rangeMatch[1] ? parseInt(rangeMatch[1], 10) : 0;
      const end = rangeMatch[2] ? parseInt(rangeMatch[2], 10) : fileStat.size - 1;

      // Validate range boundaries
      if (start >= fileStat.size || end >= fileStat.size || start > end) {
        return new NextResponse(null, {
          status: 416,
          headers: { "Content-Range": "bytes */" + fileStat.size, ETag: etag },
        });
      }

      const chunkSize = end - start + 1;
      const stream = createReadStream(fullPath, { start, end });

      const rangeHeaders: Record<string, string> = {
        "Content-Range": "bytes " + start + "-" + end + "/" + fileStat.size,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize.toString(),
        "Content-Type": contentType,
        ...cacheHeaders,
      };

      return new NextResponse(stream as unknown as BodyInit, {
        status: 206,
        headers: rangeHeaders,
      });
    }

    // Full file response
    const stream = createReadStream(fullPath);

    // Determine inline vs attachment based on resource setting and type
    const inlineTypes = [
      "video/mp4", "video/webm", "audio/mpeg", "audio/wav",
      "audio/ogg", "audio/mp4", "image/jpeg", "image/png",
      "image/gif", "image/webp", "image/svg+xml",
    ];
    const isInline = !resource.isDownloadable || inlineTypes.includes(contentType);
    const disposition = isInline ? "inline" : "attachment";
    const encodedName = encodeURIComponent(resource.fileName);

    const fullHeaders: Record<string, string> = {
      "Content-Type": contentType,
      "Content-Length": fileStat.size.toString(),
      "Content-Disposition": disposition + '; filename="' + encodedName + '"',
      "Accept-Ranges": "bytes",
      "X-File-Size": formatFileSize(fileStat.size),
      ...cacheHeaders,
    };

    return new NextResponse(stream as unknown as BodyInit, { headers: fullHeaders });
  } catch (error) {
    console.error("File serve error:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
