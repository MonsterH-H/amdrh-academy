import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const users = [
  { email: "admin@amdrh.ma", nom: "El Amrani", prenom: "Mohamed", role: "ADMIN", telephone: "+212661000001", club: "AMDRH", region: "Rabat-Salé-Kénitra", bio: "Administrateur principal de l'Académie AMDRH", licenceNumber: "AMDRH-ADMIN-001" },
  { email: "formateur@amdrh.ma", nom: "Benali", prenom: "Youssef", role: "FORMATEUR", telephone: "+212661000002", club: "AMDRH", region: "Rabat-Salé-Kénitra", bio: "Formateur certifié IHF niveau 3", licenceNumber: "AMDRH-FRM-001" },
  { email: "formateur2@amdrh.ma", nom: "Tazi", prenom: "Karim", role: "FORMATEUR", telephone: "+212661000003", club: "AMDRH", region: "Casablanca-Settat", bio: "Formateur spécialisé arbitrage", licenceNumber: "AMDRH-FRM-002" },
  { email: "arbitre1@amdrh.ma", nom: "Bennani", prenom: "Hassan", role: "ARBITRE", telephone: "+212661000004", club: "AS FAR", region: "Rabat-Salé-Kénitra", bio: "Arbitre national depuis 2018", licenceNumber: "AMDRH-ARB-001" },
  { email: "arbitre2@amdrh.ma", nom: "El Idrissi", prenom: "Fatima", role: "ARBITRE", telephone: "+212661000005", club: "WAC", region: "Casablanca-Settat", bio: "Arbitre fédéral", licenceNumber: "AMDRH-ARB-002" },
  { email: "arbitre3@amdrh.ma", nom: "Alaoui", prenom: "Omar", role: "ARBITRE", telephone: "+212661000006", club: "Raja CA", region: "Casablanca-Settat", bio: "Arbitre en formation", licenceNumber: "AMDRH-ARB-003" },
  { email: "entraineur1@amdrh.ma", nom: "Chraibi", prenom: "Ahmed", role: "ENTRAINEUR", telephone: "+212661000007", club: "AS FAR", region: "Rabat-Salé-Kénitra", bio: "Entraîneur principal AS FAR Handball", licenceNumber: "AMDRH-ENT-001" },
  { email: "entraineur2@amdrh.ma", nom: "Berrada", prenom: "Sanaa", role: "ENTRAINEUR", telephone: "+212661000008", club: "WAC", region: "Casablanca-Settat", bio: "Entraîneure catégorie jeune", licenceNumber: "AMDRH-ENT-002" },
  { email: "joueur1@amdrh.ma", nom: "El Mansouri", prenom: "Amine", role: "JOUEUR", telephone: "+212661000009", club: "AS FAR", region: "Rabat-Salé-Kénitra", bio: "Demi-centre international", licenceNumber: "AMDRH-JOU-001" },
  { email: "joueur2@amdrh.ma", nom: "Ziani", prenom: "Yassine", role: "JOUEUR", telephone: "+212661000010", club: "WAC", region: "Casablanca-Settat", bio: "Pivot", licenceNumber: "AMDRH-JOU-002" },
  { email: "joueur3@amdrh.ma", nom: "Fassi", prenom: "Imane", role: "JOUEUR", telephone: "+212661000011", club: "Raja CA", region: "Casablanca-Settat", bio: "Ailière droite", licenceNumber: "AMDRH-JOU-003" },
  { email: "joueur4@amdrh.ma", nom: "Lahlou", prenom: "Rachid", role: "JOUEUR", telephone: "+212661000012", club: "FUS Rabat", region: "Rabat-Salé-Kénitra", bio: "Gardien de but", licenceNumber: "AMDRH-JOU-004" },
  { email: "joueur5@amdrh.ma", nom: "Ouazzani", prenom: "Hiba", role: "JOUEUR", telephone: "+212661000013", club: "AS FAR", region: "Rabat-Salé-Kénitra", bio: "Demi-centre", licenceNumber: "AMDRH-JOU-005" },
];

const courses = [
  { title: "Règles Fondamentales du Handball", slug: "regles-fondamentales-handball", description: "Maîtrisez toutes les règles officielles du handball selon les standards IHF.", category: "ARBITRAGE", difficulty: "DEBUTANT", status: "PUBLIE", duration: 120, isCertifying: true, instructorEmail: "formateur@amdrh.ma", order: 1 },
  { title: "Arbitrage Avancé : Gestion du Match", slug: "arbitrage-avance-gestion-match", description: "Techniques avancées de gestion de match pour arbitres expérimentés.", category: "ARBITRAGE", difficulty: "AVANCE", status: "PUBLIE", duration: 180, isCertifying: true, instructorEmail: "formateur@amdrh.ma", order: 2 },
  { title: "Préparation Physique au Handball", slug: "preparation-physique-handball", description: "Programme complet de préparation physique spécifique au handball.", category: "ENTRAINEMENT", difficulty: "INTERMEDIAIRE", status: "PUBLIE", duration: 150, isCertifying: true, instructorEmail: "formateur2@amdrh.ma", order: 3 },
  { title: "Tactiques Collectives : Attaque", slug: "tactiques-collectives-attaque", description: "Systèmes de jeu offensifs et mouvements collectifs en attaque.", category: "ENTRAINEMENT", difficulty: "AVANCE", status: "PUBLIE", duration: 200, isCertifying: true, instructorEmail: "formateur2@amdrh.ma", order: 4 },
  { title: "Techniques Individuelles du Joueur", slug: "techniques-individuelles-joueur", description: "Perfectionnez vos gestes techniques : tir, passe, dribble.", category: "JOUEURS", difficulty: "DEBUTANT", status: "PUBLIE", duration: 90, isCertifying: true, instructorEmail: "formateur@amdrh.ma", order: 5 },
  { title: "Défense et Transition", slug: "defense-transition", description: "Principes défensifs et phases de transition rapide.", category: "JOUEURS", difficulty: "INTERMEDIAIRE", status: "PUBLIE", duration: 110, isCertifying: false, instructorEmail: "formateur@amdrh.ma", order: 6 },
  { title: "Gestion Administrative d'un Club", slug: "gestion-administrative-club", description: "Réglementation, licences et gestion quotidienne d'un club de handball.", category: "ADMINISTRATION", difficulty: "DEBUTANT", status: "PUBLIE", duration: 60, isCertifying: false, instructorEmail: "admin@amdrh.ma", order: 7 },
  { title: "Psychologie du Sportif", slug: "psychologie-sportif", description: "Gestion du stress, concentration et mentalité gagnante.", category: "ENTRAINEMENT", difficulty: "INTERMEDIAIRE", status: "PUBLIE", duration: 75, isCertifying: false, instructorEmail: "formateur2@amdrh.ma", order: 8 },
  { title: "Arbitrage des 7 Mètres", slug: "arbitrage-7-metres", description: "Spécialisation sur les situations de 7 mètres et leur arbitrage.", category: "ARBITRAGE", difficulty: "INTERMEDIAIRE", status: "PUBLIE", duration: 45, isCertifying: true, instructorEmail: "formateur@amdrh.ma", order: 9 },
  { title: "Initiation au Handball pour Jeunes", slug: "initiation-handball-jeunes", description: "Pédagogie et exercices d'initiation pour les catégories jeunes.", category: "JOUEURS", difficulty: "DEBUTANT", status: "PUBLIE", duration: 80, isCertifying: false, instructorEmail: "formateur2@amdrh.ma", order: 10 },
  { title: "Communication et Leadership", slug: "communication-leadership", description: "Développez vos compétences de communication en tant que leader sportif.", category: "ENTRAINEMENT", difficulty: "DEBUTANT", status: "EN_REVISION", duration: 55, isCertifying: false, instructorEmail: "admin@amdrh.ma", order: 11 },
  { title: "Analyse Vidéo et Performance", slug: "analyse-video-performance", description: "Utilisez l'analyse vidéo pour améliorer les performances individuelles et collectives.", category: "ADMINISTRATION", difficulty: "AVANCE", status: "BROUILLON", duration: 100, isCertifying: true, instructorEmail: "formateur@amdrh.ma", order: 12 },
  { title: "Nutrition Sportive pour Handballeurs", slug: "nutrition-sportive-handballeurs", description: "Principes nutritionnels adaptés aux handballeurs de haut niveau.", category: "ENTRAINEMENT", difficulty: "DEBUTANT", status: "PUBLIE", duration: 40, isCertifying: false, instructorEmail: "formateur2@amdrh.ma", order: 13 },
];

const sectionTemplates = [
  { title: "Introduction", lessons: [
    { title: "Présentation du cours", type: "VIDEO", content: "# Présentation du cours\n\nBienvenue dans ce cours de l'Académie AMDRH.\n\nCe module vous guidera à travers les concepts fondamentaux.\n\n## Points abordés\n\n- Les bases théoriques\n- Les mises en situation pratiques\n- Les exemples concrets tirés de matchs réels\n\n## Prérequis\n\nAucun prérequis n'est nécessaire pour ce cours.", duration: 5 },
    { title: "Objectifs et prérequis", type: "TEXTE", content: "# Objectifs\n\nÀ la fin de ce cours, vous serez capable de :\n\n1. Maîtriser les concepts de base\n2. Appliquer les techniques apprises\n3. Évaluer vos connaissances\n\n## Compétences visées\n\n- Compréhension des règles\n- Application pratique\n- Analyse de situations de jeu\n\n## Évaluation\n\nUn quiz final vous permettra de valider vos acquis. Un score minimum de 70% est requis pour l'obtention du certificat.", duration: 10 },
  ]},
  { title: "Partie Principale", lessons: [
    { title: "Concept 1 : Fondamentaux", type: "VIDEO", content: "# Concept 1\n\nDans cette leçon, nous abordons les fondamentaux.\n\n## Points clés\n\n- Premier point important\n- Deuxième point important\n- Troisième point important\n\n## Résumé\n\nCes fondations sont essentielles pour la suite du cours.\n\n## Exemples\n\nVoici quelques exemples concrets tirés de matchs officiels.\n\n### Exemple 1\nDescription détaillée de la situation.\n\n### Exemple 2\nDescription détaillée de la situation.\n\n### Exemple 3\nDescription détaillée de la situation.", duration: 15 },
    { title: "Concept 2 : Approfondissement", type: "TEXTE", content: "# Concept 2\n\nApprofondissons nos connaissances.\n\n## Détails\n\n### Sous-section A\nContenu détaillé de la sous-section A avec des explications précises et des exemples concrets.\n\n### Sous-section B\nContenu détaillé de la sous-section B. Cette partie couvre les aspects avancés du sujet.\n\n### Sous-section C\nContenu détaillé de la sous-section C. Applications pratiques et exercices.\n\n## Points importants\n\n- Les erreurs les plus courantes\n- Comment les éviter\n- Les bonnes pratiques à adopter\n\n## Résumé\n\nEn résumé, voici les points essentiels à retenir de cette leçon.", duration: 20 },
    { title: "Exercices pratiques", type: "INTERACTIF", content: "# Exercices pratiques\n\nMettez en pratique les concepts appris dans les leçons précédentes.\n\n## Consignes\n\n1. Lisez attentivement chaque exercice\n2. Appliquez les techniques enseignées\n3. Vérifiez vos réponses\n\n## Exercice 1\nDécrivez la procédure correcte dans cette situation.\n\n## Exercice 2\nIdentifiez les erreurs dans cette séquence de jeu.\n\n## Exercice 3\nProposez une solution alternative.", duration: 25 },
  ]},
  { title: "Évaluation et Conclusion", lessons: [
    { title: "Quiz final", type: "INTERACTIF", content: "Quiz", duration: 15 },
    { title: "Conclusion et perspectives", type: "TEXTE", content: "# Conclusion\n\nFélicitations pour avoir terminé ce cours !\n\n## Ce que vous avez appris\n\n- Les concepts fondamentaux\n- Les techniques avancées\n- Les applications pratiques\n\n## Prochaines étapes\n\nPassez le quiz final pour valider votre certification.\n\n## Ressources complémentaires\n\nConsultez la médiathèque pour des ressources supplémentaires.", duration: 5 },
  ]},
];

const quizTemplates = [
  { questions: [
    { text: "Quelle est la durée d'une mi-temps au handball ?", type: "QCM_SIMPLE", options: '["15 minutes","20 minutes","25 minutes","30 minutes"]', correctAnswer: "[3]", explanation: "Une mi-temps dure 30 minutes chez les seniors.", points: 2 },
    { text: "Combien de joueurs par équipe sur le terrain ?", type: "QCM_SIMPLE", options: '["5","6","7","8"]', correctAnswer: "[2]", explanation: "7 joueurs par équipe (6 joueurs de champ + 1 gardien).", points: 2 },
    { text: "Le dribble est autorisé pendant combien de secondes ?", type: "VRAI_FAUX", options: '["3 secondes","5 secondes","Illimité","10 secondes"]', correctAnswer: "[0]", explanation: "Le dribble est limité, mais c'est le nombre de pas qui compte.", points: 1 },
    { text: "Quelles sont les zones de tir à 7 mètres (au moins 2) ?", type: "QCM_MULTIPLE", options: '["Faute sur tir","Jeux passifs","Avertissement","Exclusion"]', correctAnswer: "[0,1]", explanation: "7 mètres pour faute sur tir et jeux passifs.", points: 3 },
    { text: "Un joueur peut rester dans la zone des 6 mètres pendant 3 secondes.", type: "VRAI_FAUX", options: '["Vrai","Faux"]', correctAnswer: "[1]", explanation: "Seul le gardien peut se trouver dans la zone des 6 mètres.", points: 1 },
  ]},
];

const learningPaths = [
  { title: "Parcours Arbitre Débutant", description: "Formation complète pour devenir arbitre de handball certifié AMDRH.", slug: "parcours-arbitre-debutant", targetRole: "ARBITRE", mode: "sequentiel", isMandatory: true, order: 1, courseSlugs: ["regles-fondamentales-handball", "arbitrage-7-metres", "arbitrage-avance-gestion-match"] },
  { title: "Parcours Entraîneur Certifié", description: "Devenez entraîneur certifié avec les méthodes AMDRH-FRMHB.", slug: "parcours-entraineur-certifie", targetRole: "ENTRAINEUR", mode: "sequentiel", isMandatory: true, order: 2, courseSlugs: ["preparation-physique-handball", "tactiques-collectives-attaque", "psychologie-sportif"] },
  { title: "Parcours Joueur Excellence", description: "Perfectionnez vos techniques individuelles et collectives.", slug: "parcours-joueur-excellence", targetRole: "JOUEUR", mode: "flexible", isMandatory: false, order: 3, courseSlugs: ["techniques-individuelles-joueur", "defense-transition", "nutrition-sportive-handballeurs"] },
  { title: "Parcours Formateur AMDRH", description: "Formation pour devenir formateur au sein de l'AMDRH.", slug: "parcours-formateur-amdrh", targetRole: "FORMATEUR", mode: "hybride", isMandatory: true, order: 4, courseSlugs: ["regles-fondamentales-handball", "psychologie-sportif", "communication-leadership"] },
];

const badges = [
  { name: "Premier Pas", description: "Complétez votre premier cours", icon: "🎯", level: "BRONZE", criteria: "Compléter 1 cours" },
  { name: "Apprenti Arbitre", description: "Complétez le parcours arbitre débutant", icon: "🏅", level: "ARGENT", criteria: "Compléter le parcours arbitre débutant" },
  { name: "Expert Technique", description: "Réussissez 5 quiz avec un score supérieur à 80%", icon: "🏆", level: "OR", criteria: "5 quiz > 80%" },
  { name: "Légende AMDRH", description: "Obtenez tous les certificats disponibles", icon: "⭐", level: "PLATINE", criteria: "Tous les certificats obtenus" },
  { name: "Bâtisseur", description: "Créez 5 cours en tant que formateur", icon: "🔨", level: "ARGENT", criteria: "Créer 5 cours" },
];

async function main() {
  console.log("🌱 Seeding AMDRH Academy database (idempotent)...");

  // 1. Create users (upsert by email)
  console.log("👤 Creating users...");
  const passwordHash = await bcrypt.hash("Password123!", 10);
  const createdUsers: Record<string, string> = {};

  for (const u of users) {
    try {
      const user = await db.user.upsert({
        where: { email: u.email },
        update: {
          nom: u.nom,
          prenom: u.prenom,
          role: u.role,
          telephone: u.telephone,
          club: u.club,
          region: u.region,
          bio: u.bio,
          licenceNumber: u.licenceNumber,
          isActive: true,
        },
        create: {
          email: u.email,
          passwordHash,
          nom: u.nom,
          prenom: u.prenom,
          role: u.role,
          telephone: u.telephone,
          club: u.club,
          region: u.region,
          bio: u.bio,
          licenceNumber: u.licenceNumber,
          isActive: true,
        },
      });
      createdUsers[u.email] = user.id;
      console.log(`  ✓ ${u.prenom} ${u.nom} (${u.role})`);
    } catch (e) {
      console.log(`  ! ${u.email} already exists, fetching...`);
      const existing = await db.user.findUnique({ where: { email: u.email } });
      if (existing) createdUsers[u.email] = existing.id;
    }
  }

  // 2. Create courses (upsert by slug)
  console.log("📚 Creating courses...");
  const createdCourses: Record<string, string> = {};

  for (let i = 0; i < courses.length; i++) {
    const c = courses[i];
    try {
      const existing = await db.course.findUnique({ where: { slug: c.slug } });
      if (existing) {
        createdCourses[c.slug] = existing.id;
        console.log(`  ~ ${c.title} (already exists)`);
        continue;
      }

      const course = await db.course.create({
        data: {
          title: c.title,
          slug: c.slug,
          description: c.description,
          category: c.category,
          difficulty: c.difficulty,
          status: c.status,
          duration: c.duration,
          isCertifying: c.isCertifying,
          passingScore: 70,
          maxAttempts: 3,
          order: c.order,
          instructorId: createdUsers[c.instructorEmail],
        },
      });
      createdCourses[c.slug] = course.id;
      console.log(`  ✓ ${c.title}`);

      // Create sections and lessons for PUBLIE courses
      if (c.status === "PUBLIE") {
        for (let sIdx = 0; sIdx < sectionTemplates.length; sIdx++) {
          const st = sectionTemplates[sIdx];
          const section = await db.section.create({
            data: {
              title: st.title,
              order: sIdx + 1,
              courseId: course.id,
            },
          });

          for (let lIdx = 0; lIdx < st.lessons.length; lIdx++) {
            const lt = st.lessons[lIdx];
            await db.lesson.create({
              data: {
                title: lt.title,
                type: lt.type,
                content: lt.content,
                duration: lt.duration,
                order: lIdx + 1,
                sectionId: section.id,
              },
            });
          }
        }

        // Create quiz for certifying courses
        if (c.isCertifying && quizTemplates[0]) {
          const qt = quizTemplates[0];
          const quiz = await db.quiz.create({
            data: {
              title: `Quiz : ${c.title}`,
              courseId: course.id,
              duration: 30,
              passingScore: 70,
            },
          });

          for (const q of qt.questions) {
            await db.question.create({
              data: {
                quizId: quiz.id,
                text: q.text,
                type: q.type,
                options: q.options,
                correctAnswer: q.correctAnswer,
                explanation: q.explanation,
                points: q.points,
              },
            });
          }
        }
      }
    } catch (e) {
      console.log(`  ! Course ${c.slug} error: ${(e as Error).message.slice(0, 60)}`);
    }
  }

  // 3. Create learning paths
  console.log("🗺️ Creating learning paths...");
  for (const lp of learningPaths) {
    try {
      const existing = await db.learningPath.findUnique({ where: { slug: lp.slug } });
      if (existing) {
        console.log(`  ~ ${lp.title} (already exists)`);
        continue;
      }

      const path = await db.learningPath.create({
        data: {
          title: lp.title,
          description: lp.description,
          slug: lp.slug,
          targetRole: lp.targetRole,
          mode: lp.mode,
          isMandatory: lp.isMandatory,
          order: lp.order,
        },
      });

      for (let i = 0; i < lp.courseSlugs.length; i++) {
        const courseId = createdCourses[lp.courseSlugs[i]];
        if (courseId) {
          await db.learningPathCourse.create({
            data: {
              learningPathId: path.id,
              courseId,
              order: i + 1,
              isRequired: true,
              minScore: 70,
            },
          });
        }
      }
      console.log(`  ✓ ${lp.title}`);
    } catch (e) {
      console.log(`  ! LP ${lp.slug} error: ${(e as Error).message.slice(0, 60)}`);
    }
  }

  // 4. Create badges
  console.log("🏆 Creating badges...");
  const createdBadgeIds: string[] = [];
  for (const b of badges) {
    try {
      const existing = await db.badge.findFirst({ where: { name: b.name } });
      if (existing) {
        createdBadgeIds.push(existing.id);
        continue;
      }
      const badge = await db.badge.create({ data: b });
      createdBadgeIds.push(badge.id);
      console.log(`  ✓ ${b.name} (${b.level})`);
    } catch (e) {
      // skip
    }
  }

  // 5. Create enrollments (only for users with no enrollments)
  console.log("📋 Creating enrollments...");
  const learnerEmails = ["arbitre1@amdrh.ma", "arbitre2@amdrh.ma", "entraineur1@amdrh.ma", "joueur1@amdrh.ma", "joueur2@amdrh.ma", "joueur3@amdrh.ma", "joueur4@amdrh.ma", "joueur5@amdrh.ma"];
  const publishedCourseIds = Object.entries(createdCourses)
    .filter(([slug]) => !["communication-leadership", "analyse-video-performance"].includes(slug))
    .map(([, id]) => id);

  let enrollCount = 0;
  for (const email of learnerEmails) {
    const userId = createdUsers[email];
    if (!userId) continue;

    const existingEnrollments = await db.enrollment.count({ where: { userId } });
    if (existingEnrollments > 0) continue; // Skip users who already have enrollments

    const numCourses = 2 + Math.floor(Math.random() * 3);
    const shuffled = [...publishedCourseIds].sort(() => Math.random() - 0.5);

    for (let i = 0; i < Math.min(numCourses, shuffled.length); i++) {
      try {
        const progress = Math.random() * 100;
        const status = progress >= 100 ? "termine" : "en_cours";

        await db.enrollment.create({
          data: {
            userId,
            courseId: shuffled[i],
            status,
            progress: Math.min(progress, 100),
            completedAt: progress >= 100 ? new Date() : null,
          },
        });
        enrollCount++;
      } catch {
        // unique constraint - skip
      }
    }
  }
  console.log(`  ✓ ${enrollCount} enrollments created`);

  // 6. Create certificates for completed enrollments
  console.log("📜 Creating certificates...");
  const year = new Date().getFullYear();
  const existingCertCount = await db.certificate.count();
  let certSeq = existingCertCount;

  if (certSeq === 0) {
    const completedEnrollments = await db.enrollment.findMany({
      where: { status: "termine" },
      include: { user: true, course: true },
      take: 5,
    });

    for (const e of completedEnrollments) {
      certSeq++;
      const code = `AMDRH-${year}-${String(certSeq).padStart(5, "0")}`;
      try {
        await db.certificate.create({
          data: {
            code,
            type: "CERTIFICAT",
            status: "ACTIVE",
            userId: e.userId,
            courseId: e.courseId,
            courseTitle: e.course.title,
            userName: `${e.user.prenom} ${e.user.nom}`,
            userLicence: e.user.licenceNumber,
            score: 85,
            maxScore: 100,
            issuedAt: new Date(),
          },
        });
      } catch {
        // skip
      }
    }
    console.log(`  ✓ ${certSeq} certificates created`);
  } else {
    console.log(`  ~ ${certSeq} certificates already exist`);
  }

  // 7. Award badges
  console.log("🏅 Awarding badges...");
  const adminId = createdUsers["admin@amdrh.ma"];
  if (adminId && createdBadgeIds.length > 0) {
    try {
      await db.userBadge.upsert({
        where: { userId_badgeId: { userId: adminId, badgeId: createdBadgeIds[0] } },
        update: {},
        create: { userId: adminId, badgeId: createdBadgeIds[0] },
      });
      console.log(`  ✓ Badge awarded to admin`);
    } catch {
      // skip
    }
  }

  // 8. Create notifications
  console.log("🔔 Creating notifications...");
  const notifTypes = [
    { type: "COURS", title: "Nouveau cours disponible", message: "Le cours 'Arbitrage Avancé' est maintenant publié." },
    { type: "QUIZ", title: "Résultat de quiz", message: "Vous avez obtenu 85% au quiz 'Règles Fondamentales'." },
    { type: "CERTIFICAT", title: "Certificat obtenu !", message: "Félicitations, vous avez obtenu votre certificat." },
    { type: "BADGE", title: "Nouveau badge", message: "Vous avez débloqué le badge 'Premier Pas'." },
    { type: "SYSTEME", title: "Bienvenue", message: "Bienvenue sur l'Académie AMDRH !" },
  ];

  const existingNotifCount = await db.notification.count();
  if (existingNotifCount === 0) {
    for (const email of ["arbitre1@amdrh.ma", "entraineur1@amdrh.ma", "joueur1@amdrh.ma"]) {
      const userId = createdUsers[email];
      if (!userId) continue;
      for (let i = 0; i < notifTypes.length; i++) {
        await db.notification.create({
          data: {
            userId,
            type: notifTypes[i].type,
            title: notifTypes[i].title,
            message: notifTypes[i].message,
            isRead: i > 2,
          },
        });
      }
    }
    console.log(`  ✓ 15 notifications created`);
  } else {
    console.log(`  ~ ${existingNotifCount} notifications already exist`);
  }

  // 9. Create messages
  console.log("💬 Creating messages...");
  const existingConvs = await db.conversation.count();
  if (existingConvs === 0) {
    const conv1 = await db.conversation.create({ data: { subject: "Formation arbitrage" } });
    const adminId2 = createdUsers["admin@amdrh.ma"];
    const arbitre1Id = createdUsers["arbitre1@amdrh.ma"];

    if (adminId2 && arbitre1Id) {
      await db.conversationParticipant.createMany({
        data: [
          { userId: adminId2, conversationId: conv1.id },
          { userId: arbitre1Id, conversationId: conv1.id },
        ],
      });
      await db.message.createMany({
        data: [
          { content: "Bonjour, j'ai une question concernant la formation arbitrage.", senderId: arbitre1Id, receiverId: adminId2, conversationId: conv1.id },
          { content: "Bien sûr, je suis là pour vous aider !", senderId: adminId2, receiverId: arbitre1Id, conversationId: conv1.id, isRead: true },
          { content: "Quelles sont les étapes pour devenir arbitre certifié ?", senderId: arbitre1Id, receiverId: adminId2, conversationId: conv1.id },
        ],
      });
    }

    const conv2 = await db.conversation.create({ data: { subject: "Planning des formations" } });
    const formateurId = createdUsers["formateur@amdrh.ma"];
    const entraineur1Id = createdUsers["entraineur1@amdrh.ma"];

    if (formateurId && entraineur1Id) {
      await db.conversationParticipant.createMany({
        data: [
          { userId: formateurId, conversationId: conv2.id },
          { userId: entraineur1Id, conversationId: conv2.id },
        ],
      });
      await db.message.createMany({
        data: [
          { content: "Le planning de la prochaine session est-il disponible ?", senderId: entraineur1Id, receiverId: formateurId, conversationId: conv2.id },
          { content: "Oui, la prochaine session débutera le 15 du mois. Je vous envoie le lien d'inscription.", senderId: formateurId, receiverId: entraineur1Id, conversationId: conv2.id, isRead: true },
        ],
      });
    }
    console.log("  ✓ Conversations and messages created");
  } else {
    console.log(`  ~ ${existingConvs} conversations already exist`);
  }

  console.log("\n✅ Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
