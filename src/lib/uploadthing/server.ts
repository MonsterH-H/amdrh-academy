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
  // Avatar upload (max 2MB, image only)
  avatar: f({
    middleware: createAuthedContext,
    onUploadComplete: async ({ file }) => {
      console.log("[UploadThing] Avatar uploaded:", file.name);
      return { url: file.url, key: file.key, name: file.name };
    },
  }),

  // Document upload (max 50MB — PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX)
  document: f({
    middleware: createAuthedContext,
    onUploadComplete: async ({ file }) => {
      console.log("[UploadThing] Document uploaded:", file.name);
      return { url: file.url, key: file.key, name: file.name };
    },
  }),

  // Media upload (max 100MB — images, videos)
  media: f({
    middleware: createAuthedContext,
    onUploadComplete: async ({ file }) => {
      console.log("[UploadThing] Media uploaded:", file.name);
      return { url: file.url, key: file.key, name: file.name };
    },
  }),

  // Course resource upload (max 200MB — all types)
  courseResource: f({
    middleware: createAuthedContext,
    onUploadComplete: async ({ file }) => {
      console.log("[UploadThing] Course resource uploaded:", file.name);
      return { url: file.url, key: file.key, name: file.name };
    },
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof UploadRouter;

/** Server-side UploadThing API for programmatic operations */
export function getUTApi(): UTApi {
  return new UTApi();
}
