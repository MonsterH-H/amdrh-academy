import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// Neon PostgreSQL connection
const db = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.NEON_DATABASE_URL || process.env.DATABASE_URL,
    },
  },
});

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

async function main() {
  console.log("🌱 Seeding AMDRH Academy database...\n");

  // ─────────────────────────────────────────────────────────────────
  // 1. SUPER ADMIN
  // ─────────────────────────────────────────────────────────────────
  const superAdminPassword = await hashPassword("Admin@2024!");
  const superAdmin = await db.user.upsert({
    where: { email: "admin@amdrh.ma" },
    update: {},
    create: {
      email: "admin@amdrh.ma",
      passwordHash: superAdminPassword,
      nom: "AMDRH",
      prenom: "Super",
      role: "ADMIN",
      telephone: "+212600000001",
      club: "FRMHB",
      region: "Rabat-Salé-Kénitra",
      bio: "Administrateur principal de l'Académie AMDRH",
      licenceNumber: "ADM-001",
      isActive: true,
      emailVerified: true,
    },
  });
  console.log("✅ Super Admin créé:", superAdmin.email);

  // ─────────────────────────────────────────────────────────────────
  // 2. FORMATEUR
  // ─────────────────────────────────────────────────────────────────
  const formateurPassword = await hashPassword("Formateur@2024!");
  const formateur = await db.user.upsert({
    where: { email: "formateur@amdrh.ma" },
    update: {},
    create: {
      email: "formateur@amdrh.ma",
      passwordHash: formateurPassword,
      nom: "BENALI",
      prenom: "Ahmed",
      role: "FORMATEUR",
      telephone: "+212600000002",
      club: "WAC Casablanca",
      region: "Casablanca-Settat",
      bio: "Formateur certifié en arbitrage handball",
      licenceNumber: "FRM-001",
      isActive: true,
      emailVerified: true,
    },
  });
  console.log("✅ Formateur créé:", formateur.email);

  // ─────────────────────────────────────────────────────────────────
  // 3. ARBITRE (test accounts)
  // ─────────────────────────────────────────────────────────────────
  const arbitrePassword = await hashPassword("Arbitre@2024!");
  const arbitre1 = await db.user.upsert({
    where: { email: "arbitre@amdrh.ma" },
    update: {},
    create: {
      email: "arbitre@amdrh.ma",
      passwordHash: arbitrePassword,
      nom: "TAZI",
      prenom: "Mohamed",
      role: "ARBITRE",
      telephone: "+212600000003",
      club: "FAR Rabat",
      region: "Rabat-Salé-Kénitra",
      bio: "Arbitre national niveau 2",
      licenceNumber: "ARB-001",
      isActive: true,
      emailVerified: true,
    },
  });
  console.log("✅ Arbitre créé:", arbitre1.email);

  // ─────────────────────────────────────────────────────────────────
  // 4. ENTRAINEUR
  // ─────────────────────────────────────────────────────────────────
  const entraineurPassword = await hashPassword("Entraineur@2024!");
  const entraineur = await db.user.upsert({
    where: { email: "entraineur@amdrh.ma" },
    update: {},
    create: {
      email: "entraineur@amdrh.ma",
      passwordHash: entraineurPassword,
      nom: "ELMANSOURI",
      prenom: "Karim",
      role: "ENTRAINEUR",
      telephone: "+212600000004",
      club: "AS FAR",
      region: "Rabat-Salé-Kénitra",
      bio: "Entraîneur principal catégorie senior",
      licenceNumber: "ENT-001",
      isActive: true,
      emailVerified: true,
    },
  });
  console.log("✅ Entraîneur créé:", entraineur.email);

  // ─────────────────────────────────────────────────────────────────
  // 5. JOUEUR
  // ─────────────────────────────────────────────────────────────────
  const joueurPassword = await hashPassword("Joueur@2024!");
  const joueur = await db.user.upsert({
    where: { email: "joueur@amdrh.ma" },
    update: {},
    create: {
      email: "joueur@amdrh.ma",
      passwordHash: joueurPassword,
      nom: "ALAOUI",
      prenom: "Youssef",
      role: "JOUEUR",
      telephone: "+212600000005",
      club: "CODM Marrakech",
      region: "Marrakech-Safi",
      bio: "Joueur espoir catégorie junior",
      licenceNumber: "JOU-001",
      isActive: true,
      emailVerified: true,
    },
  });
  console.log("✅ Joueur créé:", joueur.email);

  // ─────────────────────────────────────────────────────────────────
  // 6. PERMISSIONS
  // ─────────────────────────────────────────────────────────────────
  const permissionsData = [
    // Courses
    { name: "courses.view", description: "Voir les cours", module: "courses", action: "view" },
    { name: "courses.create", description: "Créer des cours", module: "courses", action: "create" },
    { name: "courses.edit", description: "Modifier les cours", module: "courses", action: "edit" },
    { name: "courses.delete", description: "Supprimer les cours", module: "courses", action: "delete" },
    { name: "courses.manage", description: "Gérer les cours", module: "courses", action: "manage" },
    { name: "courses.publish", description: "Publier les cours", module: "courses", action: "publish" },
    // Users
    { name: "users.view", description: "Voir les utilisateurs", module: "users", action: "view" },
    { name: "users.create", description: "Créer des utilisateurs", module: "users", action: "create" },
    { name: "users.edit", description: "Modifier les utilisateurs", module: "users", action: "edit" },
    { name: "users.delete", description: "Supprimer des utilisateurs", module: "users", action: "delete" },
    { name: "users.manage", description: "Gérer les utilisateurs", module: "users", action: "manage" },
    // Quiz
    { name: "quizzes.view", description: "Voir les quiz", module: "quizzes", action: "view" },
    { name: "quizzes.create", description: "Créer des quiz", module: "quizzes", action: "create" },
    { name: "quizzes.edit", description: "Modifier les quiz", module: "quizzes", action: "edit" },
    { name: "quizzes.delete", description: "Supprimer les quiz", module: "quizzes", action: "delete" },
    { name: "quizzes.manage", description: "Gérer les quiz", module: "quizzes", action: "manage" },
    // Certificates
    { name: "certificates.view", description: "Voir les certificats", module: "certificates", action: "view" },
    { name: "certificates.create", description: "Créer des certificats", module: "certificates", action: "create" },
    { name: "certificates.revoke", description: "Révoquer des certificats", module: "certificates", action: "delete" },
    { name: "certificates.manage", description: "Gérer les certificats", module: "certificates", action: "manage" },
    // Learning Paths
    { name: "learning-paths.view", description: "Voir les parcours", module: "learning-paths", action: "view" },
    { name: "learning-paths.create", description: "Créer des parcours", module: "learning-paths", action: "create" },
    { name: "learning-paths.edit", description: "Modifier les parcours", module: "learning-paths", action: "edit" },
    { name: "learning-paths.delete", description: "Supprimer les parcours", module: "learning-paths", action: "delete" },
    { name: "learning-paths.manage", description: "Gérer les parcours", module: "learning-paths", action: "manage" },
    // Admin
    { name: "admin.dashboard", description: "Accéder au dashboard admin", module: "admin", action: "view" },
    { name: "admin.settings", description: "Modifier les paramètres", module: "admin", action: "edit" },
    { name: "admin.analytics", description: "Voir les analytics", module: "admin", action: "view" },
    { name: "admin.sync", description: "Synchroniser avec la fédération", module: "admin", action: "manage" },
    { name: "admin.permissions", description: "Gérer les permissions", module: "admin", action: "manage" },
    { name: "admin.announcements", description: "Gérer les annonces", module: "admin", action: "manage" },
    // Messages
    { name: "messages.view", description: "Voir les messages", module: "messages", action: "view" },
    { name: "messages.send", description: "Envoyer des messages", module: "messages", action: "create" },
    // Resources
    { name: "resources.view", description: "Voir les ressources", module: "resources", action: "view" },
    { name: "resources.upload", description: "Téléverser des ressources", module: "resources", action: "create" },
    { name: "resources.delete", description: "Supprimer des ressources", module: "resources", action: "delete" },
    // Notifications
    { name: "notifications.view", description: "Voir les notifications", module: "notifications", action: "view" },
    { name: "notifications.manage", description: "Gérer les notifications", module: "notifications", action: "manage" },
    // Traceability
    { name: "traceability.view", description: "Voir la traçabilité", module: "traceability", action: "view" },
    { name: "traceability.export", description: "Exporter la traçabilité", module: "traceability", action: "manage" },
  ];

  const createdPermissions: Record<string, string> = {};
  for (const p of permissionsData) {
    const perm = await db.permission.upsert({
      where: { name: p.name },
      update: {},
      create: p,
    });
    createdPermissions[p.name] = perm.id;
  }
  console.log(`✅ ${Object.keys(createdPermissions).length} permissions créées`);

  // ─────────────────────────────────────────────────────────────────
  // 7. ROLE PERMISSIONS
  // ─────────────────────────────────────────────────────────────────
  const rolePermissionMap: Record<string, string[]> = {
    ADMIN: Object.keys(createdPermissions), // All permissions
    FORMATEUR: [
      "courses.view", "courses.create", "courses.edit",
      "quizzes.view", "quizzes.create", "quizzes.edit",
      "certificates.view",
      "learning-paths.view",
      "messages.view", "messages.send",
      "resources.view", "resources.upload",
      "notifications.view",
    ],
    ARBITRE: [
      "courses.view",
      "quizzes.view",
      "certificates.view",
      "learning-paths.view",
      "messages.view", "messages.send",
      "resources.view",
      "notifications.view",
    ],
    ENTRAINEUR: [
      "courses.view",
      "quizzes.view",
      "certificates.view",
      "learning-paths.view",
      "messages.view", "messages.send",
      "resources.view",
      "notifications.view",
    ],
    JOUEUR: [
      "courses.view",
      "quizzes.view",
      "certificates.view",
      "learning-paths.view",
      "messages.view", "messages.send",
      "resources.view",
      "notifications.view",
    ],
  };

  for (const [role, permissionNames] of Object.entries(rolePermissionMap)) {
    for (const permName of permissionNames) {
      const permId = createdPermissions[permName];
      if (!permId) continue;
      await db.rolePermission.upsert({
        where: {
          role_permissionId: { role, permissionId: permId },
        },
        update: {},
        create: { role, permissionId: permId },
      });
    }
    console.log(`✅ ${permissionNames.length} permissions pour ${role}`);
  }

  // ─────────────────────────────────────────────────────────────────
  // 8. SAMPLE COURSES
  // ─────────────────────────────────────────────────────────────────
  const coursesData = [
    {
      title: "Introduction à l'Arbitrage Handball",
      slug: "intro-arbitrage",
      description: "Formation fondamentale pour les débutants en arbitrage handball. Découvrez les règles de base, le positionnement et la gestion du match.",
      category: "ARBITRAGE",
      difficulty: "DEBUTANT",
      status: "PUBLIE",
      duration: 120,
      isCertifying: true,
      passingScore: 70,
      maxAttempts: 3,
      instructorId: formateur.id,
      order: 1,
    },
    {
      title: "Règles Officielles IHF - Niveau 1",
      slug: "regles-ihf-niveau1",
      description: "Maîtrisez les règles officielles de l'IHF. Passages en force, fautes progressives, exclusions et jet de 7 mètres.",
      category: "ARBITRAGE",
      difficulty: "INTERMEDIAIRE",
      status: "PUBLIE",
      duration: 240,
      isCertifying: true,
      passingScore: 80,
      maxAttempts: 3,
      instructorId: formateur.id,
      order: 2,
    },
    {
      title: "Techniques de Communication en Match",
      slug: "techniques-communication-match",
      description: "Apprenez à communiquer efficacement avec les joueurs, entraîneurs et officiels pendant un match de handball.",
      category: "ARBITRAGE",
      difficulty: "INTERMEDIAIRE",
      status: "PUBLIE",
      duration: 90,
      isCertifying: false,
      instructorId: formateur.id,
      order: 3,
    },
    {
      title: "Arbitrage Avancé - Gestion de Conflits",
      slug: "arbitrage-avance-gestion-conflits",
      description: "Formation avancée pour gérer les situations complexes et les conflits lors de matchs de haut niveau.",
      category: "ARBITRAGE",
      difficulty: "AVANCE",
      status: "PUBLIE",
      duration: 180,
      isCertifying: true,
      passingScore: 85,
      maxAttempts: 2,
      instructorId: superAdmin.id,
      order: 4,
    },
    {
      title: "Préparation Physique pour Entraîneurs",
      slug: "preparation-physique-entraineurs",
      description: "Programme complet de préparation physique adapté au handball pour les entraîneurs.",
      category: "ENTRAINEMENT",
      difficulty: "DEBUTANT",
      status: "PUBLIE",
      duration: 150,
      isCertifying: false,
      instructorId: formateur.id,
      order: 5,
    },
    {
      title: "Tactiques Défensives Handball",
      slug: "tactiques-defensives",
      description: "Analysez et implémentez les systèmes défensifs modernes en handball : 6-0, 5-1, 3-2-1.",
      category: "ENTRAINEMENT",
      difficulty: "AVANCE",
      status: "PUBLIE",
      duration: 200,
      isCertifying: true,
      passingScore: 75,
      maxAttempts: 3,
      instructorId: formateur.id,
      order: 6,
    },
  ];

  const createdCourses: Record<string, string> = {};
  for (const c of coursesData) {
    const course = await db.course.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
    createdCourses[c.slug] = course.id;
  }
  console.log(`✅ ${coursesData.length} cours créés`);

  // ─────────────────────────────────────────────────────────────────
  // 9. SECTIONS & LESSONS (for first 2 courses)
  // ─────────────────────────────────────────────────────────────────
  const introCourseId = createdCourses["intro-arbitrage"];
  const ihfCourseId = createdCourses["regles-ihf-niveau1"];

  if (introCourseId) {
    const sections = [
      { title: "Présentation du Module", order: 0 },
      { title: "Règles Fondamentales", order: 1 },
      { title: "Positionnement sur le Terrain", order: 2 },
      { title: "Gestion du Match", order: 3 },
    ];
    for (const s of sections) {
      const section = await db.section.create({
        data: { ...s, courseId: introCourseId },
      });
      const lessonTypes = ["TEXTE", "VIDEO", "TEXTE"];
      for (let i = 0; i < 3; i++) {
        await db.lesson.create({
          data: {
            title: `${s.title} - Leçon ${i + 1}`,
            type: lessonTypes[i],
            content: `Contenu détaillé de la leçon ${i + 1} pour ${s.title}.`,
            duration: 15 + i * 5,
            order: i,
            sectionId: section.id,
          },
        });
      }
    }
  }

  if (ihfCourseId) {
    const sections = [
      { title: "Fautes et Sanctions", order: 0 },
      { title: "Passages en Force", order: 1 },
      { title: "Jet de 7 Mètres", order: 2 },
    ];
    for (const s of sections) {
      const section = await db.section.create({
        data: { ...s, courseId: ihfCourseId },
      });
      for (let i = 0; i < 2; i++) {
        await db.lesson.create({
          data: {
            title: `${s.title} - Leçon ${i + 1}`,
            type: "TEXTE",
            content: `Contenu détaillé pour ${s.title} - Leçon ${i + 1}.`,
            duration: 20,
            order: i,
            sectionId: section.id,
          },
        });
      }
    }
  }
  console.log("✅ Sections et leçons créées");

  // ─────────────────────────────────────────────────────────────────
  // 10. BADGES
  // ─────────────────────────────────────────────────────────────────
  const badgesData = [
    { name: "Premier Pas", description: "Première inscription à un cours", icon: "footprints", level: "BRONZE", criteria: "S'inscrire à un cours" },
    { name: "Étudiant Assidu", description: "Compléter 5 cours", icon: "book-open", level: "ARGENT", criteria: "Compléter 5 cours" },
    { name: "Expert en Arbitrage", description: "Obtenir la certification arbitrage", icon: "award", level: "OR", criteria: "Obtenir le certificat d'arbitrage" },
    { name: "Champion Quiz", description: "Score parfait à 3 quiz", icon: "trophy", level: "OR", criteria: "Score 100% à 3 quiz" },
    { name: "Formateur Certifié", description: "Créer et publier 10 cours", icon: "graduation-cap", level: "PLATINE", criteria: "Publier 10 cours" },
  ];
  const createdBadges: Record<string, string> = {};
  for (const b of badgesData) {
    const badge = await db.badge.upsert({
      where: { name: b.name },
      update: {},
      create: b,
    });
    createdBadges[b.name] = badge.id;
  }
  console.log(`✅ ${badgesData.length} badges créés`);

  // ─────────────────────────────────────────────────────────────────
  // 11. ENROLLMENTS
  // ─────────────────────────────────────────────────────────────────
  const enrollments = [
    { userId: arbitre1.id, courseId: introCourseId, status: "en_cours", progress: 35 },
    { userId: arbitre1.id, courseId: ihfCourseId, status: "en_cours", progress: 10 },
    { userId: entraineur.id, courseId: introCourseId, status: "en_cours", progress: 60 },
    { userId: joueur.id, courseId: introCourseId, status: "en_cours", progress: 15 },
  ];
  for (const e of enrollments) {
    if (!e.courseId) continue;
    await db.enrollment.upsert({
      where: { userId_courseId: { userId: e.userId, courseId: e.courseId } },
      update: { progress: e.progress },
      create: e,
    });
  }
  console.log(`✅ ${enrollments.length} inscriptions créées`);

  // ─────────────────────────────────────────────────────────────────
  // 12. QUIZ (for intro course)
  // ─────────────────────────────────────────────────────────────────
  if (introCourseId) {
    const quiz = await db.quiz.upsert({
      where: { courseId: introCourseId },
      update: {},
      create: {
        title: "Quiz - Introduction à l'Arbitrage",
        description: "Évaluez vos connaissances fondamentales en arbitrage handball.",
        courseId: introCourseId,
        duration: 20,
        passingScore: 70,
        shuffleQuestions: true,
        showAnswers: true,
        maxAttempts: 3,
      },
    });

    const questions = [
      {
        text: "Combien de joueurs composent une équipe de handball sur le terrain ?",
        type: "QCM_SIMPLE",
        options: JSON.stringify(["5", "6", "7", "8"]),
        correctAnswer: JSON.stringify(["6"]),
        explanation: "Une équipe de handball est composée de 6 joueurs de champ plus 1 gardien, soit 7 au total sur le terrain.",
        points: 1,
        order: 0,
      },
      {
        text: "Quelle est la durée d'une mi-temps en handball senior ?",
        type: "QCM_SIMPLE",
        options: JSON.stringify(["20 min", "25 min", "30 min", "35 min"]),
        correctAnswer: JSON.stringify(["30 min"]),
        explanation: "En handball senior, chaque mi-temps dure 30 minutes, pour un temps total de 60 minutes.",
        points: 1,
        order: 1,
      },
      {
        text: "Quel est le type de sanction pour une faute progressive ?",
        type: "QCM_MULTIPLE",
        options: JSON.stringify(["Avertissement (carton jaune)", "Exclusion (2 min)", "Disqualification (carton rouge)", "Jet franc"]),
        correctAnswer: JSON.stringify(["Avertissement (carton jaune)", "Exclusion (2 min)"]),
        explanation: "Les fautes progressives entraînent d'abord un avertissement, puis une exclusion temporaire de 2 minutes.",
        points: 2,
        order: 2,
      },
      {
        text: "La zone des 6 mètres est réservée exclusivement au gardien.",
        type: "VRAI_FAUX",
        options: JSON.stringify(["Vrai", "Faux"]),
        correctAnswer: JSON.stringify(["Faux"]),
        explanation: "Les joueurs de champ peuvent pénétrer dans la zone des 6 mètres à condition de lancer le ballon avant de toucher le sol.",
        points: 1,
        order: 3,
      },
      {
        text: "Quelles sont les responsabilités principales de l'arbitre ?",
        type: "QCM_MULTIPLE",
        options: JSON.stringify([
          "Faire respecter les règles",
          "Gérer le chronomètre",
          "Assurer la sécurité des joueurs",
          "Composer les équipes"
        ]),
        correctAnswer: JSON.stringify(["Faire respecter les règles", "Assurer la sécurité des joueurs"]),
        explanation: "L'arbitre est responsable du respect des règles et de la sécurité. Le chronomètre est géré par le chronométreur et la composition par l'entraîneur.",
        points: 2,
        order: 4,
      },
    ];

    for (const q of questions) {
      const question = await db.question.create({
        data: { ...q, quizId: quiz.id },
      });
    }
    console.log(`✅ Quiz créé avec ${questions.length} questions`);
  }

  // ─────────────────────────────────────────────────────────────────
  // 13. LEARNING PATHS
  // ─────────────────────────────────────────────────────────────────
  const learningPathsData = [
    {
      title: "Parcours Arbitrage - Niveau 1",
      slug: "parcours-arbitrage-n1",
      description: "Formation complète pour devenir arbitre de handball niveau 1. De la découverte du jeu à la certification.",
      targetRole: "ARBITRE",
      mode: "sequentiel",
      isMandatory: true,
      order: 1,
    },
    {
      title: "Parcours Entraînement - Initiation",
      slug: "parcours-entrainement-init",
      description: "Formation de base pour les entraîneurs débutants. Techniques, tactiques et gestion d'équipe.",
      targetRole: "ENTRAINEUR",
      mode: "sequentiel",
      isMandatory: true,
      order: 2,
    },
    {
      title: "Parcours Jeune Arbitre",
      slug: "parcours-jeune-arbitre",
      description: "Formation adaptée pour les jeunes arbitres de moins de 18 ans.",
      targetRole: "JOUEUR",
      mode: "flexible",
      isMandatory: false,
      order: 3,
    },
  ];

  for (const lp of learningPathsData) {
    const path = await db.learningPath.upsert({
      where: { slug: lp.slug },
      update: {},
      create: lp,
    });

    // Add courses to learning paths
    if (lp.slug === "parcours-arbitrage-n1" && introCourseId) {
      await db.learningPathCourse.upsert({
        where: { learningPathId_courseId: { learningPathId: path.id, courseId: introCourseId } },
        update: {},
        create: { learningPathId: path.id, courseId: introCourseId, order: 1, isRequired: true, minScore: 70 },
      });
    }
    if (lp.slug === "parcours-arbitrage-n1" && ihfCourseId) {
      await db.learningPathCourse.upsert({
        where: { learningPathId_courseId: { learningPathId: path.id, courseId: ihfCourseId } },
        update: {},
        create: { learningPathId: path.id, courseId: ihfCourseId, order: 2, isRequired: true, minScore: 80 },
      });
    }
    if (lp.slug === "parcours-entrainement-init" && introCourseId) {
      await db.learningPathCourse.upsert({
        where: { learningPathId_courseId: { learningPathId: path.id, courseId: introCourseId } },
        update: {},
        create: { learningPathId: path.id, courseId: introCourseId, order: 1, isRequired: true, minScore: 60 },
      });
    }
  }
  console.log(`✅ ${learningPathsData.length} parcours créés`);

  // ─────────────────────────────────────────────────────────────────
  // 14. ANNOUNCEMENTS
  // ─────────────────────────────────────────────────────────────────
  const announcementsData = [
    {
      title: "Bienvenue sur l'Académie AMDRH",
      content: "Bienvenue sur la plateforme de formation de l'Académie AMDRH, partenaire académique officiel de la Fédération Royale Marocaine de Handball. Explorez nos cours et formations en arbitrage, entraînement et jeu.",
      type: "INFO",
      targetRoles: JSON.stringify(["ADMIN", "FORMATEUR", "ARBITRE", "ENTRAINEUR", "JOUEUR"]),
      isPinned: true,
      isPublished: true,
      authorId: superAdmin.id,
    },
    {
      title: "Nouveau parcours certification arbitrage",
      content: "Le parcours de certification en arbitrage niveau 1 est maintenant disponible. Inscrivez-vous dès maintenant pour préparer votre certification officielle.",
      type: "FORMATION",
      targetRoles: JSON.stringify(["ARBITRE", "JOUEUR"]),
      isPinned: true,
      isPublished: true,
      authorId: formateur.id,
    },
    {
      title: "Calendrier des formations Q1 2025",
      content: "Les sessions de formation en présentiel pour le premier trimestre 2025 sont programmées. Consultez les dates et lieux sur le portail de la FRMHB.",
      type: "EVENEMENT",
      targetRoles: JSON.stringify(["ADMIN", "FORMATEUR", "ARBITRE", "ENTRAINEUR", "JOUEUR"]),
      isPinned: false,
      isPublished: true,
      authorId: superAdmin.id,
    },
    {
      title: "Mise à jour des règles IHF 2024",
      content: "Les nouvelles règles IHF pour la saison 2024-2025 sont en vigueur. Un module de mise à jour est disponible pour tous les arbitres certifiés.",
      type: "URGENT",
      targetRoles: JSON.stringify(["ARBITRE", "FORMATEUR"]),
      isPinned: true,
      isPublished: true,
      authorId: superAdmin.id,
    },
  ];

  for (const a of announcementsData) {
    await db.announcement.create({ data: a });
  }
  console.log(`✅ ${announcementsData.length} annonces créées`);

  // ─────────────────────────────────────────────────────────────────
  // 15. NOTIFICATIONS
  // ─────────────────────────────────────────────────────────────────
  const notificationsData = [
    { userId: superAdmin.id, type: "SYSTEME", title: "Plateforme déployée", message: "L'Académie AMDRH est maintenant en production.", link: null },
    { userId: formateur.id, type: "SYSTEME", title: "Bienvenue", message: "Bienvenue sur la plateforme de formation. Vous pouvez créer et gérer vos cours.", link: null },
    { userId: arbitre1.id, type: "COURS", title: "Nouveau cours disponible", message: "Introduction à l'Arbitrage Handball est maintenant disponible.", link: null },
  ];
  for (const n of notificationsData) {
    await db.notification.create({ data: n });
  }
  console.log(`✅ ${notificationsData.length} notifications créées`);

  console.log("\n🎉 Seed terminé avec succès !");
  console.log("\n═══════════════════════════════════════════════════════");
  console.log("  COMPTES DE CONNEXION");
  console.log("═══════════════════════════════════════════════════════");
  console.log("");
  console.log("  🔑 SUPER ADMIN");
  console.log("     Email:    admin@amdrh.ma");
  console.log("     Password: Admin@2024!");
  console.log("");
  console.log("  👨‍🏫 FORMATEUR");
  console.log("     Email:    formateur@amdrh.ma");
  console.log("     Password: Formateur@2024!");
  console.log("");
  console.log("  📋 ARBITRE");
  console.log("     Email:    arbitre@amdrh.ma");
  console.log("     Password: Arbitre@2024!");
  console.log("");
  console.log("  🏋️ ENTRAINEUR");
  console.log("     Email:    entraineur@amdrh.ma");
  console.log("     Password: Entraineur@2024!");
  console.log("");
  console.log("  🤾 JOUEUR");
  console.log("     Email:    joueur@amdrh.ma");
  console.log("     Password: Joueur@2024!");
  console.log("═══════════════════════════════════════════════════════");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
