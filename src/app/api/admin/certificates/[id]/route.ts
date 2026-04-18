import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-helpers";

// GET /api/admin/certificates/[id] — get single certificate
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole(req, ["ADMIN"]);
  if (!auth.authorized) return auth.response;
  try {
    const { id } = await params;
    const certificate = await db.certificate.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, nom: true, prenom: true, email: true, role: true } },
      },
    });
    if (!certificate) {
      return NextResponse.json({ error: "Certificat introuvable" }, { status: 404 });
    }
    return NextResponse.json({ certificate });
  } catch (error) {
    console.error("Admin certificate GET error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PATCH /api/admin/certificates/[id] — revoke/reactivate
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole(req, ["ADMIN"]);
  if (!auth.authorized) return auth.response;
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, revokeReason } = body;

    const certificate = await db.certificate.findUnique({ where: { id } });
    if (!certificate) {
      return NextResponse.json({ error: "Certificat introuvable" }, { status: 404 });
    }

    const validStatuses = ["ACTIVE", "REVOKED", "SUSPENDED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = { status };
    if (status === "REVOKED") {
      updateData.revokedAt = new Date();
      updateData.revokeReason = revokeReason || null;
    }
    if (status === "ACTIVE") {
      updateData.revokedAt = null;
      updateData.revokeReason = null;
    }

    const updated = await db.certificate.update({
      where: { id },
      data: updateData,
    });

    // Create notification if revoked
    if (status === "REVOKED") {
      await db.notification.create({
        data: {
          userId: certificate.userId,
          type: "CERTIFICAT",
          title: "Certificat révoqué",
          message: `Votre certificat ${certificate.code} a été révoqué. Raison: ${revokeReason || "Non spécifiée"}`,
        },
      });
    }

    if (status === "ACTIVE" && certificate.status === "REVOKED") {
      await db.notification.create({
        data: {
          userId: certificate.userId,
          type: "CERTIFICAT",
          title: "Certificat réactivé",
          message: `Votre certificat ${certificate.code} a été réactivé.`,
        },
      });
    }

    return NextResponse.json({ certificate: updated });
  } catch (error) {
    console.error("Admin certificate PATCH error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST /api/admin/certificates/bulk-issue — bulk issue certificates
export async function POST_bulkIssue(req: NextRequest) {
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
            // Get any best attempt
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
      } catch (err) {
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
