import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-helpers";

// POST /api/admin/certificates/bulk-issue — bulk issue certificates
export async function POST(req: NextRequest) {
  const auth = await requireRole(req, ["ADMIN"]);
  if (!auth.authorized) return auth.response;
  try {
    const body = await req.json();
    const { courseId, userIds, type } = body;

    if (!courseId || !userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: "courseId et userIds sont requis" }, { status: 400 });
    }

    const course = await db.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return NextResponse.json({ error: "Cours introuvable" }, { status: 404 });
    }

    const validTypes = ["ATTESTATION", "CERTIFICAT_COMPLETION", "DIPLOME", "CERTIFICAT"];
    const certType = type && validTypes.includes(type) ? type : "CERTIFICAT";

    const results: Array<{ userId: string; success: boolean; code?: string; error?: string }> = [];
    const year = new Date().getFullYear();
    let baseCount = await db.certificate.count();

    for (const userId of userIds) {
      try {
        // Check if already has certificate for this course
        const existing = await db.certificate.findFirst({
          where: { userId, courseId },
        });
        if (existing) {
          results.push({ userId, success: false, error: "Déjà certifié" });
          continue;
        }

        const user = await db.user.findUnique({ where: { id: userId } });
        if (!user) {
          results.push({ userId, success: false, error: "Utilisateur introuvable" });
          continue;
        }

        // Get best quiz score
        const quiz = await db.quiz.findUnique({ where: { courseId } });
        let score = 0;
        let maxScore = 100;
        if (quiz) {
          const bestAttempt = await db.quizAttempt.findFirst({
            where: { userId, quizId: quiz.id, status: "REUSSI" },
            orderBy: { score: "desc" },
          });
          if (bestAttempt) {
            score = bestAttempt.score;
            maxScore = bestAttempt.maxScore;
          } else {
            const anyAttempt = await db.quizAttempt.findFirst({
              where: { userId, quizId: quiz.id },
              orderBy: { score: "desc" },
            });
            if (anyAttempt) {
              score = anyAttempt.score;
              maxScore = anyAttempt.maxScore;
            }
          }
        }

        baseCount++;
        let certCode = `AMDRH-${year}-${String(baseCount).padStart(5, "0")}`;
        let exists = await db.certificate.findUnique({ where: { code: certCode } });
        let retry = 2;
        while (exists && retry < 100) {
          baseCount++;
          certCode = `AMDRH-${year}-${String(baseCount).padStart(5, "0")}`;
          exists = await db.certificate.findUnique({ where: { code: certCode } });
          retry++;
        }

        const certificate = await db.certificate.create({
          data: {
            code: certCode,
            type: certType,
            status: "ACTIVE",
            userId,
            courseId,
            courseTitle: course.title,
            userName: `${user.prenom} ${user.nom}`,
            userLicence: user.licenceNumber,
            score,
            maxScore,
            qrCodeUrl: `/verify/${certCode}`,
          },
        });

        await db.notification.create({
          data: {
            userId,
            type: "CERTIFICAT",
            title: `Nouveau ${certType === "ATTESTATION" ? "attestation" : certType === "DIPLOME" ? "diplôme" : "certificat"} délivré`,
            message: `Vous avez reçu un(e) ${certType} pour le cours "${course.title}". Code: ${certCode}`,
          },
        });

        results.push({ userId, success: true, code: certCode });
      } catch {
        results.push({ userId, success: false, error: "Erreur lors de la création" });
      }
    }

    const succeeded = results.filter((r) => r.success).length;
    return NextResponse.json({
      results,
      summary: {
        total: userIds.length,
        succeeded,
        failed: userIds.length - succeeded,
      },
    });
  } catch (error) {
    console.error("Bulk issue error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
