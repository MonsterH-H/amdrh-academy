import { createRouteHandler } from "uploadthing/next";
import { UploadRouter } from "@/lib/uploadthing/server";

/**
 * UploadThing v7 route handler
 *
 * IMPORTANT: In uploadthing v7, this MUST be at /api/uploadthing/route.ts (NOT a catch-all [...slug]).
 * The client SDK sends requests to /api/uploadthing?actionType=upload&slug=courseResource,
 * which only matches a non-catch-all route.ts.
 *
 * UPLOADTHING_TOKEN is automatically read from process.env by the UploadThing SDK.
 * On Vercel, set this environment variable in Project Settings → Environment Variables.
 */
export const { GET, POST } = createRouteHandler({
  router: UploadRouter,
  config: {
    /**
     * UploadThing uses this URL for callbacks after upload completes.
     * When deployed, NEXTAUTH_URL should be set to your public domain.
     */
    callbackUrl: process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  },
});
