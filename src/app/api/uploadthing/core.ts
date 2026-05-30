import { NextResponse } from "next/server";
import { getUTApi } from "@/lib/uploadthing/server";

/**
 * POST /api/uploadthing/core — Programmatic server-side upload
 * Accepts JSON body with file data and uploads via UTApi.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const utapi = getUTApi();

    const result = await utapi.uploadFiles(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[UploadThing] Core upload error:", error);
    return NextResponse.json(
      { error: "Erreur lors du téléchargement du fichier" },
      { status: 500 }
    );
  }
}
