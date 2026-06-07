import { createRouteHandler } from "uploadthing/next";
import { UploadRouter } from "@/lib/uploadthing/server";
import { readFileSync } from "fs";
import { join } from "path";

/**
 * Read UPLOADTHING_TOKEN from .env file as a fallback.
 * Next.js + Turbopack may not reliably expose non-NEXT_PUBLIC_ env vars
 * to all route handlers. This function parses the .env file directly.
 */
function getTokenFromEnv(): string | undefined {
  // Try process.env first (standard Next.js behavior)
  if (process.env.UPLOADTHING_TOKEN) return process.env.UPLOADTHING_TOKEN;

  // Fallback: read .env file directly
  try {
    const envPath = join(process.cwd(), ".env");
    const envContent = readFileSync(envPath, "utf-8");
    for (const line of envContent.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIndex = trimmed.indexOf("=");
      if (eqIndex === -1) continue;
      const key = trimmed.slice(0, eqIndex).trim();
      let value = trimmed.slice(eqIndex + 1).trim();
      // Strip surrounding quotes
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (key === "UPLOADTHING_TOKEN" && value) return value;
    }
  } catch {
    // .env file not found or unreadable — ignore
  }
  return undefined;
}

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
    /**
     * UploadThing API token — with .env file fallback for Turbopack compatibility.
     */
    token: getTokenFromEnv(),
  },
});
