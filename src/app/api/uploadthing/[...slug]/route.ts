import { createRouteHandler } from "uploadthing/next-legacy";
import { UploadRouter } from "@/lib/uploadthing/server";

/**
 * UploadThing callback route handler
 * Handles GET (info) and POST (upload) requests from the UploadThing client
 */
export const { GET, POST } = createRouteHandler({
  router: UploadRouter,
  config: {
    /**
     * UploadThing uses this URL for callbacks after upload completes.
     * When deployed, set NEXTAUTH_URL to your public domain.
     * The client SDK also supports polling as a fallback.
     */
    callbackUrl: process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  },
});
