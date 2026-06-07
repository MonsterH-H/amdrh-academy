import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// ─────────────────────────────────────────────────────────────
// GET /api/files/serve/[id] - Serve file by resource ID
// For UploadThing resources: redirect to the UploadThing URL
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
        { error: "Utilisateur non trouvé ou inactif" },
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

    if (!resource.filePath) {
      return NextResponse.json(
        { error: "Fichier non disponible" },
        { status: 404 }
      );
    }

    // Increment download count (fire and forget)
    db.resource.update({
      where: { id },
      data: { downloadCount: { increment: 1 } },
    }).catch(() => {});

    // For UploadThing cloud resources: redirect to the UploadThing URL
    // The filePath stored in the DB is the full UploadThing URL (e.g. https://utfs.io/f/xxx)
    if (resource.filePath.startsWith("https://")) {
      return NextResponse.redirect(resource.filePath);
    }

    // Fallback: return the file path as JSON for client-side handling
    return NextResponse.json({ url: resource.filePath, fileName: resource.fileName });
  } catch (error) {
    console.error("[Files/serve] Error:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
