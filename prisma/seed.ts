import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SALT = 12;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT);
}

async function main() {
  console.log("🌱 Seeding AMDRH Academy database...");

  // Clean existing data
  console.log("Cleaning existing data...");
  await prisma.quizAnswer.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.question.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.lessonProgress.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.learningPathEnrollment.deleteMany();
  await prisma.learningPathCourse.deleteMany();
  await prisma.learningPath.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversationParticipant.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.userBadge.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.section.deleteMany();
  await prisma.course.deleteMany();
  await prisma.federationSync.deleteMany();
  await prisma.user.deleteMany();

  const password = await hashPassword("Password123!");
  console.log("Password hashed");

  // ============================================
  // USERS
  // ============================================
  console.log("Creating users...");

  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: "admin@amdrh.ma", passwordHash: password, nom: "El Fassi", prenom: "Karim",
        role: "ADMIN", telephone: "+212 661-000001", club: "AMDRH", region: "Rabat-Salé-Kénitra",
        licenceNumber: "ADM-001", isActive: true, emailVerified: true, lastLoginAt: new Date(),
        bio: "Directeur de la plateforme AMDRH Academy",
      },
    }),
    prisma.user.create({
      data: {
        email: "admin2@frmhb.ma", passwordHash: password, nom: "Benjelloun", prenom: "Fatima",
        role: "ADMIN", telephone: "+212 661-000002", club: "FRMHB", region: "Casablanca-Settat",
        isActive: true, emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: "formateur@amdrh.ma", passwordHash: password, nom: "Tazi", prenom: "Ahmed",
        role: "FORMATEUR", telephone: "+212 662-000001", club: "AMDRH", region: "Rabat-Salé-Kénitra",
        licenceNumber: "FMT-001", isActive: true, emailVerified: true, lastLoginAt: new Date(),
        bio: "Formateur certifié IHF avec 15 ans d'expérience en arbitrage",
      },
    }),
    prisma.user.create({
      data: {
        email: "formateur2@amdrh.ma", passwordHash: password, nom: "Chraibi", prenom: "Sara",
        role: "FORMATEUR", telephone: "+212 662-000002", club: "WAC", region: "Casablanca-Settat",
        licenceNumber: "FMT-002", isActive: true, emailVerified: true,
        bio: "Entraîneure nationale, spécialiste en préparation physique",
      },
    }),
    // Arbitres
    prisma.user.create({
      data: {
        email: "arbitre1@amdrh.ma", passwordHash: password, nom: "Benali", prenom: "Youssef",
        role: "ARBITRE", telephone: "+212 663-000001", club: "FAR Rabat", region: "Rabat-Salé-Kénitra",
        licenceNumber: "ARB-2024-001", isActive: true, emailVerified: true, lastLoginAt: new Date(),
      },
    }),
    prisma.user.create({
      data: {
        email: "arbitre2@amdrh.ma", passwordHash: password, nom: "El Amrani", prenom: "Omar",
        role: "ARBITRE", telephone: "+212 663-000002", club: "MAS Fez", region: "Fès-Meknès",
        licenceNumber: "ARB-2024-002", isActive: true, emailVerified: true, lastLoginAt: new Date(),
      },
    }),
    prisma.user.create({
      data: {
        email: "arbitre3@amdrh.ma", passwordHash: password, nom: "Berrada", prenom: "Amine",
        role: "ARBITRE", telephone: "+212 663-000003", club: "Wydad AC", region: "Casablanca-Settat",
        licenceNumber: "ARB-2024-003", isActive: true, emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: "arbitre4@amdrh.ma", passwordHash: password, nom: "Alaoui", prenom: "Rachid",
        role: "ARBITRE", telephone: "+212 663-000004", club: "RS Berkane", region: "Oriental",
        licenceNumber: "ARB-2024-004", isActive: true, emailVerified: true,
      },
    }),
    // Entraîneurs
    prisma.user.create({
      data: {
        email: "entraineur1@amdrh.ma", passwordHash: password, nom: "Bennani", prenom: "Hassan",
        role: "ENTRAINEUR", telephone: "+212 664-000001", club: "AS FAR", region: "Rabat-Salé-Kénitra",
        licenceNumber: "ENT-2024-001", isActive: true, emailVerified: true, lastLoginAt: new Date(),
      },
    }),
    prisma.user.create({
      data: {
        email: "entraineur2@amdrh.ma", passwordHash: password, nom: "El Idrissi", prenom: "Khalid",
        role: "ENTRAINEUR", telephone: "+212 664-000002", club: "Raja CA", region: "Casablanca-Settat",
        licenceNumber: "ENT-2024-002", isActive: true, emailVerified: true, lastLoginAt: new Date(),
      },
    }),
    prisma.user.create({
      data: {
        email: "entraineur3@amdrh.ma", passwordHash: password, nom: "Fassi Fihri", prenom: "Mohamed",
        role: "ENTRAINEUR", telephone: "+212 664-000003", club: "HUSA Agadir", region: "Souss-Massa",
        licenceNumber: "ENT-2024-003", isActive: true, emailVerified: true,
      },
    }),
    // Joueurs
    prisma.user.create({
      data: {
        email: "joueur1@amdrh.ma", passwordHash: password, nom: "Hajji", prenom: "Ayoub",
        role: "JOUEUR", telephone: "+212 665-000001", club: "USM Alger", region: "Alger",
        licenceNumber: "JOU-2024-001", isActive: true, emailVerified: true, lastLoginAt: new Date(),
      },
    }),
    prisma.user.create({
      data: {
        email: "joueur2@amdrh.ma", passwordHash: password, nom: "Mouhibi", prenom: "Walid",
        role: "JOUEUR", telephone: "+212 665-000002", club: "ESS Rades", region: "Tunis",
        licenceNumber: "JOU-2024-002", isActive: true, emailVerified: true, lastLoginAt: new Date(),
      },
    }),
    prisma.user.create({
      data: {
        email: "joueur3@amdrh.ma", passwordHash: password, nom: "Kharroubi", prenom: "Imane",
        role: "JOUEUR", telephone: "+212 665-000003", club: "AS FAR", region: "Rabat-Salé-Kénitra",
        licenceNumber: "JOU-2024-003", isActive: true, emailVerified: true,
      },
    }),
  ]);

  const [admin, admin2, formateur, formateur2, ...learners] = users;

  // ============================================
  // BADGES
  // ============================================
  console.log("Creating badges...");

  const badges = await Promise.all([
    prisma.badge.create({
      data: {
        name: "Premier Pas", description: "Avoir complété son premier cours",
        icon: "🎯", level: "BRONZE", criteria: "first_course",
      },
    }),
    prisma.badge.create({
      data: {
        name: "Quiz Master", description: "Réussir 10 quiz du premier coup",
        icon: "🧠", level: "ARGENT", criteria: "10_quiz_first_try",
      },
    }),
    prisma.badge.create({
      data: {
        name: "Perfectionniste", description: "Obtenir un score supérieur à 95% à un quiz",
        icon: "💯", level: "OR", criteria: "score_above_95",
      },
    }),
    prisma.badge.create({
      data: {
        name: "Dévoué", description: "Compléter 5 cours",
        icon: "📚", level: "ARGENT", criteria: "5_courses_completed",
      },
    }),
    prisma.badge.create({
      data: {
        name: "Expert", description: "Terminer un parcours de formation complet",
        icon: "🏆", level: "OR", criteria: "complete_path",
      },
    }),
    prisma.badge.create({
      data: {
        name: "Champion", description: "Terminer tous les parcours de sa catégorie",
        icon: "👑", level: "PLATINE", criteria: "all_paths",
      },
    }),
    prisma.badge.create({
      data: {
        name: "Régulier", description: "Se connecter 30 jours consécutifs",
        icon: "🔥", level: "BRONZE", criteria: "30_days_streak",
      },
    }),
    prisma.badge.create({
      data: {
        name: "Mentor", description: "Aider 10 apprenants via la messagerie",
        icon: "🤝", level: "OR", criteria: "help_10_learners",
      },
    }),
  ]);

  // ============================================
  // COURSES
  // ============================================
  console.log("Creating courses...");

  const courseData = [
    // ARBITRAGE courses
    {
      title: "Règles du Jeu IHF",
      slug: "regles-du-jeu-ihf",
      description: "Maîtrisez l'ensemble des règles du handball définies par l'IHF. Ce cours couvre les règles fondamentales, les sanctions, et les situations de jeu particulières que tout arbitre doit connaître.",
      category: "ARBITRAGE", difficulty: "DEBUTANT", duration: 180, isCertifying: true,
      instructorId: formateur.id, status: "PUBLIE", passingScore: 70,
      sections: [
        { title: "Règles fondamentales", lessons: [
          { title: "Le terrain et les équipements", type: "TEXTE", content: "Le terrain de handball mesure 40 mètres de long sur 20 mètres de large...", duration: 15 },
          { title: "Composition des équipes", type: "TEXTE", content: "Chaque équipe est composée de 7 joueurs sur le terrain...", duration: 10 },
          { title: "Durée du match", type: "TEXTE", content: "Un match de handball se déroule en deux mi-temps de 30 minutes...", duration: 10 },
        ]},
        { title: "Sanctions et fautes", lessons: [
          { title: "Fautes simples et avertissements", type: "TEXTE", content: "Les fautes simples incluent les contacts irréguliers...", duration: 15 },
          { title: "Exclusions et disqualifications", type: "TEXTE", content: "L'exclusion (2 minutes) est infligée pour des fautes répétées...", duration: 15 },
        ]},
      ],
      quizQuestions: [
        { text: "Quelles sont les dimensions réglementaires d'un terrain de handball ?", type: "QCM_SIMPLE", options: ["30m x 15m", "40m x 20m", "45m x 25m", "35m x 18m"], correctAnswer: [1], explanation: "Le terrain de handball mesure 40 mètres de long sur 20 mètres de large selon les règles IHF." },
        { text: "Combien de joueurs composent une équipe sur le terrain ?", type: "QCM_SIMPLE", options: ["5", "6", "7", "8"], correctAnswer: [2], explanation: "Une équipe de handball est composée de 7 joueurs : 6 joueurs de champ et 1 gardien." },
        { text: "Quelle est la durée d'un match de handball senior ?", type: "QCM_SIMPLE", options: ["2 x 25 min", "2 x 30 min", "2 x 35 min", "2 x 40 min"], correctAnswer: [1], explanation: "Un match senior se déroule en deux mi-temps de 30 minutes." },
        { text: "L'exclusion (2 minutes) est indiquée par quel geste de l'arbitre ?", type: "QCM_SIMPLE", options: ["Bras levé verticalement", "Bras tendu horizontalement", "Main ouverte levée", "Poing fermé levé"], correctAnswer: [1], explanation: "L'arbitre lève le bras horizontalement avec deux doigts levés pour indiquer une exclusion de 2 minutes." },
        { text: "Un jet de 7 mètres est accordé en cas de faute grave sur une occasion nette de but.", type: "VRAI_FAUX", options: ["Vrai", "Faux"], correctAnswer: [0], explanation: "C'est exactement le cas : une faute qui empêche une occasion nette de but est sanctionnée par un jet de 7m." },
      ],
    },
    {
      title: "Gestion des Situations de Jeu",
      slug: "gestion-situations-jeu",
      description: "Apprenez à gérer les situations complexes et conflictuelles lors d'un match. Positionnement, communication et prise de décision rapide.",
      category: "ARBITRAGE", difficulty: "INTERMEDIAIRE", duration: 240, isCertifying: true,
      instructorId: formateur.id, status: "PUBLIE", passingScore: 75,
      sections: [
        { title: "Positionnement", lessons: [
          { title: "Position de base et déplacement", type: "TEXTE", content: "L'arbitre doit maintenir une position qui lui permette de voir le jeu...", duration: 20 },
          { title: "Communication entre arbitres", type: "TEXTE", content: "Le duo arbitral doit communiquer en permanence par contact visuel...", duration: 15 },
        ]},
        { title: "Gestion du temps", lessons: [
          { title: "Arrêts de jeu et temps mort", type: "TEXTE", content: "L'arbitre doit gérer efficacement les arrêts de jeu...", duration: 15 },
          { title: "Gestion de la fin de match", type: "TEXTE", content: "La fin de match nécessite une attention particulière...", duration: 15 },
        ]},
      ],
      quizQuestions: [
        { text: "Quel est le principe fondamental du positionnement d'un arbitre ?", type: "QCM_SIMPLE", options: ["Être au centre du terrain", "Voir l'action sans gêner le jeu", "Suivre le ballon en permanence", "Être proche des joueurs"], correctAnswer: [1] },
        { text: "En cas de désaccord entre les deux arbitres, qui a le dernier mot ?", type: "QCM_SIMPLE", options: ["L'arbitre de terrain", "L'arbitre de table", "L'arbitre le plus ancien", "Aucun des deux"], correctAnswer: [0] },
        { text: "Combien de temps morts chaque équipe dispose-t-elle par mi-temps ?", type: "QCM_SIMPLE", options: ["1", "2", "3", "Illimité"], correctAnswer: [2] },
      ],
    },
    {
      title: "Techniques d'Arbitrage",
      slug: "techniques-arbitrage",
      description: "Perfectionnez vos techniques d'arbitrage : gestuelle, sifflement, gestion des joueurs et maintien de l'autorité.",
      category: "ARBITRAGE", difficulty: "AVANCE", duration: 300, isCertifying: true,
      instructorId: formateur.id, status: "PUBLIE", passingScore: 80,
      sections: [
        { title: "Gestuelle officielle", lessons: [
          { title: "Signaux de base", type: "TEXTE", content: "La gestuelle IHF comprend plus de 30 signaux standardisés...", duration: 20 },
          { title: "Signaux avancés", type: "TEXTE", content: "Les signaux avancés concernent les situations complexes...", duration: 20 },
        ]},
        { title: "Psychologie de l'arbitre", lessons: [
          { title: "Gestion de la pression", type: "TEXTE", content: "L'arbitre doit apprendre à gérer la pression des joueurs...", duration: 25 },
        ]},
      ],
      quizQuestions: [
        { text: "Combien de signaux officielles l'IHF définit-elle ?", type: "QCM_SIMPLE", options: ["20", "30", "40", "50"], correctAnswer: [1] },
        { text: "La gestion de la pression est un aspect psychologique important pour l'arbitre.", type: "VRAI_FAUX", options: ["Vrai", "Faux"], correctAnswer: [0] },
      ],
    },
    {
      title: "Éthique Sportive",
      slug: "ethique-sportive",
      description: "Les valeurs fondamentales du handball : fair-play, respect, intégrité et conduite exemplaire sur et hors du terrain.",
      category: "ARBITRAGE", difficulty: "DEBUTANT", duration: 120, isCertifying: false,
      instructorId: formateur.id, status: "PUBLIE",
      sections: [
        { title: "Valeurs du handball", lessons: [
          { title: "Fair-play et respect", type: "TEXTE", content: "Le fair-play est une valeur fondamentale du handball...", duration: 15 },
          { title: "Intégrité et conduite", type: "TEXTE", content: "L'intégrité sportive implique un comportement exemplaire...", duration: 15 },
        ]},
      ],
      quizQuestions: [
        { text: "Le fair-play est une valeur optionnelle dans le handball.", type: "VRAI_FAUX", options: ["Vrai", "Faux"], correctAnswer: [1] },
      ],
    },
    {
      title: "Communication en Arbitrage",
      slug: "communication-arbitrage",
      description: "Développez vos compétences en communication verbale et non-verbale pour une meilleure gestion des matchs.",
      category: "ARBITRAGE", difficulty: "INTERMEDIAIRE", duration: 150, isCertifying: false,
      instructorId: formateur.id, status: "PUBLIE",
      sections: [
        { title: "Communication verbale", lessons: [
          { title: "Autorité et clarté", type: "TEXTE", content: "La communication verbale de l'arbitre doit être claire...", duration: 20 },
          { title: "Gestion des conflits verbaux", type: "TEXTE", content: "Face aux contestations, l'arbitre doit rester calme...", duration: 20 },
        ]},
      ],
      quizQuestions: [
        { text: "La communication verbale de l'arbitre doit être :", type: "QCM_SIMPLE", options: ["Aggressive", "Claire et ferme", "Minimale", "Aucune communication verbale"], correctAnswer: [1] },
      ],
    },
    // ENTRAINEMENT courses
    {
      title: "Méthodologie d'Entraînement",
      slug: "methodologie-entrainement",
      description: "Les fondements de la planification et de la périodisation de l'entraînement handball. Apprenez à structurer des séances efficaces.",
      category: "ENTRAINEMENT", difficulty: "DEBUTANT", duration: 200, isCertifying: true,
      instructorId: formateur2.id, status: "PUBLIE", passingScore: 70,
      sections: [
        { title: "Principes de base", lessons: [
          { title: "Périodisation de l'entraînement", type: "TEXTE", content: "La périodisation divise l'année sportive en cycles...", duration: 20 },
          { title: "Structure d'une séance type", type: "TEXTE", content: "Une séance d'entraînement suit généralement le schéma...", duration: 15 },
          { title: "Objectifs pédagogiques", type: "TEXTE", content: "Chaque séance doit avoir des objectifs clairs et mesurables...", duration: 15 },
        ]},
        { title: "Planification", lessons: [
          { title: "Planification hebdomadaire", type: "TEXTE", content: "La semaine type d'un entraîneur de handball...", duration: 20 },
        ]},
      ],
      quizQuestions: [
        { text: "La périodisation divise l'année en :", type: "QCM_SIMPLE", options: ["Matchs et repos", "Cycles d'entraînement", "Saisons et intersaisons", "Mois et semaines"], correctAnswer: [1] },
        { text: "L'échauffement fait partie intégrante de toute séance d'entraînement.", type: "VRAI_FAUX", options: ["Vrai", "Faux"], correctAnswer: [0] },
      ],
    },
    {
      title: "Préparation Physique",
      slug: "preparation-physique",
      description: "Développez les qualités physiques spécifiques au handball : endurance, force, vitesse et agilité.",
      category: "ENTRAINEMENT", difficulty: "INTERMEDIAIRE", duration: 250, isCertifying: true,
      instructorId: formateur2.id, status: "PUBLIE", passingScore: 70,
      sections: [
        { title: "Qualités physiques", lessons: [
          { title: "Endurance spécifique", type: "TEXTE", content: "Le handball exige une endurance intermittente...", duration: 20 },
          { title: "Force et puissance", type: "TEXTE", content: "La force est essentielle pour les duels...", duration: 20 },
        ]},
        { title: "Tests et évaluation", lessons: [
          { title: "Batterie de tests physique", type: "TEXTE", content: "Plusieurs tests standardisés permettent d'évaluer...", duration: 15 },
        ]},
      ],
      quizQuestions: [
        { text: "Le handball est un sport qui nécessite principalement :", type: "QCM_SIMPLE", options: ["Endurance continue", "Endurance intermittente", "Force pure", "Vitesse pure"], correctAnswer: [1] },
      ],
    },
    {
      title: "Tactique et Stratégie",
      slug: "tactique-strategie",
      description: "Maîtrisez les systèmes tactiques offensifs et défensifs du handball de haut niveau.",
      category: "ENTRAINEMENT", difficulty: "AVANCE", duration: 300, isCertifying: true,
      instructorId: formateur2.id, status: "PUBLIE", passingScore: 75,
      sections: [
        { title: "Systèmes défensifs", lessons: [
          { title: "Défense 6:0 et 5:1", type: "TEXTE", content: "La défense 6:0 est le système le plus courant...", duration: 25 },
          { title: "Défense 3:2:1", type: "TEXTE", content: "Le système 3:2:1 offre une couverture plus avancée...", duration: 25 },
        ]},
        { title: "Systèmes offensifs", lessons: [
          { title: "Attaque placée et rapide", type: "TEXTE", content: "L'attaque de contre-attaque est une arme redoutable...", duration: 20 },
        ]},
      ],
      quizQuestions: [
        { text: "Quel est le système défensif le plus courant au handball ?", type: "QCM_SIMPLE", options: ["5:1", "6:0", "3:2:1", "4:2"], correctAnswer: [1] },
      ],
    },
    {
      title: "Psychologie Sportive",
      slug: "psychologie-sportive",
      description: "Comprenez les aspects psychologiques de la performance sportive et apprenez à motiver vos joueurs.",
      category: "ENTRAINEMENT", difficulty: "INTERMEDIAIRE", duration: 180, isCertifying: false,
      instructorId: formateur2.id, status: "PUBLIE",
      sections: [
        { title: "Motivation", lessons: [
          { title: "Théories de la motivation", type: "TEXTE", content: "La motivation peut être intrinsèque ou extrinsèque...", duration: 20 },
          { title: "Techniques de motivation", type: "TEXTE", content: "Plusieurs techniques peuvent aider à maintenir la motivation...", duration: 20 },
        ]},
      ],
      quizQuestions: [
        { text: "La motivation intrinsèque provient de l'intérieur de l'individu.", type: "VRAI_FAUX", options: ["Vrai", "Faux"], correctAnswer: [0] },
      ],
    },
    {
      title: "Nutrition Sportive",
      slug: "nutrition-sportive",
      description: "Les bases de la nutrition adaptée aux handballeurs : avant, pendant et après l'effort.",
      category: "ENTRAINEMENT", difficulty: "DEBUTANT", duration: 120, isCertifying: false,
      instructorId: formateur2.id, status: "PUBLIE",
      sections: [
        { title: "Bases nutritionnelles", lessons: [
          { title: "Macronutriments et performance", type: "TEXTE", content: "Les trois macronutriments essentiels sont...", duration: 15 },
          { title: "Hydratation", type: "TEXTE", content: "L'hydratation est cruciale pour la performance...", duration: 10 },
        ]},
      ],
      quizQuestions: [
        { text: "L'hydratation est un facteur important de la performance sportive.", type: "VRAI_FAUX", options: ["Vrai", "Faux"], correctAnswer: [0] },
      ],
    },
    // JOUEURS courses
    {
      title: "Techniques Individuelles",
      slug: "techniques-individuelles",
      description: "Perfectionnez vos fondamentaux techniques : passes, tirs, dribbles et duels 1 contre 1.",
      category: "JOUEURS", difficulty: "DEBUTANT", duration: 200, isCertifying: true,
      instructorId: formateur2.id, status: "PUBLIE", passingScore: 60,
      sections: [
        { title: "Fondamentaux", lessons: [
          { title: "Les types de passes", type: "TEXTE", content: "La passe est le geste technique le plus fréquent...", duration: 20 },
          { title: "Techniques de tir", type: "TEXTE", content: "Il existe plusieurs types de tirs au handball...", duration: 20 },
          { title: "Dribble et progression", type: "TEXTE", content: "Le dribble permet au joueur de progresser...", duration: 15 },
        ]},
        { title: "Duels", lessons: [
          { title: "Attaquant face au défenseur", type: "TEXTE", content: "Le duel 1v1 est une situation clé du handball...", duration: 20 },
        ]},
      ],
      quizQuestions: [
        { text: "Combien de secondes un joueur dispose-t-il pour tirer au but après avoir reçu le ballon ?", type: "QCM_SIMPLE", options: ["3", "5", "7", "10"], correctAnswer: [0] },
        { text: "Le dribble est autorisé pendant la course du joueur.", type: "VRAI_FAUX", options: ["Vrai", "Faux"], correctAnswer: [0] },
      ],
    },
    {
      title: "Règles du Handball",
      slug: "regles-handball",
      description: "Connaître les règles du jeu est essentiel pour tout joueur. Ce cours couvre les règles fondamentales du handball.",
      category: "JOUEURS", difficulty: "DEBUTANT", duration: 90, isCertifying: false,
      instructorId: formateur.id, status: "PUBLIE",
      sections: [
        { title: "Règles de base", lessons: [
          { title: "Règles essentielles", type: "TEXTE", content: "Les règles de base du handball incluent...", duration: 15 },
          { title: "Sanctions et fair-play", type: "TEXTE", content: "Le respect des règles est fondamental...", duration: 15 },
        ]},
      ],
      quizQuestions: [
        { text: "Un but est accordé quand le ballon franchit entièrement la ligne de but.", type: "VRAI_FAUX", options: ["Vrai", "Faux"], correctAnswer: [0] },
      ],
    },
    {
      title: "Prévention des Blessures",
      slug: "prevention-blessures",
      description: "Apprenez les techniques de prévention des blessures les plus courantes au handball.",
      category: "JOUEURS", difficulty: "INTERMEDIAIRE", duration: 150, isCertifying: false,
      instructorId: formateur2.id, status: "PUBLIE",
      sections: [
        { title: "Types de blessures", lessons: [
          { title: "Blessures fréquentes au handball", type: "TEXTE", content: "Les blessures les plus courantes sont...", duration: 15 },
          { title: "Exercices de prévention", type: "TEXTE", content: "Des exercices spécifiques peuvent réduire le risque...", duration: 20 },
        ]},
      ],
      quizQuestions: [
        { text: "L'échauffement réduit le risque de blessure.", type: "VRAI_FAUX", options: ["Vrai", "Faux"], correctAnswer: [0] },
      ],
    },
    {
      title: "Jeu Collectif",
      slug: "jeu-collectif",
      description: "Développez votre intelligence de jeu et votre capacité à jouer en équipe.",
      category: "JOUEURS", difficulty: "AVANCE", duration: 180, isCertifying: true,
      instructorId: formateur2.id, status: "PUBLIE", passingScore: 70,
      sections: [
        { title: "Collectif offensif", lessons: [
          { title: "Création d'espaces", type: "TEXTE", content: "Le jeu collectif repose sur la création d'espaces...", duration: 20 },
          { title: "Circulation de balle", type: "TEXTE", content: "Une bonne circulation de balle est la clé...", duration: 20 },
        ]},
      ],
      quizQuestions: [
        { text: "Le jeu collectif repose sur :", type: "QCM_SIMPLE", options: ["Le talent individuel", "La communication et la coordination", "La chance", "La force physique"], correctAnswer: [1] },
      ],
    },
    // ADMINISTRATION courses
    {
      title: "Gestion Administrative d'un Club",
      slug: "gestion-administrative-club",
      description: "Les bases de la gestion administrative d'un club de handball : licences, budgets, événements.",
      category: "ADMINISTRATION", difficulty: "DEBUTANT", duration: 180, isCertifying: true,
      instructorId: admin.id, status: "PUBLIE", passingScore: 70,
      sections: [
        { title: "Administration de base", lessons: [
          { title: "Gestion des licences", type: "TEXTE", content: "La gestion des licences est une responsabilité clé...", duration: 20 },
          { title: "Budget et comptabilité", type: "TEXTE", content: "Le budget d'un club comprend revenus et dépenses...", duration: 20 },
        ]},
      ],
      quizQuestions: [
        { text: "La gestion des licences est une responsabilité du club.", type: "VRAI_FAUX", options: ["Vrai", "Faux"], correctAnswer: [0] },
      ],
    },
    {
      title: "Réglementation Fédérale",
      slug: "reglementation-federale",
      description: "Comprendre le cadre réglementaire de la FRMHB et les obligations des clubs affiliés.",
      category: "ADMINISTRATION", difficulty: "INTERMEDIAIRE", duration: 150, isCertifying: true,
      instructorId: admin.id, status: "PUBLIE", passingScore: 75,
      sections: [
        { title: "Cadre réglementaire", lessons: [
          { title: "Statuts et règlements", type: "TEXTE", content: "Les statuts de la FRMHB définissent le cadre...", duration: 20 },
          { title: "Obligations des clubs", type: "TEXTE", content: "Les clubs affiliés ont plusieurs obligations...", duration: 20 },
        ]},
      ],
      quizQuestions: [
        { text: "Les clubs doivent respecter les statuts de la fédération.", type: "VRAI_FAUX", options: ["Vrai", "Faux"], correctAnswer: [0] },
      ],
    },
    {
      title: "Communication Sportive",
      slug: "communication-sportive",
      description: "Maîtrisez la communication interne et externe d'un club de handball.",
      category: "ADMINISTRATION", difficulty: "DEBUTANT", duration: 120, isCertifying: false,
      instructorId: admin2.id, status: "PUBLIE",
      sections: [
        { title: "Communication externe", lessons: [
          { title: "Médias et réseaux sociaux", type: "TEXTE", content: "La communication via les réseaux sociaux est essentielle...", duration: 15 },
          { title: "Relations avec les sponsors", type: "TEXTE", content: "Les sponsors sont des partenaires clés du club...", duration: 15 },
        ]},
      ],
      quizQuestions: [
        { text: "Les réseaux sociaux sont un outil important pour la communication sportive.", type: "VRAI_FAUX", options: ["Vrai", "Faux"], correctAnswer: [0] },
      ],
    },
  ];

  const createdCourses = [];

  for (const cData of courseData) {
    const { sections, quizQuestions, ...courseInfo } = cData;
    const course = await prisma.course.create({
      data: {
        ...courseInfo,
        slug: courseInfo.slug,
      },
    });

    // Create sections and lessons
    for (let sIdx = 0; sIdx < sections.length; sIdx++) {
      const section = await prisma.section.create({
        data: {
          title: sections[sIdx].title,
          order: sIdx,
          courseId: course.id,
        },
      });

      for (let lIdx = 0; lIdx < sections[sIdx].lessons.length; lIdx++) {
        await prisma.lesson.create({
          data: {
            title: sections[sIdx].lessons[lIdx].title,
            type: sections[sIdx].lessons[lIdx].type as never,
            content: sections[sIdx].lessons[lIdx].content,
            duration: sections[sIdx].lessons[lIdx].duration,
            order: lIdx,
            sectionId: section.id,
          },
        });
      }
    }

    // Create quiz if questions exist
    if (quizQuestions && quizQuestions.length > 0) {
      const quiz = await prisma.quiz.create({
        data: {
          title: `Quiz - ${course.title}`,
          courseId: course.id,
          duration: Math.max(10, Math.ceil(quizQuestions.length * 2)),
          passingScore: course.passingScore || 70,
          maxAttempts: course.maxAttempts || 3,
        },
      });

      for (let qIdx = 0; qIdx < quizQuestions.length; qIdx++) {
        const q = quizQuestions[qIdx];
        await prisma.question.create({
          data: {
            quizId: quiz.id,
            text: q.text,
            type: q.type as never,
            options: JSON.stringify(q.options),
            correctAnswer: JSON.stringify(q.correctAnswer),
            explanation: q.explanation || null,
            points: 1,
            order: qIdx,
          },
        });
      }
    }

    createdCourses.push(course);
  }

  // ============================================
  // LEARNING PATHS
  // ============================================
  console.log("Creating learning paths...");

  const arbitrageCourses = createdCourses.filter(c => c.category === "ARBITRAGE");
  const entrainementCourses = createdCourses.filter(c => c.category === "ENTRAINEMENT");
  const joueursCourses = createdCourses.filter(c => c.category === "JOUEURS");
  const adminCourses = createdCourses.filter(c => c.category === "ADMINISTRATION");

  const learningPaths = await Promise.all([
    prisma.learningPath.create({
      data: {
        title: "Formation Initiale Arbitrage",
        description: "Parcours complet pour devenir arbitre certifié. Couvre les règles, techniques et éthique.",
        slug: "formation-initiale-arbitrage",
        targetRole: "ARBITRE",
        mode: "sequentiel",
        isMandatory: true,
        order: 1,
        courses: {
          create: arbitrageCourses.map((c, i) => ({
            courseId: c.id,
            order: i,
            isRequired: true,
          })),
        },
      },
    }),
    prisma.learningPath.create({
      data: {
        title: "Certification Entraîneur N1",
        description: "Formation pour obtenir la certification niveau 1 d'entraîneur de handball.",
        slug: "certification-entraineur-n1",
        targetRole: "ENTRAINEUR",
        mode: "sequentiel",
        isMandatory: true,
        order: 1,
        courses: {
          create: entrainementCourses.map((c, i) => ({
            courseId: c.id,
            order: i,
            isRequired: c.isCertifying,
          })),
        },
      },
    }),
    prisma.learningPath.create({
      data: {
        title: "Développement Joueur",
        description: "Parcours de développement pour les joueurs de tous niveaux.",
        slug: "developpement-joueur",
        targetRole: "JOUEUR",
        mode: "flexible",
        isMandatory: true,
        order: 1,
        courses: {
          create: joueursCourses.map((c, i) => ({
            courseId: c.id,
            order: i,
            isRequired: c.isCertifying,
          })),
        },
      },
    }),
    prisma.learningPath.create({
      data: {
        title: "Gestion Administrative",
        description: "Formation pour les administrateurs de club handball.",
        slug: "gestion-administrative",
        targetRole: "ADMIN",
        mode: "flexible",
        isMandatory: false,
        order: 1,
        courses: {
          create: adminCourses.map((c, i) => ({
            courseId: c.id,
            order: i,
            isRequired: false,
          })),
        },
      },
    }),
  ]);

  // ============================================
  // ENROLLMENTS & PROGRESS
  // ============================================
  console.log("Creating enrollments...");

  for (const user of learners) {
    const relevantCourses = createdCourses.filter(c => {
      if (user.role === "ARBITRE") return c.category === "ARBITRAGE";
      if (user.role === "ENTRAINEUR") return c.category === "ENTRAINEMENT";
      if (user.role === "JOUEUR") return c.category === "JOUEURS";
      return true;
    });

    // Enroll in 2-5 courses
    const numEnrollments = Math.min(relevantCourses.length, 2 + Math.floor(Math.random() * 4));
    const shuffled = relevantCourses.sort(() => Math.random() - 0.5);

    for (let i = 0; i < numEnrollments; i++) {
      const course = shuffled[i];
      const progress = Math.random() > 0.3 ? Math.floor(Math.random() * 100) : 0;
      const isComplete = progress >= 100;
      const isStarted = progress > 0;

      const enrollment = await prisma.enrollment.create({
        data: {
          userId: user.id,
          courseId: course.id,
          status: isComplete ? "termine" : (isStarted ? "en_cours" : "en_cours"),
          progress: Math.min(progress, isComplete ? 100 : progress),
          startedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          completedAt: isComplete ? new Date() : null,
          lastAccessAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        },
      });

      // Create lesson progress
      const lessons = await prisma.lesson.findMany({
        where: { section: { courseId: course.id } },
      });

      for (const lesson of lessons) {
        if (Math.random() < progress / 100) {
          await prisma.lessonProgress.create({
            data: {
              enrollmentId: enrollment.id,
              lessonId: lesson.id,
              completed: Math.random() < 0.8,
              lastPosition: Math.floor(Math.random() * (lesson.duration || 60) * 60),
            },
          });
        }
      }

      // Create quiz attempt for some courses
      if (progress > 50 && Math.random() > 0.4) {
        const quiz = await prisma.quiz.findUnique({ where: { courseId: course.id } });
        if (quiz) {
          const questions = await prisma.question.findMany({ where: { quizId: quiz.id } });
          const score = Math.floor(Math.random() * questions.length * 1.2);
          const isPassed = score / questions.length >= (quiz.passingScore / 100);

          const attempt = await prisma.quizAttempt.create({
            data: {
              userId: user.id,
              quizId: quiz.id,
              status: isPassed ? "REUSSI" : "ECHOUE",
              score,
              maxScore: questions.length,
              duration: Math.floor(Math.random() * 1800) + 300,
              submittedAt: new Date(),
            },
          });

          // Create certificate for passed quizzes on certifying courses
          if (isPassed && course.isCertifying) {
            const certCode = `AMDRH-2026-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
            await prisma.certificate.create({
              data: {
                code: certCode,
                userId: user.id,
                courseId: course.id,
                courseTitle: course.title,
                score,
                maxScore: questions.length,
                userName: `${user.prenom} ${user.nom}`,
                userLicence: user.licenceNumber,
                qrCodeUrl: `/verify/${certCode}`,
              },
            });
          }
        }
      }
    }
  }

  // ============================================
  // USER BADGES
  // ============================================
  console.log("Creating user badges...");

  // Give badges to users who completed courses
  for (const user of learners) {
    const completedEnrollments = await prisma.enrollment.count({
      where: { userId: user.id, status: "termine" },
    });

    if (completedEnrollments > 0) {
      await prisma.userBadge.create({
        data: { userId: user.id, badgeId: badges[0].id }, // Premier Pas
      });
    }
    if (completedEnrollments >= 2) {
      await prisma.userBadge.create({
        data: { userId: user.id, badgeId: badges[3].id }, // Dévoué
      });
    }
  }

  // ============================================
  // MESSAGES
  // ============================================
  console.log("Creating messages...");

  const messagePairs = [
    [learners[0], formateur],
    [learners[1], formateur],
    [learners[2], formateur2],
    [learners[4], formateur2],
    [admin, formateur],
    [learners[0], learners[1]],
  ];

  for (const [u1, u2] of messagePairs) {
    const conversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [
            { userId: u1.id },
            { userId: u2.id },
          ],
        },
      },
    });

    const messages = [
      { senderId: u1.id, content: "Bonjour, j'ai une question concernant le cours." },
      { senderId: u2.id, content: "Bonjour ! Bien sûr, quelle est votre question ?" },
      { senderId: u1.id, content: "Pouvez-vous m'expliquer la règle du jet de 7 mètres plus en détail ?" },
      { senderId: u2.id, content: "Le jet de 7 mètres est accordé lorsqu'une faute grave empêche une occasion nette de but. C'est l'équivalent d'un penalty au football." },
    ];

    for (const msg of messages) {
      await prisma.message.create({
        data: {
          content: msg.content,
          senderId: msg.senderId,
          conversationId: conversation.id,
          receiverId: msg.senderId === u1.id ? u2.id : u1.id,
          isRead: true,
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        },
      });
    }
  }

  // ============================================
  // NOTIFICATIONS
  // ============================================
  console.log("Creating notifications...");

  const notificationData = [
    { userId: learners[0].id, type: "COURS" as const, title: "Nouveau cours disponible", message: "Le cours 'Techniques d'Arbitrage' est maintenant disponible.", link: "/courses" },
    { userId: learners[0].id, type: "CERTIFICAT" as const, title: "🏆 Certificat obtenu !", message: "Félicitations ! Vous avez obtenu votre certificat.", link: "/certificates" },
    { userId: learners[1].id, type: "QUIZ" as const, title: "Résultat du quiz", message: "Votre tentative au quiz a été enregistrée.", link: "/courses" },
    { userId: learners[2].id, type: "BADGE" as const, title: "🏅 Nouveau badge !", message: "Vous avez obtenu le badge 'Premier Pas'.", link: "/badges" },
    { userId: learners[3].id, type: "MESSAGE" as const, title: "Nouveau message", message: "Vous avez reçu un nouveau message.", link: "/messages" },
    { userId: learners[4].id, type: "SYSTEME" as const, title: "Bienvenue", message: "Bienvenue sur la plateforme AMDRH Academy !", link: "/" },
    { userId: learners[5].id, type: "COURS" as const, title: "Rappel", message: "N'oubliez pas de continuer votre formation.", link: "/courses" },
    { userId: formateur.id, type: "SYSTEME" as const, title: "Nouvel inscrit", message: "Un nouvel apprenant s'est inscrit à votre cours.", link: "/courses" },
    { userId: admin.id, type: "SYSTEME" as const, title: "Rapport hebdomadaire", message: "Le rapport hebdomadaire est disponible.", link: "/admin" },
  ];

  for (const notif of notificationData) {
    await prisma.notification.create({
      data: {
        ...notif,
        isRead: Math.random() > 0.5,
      },
    });
  }

  // ============================================
  // FEDERATION SYNC
  // ============================================
  console.log("Creating federation sync records...");

  await Promise.all([
    prisma.federationSync.create({
      data: {
        type: "licence_sync",
        status: "TERMINE",
        totalRecords: 15,
        processedRecords: 15,
        errorRecords: 0,
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        triggeredBy: admin.id,
      },
    }),
    prisma.federationSync.create({
      data: {
        type: "certification_sync",
        status: "TERMINE",
        totalRecords: 8,
        processedRecords: 8,
        errorRecords: 0,
        completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        triggeredBy: admin.id,
      },
    }),
    prisma.federationSync.create({
      data: {
        type: "licence_sync",
        status: "EN_COURS",
        totalRecords: 3,
        processedRecords: 1,
        errorRecords: 0,
        triggeredBy: admin.id,
      },
    }),
  ]);

  console.log("✅ Seed completed successfully!");
  console.log(`- ${users.length} users created`);
  console.log(`- ${createdCourses.length} courses created`);
  console.log(`- ${learningPaths.length} learning paths created`);
  console.log(`- ${badges.length} badges created`);
  console.log("\n🔑 Test accounts:");
  console.log("  Admin: admin@amdrh.ma / Password123!");
  console.log("  Formateur: formateur@amdrh.ma / Password123!");
  console.log("  Arbitre: arbitre1@amdrh.ma / Password123!");
  console.log("  Entraîneur: entraineur1@amdrh.ma / Password123!");
  console.log("  Joueur: joueur1@amdrh.ma / Password123!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
