import { UTApi } from "uploadthing/server";

/**
 * Delete a file from UploadThing by key
 */
export async function deleteFile(fileKey: string): Promise<void> {
  try {
    const utapi = new UTApi();
    await utapi.deleteFiles(fileKey);
  } catch (error) {
    console.error(`[UploadThing] Failed to delete file ${fileKey}:`, error);
    throw error;
  }
}

/**
 * Get file info from UploadThing by key
 */
export async function getFileInfo(fileKey: string) {
  try {
    const utapi = new UTApi();
    return await utapi.getFileInfo(fileKey);
  } catch (error) {
    console.error(`[UploadThing] Failed to get file info ${fileKey}:`, error);
    return null;
  }
}

/**
 * Get file URL from key
 */
export function getFileUrl(fileKey: string): string {
  return `https://utfs.io/f/${fileKey}`;
}

/**
 * Get file URL from a full UploadThing URL
 */
export function extractFileKey(url: string): string {
  // UploadThing URLs: https://utfs.io/f/{key}
  const match = url.match(/\/f\/([a-zA-Z0-9_-]+)/);
  return match?.[1] || "";
}

/**
 * Validate file type against allowed categories
 */
export function validateFileType(
  fileName: string,
  allowedTypes: string[]
): { valid: boolean; type: string } {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";

  const typeMap: Record<string, string[]> = {
    image: ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"],
    video: ["mp4", "webm", "mov", "avi", "mkv"],
    audio: ["mp3", "wav", "ogg", "m4a", "flac"],
    document: [
      "pdf",
      "doc",
      "docx",
      "xls",
      "xlsx",
      "ppt",
      "pptx",
      "txt",
      "csv",
    ],
    archive: ["zip", "rar", "7z", "tar", "gz"],
  };

  for (const [type, extensions] of Object.entries(typeMap)) {
    if (allowedTypes.includes(type) && extensions.includes(ext)) {
      return { valid: true, type };
    }
  }

  return { valid: false, type: "unknown" };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${units[i]}`;
}

/**
 * Determine resource category from file type
 */
export function getResourceCategory(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";

  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext))
    return "MEDIA_COURS";
  if (["mp4", "webm", "mov"].includes(ext)) return "MEDIA_COURS";
  if (["pdf"].includes(ext)) return "SUPPORT_COURS";
  if (["doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(ext))
    return "RESSOURCE_ANNEXE";
  return "AUTRE";
}

/**
 * MIME type mapping for common file extensions
 */
export function getMimeType(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  const mimeMap: Record<string, string> = {
    pdf: "application/pdf",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    mp4: "video/mp4",
    webm: "video/webm",
    mov: "video/quicktime",
    mp3: "audio/mpeg",
    wav: "audio/wav",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    zip: "application/zip",
    csv: "text/csv",
    txt: "text/plain",
  };
  return mimeMap[ext] || "application/octet-stream";
}

/**
 * Determine file type enum from file extension
 */
export function getFileType(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";

  if (["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "avif"].includes(ext))
    return "IMAGE";
  if (["mp4", "webm", "mov", "avi", "mkv"].includes(ext)) return "VIDEO";
  if (["mp3", "wav", "ogg", "m4a", "flac"].includes(ext)) return "AUDIO";
  if (["pdf"].includes(ext)) return "PDF";
  if (
    ["doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "csv", "rtf"].includes(
      ext
    )
  )
    return "DOCUMENT";
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return "ARCHIVE";
  return "AUTRE";
}

/**
 * Check if file is an image by extension
 */
export function isImageFile(fileName: string): boolean {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  return ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(ext);
}

/**
 * Endpoint-specific file type constraints
 */
export function getAllowedTypesForEndpoint(
  endpoint: "avatar" | "document" | "media" | "courseResource"
): string[] {
  switch (endpoint) {
    case "avatar":
      return ["image"];
    case "document":
      return ["document", "image"];
    case "media":
      return ["image", "video"];
    case "courseResource":
      return ["image", "video", "audio", "document", "archive"];
  }
}

/**
 * Endpoint-specific max file sizes
 */
export function getMaxSizeForEndpoint(
  endpoint: "avatar" | "document" | "media" | "courseResource"
): number {
  switch (endpoint) {
    case "avatar":
      return 2 * 1024 * 1024; // 2MB
    case "document":
      return 50 * 1024 * 1024; // 50MB
    case "media":
      return 100 * 1024 * 1024; // 100MB
    case "courseResource":
      return 200 * 1024 * 1024; // 200MB
  }
}

/**
 * Endpoint-specific max files count
 */
export function getMaxFilesForEndpoint(
  endpoint: "avatar" | "document" | "media" | "courseResource"
): number {
  switch (endpoint) {
    case "avatar":
      return 1;
    case "document":
      return 10;
    case "media":
      return 5;
    case "courseResource":
      return 20;
  }
}
