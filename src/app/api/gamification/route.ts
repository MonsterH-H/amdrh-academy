import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// ─── Level definitions ────────────────────────────────────────────────────────

const LEVELS = [
  { name: "Débutant", xp: 0 },
  { name: "Apprenti", xp: 100 },
  { name: "Confirmé", xp: 300 },
  { name: "Avancé", xp: 600 },
  { name: "Expert", xp: 1000 },
  { name: "Maître", xp: 1500 },
];

// ─── XP rules ─────────────────────────────────────────────────────────────────

const XP_LESSON_COMPLETE = 10;
const XP_QUIZ_COMPLETE = 50;
const XP_QUIZ_BONUS_THRESHOLD = 80;
const XP_QUIZ_BONUS = 25;
const XP_CERTIFICATE = 100;
const XP_BADGE = 75;
const XP_DAILY_LOGIN = 5;

function getLevelFromXP(totalXP: number) {
  let current = LEVELS[0];
  let next = LEVELS[1];
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVELS[i].xp) {
      current = LEVELS[i];
      next = LEVELS[i + 1] || null;
      break;
    }
  }
  return {
    current,
    next,
    progress: next
      ? Math.min(100, Math.round(((totalXP - current.xp) / (next.xp - current.xp)) * 100))
      : 100,
  };
}

// ─── GET handler ──────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Paramètre userId manquant" }, { status: 400 });
    }

    // Fetch all relevant data in parallel
    const [
      lessonProgress,
      quizAttempts,
      certificates,
      userBadges,
      enrollments,
      user,
    ] = await Promise.all([
      db.lessonProgress.findMany({
        where: {
          enrollment: { userId },
          completed: true,
        },
        select: { completedAt: true, id: true },
      }),
      db.quizAttempt.findMany({
        where: { userId, status: { in: ["REUSSI", "ECHOUE", "SOUMIS"] } },
        select: { score: true, maxScore: true, submittedAt: true, id: true },
      }),
      db.certificate.findMany({
        where: { userId },
        select: { issuedAt: true, id: true },
      }),
      db.userBadge.findMany({
        where: { userId },
        include: { badge: true },
      }),
      db.enrollment.findMany({
        where: { userId },
        include: {
          course: {
            include: { quiz: true },
          },
          lessonProgress: {
            where: { completed: true },
            select: { completedAt: true },
          },
        },
      }),
      db.user.findUnique({
        where: { id: userId },
        select: { lastLoginAt: true, createdAt: true },
      }),
    ]);

    // ─── Calculate XP from completed lessons ─────────────────────────────
    const uniqueLessonDays = new Set<string>();
    for (const lp of lessonProgress) {
      if (lp.completedAt) {
        uniqueLessonDays.add(lp.completedAt.toISOString().slice(0, 10));
      }
    }
    const lessonXP = lessonProgress.length * XP_LESSON_COMPLETE;

    // ─── Calculate XP from quiz attempts ────────────────────────────────
    let quizXP = 0;
    const quizDays = new Set<string>();
    for (const attempt of quizAttempts) {
      quizXP += XP_QUIZ_COMPLETE;
      const scorePct = attempt.maxScore > 0
        ? Math.round((attempt.score / attempt.maxScore) * 100)
        : 0;
      if (scorePct > XP_QUIZ_BONUS_THRESHOLD) {
        quizXP += XP_QUIZ_BONUS;
      }
      if (attempt.submittedAt) {
        quizDays.add(attempt.submittedAt.toISOString().slice(0, 10));
      }
    }

    // ─── Calculate XP from certificates and badges ───────────────────────
    const certificateXP = certificates.length * XP_CERTIFICATE;
    const badgeXP = userBadges.length * XP_BADGE;

    // ─── Estimate daily login XP ────────────────────────────────────────
    const loginDays = new Set<string>();
    if (user?.lastLoginAt) {
      // Count days between account creation and now as an approximation
      const created = user.createdAt || new Date();
      const now = new Date();
      const dayMs = 1000 * 60 * 60 * 24;
      const totalDays = Math.max(1, Math.ceil((now.getTime() - created.getTime()) / dayMs));
      // Use unique activity days as a proxy for login days
      for (const day of uniqueLessonDays) loginDays.add(day);
      for (const day of quizDays) loginDays.add(day);
      for (const cert of certificates) {
        if (cert.issuedAt) loginDays.add(cert.issuedAt.toISOString().slice(0, 10));
      }
      for (const ub of userBadges) {
        loginDays.add(ub.earnedAt.toISOString().slice(0, 10));
      }
    }
    const dailyLoginXP = loginDays.size * XP_DAILY_LOGIN;

    // ─── Total XP and breakdown ─────────────────────────────────────────
    const totalXP = lessonXP + quizXP + certificateXP + badgeXP + dailyLoginXP;

    const pointsBreakdown = {
      lessons: { xp: lessonXP, count: lessonProgress.length, label: "Leçons complétées" },
      quizzes: { xp: quizXP, count: quizAttempts.length, label: "Quiz complétés" },
      certificates: { xp: certificateXP, count: certificates.length, label: "Certificats obtenus" },
      badges: { xp: badgeXP, count: userBadges.length, label: "Badges obtenus" },
      dailyLogin: { xp: dailyLoginXP, count: loginDays.size, label: "Connexions quotidiennes" },
    };

    // ─── Level ──────────────────────────────────────────────────────────
    const levelInfo = getLevelFromXP(totalXP);

    // ─── Streak calculation ─────────────────────────────────────────────
    const allActivityDays = new Set<string>();
    for (const day of uniqueLessonDays) allActivityDays.add(day);
    for (const day of quizDays) allActivityDays.add(day);
    for (const cert of certificates) {
      if (cert.issuedAt) allActivityDays.add(cert.issuedAt.toISOString().slice(0, 10));
    }
    for (const ub of userBadges) allActivityDays.add(ub.earnedAt.toISOString().slice(0, 10));

    const today = new Date().toISOString().slice(0, 10);
    if (allActivityDays.size > 0) allActivityDays.add(today);

    const sortedDays = Array.from(allActivityDays).sort().reverse();
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    const dayMs = 1000 * 60 * 60 * 24;

    if (sortedDays.length > 0) {
      const checkDate = new Date(today);
      // If today or yesterday has activity, count the streak from today
      const hasToday = allActivityDays.has(today);
      const yesterday = new Date(Date.now() - dayMs).toISOString().slice(0, 10);
      const hasYesterday = allActivityDays.has(yesterday);

      if (hasToday || hasYesterday) {
        let d = hasToday ? new Date(today) : new Date(yesterday);
        while (allActivityDays.has(d.toISOString().slice(0, 10))) {
          currentStreak++;
          d = new Date(d.getTime() - dayMs);
        }
      }

      // Calculate longest streak from sorted days
      for (let i = 0; i < sortedDays.length; i++) {
        if (i === 0) {
          tempStreak = 1;
        } else {
          const prev = new Date(sortedDays[i - 1]);
          const curr = new Date(sortedDays[i]);
          const diff = Math.round((prev.getTime() - curr.getTime()) / dayMs);
          if (diff === 1) {
            tempStreak++;
          } else {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
          }
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);
    }

    // ─── Points today ───────────────────────────────────────────────────
    let pointsToday = 0;
    if (allActivityDays.has(today)) {
      pointsToday += XP_DAILY_LOGIN; // Login XP
    }
    for (const lp of lessonProgress) {
      if (lp.completedAt && lp.completedAt.toISOString().slice(0, 10) === today) {
        pointsToday += XP_LESSON_COMPLETE;
      }
    }
    for (const attempt of quizAttempts) {
      if (attempt.submittedAt && attempt.submittedAt.toISOString().slice(0, 10) === today) {
        pointsToday += XP_QUIZ_COMPLETE;
        const scorePct = attempt.maxScore > 0
          ? Math.round((attempt.score / attempt.maxScore) * 100)
          : 0;
        if (scorePct > XP_QUIZ_BONUS_THRESHOLD) pointsToday += XP_QUIZ_BONUS;
      }
    }

    // ─── Weekly activity heatmap (last 12 weeks) ────────────────────────
    const heatmap: Array<{ week: string; days: number[] }> = [];
    const twelveWeeksAgo = new Date(Date.now() - 12 * 7 * dayMs);
    // Align to Monday
    const startOfWeek = new Date(twelveWeeksAgo);
    startOfWeek.setDate(startOfWeek.getDate() - ((startOfWeek.getDay() + 6) % 7));
    startOfWeek.setHours(0, 0, 0, 0);

    for (let w = 0; w < 12; w++) {
      const weekStart = new Date(startOfWeek.getTime() + w * 7 * dayMs);
      const days: number[] = [];
      for (let d = 0; d < 7; d++) {
        const day = new Date(weekStart.getTime() + d * dayMs);
        const dayStr = day.toISOString().slice(0, 10);
        let dayXP = 0;
        // Count activities for this day
        for (const lp of lessonProgress) {
          if (lp.completedAt && lp.completedAt.toISOString().slice(0, 10) === dayStr) dayXP += XP_LESSON_COMPLETE;
        }
        for (const attempt of quizAttempts) {
          if (attempt.submittedAt && attempt.submittedAt.toISOString().slice(0, 10) === dayStr) dayXP += XP_QUIZ_COMPLETE;
        }
        for (const cert of certificates) {
          if (cert.issuedAt && cert.issuedAt.toISOString().slice(0, 10) === dayStr) dayXP += XP_CERTIFICATE;
        }
        for (const ub of userBadges) {
          if (ub.earnedAt.toISOString().slice(0, 10) === dayStr) dayXP += XP_BADGE;
        }
        days.push(dayXP);
      }
      heatmap.push({
        week: `S${w + 1}`,
        days,
      });
    }

    return NextResponse.json({
      currentStreak,
      longestStreak,
      totalXP,
      level: {
        name: levelInfo.current.name,
        xpRequired: levelInfo.current.xp,
        nextLevel: levelInfo.next?.name || null,
        nextLevelXP: levelInfo.next?.xp || null,
        progress: levelInfo.progress,
      },
      pointsBreakdown,
      pointsToday,
      heatmap,
    });
  } catch (error) {
    console.error("Gamification error:", error);
    return NextResponse.json({ error: "Erreur gamification" }, { status: 500 });
  }
}
