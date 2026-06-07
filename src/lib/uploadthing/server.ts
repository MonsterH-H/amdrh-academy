import { createUploadthing, type FileRouter } from "uploadthing/next-legacy";
import { UTApi } from "uploadthing/server";

const f = createUploadthing();

/**
 * Auth middleware — validates that the request has proper authorization.
 * Returns user context for downstream handlers.
 */
async function createAuthedContext() {
  // In production, validate JWT or session from headers/cookies.
  // For now, return a stub that the middleware expects.
  return { userId: "authenticated" };
}

export const UploadRouter = {
  // Avatar upload (max 2MB, single image only)
  avatar: f({
    image: {
      maxFileSize: "2MB",
      maxFileCount: 1,
    },
  })
    .middleware(createAuthedContext)
    .onUploadComplete(async ({ file }) => {
      console.log("[UploadThing] Avatar uploaded:", file.name, "→", file.url);
      return { url: file.url, key: file.key, name: file.name };
    }),

  // Document upload (max 50MB — PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX)
  document: f({
    "application/pdf": { maxFileSize: "50MB", maxFileCount: 10 },
    "application/msword": { maxFileSize: "50MB", maxFileCount: 10 },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { maxFileSize: "50MB", maxFileCount: 10 },
    "application/vnd.ms-excel": { maxFileSize: "50MB", maxFileCount: 10 },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": { maxFileSize: "50MB", maxFileCount: 10 },
    "application/vnd.ms-powerpoint": { maxFileSize: "50MB", maxFileCount: 10 },
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": { maxFileSize: "50MB", maxFileCount: 10 },
    "text/plain": { maxFileSize: "50MB", maxFileCount: 10 },
    "text/csv": { maxFileSize: "50MB", maxFileCount: 10 },
    image: { maxFileSize: "50MB", maxFileCount: 10 },
  })
    .middleware(createAuthedContext)
    .onUploadComplete(async ({ file }) => {
      console.log("[UploadThing] Document uploaded:", file.name, "→", file.url);
      return { url: file.url, key: file.key, name: file.name };
    }),

  // Media upload (max 100MB — images, videos)
  media: f({
    image: { maxFileSize: "100MB", maxFileCount: 5 },
    video: { maxFileSize: "100MB", maxFileCount: 5 },
  })
    .middleware(createAuthedContext)
    .onUploadComplete(async ({ file }) => {
      console.log("[UploadThing] Media uploaded:", file.name, "→", file.url);
      return { url: file.url, key: file.key, name: file.name };
    }),

  // Course resource upload (max 200MB — all types)
  courseResource: f({
    image: { maxFileSize: "200MB", maxFileCount: 20 },
    video: { maxFileSize: "200MB", maxFileCount: 20 },
    "application/pdf": { maxFileSize: "200MB", maxFileCount: 20 },
    "application/msword": { maxFileSize: "200MB", maxFileCount: 20 },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { maxFileSize: "200MB", maxFileCount: 20 },
    "application/vnd.ms-excel": { maxFileSize: "200MB", maxFileCount: 20 },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": { maxFileSize: "200MB", maxFileCount: 20 },
    "application/vnd.ms-powerpoint": { maxFileSize: "200MB", maxFileCount: 20 },
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": { maxFileSize: "200MB", maxFileCount: 20 },
    "text/plain": { maxFileSize: "200MB", maxFileCount: 20 },
    "text/csv": { maxFileSize: "200MB", maxFileCount: 20 },
    audio: { maxFileSize: "200MB", maxFileCount: 20 },
    "application/zip": { maxFileSize: "200MB", maxFileCount: 20 },
    "application/x-rar-compressed": { maxFileSize: "200MB", maxFileCount: 20 },
    "application/x-7z-compressed": { maxFileSize: "200MB", maxFileCount: 20 },
    "application/gzip": { maxFileSize: "200MB", maxFileCount: 20 },
  })
    .middleware(createAuthedContext)
    .onUploadComplete(async ({ file }) => {
      console.log("[UploadThing] Course resource uploaded:", file.name, "→", file.url);
      return { url: file.url, key: file.key, name: file.name };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof UploadRouter;

/** Server-side UploadThing API for programmatic operations */
export function getUTApi(): UTApi {
  return new UTApi();
}
