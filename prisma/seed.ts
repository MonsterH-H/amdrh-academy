import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const SALT_ROUNDS = 12;
const DEFAULT_PASSWORD = "Password123!";

async function hashPassword(password: string) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function main() {
  console.log("🌱 Seeding Académie AMDRH database...\n");

  // Clean existing data (in order of dependencies)
  console.log("🧹 Cleaning existing data...");
  await db.quizAnswer.deleteMany();
  await db.quizAttempt.deleteMany();
  await db.question.deleteMany();
  await db.quiz.deleteMany();
  await db.lessonProgress.deleteMany();
  await db.enrollment.deleteMany();
  await db.lesson.deleteMany();
  await db.section.deleteMany();
  await db.learningPathCourse.deleteMany();
  await db.learningPathEnrollment.deleteMany();
  await db.certificate.deleteMany();
  await db.userBadge.deleteMany();
  await db.badge.deleteMany();
  await db.learningPath.deleteMany();
  await db.course.deleteMany();
  await db.conversationParticipant.deleteMany();
  await db.message.deleteMany();
  await db.conversation.deleteMany();
  await db.notification.deleteMany();
  await db.passwordResetToken.deleteMany();
  await db.verificationToken.deleteMany();
  await db.federationSync.deleteMany();
  await db.user.deleteMany();
  console.log("✅ Data cleaned.\n");

  // =============================================
  // USERS
  // =============================================
  console.log("👥 Creating users...");
  const passwordHash = await hashPassword(DEFAULT_PASSWORD);

  const users = await Promise.all([
    db.user.create({
      data: { email: "admin@amdrh.ma", passwordHash, prenom: "Mohamed", nom: "El Amrani", role: "ADMIN", telephone: "+212 661-000001", club: "AMDRH", region: "Rabat-Salé-Kénitra", isActive: true, emailVerified: true },
    }),
    db.user.create({
      data: { email: "formateur@amdrh.ma", passwordHash, prenom: "Karim", nom: "Bennani", role: "FORMATEUR", telephone: "+212 661-000002", club: "AS FAR", region: "Rabat-Salé-Kénitra", bio: "Formateur IHF niveau 3 avec 15 ans d'expérience en arbitrage international.", isActive: true, emailVerified: true },
    }),
    db.user.create({
      data: { email: "formateur2@amdrh.ma", passwordHash, prenom: "Fatima", nom: "Zahra", role: "FORMATEUR", telephone: "+212 661-000003", club: "WAC", region: "Casablanca-Settat", bio: "Spécialiste formation des arbitres jeunes.", isActive: true, emailVerified: true },
    }),
    db.user.create({
      data: { email: "arbitre1@amdrh.ma", passwordHash, prenom: "Youssef", nom: "Benali", role: "ARBITRE", telephone: "+212 661-000010", club: "FAR Rabat", region: "Rabat-Salé-Kénitra", licenceNumber: "ARB-2024-001", isActive: true, emailVerified: true },
    }),
    db.user.create({
      data: { email: "arbitre2@amdrh.ma", passwordHash, prenom: "Ahmed", nom: "Tazi", role: "ARBITRE", telephone: "+212 661-000011", club: "WAC Casablanca", region: "Casablanca-Settat", licenceNumber: "ARB-2024-002", isActive: true, emailVerified: true },
    }),
    db.user.create({
      data: { email: "arbitre3@amdrh.ma", passwordHash, prenom: "Rachid", nom: "Ouazzani", role: "ARBITRE", telephone: "+212 661-000012", club: "MAT Tétouan", region: "Tanger-Tétouan-Al Hoceima", licenceNumber: "ARB-2024-003", isActive: true, emailVerified: true },
    }),
    db.user.create({
      data: { email: "entraineur1@amdrh.ma", passwordHash, prenom: "Hassan", nom: "Bennani", role: "ENTRAINEUR", telephone: "+212 661-000020", club: "AS FAR Handball", region: "Rabat-Salé-Kénitra", isActive: true, emailVerified: true },
    }),
    db.user.create({
      data: { email: "entraineur2@amdrh.ma", passwordHash, prenom: "Omar", nom: "Cherkaoui", role: "ENTRAINEUR", telephone: "+212 661-000021", club: "RS Berkane", region: "Oriental", isActive: true, emailVerified: true },
    }),
    db.user.create({
      data: { email: "joueur1@amdrh.ma", passwordHash, prenom: "Fatima", nom: "El Idrissi", role: "JOUEUR", telephone: "+212 661-000030", club: "AS FAR Handball", region: "Rabat-Salé-Kénitra", isActive: true, emailVerified: true },
    }),
    db.user.create({
      data: { email: "joueur2@amdrh.ma", passwordHash, prenom: "Amina", nom: "Hajji", role: "JOUEUR", telephone: "+212 661-000031", club: "WAC Casablanca", region: "Casablanca-Settat", isActive: true, emailVerified: true },
    }),
    db.user.create({
      data: { email: "joueur3@amdrh.ma", passwordHash, prenom: "Sara", nom: "Alaoui", role: "JOUEUR", telephone: "+212 661-000032", club: "MAT Tétouan", region: "Tanger-Tétouan-Al Hoceima", isActive: true, emailVerified: true },
    }),
    db.user.create({
      data: { email: "arbitre4@amdrh.ma", passwordHash, prenom: "Mehdi", nom: "Fassi", role: "ARBITRE", telephone: "+212 661-000013", club: "KAC Marrakech", region: "Marrakech-Safi", licenceNumber: "ARB-2024-004", isActive: true, emailVerified: true },
    }),
    db.user.create({
      data: { email: "arbitre5@amdrh.ma", passwordHash, prenom: "Khalid", nom: "Moussaid", role: "ARBITRE", telephone: "+212 661-000014", club: "HUSA Agadir", region: "Souss-Massa", licenceNumber: "ARB-2024-005", isActive: false, emailVerified: false },
    }),
  ]);

  const admin = users[0];
  const formateurs = users.slice(1, 3);
  const arbitres = users.filter(u => u.role === "ARBITRE");
  const entraineurs = users.filter(u => u.role === "ENTRAINEUR");
  const joueurs = users.filter(u => u.role === "JOUEUR");

  console.log(`✅ Created ${users.length} users (1 admin, ${formateurs.length} formateurs, ${arbitres.length} arbitres, ${entraineurs.length} entraineurs, ${joueurs.length} joueurs)\n`);

  // =============================================
  // LEARNING PATHS
  // =============================================
  console.log("📚 Creating learning paths...");

  const learningPaths = await Promise.all([
    db.learningPath.create({
      data: { title: "Parcours Arbitre Débutant", description: "Formation complète pour les nouveaux arbitres de handball. Couvre les règles de base, le positionnement et la gestion du match.", slug: "arbitre-debutant", targetRole: "ARBITRE", mode: "sequentiel", isMandatory: true, order: 1 },
    }),
    db.learningPath.create({
      data: { title: "Parcours Arbitre Confirmé", description: "Perfectionnement pour arbitres expérimentés. Arbitrage de haut niveau et gestion des situations complexes.", slug: "arbitre-confirme", targetRole: "ARBITRE", mode: "sequentiel", isMandatory: false, order: 2 },
    }),
    db.learningPath.create({
      data: { title: "Parcours Entraîneur", description: "Formation complète pour les entraîneurs de handball : méthodologie, tactique, préparation physique.", slug: "entraineur-formation", targetRole: "ENTRAINEUR", mode: "hybride", isMandatory: true, order: 3 },
    }),
    db.learningPath.create({
      data: { title: "Parcours Joueur", description: "Perfectionnement technique et tactique pour les joueurs de handball.", slug: "joueur-perfectionnement", targetRole: "JOUEUR", mode: "flexible", isMandatory: true, order: 4 },
    }),
  ]);

  console.log(`✅ Created ${learningPaths.length} learning paths\n`);

  // =============================================
  // COURSES
  // =============================================
  console.log("📖 Creating courses...");

  const courses = await Promise.all([
    // Arbitrage courses
    db.course.create({
      data: {
        title: "Introduction aux Règles du Handball",
        slug: "intro-regles-handball",
        description: "Découvrez les règles fondamentales du handball selon les standards IHF. Ce cours couvre les règles de base du jeu, les sanctions, et le rôle de l'arbitre.",
        category: "ARBITRAGE", difficulty: "DEBUTANT", status: "PUBLIE", duration: 120, isCertifying: true, passingScore: 70, maxAttempts: 3, order: 1,
        instructorId: formateurs[0].id,
      },
    }),
    db.course.create({
      data: {
        title: "Positionnement et Déplacement de l'Arbitre",
        slug: "positionnement-arbitre",
        description: "Maîtrisez les techniques de positionnement et de déplacement essentielles pour un arbitrage efficace. Apprenez les trajectoires optimales et les angles de vue.",
        category: "ARBITRAGE", difficulty: "DEBUTANT", status: "PUBLIE", duration: 90, isCertifying: true, passingScore: 60, maxAttempts: 3, order: 2,
        instructorId: formateurs[0].id,
      },
    }),
    db.course.create({
      data: {
        title: "Gestion de l'Engagement et des Sanctions",
        slug: "gestion-engagement-sanctions",
        description: "Apprenez à gérer les situations d'engagement physique, identifier les fautes et appliquer les sanctions appropriées selon le règlement IHF.",
        category: "ARBITRAGE", difficulty: "INTERMEDIAIRE", status: "PUBLIE", duration: 150, isCertifying: true, passingScore: 75, maxAttempts: 3, order: 3,
        instructorId: formateurs[0].id,
      },
    }),
    db.course.create({
      data: {
        title: "Arbitrage des 7 mètres",
        slug: "arbitrage-7-metres",
        description: "Techniques spécifiques et procédures pour l'arbitrage des jets de 7 mètres. Gestion du temps, signaux et communication avec les joueurs.",
        category: "ARBITRAGE", difficulty: "AVANCE", status: "PUBLIE", duration: 60, isCertifying: true, passingScore: 80, maxAttempts: 2, order: 4,
        instructorId: formateurs[1].id,
      },
    }),
    db.course.create({
      data: {
        title: "Technique du Sifflet et Communication",
        slug: "technique-sifflet-communication",
        description: "Développez une technique de sifflement claire et maîtrisez la communication non-verbale avec les joueurs, les entraîneurs et la table de marque.",
        category: "ARBITRAGE", difficulty: "DEBUTANT", status: "PUBLIE", duration: 75, isCertifying: false, passingScore: 50, maxAttempts: 5, order: 5,
        instructorId: formateurs[1].id,
      },
    }),
    // Entraînement courses
    db.course.create({
      data: {
        title: "Méthodologie de l'Entraînement Handball",
        slug: "methodologie-entrainement",
        description: "Principes fondamentaux de la planification et de la conduite de l'entraînement en handball. Périodisation, séances types et progression.",
        category: "ENTRAINEMENT", difficulty: "DEBUTANT", status: "PUBLIE", duration: 180, isCertifying: true, passingScore: 70, maxAttempts: 3, order: 6,
        instructorId: formateurs[0].id,
      },
    }),
    db.course.create({
      data: {
        title: "Tactique Collective : Attaque",
        slug: "tactique-collective-attaque",
        description: "Systèmes de jeu offensifs, mouvements sans ballon, création d'espaces et finishes en handball.",
        category: "ENTRAINEMENT", difficulty: "INTERMEDIAIRE", status: "PUBLIE", duration: 120, isCertifying: true, passingScore: 65, maxAttempts: 3, order: 7,
        instructorId: formateurs[1].id,
      },
    }),
    db.course.create({
      data: {
        title: "Tactique Collective : Défense",
        slug: "tactique-collective-defense",
        description: "Systèmes défensifs, replis, défense individuelle et de zone en handball moderne.",
        category: "ENTRAINEMENT", difficulty: "INTERMEDIAIRE", status: "PUBLIE", duration: 120, isCertifying: true, passingScore: 65, maxAttempts: 3, order: 8,
        instructorId: formateurs[1].id,
      },
    }),
    db.course.create({
      data: {
        title: "Préparation Physique Spécifique",
        slug: "preparation-physique-handball",
        description: "Programmes de préparation physique adaptés au handball : endurance, force, vitesse, souplesse et prévention des blessures.",
        category: "ENTRAINEMENT", difficulty: "AVANCE", status: "PUBLIE", duration: 150, isCertifying: true, passingScore: 70, maxAttempts: 3, order: 9,
        instructorId: formateurs[0].id,
      },
    }),
    // Joueurs courses
    db.course.create({
      data: {
        title: "Techniques Individuelles Offensives",
        slug: "techniques-individuelles-offensives",
        description: "Perfectionnez vos techniques de tir, de passe et de dribble. Du fondamental au geste expert.",
        category: "JOUEURS", difficulty: "DEBUTANT", status: "PUBLIE", duration: 100, isCertifying: false, passingScore: 50, maxAttempts: 5, order: 10,
        instructorId: formateurs[1].id,
      },
    }),
    db.course.create({
      data: {
        title: "Techniques Individuelles Défensives",
        slug: "techniques-individuelles-defensives",
        description: "Maîtrisez les techniques défensives : placement du corps, duels, interceptions et blocs.",
        category: "JOUEURS", difficulty: "INTERMEDIAIRE", status: "PUBLIE", duration: 90, isCertifying: false, passingScore: 50, maxAttempts: 5, order: 11,
        instructorId: formateurs[0].id,
      },
    }),
    // Administration
    db.course.create({
      data: {
        title: "Règlementation et Gestion Administrative",
        slug: "reglementation-gestion",
        description: "Aspects réglementaires de la gestion d'un club de handball : licences, transferts, compétitions et relations avec la fédération.",
        category: "ADMINISTRATION", difficulty: "INTERMEDIAIRE", status: "PUBLIE", duration: 60, isCertifying: false, passingScore: 60, maxAttempts: 3, order: 12,
        instructorId: admin.id,
      },
    }),
    db.course.create({
      data: {
        title: "Psychologie du Sportif",
        slug: "psychologie-sportif",
        description: "Gestion du stress, concentration, motivation et travail d'équipe dans le contexte du handball de haut niveau.",
        category: "ENTRAINEMENT", difficulty: "AVANCE", status: "PUBLIE", duration: 90, isCertifying: false, passingScore: 60, maxAttempts: 3, order: 13,
        instructorId: formateurs[1].id,
      },
    }),
  ]);

  console.log(`✅ Created ${courses.length} courses\n`);

  // =============================================
  // SECTIONS & LESSONS
  // =============================================
  console.log("📝 Creating sections and lessons...");

  for (const course of courses) {
    const sectionCount = 2 + Math.floor(Math.random() * 3);
    const lessonTypes = ["VIDEO", "TEXTE", "PDF", "INTERACTIF"];

    for (let s = 0; s < sectionCount; s++) {
      const section = await db.section.create({
        data: {
          title: `Section ${s + 1}: ${course.title.split(" ").slice(0, 3).join(" ")} - Partie ${s + 1}`,
          order: s,
          courseId: course.id,
        },
      });

      const lessonCount = 2 + Math.floor(Math.random() * 3);
      for (let l = 0; l < lessonCount; l++) {
        await db.lesson.create({
          data: {
            title: `Leçon ${s + 1}.${l + 1}: ${["Présentation", "Concepts clés", "Exercices pratiques", "Étude de cas", "Évaluation"][l % 5]}`,
            type: lessonTypes[l % lessonTypes.length],
            content: `Contenu de la leçon ${s + 1}.${l + 1} du cours "${course.title}".`,
            duration: 15 + Math.floor(Math.random() * 30),
            order: l,
            sectionId: section.id,
          },
        });
      }
    }
  }

  console.log("✅ Sections and lessons created\n");

  // =============================================
  // QUIZZES
  // =============================================
  console.log("❓ Creating quizzes...");

  for (const course of courses.filter(c => c.isCertifying)) {
    const quiz = await db.quiz.create({
      data: {
        title: `Quiz: ${course.title}`,
        description: `Évaluation finale du cours "${course.title}"`,
        courseId: course.id,
        duration: 30,
        passingScore: course.passingScore,
        shuffleQuestions: true,
        showAnswers: true,
        maxAttempts: course.maxAttempts,
      },
    });

    const questionCount = 5 + Math.floor(Math.random() * 6);
    for (let q = 0; q < questionCount; q++) {
      const options = [
        "Option A - Réponse correcte",
        "Option B - Première distraction",
        "Option C - Deuxième distraction",
        "Option D - Troisième distraction",
      ];
      await db.question.create({
        data: {
          quizId: quiz.id,
          text: `Question ${q + 1}: Quelle affirmation est correcte concernant ${course.title.split(" ").slice(-2).join(" ")} ?`,
          type: "QCM_SIMPLE",
          options: JSON.stringify(options),
          correctAnswer: JSON.stringify([0]),
          explanation: `La bonne réponse est l'option A. Cette question porte sur le cours "${course.title}".`,
          points: 1,
          order: q,
        },
      });
    }
  }

  console.log("✅ Quizzes created\n");

  // =============================================
  // BADGES
  // =============================================
  console.log("🏆 Creating badges...");

  const badges = await Promise.all([
    db.badge.create({ data: { name: "Premier Pas", description: "A terminé son premier cours", icon: "🎯", level: "BRONZE", criteria: "Terminer 1 cours" } }),
    db.badge.create({ data: { name: "Étudiant Assidu", description: "A terminé 5 cours", icon: "📚", level: "ARGENT", criteria: "Terminer 5 cours" } }),
    db.badge.create({ data: { name: "Expert en Arbitrage", description: "A réussi tous les quiz d'arbitrage", icon: "🏆", level: "OR", criteria: "Réussir tous les quiz de la catégorie Arbitrage" } }),
    db.badge.create({ data: { name: "Certifié AMDRH", description: "A obtenu 3 certificats", icon: "🏅", level: "OR", criteria: "Obtenir 3 certificats" } }),
    db.badge.create({ data: { name: "Légende", description: "A obtenu 10 certificats et tous les badges", icon: "👑", level: "PLATINE", criteria: "Obtenir 10 certificats" } }),
  ]);

  console.log(`✅ Created ${badges.length} badges\n`);

  // =============================================
  // LEARNING PATH COURSES
  // =============================================
  console.log("🔗 Linking courses to learning paths...");

  const arbitrageCourses = courses.filter(c => c.category === "ARBITRAGE");
  const entrainementCourses = courses.filter(c => c.category === "ENTRAINEMENT");
  const joueursCourses = courses.filter(c => c.category === "JOUEURS");

  const pathArbitreDebutant = learningPaths[0];
  const pathArbitreConfirme = learningPaths[1];
  const pathEntraineur = learningPaths[2];
  const pathJoueur = learningPaths[3];

  for (let i = 0; i < Math.min(3, arbitrageCourses.length); i++) {
    await db.learningPathCourse.create({
      data: { learningPathId: pathArbitreDebutant.id, courseId: arbitrageCourses[i].id, order: i, isRequired: i < 2, minScore: 70 },
    });
  }
  for (let i = 0; i < Math.min(2, arbitrageCourses.length); i++) {
    await db.learningPathCourse.create({
      data: { learningPathId: pathArbitreConfirme.id, courseId: arbitrageCourses[Math.min(3 + i, arbitrageCourses.length - 1)].id, order: i, isRequired: true, minScore: 75 },
    });
  }
  for (let i = 0; i < Math.min(3, entrainementCourses.length); i++) {
    await db.learningPathCourse.create({
      data: { learningPathId: pathEntraineur.id, courseId: entrainementCourses[i].id, order: i, isRequired: i < 2, minScore: 65 },
    });
  }
  for (let i = 0; i < Math.min(2, joueursCourses.length); i++) {
    await db.learningPathCourse.create({
      data: { learningPathId: pathJoueur.id, courseId: joueursCourses[i].id, order: i, isRequired: true, minScore: 50 },
    });
  }

  console.log("✅ Learning path courses linked\n");

  // =============================================
  // ENROLLMENTS & PROGRESS
  // =============================================
  console.log("📋 Creating enrollments...");

  // Enroll arbitres in first arbitrage course
  for (const arbitre of arbitres.filter(a => a.isActive)) {
    const course = arbitrageCourses[0];
    if (course) {
      await db.enrollment.create({
        data: {
          userId: arbitre.id,
          courseId: course.id,
          status: "en_cours",
          progress: Math.floor(Math.random() * 80) + 10,
        },
      });
    }
  }

  // Enroll entraineurs in first entrainement course
  for (const entraineur of entraineurs) {
    const course = entrainementCourses[0];
    if (course) {
      await db.enrollment.create({
        data: {
          userId: entraineur.id,
          courseId: course.id,
          status: Math.random() > 0.5 ? "en_cours" : "termine",
          progress: Math.random() > 0.5 ? Math.floor(Math.random() * 60) + 20 : 100,
        },
      });
    }
  }

  // Enroll joueurs in first joueur course
  for (const joueur of joueurs) {
    const course = joueursCourses[0];
    if (course) {
      await db.enrollment.create({
        data: {
          userId: joueur.id,
          courseId: course.id,
          status: "en_cours",
          progress: Math.floor(Math.random() * 50) + 5,
        },
      });
    }
  }

  // Enroll some in learning paths
  for (const arbitre of arbitres.filter(a => a.isActive).slice(0, 2)) {
    await db.learningPathEnrollment.create({
      data: {
        userId: arbitre.id,
        learningPathId: pathArbitreDebutant.id,
        progress: Math.floor(Math.random() * 40) + 10,
        status: "en_cours",
      },
    });
  }

  for (const entraineur of entraineurs.slice(0, 1)) {
    await db.learningPathEnrollment.create({
      data: {
        userId: entraineur.id,
        learningPathId: pathEntraineur.id,
        progress: Math.floor(Math.random() * 60) + 20,
        status: "en_cours",
      },
    });
  }

  // Award some badges
  await db.userBadge.create({ data: { userId: arbitres[0].id, badgeId: badges[0].id } });
  await db.userBadge.create({ data: { userId: arbitres[1].id, badgeId: badges[0].id } });

  console.log("✅ Enrollments created\n");

  // =============================================
  // NOTIFICATIONS
  // =============================================
  console.log("🔔 Creating notifications...");

  const notificationTypes = ["COURS", "QUIZ", "CERTIFICAT", "SYSTEME", "BADGE"] as const;

  for (const u of users.slice(0, 5)) {
    for (let i = 0; i < 3; i++) {
      await db.notification.create({
        data: {
          userId: u.id,
          type: notificationTypes[i % notificationTypes.length],
          title: ["Nouveau cours disponible", "Rappel quiz", "Félicitations !", "Maintenance prévue", "Nouveau badge obtenu"][i],
          message: ["Un nouveau cours a été publié dans votre parcours.", "N'oubliez pas de compléter votre quiz.", "Vous avez terminé un cours avec succès.", "La plateforme sera en maintenance ce week-end.", "Vous avez obtenu le badge 'Premier Pas'."][i],
          link: "/dashboard",
          isRead: Math.random() > 0.5,
        },
      });
    }
  }

  console.log("✅ Notifications created\n");

  // =============================================
  // CERTIFICATES (for some users)
  // =============================================
  console.log("🎓 Creating certificates...");

  // Give a certificate to the first active arbitre
  if (arbitres.length > 0 && arbitrageCourses.length > 0) {
    await db.certificate.create({
      data: {
        code: "AMDRH-2026-00001",
        userId: arbitres[0].id,
        courseId: arbitrageCourses[0].id,
        courseTitle: arbitrageCourses[0].title,
        userName: `${arbitres[0].prenom} ${arbitres[0].nom}`,
        userLicence: arbitres[0].licenceNumber,
        score: 85,
        maxScore: 100,
        verifiedBy: admin.id,
      },
    });
  }

  // Give a certificate to the first entraineur
  if (entraineurs.length > 0 && entrainementCourses.length > 1) {
    await db.certificate.create({
      data: {
        code: "AMDRH-2026-00002",
        userId: entraineurs[0].id,
        courseId: entrainementCourses[1].id,
        courseTitle: entrainementCourses[1].title,
        userName: `${entraineurs[0].prenom} ${entraineurs[0].nom}`,
        score: 78,
        maxScore: 100,
        verifiedBy: admin.id,
      },
    });
  }

  console.log("✅ Certificates created\n");

  console.log("═".repeat(50));
  console.log("✅ SEEDING COMPLETE!");
  console.log("═".repeat(50));
  console.log("\n📊 Summary:");
  console.log(`  👥 Users: ${users.length}`);
  console.log(`  📚 Learning Paths: ${learningPaths.length}`);
  console.log(`  📖 Courses: ${courses.length}`);
  console.log(`  ❓ Quizzes: ${courses.filter(c => c.isCertifying).length}`);
  console.log(`  🏆 Badges: ${badges.length}`);
  console.log(`  🎓 Certificates: 2`);
  console.log(`  🔔 Notifications: 15`);
  console.log(`\n🔑 Default credentials:`);
  console.log(`  Admin: admin@amdrh.ma / ${DEFAULT_PASSWORD}`);
  console.log(`  Formateur: formateur@amdrh.ma / ${DEFAULT_PASSWORD}`);
  console.log(`  Arbitre: arbitre1@amdrh.ma / ${DEFAULT_PASSWORD}`);
  console.log(`  Entraîneur: entraineur1@amdrh.ma / ${DEFAULT_PASSWORD}`);
  console.log(`  Joueur: joueur1@amdrh.ma / ${DEFAULT_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
