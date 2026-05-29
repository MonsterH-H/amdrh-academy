import { createRouteHandler } from "uploadthing/next-legacy";
import { UploadRouter } from "@/lib/uploadthing/server";

/**
 * UploadThing callback route handler
 * Handles GET (info) and POST (upload) requests from the UploadThing client
 */
export const { GET, POST } = createRouteHandler({
  router: UploadRouter,
  config: {
    callbackUrl: process.env.NEXTAUTH_URL || "http://localhost:3000",
  },
});
