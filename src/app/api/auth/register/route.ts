import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { registerStep1Schema, registerStep2Schema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { step1, step2 } = body;

    const validated1 = registerStep1Schema.safeParse(step1);
    if (!validated1.success) {
      return NextResponse.json(
        { error: validated1.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const validated2 = registerStep2Schema.safeParse(step2);
    if (!validated2.success) {
      return NextResponse.json(
        { error: validated2.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const existingUser = await db.user.findUnique({
      where: { email: validated1.data.email },
    });
    if (existingUser) {
      return NextResponse.json(
        { error: { email: ["Cet email est déjà utilisé"] } },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(validated1.data.password, 12);

    const user = await db.user.create({
      data: {
        email: validated1.data.email,
        passwordHash,
        nom: validated1.data.nom,
        prenom: validated1.data.prenom,
        role: validated2.data.role,
        telephone: validated2.data.telephone,
        club: validated2.data.club,
        region: validated2.data.region,
        licenceNumber: validated2.data.licenceNumber || null,
      },
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        role: true,
      },
    });

    // Auto-enroll in mandatory learning paths for the user's role
    const mandatoryPaths = await db.learningPath.findMany({
      where: { targetRole: validated2.data.role as never, isMandatory: true },
    });

    for (const path of mandatoryPaths) {
      await db.learningPathEnrollment.create({
        data: {
          userId: user.id,
          learningPathId: path.id,
        },
      });

      // Enroll in first course of path
      const firstCourse = await db.learningPathCourse.findFirst({
        where: { learningPathId: path.id },
        orderBy: { order: "asc" },
      });
      if (firstCourse) {
        await db.enrollment.create({
          data: { userId: user.id, courseId: firstCourse.courseId },
        });
      }
    }

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du compte" },
      { status: 500 }
    );
  }
}
