import { createRouteHandler } from "uploadthing/next";
import { UploadRouter } from "@/lib/uploadthing/server";

/**
 * UploadThing v7 route handler
 *
 * IMPORTANT: In uploadthing v7, this MUST be at /api/uploadthing/route.ts (NOT a catch-all [...slug]).
 * The client SDK sends requests to /api/uploadthing?actionType=upload&slug=courseResource,
 * which only matches a non-catch-all route.ts.
 */
export const { GET, POST } = createRouteHandler({
  router: UploadRouter,
  config: {
    /**
     * UploadThing uses this URL for callbacks after upload completes.
     * When deployed, set NEXTAUTH_URL to your public domain.
     */
    callbackUrl: process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  },
});
