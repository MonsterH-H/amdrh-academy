import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const quiz = await db.quiz.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            text: true,
            type: true,
            options: true,
            points: true,
            order: true,
          },
        },
        course: {
          select: { title: true, maxAttempts: true, isCertifying: true },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz introuvable" }, { status: 404 });
    }

    return NextResponse.json({ quiz });
  } catch (error) {
    console.error("Quiz fetch error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId, answers, attemptId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Utilisateur requis" }, { status: 400 });
    }

    const quiz = await db.quiz.findUnique({
      where: { id },
      include: { questions: true, course: true },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz introuvable" }, { status: 404 });
    }

    const previousAttempts = await db.quizAttempt.count({
      where: { userId, quizId: id, status: { in: ["REUSSI", "ECHOUE"] } },
    });

    if (previousAttempts >= quiz.maxAttempts) {
      return NextResponse.json(
        { error: "Nombre maximum de tentatives atteint" },
        { status: 403 }
      );
    }

    let attempt = attemptId
      ? await db.quizAttempt.findUnique({ where: { id: attemptId } })
      : null;

    if (!attempt) {
      attempt = await db.quizAttempt.create({
        data: {
          userId,
          quizId: id,
          maxScore: quiz.questions.reduce((acc, q) => acc + q.points, 0),
        },
        include: { answers: true },
      });
    }

    let totalScore = 0;
    const answerResults: Array<{
      questionId: string;
      isCorrect: boolean;
      pointsEarned: number;
      correctAnswer: number[];
    }> = [];

    for (const question of quiz.questions) {
      const userAnswer = answers?.find(
        (a: { questionId: string }) => a.questionId === question.id
      );
      const correctAnswer = JSON.parse(question.correctAnswer) as number[];
      const selectedAnswer = userAnswer
        ? (JSON.parse(userAnswer.selectedAnswer as string) as number[])
        : [];
      const isCorrect =
        JSON.stringify([...selectedAnswer].sort()) ===
        JSON.stringify([...correctAnswer].sort());
      const pointsEarned = isCorrect ? question.points : 0;

      totalScore += pointsEarned;

      await db.quizAnswer.upsert({
        where: {
          id:
            userAnswer?.answerId || `temp-${Date.now()}-${question.id}`,
        },
        create: {
          attemptId: attempt.id,
          questionId: question.id,
          selectedAnswer: JSON.stringify(selectedAnswer),
          isCorrect,
          pointsEarned,
        },
        update: {
          selectedAnswer: JSON.stringify(selectedAnswer),
          isCorrect,
          pointsEarned,
        },
      });

      answerResults.push({
        questionId: question.id,
        isCorrect,
        pointsEarned,
        correctAnswer,
      });
    }

    const maxScore = quiz.questions.reduce((acc, q) => acc + q.points, 0);
    const scorePercentage = Math.round((totalScore / maxScore) * 100);
    const status = scorePercentage >= quiz.passingScore ? "REUSSI" : "ECHOUE";

    await db.quizAttempt.update({
      where: { id: attempt.id },
      data: {
        score: totalScore,
        status,
        submittedAt: new Date(),
      },
    });

    // Calculate attempts remaining (current attempt counts as used)
    const attemptsRemaining = Math.max(
      0,
      quiz.maxAttempts - (previousAttempts + 1)
    );

    // Variables for response
    let certificateInfo: {
      code: string;
      type: string;
      courseTitle: string;
    } | null = null;
    let enrollmentCompleted = false;
    let remainingLessons = 0;

    // ── PASSED: Handle certificate & enrollment completion ──
    if (status === "REUSSI" && quiz.courseId) {
      // --- Certificate for certifying courses ---
      if (quiz.course?.isCertifying) {
        const existingCert = await db.certificate.findFirst({
          where: { userId, courseId: quiz.course.id },
        });

        if (!existingCert) {
          // Generate sequential certificate code: AMDRH-YYYY-XXXXX
          const year = new Date().getFullYear();
          const count = await db.certificate.count();
          let certCode = `AMDRH-${year}-${String(count + 1).padStart(5, "0")}`;

          // Ensure uniqueness with retry loop
          let existing = await db.certificate.findUnique({
            where: { code: certCode },
          });
          let retry = 2;
          while (existing && retry < 100) {
            certCode = `AMDRH-${year}-${String(count + retry).padStart(5, "0")}`;
            existing = await db.certificate.findUnique({
              where: { code: certCode },
            });
            retry++;
          }

          // Fetch user to get proper name and licence
          const user = await db.user.findUnique({ where: { id: userId } });

          await db.certificate.create({
            data: {
              code: certCode,
              type: "CERTIFICAT",
              status: "ACTIVE",
              userId,
              courseId: quiz.course.id,
              courseTitle: quiz.course.title,
              score: totalScore,
              maxScore,
              userName: user ? `${user.prenom} ${user.nom}` : "",
              userLicence: user?.licenceNumber || null,
              qrCodeUrl: `/verify/${certCode}`,
            },
          });

          certificateInfo = {
            code: certCode,
            type: "CERTIFICAT",
            courseTitle: quiz.course.title,
          };

          await db.notification.create({
            data: {
              userId,
              type: "CERTIFICAT",
              title: "Félicitations ! Certificat obtenu",
              message: `Vous avez obtenu votre certificat pour le cours "${quiz.course.title}". Code : ${certCode}`,
            },
          });
        } else {
          certificateInfo = {
            code: existingCert.code,
            type: existingCert.type,
            courseTitle: existingCert.courseTitle,
          };
        }
      }

      // --- Enrollment completion logic ---
      const enrollment = await db.enrollment.findUnique({
        where: {
          userId_courseId: { userId, courseId: quiz.courseId },
        },
      });

      if (enrollment && enrollment.status !== "termine") {
        // Count total lessons and completed lessons
        const totalLessons = await db.lesson.count({
          where: {
            section: { courseId: quiz.courseId },
          },
        });
        const completedLessons = await db.lessonProgress.count({
          where: {
            enrollmentId: enrollment.id,
            completed: true,
          },
        });

        remainingLessons = totalLessons - completedLessons;

        // For certifying courses: quiz pass + all lessons done = complete
        // For non-certifying courses with quiz: quiz pass = complete
        const shouldComplete = quiz.course?.isCertifying
          ? completedLessons >= totalLessons
          : true;

        if (shouldComplete) {
          await db.enrollment.update({
            where: { id: enrollment.id },
            data: {
              status: "termine",
              progress: 100,
              completedAt: new Date(),
            },
          });
          enrollmentCompleted = true;
        }
      }

      // Create quiz passed notification
      if (enrollmentCompleted) {
        await db.notification.create({
          data: {
            userId,
            type: "QUIZ",
            title: "Formation terminée !",
            message: `Vous avez terminé la formation "${quiz.course.title}" avec succès. Score : ${totalScore}/${maxScore} (${scorePercentage}%).`,
            link: `/courses/${quiz.courseId}`,
          },
        });
      } else {
        await db.notification.create({
          data: {
            userId,
            type: "QUIZ",
            title: "Quiz réussi !",
            message: `Vous avez réussi le quiz de "${quiz.course.title}" avec un score de ${totalScore}/${maxScore} (${scorePercentage}%).${
              remainingLessons > 0
                ? ` Il vous reste ${remainingLessons} leçon${remainingLessons > 1 ? "s" : ""} à compléter.`
                : ""
            }`,
            link: `/courses/${quiz.courseId}`,
          },
        });
      }
    }

    // ── FAILED: Create notification with encouragement ──
    if (status === "ECHOUE") {
      const encouragement =
        attemptsRemaining > 0
          ? `Ne vous découragez pas ! Vous avez encore ${attemptsRemaining} tentative${attemptsRemaining > 1 ? "s" : ""}. Révisez le cours et réessayez.`
          : "Nombre maximum de tentatives atteint. Consultez le cours pour réviser le contenu.";

      await db.notification.create({
        data: {
          userId,
          type: "QUIZ",
          title: "Quiz non réussi",
          message: `Vous n'avez pas atteint le score minimum pour le quiz "${quiz.course.title}". Score : ${totalScore}/${maxScore} (${scorePercentage}%). ${encouragement}`,
          link: `/courses/${quiz.courseId}`,
        },
      });
    }

    return NextResponse.json({
      attemptId: attempt.id,
      score: totalScore,
      maxScore,
      scorePercentage,
      status,
      answers: answerResults,
      certificate: certificateInfo,
      enrollmentCompleted,
      attemptsRemaining,
      ...(status === "REUSSI" && remainingLessons > 0
        ? { remainingLessons }
        : {}),
    });
  } catch (error) {
    console.error("Quiz submit error:", error);
    return NextResponse.json(
      { error: "Erreur de soumission" },
      { status: 500 }
    );
  }
}
