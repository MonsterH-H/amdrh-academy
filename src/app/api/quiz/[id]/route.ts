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
          select: { title: true, maxAttempts: true },
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
    const answerResults = [];

    for (const question of quiz.questions) {
      const userAnswer = answers?.find((a: { questionId: string }) => a.questionId === question.id);
      const correctAnswer = JSON.parse(question.correctAnswer) as number[];
      const selectedAnswer = userAnswer ? JSON.parse(userAnswer.selectedAnswer as string) as number[] : [];
      const isCorrect =
        JSON.stringify([...selectedAnswer].sort()) === JSON.stringify([...correctAnswer].sort());
      const pointsEarned = isCorrect ? question.points : 0;

      totalScore += pointsEarned;

      await db.quizAnswer.upsert({
        where: {
          id: userAnswer?.answerId || `temp-${Date.now()}-${question.id}`,
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

    const scorePercentage = Math.round(
      (totalScore / quiz.questions.reduce((acc, q) => acc + q.points, 0)) * 100
    );

    const status = scorePercentage >= quiz.passingScore ? "REUSSI" : "ECHOUE";

    await db.quizAttempt.update({
      where: { id: attempt.id },
      data: {
        score: totalScore,
        status,
        submittedAt: new Date(),
      },
    });

    // Check if we should issue a certificate
    if (status === "REUSSI" && quiz.course?.isCertifying) {
      const existingCert = await db.certificate.findFirst({
        where: { userId, courseId: quiz.course.id },
      });

      if (!existingCert) {
        // Generate sequential certificate code: AMDRH-YYYY-XXXXX
        const year = new Date().getFullYear();
        const count = await db.certificate.count();
        let certCode = `AMDRH-${year}-${String(count + 1).padStart(5, "0")}`;

        // Ensure uniqueness with retry loop
        let existing = await db.certificate.findUnique({ where: { code: certCode } });
        let retry = 2;
        while (existing && retry < 100) {
          certCode = `AMDRH-${year}-${String(count + retry).padStart(5, "0")}`;
          existing = await db.certificate.findUnique({ where: { code: certCode } });
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
            maxScore: quiz.questions.reduce((acc, q) => acc + q.points, 0),
            userName: user ? `${user.prenom} ${user.nom}` : "",
            userLicence: user?.licenceNumber || null,
            qrCodeUrl: `/verify/${certCode}`,
          },
        });

        await db.notification.create({
          data: {
            userId,
            type: "CERTIFICAT",
            title: "Félicitations ! Certificat obtenu",
            message: `Vous avez obtenu votre certificat pour le cours "${quiz.course.title}". Code : ${certCode}`,
          },
        });
      }
    }

    return NextResponse.json({
      attemptId: attempt.id,
      score: totalScore,
      maxScore: quiz.questions.reduce((acc, q) => acc + q.points, 0),
      scorePercentage,
      status,
      answers: answerResults,
    });
  } catch (error) {
    console.error("Quiz submit error:", error);
    return NextResponse.json({ error: "Erreur de soumission" }, { status: 500 });
  }
}
