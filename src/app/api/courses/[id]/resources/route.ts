import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { title, fileType, category, fileUrl } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Le titre est requis" }, { status: 400 });
    }

    const course = await db.course.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!course) {
      return NextResponse.json({ error: "Cours introuvable" }, { status: 404 });
    }

    // Use a default uploadedById since we don't have auth in API
    const resource = await db.resource.create({
      data: {
        title: title.trim(),
        description: "",
        fileName: fileUrl ? fileUrl.split("/").pop() || "fichier" : "fichier",
        filePath: fileUrl || "",
        fileType: fileType || "AUTRE",
        category: category || "AUTRE",
        courseId: id,
        uploadedById: (await db.user.findFirst({ select: { id: true } }))?.id || "",
      },
    });

    return NextResponse.json({ resource }, { status: 201 });
  } catch (error) {
    console.error("Resource create error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'ajout de la ressource" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const resourceId = searchParams.get("resourceId");

    if (!resourceId) {
      return NextResponse.json({ error: "resourceId requis" }, { status: 400 });
    }

    await db.resource.delete({
      where: { id: resourceId, courseId: id },
    });

    return NextResponse.json({ message: "Ressource supprimée" });
  } catch (error) {
    console.error("Resource delete error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la ressource" },
      { status: 500 }
    );
  }
}
