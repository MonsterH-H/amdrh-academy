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
          { title: "Le terrain et les équipements", type: "TEXTE", content: `Le terrain de handball est un espace rectangulaire réglementé par les règles de l'IHF, mesurant exactement 40 mètres de longueur sur 20 mètres de largeur. Ce terrain est divisé en plusieurs zones distinctes, chacune ayant une fonction précise lors du déroulement du match. La surface de jeu doit être en bois, en materiau synthétique ou en caoutchouc, offrant une adhérence optimale pour les déplacements rapides des joueurs.

Au centre du terrain se trouve la ligne médiane, qui sépare les deux moitiés de jeu. Autour de cette ligne, un cercle central d'un rayon de 3 mètres est tracé ; c'est à cet endroit que le jet d'engagement est effectué en début de match et après chaque but. Chaque camp est équipé d'une surface de but de 6 mètres de rayon, délimitée par un demi-cercle tracé devant le but. Aucun joueur autre que le gardien de but n'est autorisé à pénétrer dans cette zone, sous peine de sanction.

La zone de jet franc est représentée par une ligne en pointillés tracée à 9 mètres du but. Cette zone marque l'endroit où sont exécutés la plupart des jets francs. La ligne de jet de 7 mètres, quant à elle, est tracée à exactement 7 mètres devant le but et est utilisée pour les sanctions les plus sévères. Le but lui-même mesure 3 mètres de largeur et 2 mètres de hauteur, avec un filet qui doit être correctement tendu.

Les zones de changement sont situées de chaque côté de la zone de remplacement, permettant aux joueurs d'entrer et de sortir du terrain. La table de marque et le banc des remplaçants se trouvent généralement au milieu de l'un des côtés du terrain. Les règles stipulent également que les bandes latérales doivent avoir une largeur minimale d'un mètre hors limites pour assurer la sécurité des joueurs. La connaissance précise de ces dimensions et de ces zones est indispensable pour tout arbitre, car de nombreuses décisions dépendent de la localisation exacte des joueurs et du ballon sur le terrain.`, duration: 15 },
          { title: "Composition des équipes", type: "TEXTE", content: `Au handball, chaque équipe est composée de sept joueurs sur le terrain : six joueurs de champ et un gardien de but. Cette composition est fixée par les règles de l'IHF et constitue la base de toutes les formations et stratégies de jeu. Chaque joueur a un rôle spécifique en fonction de son poste, et la compréhension de ces rôles est essentielle pour l'arbitre afin de bien analyser les situations de jeu.

Les postes offensifs sont généralement répartis ainsi : le demi-centre (ou pivot de construction), qui organise le jeu et distribue les ballons ; les deux arrières (arrière gauche et arrière droit), souvent les tireurs les plus puissants de l'équipe ; les deux ailiers (ailier gauche et ailier droit), positionnés près des côtés du terrain et spécialisés dans les tirs en suspension ; et le pivot, un joueur massif positionné entre les défenseurs adverses pour créer des espaces et recevoir les ballons en position de tir.

Le gardien de but occupe une place unique dans l'équipe. C'est le seul joueur autorisé à se trouver dans la surface de but (les 6 mètres). Il peut utiliser toutes les parties de son corps pour arrêter les tirs, y compris les pieds, ce qui le distingue des autres joueurs. Le gardien moderne au handball joue un rôle de plus en plus actif dans la relance offensive, participant souvent aux contre-attaques.

Chaque équipe peut inscrire jusqu'à 14 joueurs sur la feuille de match. Les remplacements sont illimités et peuvent être effectués à tout moment, à condition que le joueur sortant ait complètement quitté le terrain avant que le remplaçant n'y entre. Les remplacements doivent se faire par la zone de changement spécifique. Un remplacement irrégulier est sanctionné d'un jet franc en faveur de l'équipe adverse. Les joueurs doivent également porter des numéros distincts de 1 à 99, le numéro 1 étant généralement réservé au gardien titulaire et le numéro 12 au gardien remplaçant.`, duration: 10 },
          { title: "Durée du match", type: "TEXTE", content: `Un match de handball senior se déroule en deux mi-temps de 30 minutes chacune, avec une pause à la mi-temps de 15 minutes. Le chronomètre est arrêté à chaque interruption du jeu, ce qui signifie que la durée réelle d'un match est souvent supérieure à 75 minutes. Cette particularité est importante pour l'arbitre, qui doit signaler chaque arrêt de chronomètre au chronométreur officiel.

Pour les catégories de jeunes, la durée des mi-temps varie selon l'âge : les minimes jouent généralement 2 x 25 minutes, les cadets 2 x 25 minutes, et les benjamins 2 x 20 minutes. Les arbitres doivent s'adapter aux règles spécifiques de chaque catégorie et vérifier les conditions de match avant le début de la rencontre. Il est recommandé d'arriver au minimum 45 minutes avant le début du match pour effectuer l'inspection du terrain et des équipements.

Le chronométreur officiel est responsable de la gestion du temps de jeu. Il doit arrêter le chronomètre sur signal de l'arbitre lors d'un jet franc, d'un jet de 7 mètres, d'un temps mort, d'une blessure, d'une exclusion ou de toute autre interruption. Les trois temps morts par équipe et par mi-temps sont d'une durée d'une minute chacun. L'arbitre doit s'assurer que les équipes reprennent le jeu immédiatement après la fin du temps mort.

En cas d'égalité à la fin du temps réglementaire, des prolongations de 2 x 5 minutes sont jouées. Si l'égalité persiste, on procède à une série de jets de 7 mètres (la « séance de tirs au but »). Chaque équipe effectue 5 tirs, en alternance. Si l'égalité persiste après ces 10 tirs, la séance se poursuit en « mort subite » : chaque tir manqué par une équipe alors que l'autre a réussi le sien entraîne la victoire de cette dernière. L'arbitre principal doit s'assurer que le protocole des prolongations est strictement respecté.`, duration: 10 },
        ]},
        { title: "Sanctions et fautes", lessons: [
          { title: "Fautes simples et avertissements", type: "TEXTE", content: `Les fautes simples constituent la grande majorité des sanctions au handball. Elles incluent tous les contacts irréguliers entre joueurs, tels que les poussées, les tacles, les blocages illégaux, les accrochages et les charges. Selon les règles de l'IHF, tout contact qui entrave le mouvement libre d'un adversaire est considéré comme une faute. L'arbitre doit évaluer si le contact a effectivement perturbé le jeu avant de siffler une faute.

L'avertissement (carton jaune) est la première étape de la progression des sanctions. Il est donné pour des fautes qui ne nécessitent pas une exclusion immédiate mais qui méritent d'être signalées. Un joueur ne peut recevoir qu'un seul avertissement par match, et une équipe ne peut recevoir que trois avertissements au total. Une fois ces trois avertissements distribués, toute faute supplémentaire entraîne automatiquement une exclusion de 2 minutes. Cette règle encourage l'arbitre à gérer progressivement la discipline du match.

Les irrégularités techniques sont également sanctionnées comme des fautes simples. Il s'agit notamment du marcher (faire plus de trois pas sans dribbler), du repiquer (dribbler, s'arrêter, puis dribbler à nouveau), de la reprise de dribble, et du non-respect de la zone de 3 secondes autour du gardien de but adverse. Le gardien lui-même est soumis à des règles spécifiques : il ne peut pas sortir de sa surface de but avec le ballon et doit le relancer en moins de 3 secondes.

L'arbitre doit utiliser des critères objectifs pour siffler les fautes : le principe de base est que « le joueur qui attaque la balle a le droit de passage ». Le défenseur doit se positionner correctement avant le contact. Si le défenseur entre en collision avec un attaquant en ayant les deux pieds en mouvement, c'est généralement une faute de défense. La constance dans les décisions est cruciale pour maintenir la crédibilité de l'arbitre et la fluidité du match.`, duration: 15 },
          { title: "Exclusions et disqualifications", type: "TEXTE", content: `L'exclusion temporaire de 2 minutes est l'une des sanctions les plus fréquentes au handball. Elle est infligée pour des fautes répétées, des fautes anti-sportives ou des irrégularités techniques graves. Lorsqu'un joueur est exclu, il doit quitter immédiatement le terrain et s'asseoir sur le banc des pénalités. L'équipe joue alors en infériorité numérique pendant toute la durée de l'exclusion. L'arbitre doit lever le bras horizontalement avec deux doigts écartés pour signaler cette sanction.

Les troisième et quatrième exclusions d'un même joueur au cours d'un match entraînent automatiquement une disqualification. La troisième exclusion est signalée par un carton bleu en plus du bras levé. La disqualification signifie que le joueur doit quitter définitivement le terrain et le secteur de remplacement, et son équipe reste en infériorité numérique pour les 2 minutes restantes. L'arbitre doit noter soigneusement le numéro du joueur exclu et le moment de l'exclusion sur sa feuille de match.

La disqualification directe (sans exclusion préalable) est la sanction la plus sévère après l'exclusion. Elle est prononcée pour des fautes particulièrement dangereuses, comme un tacle par derrière, un coup volontaire, une insulte ou un comportement antisportif grave. Le joueur disqualifié doit quitter le terrain et le secteur de remplacement pour le reste du match. Un rapport doit être rédigé par l'arbitre et soumis à la commission de discipline compétente dans les 24 heures suivant le match.

La progression disciplinaire est un concept fondamental que tout arbitre doit maîtriser. Elle suit un ordre précis : avertissement (jaune), exclusion (2 minutes), puis disqualification (rouge). Cependant, dans le cas d'une faute exceptionnellement grave, l'arbitre peut prononcer une disqualification directe sans passer par les étapes précédentes. Les officiels de banc (entraîneurs, officiels d'équipe) sont également soumis à cette progression, bien qu'ils ne puissent pas être exclus temporairement : ils reçoivent directement une disqualification en cas de comportement inapproprié.`, duration: 15 },
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
          { title: "Position de base et déplacement", type: "TEXTE", content: `Le positionnement de l'arbitre est l'un des aspects les plus importants de l'arbitrage au handball. Un bon positionnement permet à l'arbitre de prendre des décisions justes et rapides en ayant une vision optimale de l'action. Le duo arbitral fonctionne selon le principe de la « diagonale » : un arbitre se positionne du côté de l'attaque, tandis que l'autre se place du côté de la défense. Cette répartition permet une couverture visuelle maximale du terrain.

L'arbitre de terrain (arbitre de côté) se déplace le long du côté du terrain, en suivant le mouvement du ballon et des joueurs. Il doit maintenir une distance d'environ 3 à 5 mètres de l'action pour avoir une vue dégagée tout en restant proche enough pour observer les détails. L'arbitre doit toujours avoir le ballon et les joueurs concernés dans son champ de vision. Il doit éviter de se positionner entre les joueurs et le ballon, car cela pourrait gêner le jeu ou bloquer sa propre vue.

Le déplacement de l'arbitre doit être fluide et anticipé. Un bon arbitre ne court pas après le ballon mais se déplace en anticipation pour être au bon endroit au bon moment. Lors d'une contre-attaque, l'arbitre doit sprinter pour suivre l'action tout en restant sur la ligne de côté. Dans les situations de jeu statique (attaque placée), l'arbitre doit se positionner en fonction de la position du pivot et des arrières pour observer les contacts éventuels.

L'arbitre de but se place généralement derrière le but ou sur le côté du but, en fonction de la position de l'attaque. Son rôle principal est de surveiller les irrégularités dans la surface de but, les fautes sur le gardien et les situations de jet de 7 mètres. La coordination entre les deux arbitres est essentielle : celui qui est le plus proche de l'action prend la décision, et l'autre observe le jeu éloigné pour détecter d'éventuelles irrégularités. Un bon positionnement réduit considérablement les erreurs d'arbitrage et améliore la qualité globale du match.`, duration: 20 },
          { title: "Communication entre arbitres", type: "TEXTE", content: `La communication entre les deux arbitres est un pilier fondamental de l'arbitrage de qualité au handball. Le duo arbitral doit fonctionner comme une équipe soudée, où chaque membre comprend intuitivement les intentions et les décisions de l'autre. Le contact visuel est le moyen de communication le plus important : avant chaque décision importante, les arbitres doivent échanger un regard pour s'assurer qu'ils ont la même perception de la situation.

Le système de communication officiel entre arbitres repose sur plusieurs éléments. Le contact visuel permanent permet de coordonner les déplacements et les positions. Le langage corporel est également crucial : un hochement de tête, un geste de la main ou une posture peuvent transmettre des informations sans un seul mot. Les arbitres doivent développer une compréhension mutuelle qui va au-delà des mots, une véritable complicité professionnelle qui se construit par des heures d'entraînement et de matchs ensemble.

Lorsqu'une situation ambiguë se présente, les arbitres doivent pouvoir échanger rapidement. Le principe de base est que l'arbitre le plus proche de l'action a priorité pour prendre la décision. Si l'arbitre éloigné observe une irrégularité que l'autre n'a pas vue, il doit intervenir immédiatement. En cas de désaccord, l'arbitre de terrain (le plus ancien dans la hiérarchie arbitrale) a le dernier mot. Cependant, il est recommandé que les deux arbitres se concertent brièvement pour les décisions majeures, comme un jet de 7 mètres ou une disqualification.

La préparation avant le match est également un moment clé de la communication entre arbitres. Lors de la rencontre préalable, les deux arbitres doivent discuter de leur positionnement, des situations particulières à surveiller, et des conventions de communication qu'ils utiliseront. Ils doivent également revoir ensemble les règles spécifiques et les interprétations récentes de l'IHF. Un duo arbitral bien préparé et bien communiquant inspire confiance aux joueurs, aux entraîneurs et aux spectateurs, et contribue significativement à la qualité du match.`, duration: 15 },
        ]},
        { title: "Gestion du temps", lessons: [
          { title: "Arrêts de jeu et temps mort", type: "TEXTE", content: `La gestion des arrêts de jeu et des temps morts est une compétence essentielle pour tout arbitre de handball. L'arbitre doit être capable de suspendre le jeu de manière fluide et de le reprendre au bon moment, tout en respectant les règles et en maintenant le rythme du match. Chaque arrêt de jeu doit être signalé au chronométreur par un geste clair et distinct, généralement deux bras levés avec les mains ouvertes.

Les temps morts sont des moments stratégiques importants dans un match de handball. Chaque équipe dispose de trois temps morts par mi-temps, d'une durée d'une minute chacun. L'entraîneur demande un temps mort en présentant un carton vert au chronométreur ou à l'arbitre. L'arbitre doit accorder le temps mort au premier arrêt de jeu approprié, en s'assurant que l'équipe qui en fait la demande est en possession du ballon ou que la situation le permet selon les règles. L'arbitre doit vérifier que le temps mort est bien noté sur la feuille de match.

L'arbitre doit également gérer les arrêts de jeu liés aux blessures. Lorsqu'un joueur est blessé, l'arbitre doit évaluer rapidement la gravité de la situation. Si le joueur peut se relever et continuer, le jeu reprend sans arrêt prolongé. Si le joueur nécessite des soins, l'arbitre arrête le jeu et autorise l'entrée du personnel médical. Il est important de noter que l'arbitre ne doit jamais toucher un joueur blessé ni tenter de le soigner, mais doit simplement assurer la sécurité et ordonner l'entrée des professionnels de santé.

Les autres situations d'arrêt de jeu incluent les remplacements irréguliers, les problèmes d'équipement, les perturbations du public et les incidents techniques. Dans chaque cas, l'arbitre doit prendre une décision rapide et équitable, en privilégiant la sécurité des joueurs et le bon déroulement du match. La gestion efficace des arrêts de jeu contribue à maintenir un rythme de match fluide et agréable pour tous les participants.`, duration: 15 },
          { title: "Gestion de la fin de match", type: "TEXTE", content: `La gestion de la fin de match est l'un des moments les plus délicats pour un arbitre de handball. Les dernières minutes d'un match sont souvent les plus intenses, avec une pression maximale sur les joueurs, les entraîneurs et les arbitres. L'arbitre doit maintenir un niveau de concentration élevé et appliquer les règles avec la même rigueur que lors des premières minutes du match. La tentation de « laisser jouer » dans les dernières secondes est un piège que tout arbitre doit éviter.

Dans les dernières minutes d'un match serré, les équipes adoptent souvent des stratégies spécifiques : retrait du gardien pour créer un surnombre en attaque, jeu plus agressif, provocations pour obtenir des exclusions adverses. L'arbitre doit anticiper ces situations et rester vigilant face aux tentatives de manipulation du jeu. Les simulations et les provocations augmentent fréquemment en fin de match, et l'arbitre doit les sanctionner avec fermeté et discernement.

Le chronométrage de la fin de match est un aspect crucial. Le temps réglementaire ne se termine pas nécessairement à la minute exacte affichée au chronomètre. Le chronométreur doit attendre que le ballon soit en jeu au moment où le temps réglementaire expire pour signaler la fin du match. Si un jet franc ou un jet de 7 mètres a été sifflé avant la fin du temps, il doit être exécuté. L'arbitre doit s'assurer que le signal de fin de match est correctement synchronisé avec le chronométreur et que toutes les situations en cours sont résolues avant de déclarer la fin de la rencontre.

Après le coup de sifflet final, l'arbitre doit vérifier la feuille de match avec le chronométreur et le secrétaire. Il doit s'assurer que tous les événements importants (buts, exclusions, avertissements, temps morts) sont correctement enregistrés. Les deux arbitres doivent signer la feuille de match, ainsi que les capitaines des deux équipes. L'arbitre doit ensuite rédiger son rapport de match, mentionnant tout incident ou comportement antisportif qui nécessite un suivi disciplinaire de la part de la fédération.`, duration: 15 },
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
          { title: "Signaux de base", type: "TEXTE", content: `La gestuelle officielle de l'arbitre de handball est un langage universel codifié par l'IHF. Elle comprend plus de 30 signaux standardisés que tout arbitre doit maîtriser parfaitement. Ces signaux permettent de communiquer les décisions aux joueurs, aux entraîneurs, au public et à la table de marque de manière claire et univoque. Une bonne gestuelle est caractérisée par des mouvements précis, amples et tenus, visibles de tous les points du terrain.

Les signaux de base comprennent : le signal de début de match (bras vertical vers le haut), le signal de but (bras vertical vers le haut avec un mouvement de rotation), le signal de jet franc (bras tendu horizontalement dans la direction de l'équipe bénéficiaire), le signal de jet de 7 mètres (bras levé verticalement avec un doigt pointé vers le haut), et le signal d'engagement (bras horizontal indiquant la direction de l'équipe qui engage). Chaque signal doit être exécuté de manière distincte et maintenu suffisamment longtemps pour que tous les acteurs du match puissent le voir et le comprendre.

Les signaux liés aux sanctions sont également essentiels. L'avertissement est signalé par le bras levé avec un carton jaune visible. L'exclusion de 2 minutes est indiquée par les deux doigts levés du bras horizontal. La disqualification est signalée par les bras croisés au-dessus de la tête, accompagnés d'un carton rouge. L'arbitre doit toujours montrer le carton de la couleur appropriée en direction du joueur sanctionné, en le maintenant visible pendant quelques secondes.

L'apprentissage de la gestuelle commence dès la formation initiale de l'arbitre et se perfectionne tout au long de sa carrière. Les formateurs recommandent de pratiquer les signaux devant un miroir et en situation de match amical avant de les utiliser en compétition officielle. La régularité et la constance des signaux sont aussi importantes que leur exactitude : un arbitre dont la gestuelle est cohérente inspire confiance et est mieux accepté par les participants. L'IHF publie régulièrement des mises à jour et des clarifications sur la gestuelle officielle que les arbitres doivent consulter régulièrement.`, duration: 20 },
          { title: "Signaux avancés", type: "TEXTE", content: `Les signaux avancés de l'arbitre concernent les situations de jeu plus complexes qui nécessitent une communication précise et détaillée. Ces signaux vont au-delà des décisions de base et permettent d'expliquer la nature spécifique de l'irrégularité commise, facilitant ainsi la compréhension des joueurs et du public. Un arbitre expérimenté utilise ces signaux avec aisance et les combine avec les signaux de base pour une communication complète.

Parmi les signaux avancés les plus importants, on trouve le signal de marcher (mouvement alternatif des poings fermés), le signal de dribble irrégulier ou de reprise de dribble (mouvement de frappe de la paume de la main), le signal de franchissement de la surface de but par un joueur de champ (index pointé vers la zone), et le signal de retenir le ballon trop longtemps (mouvement circulaire des mains). Chacun de ces signaux identifie la nature exacte de la faute et aide les joueurs à comprendre pourquoi la décision a été prise.

Les signaux liés au jeu passif sont particulièrement importants. Le jeu passif (ou « passe à dix ») est signalé par un bras levé avec un geste d'avertissement pour indiquer que l'équipe attaquante ne tente pas suffisamment de marquer. Si l'équipe ne crée pas d'occasion de but après l'avertissement, l'arbitre siffle un jet franc en faveur de l'équipe adverse. Ce signal est souvent accompagné d'un geste montrant le chronomètre pour rappeler la limite de temps de possession.

La gestion des situations de jet de 7 mètres implique également des signaux spécifiques. L'arbitre doit signaler le jet en levant un bras verticalement, puis vérifier que les joueurs sont correctement positionnés : le tireur derrière la ligne de 7 mètres, les autres joueurs derrière la ligne de jet franc (9 mètres). L'arbitre siffle le début de l'exécution d'un geste de bras descendant. Les signaux avancés de l'arbitre sont un atout majeur pour la clarté du match et doivent être pratiqués régulièrement pour maintenir un haut niveau de compétence.`, duration: 20 },
        ]},
        { title: "Psychologie de l'arbitre", lessons: [
          { title: "Gestion de la pression", type: "TEXTE", content: `La gestion de la pression est un aspect psychologique fondamental de l'arbitrage au handball. Les arbitres sont constamment sous pression, que ce soit de la part des joueurs, des entraîneurs, du public ou même des médias. La capacité à maintenir son calme, sa concentration et son objectivité dans des situations de forte tension est ce qui distingue un bon arbitre d'un arbitre exceptionnel. Cette compétence mentale s'acquiert et se développe par la pratique et l'expérience.

Les sources de pression en arbitrage sont multiples et variées. La pression des joueurs se manifeste par les contestations verbales, les gesticulations et parfois même les contacts physiques avec l'arbitre. La pression du public est particulièrement intense dans les grands matchs, où des milliers de supporters peuvent faire peser leur influence sur les décisions. La pression médiatique, de plus en plus présente avec la diffusion en direct et les réseaux sociaux, ajoute une dimension supplémentaire à la charge psychologique de l'arbitre. L'arbitre doit apprendre à filtrer ces influences et à se concentrer uniquement sur ce qui se passe sur le terrain.

Plusieurs techniques de gestion de la pression sont recommandées par les psychologues du sport. La respiration contrôlée est l'une des méthodes les plus efficaces : avant un match ou dans un moment de tension, l'arbitre doit prendre de profondes inspirations pour réguler son rythme cardiaque et clarifier sa pensée. La visualisation positive, qui consiste à imaginer des situations de match et la manière de les gérer, permet de se préparer mentalement aux défis à venir. La concentration sélective, c'est-à-dire la capacité à se focaliser uniquement sur les éléments pertinents du jeu en ignorant les distractions, est également une compétence clé.

L'expérience est le meilleur professeur en matière de gestion de la pression. Chaque match arbitré, surtout les plus difficiles, contribue à renforcer la résilience psychologique de l'arbitre. Les jeunes arbitres sont encouragés à débuter par des matchs de catégories inférieures, où la pression est moindre, avant de progresser vers des rencontres de plus en plus exigeantes. Le mentorat, c'est-à-dire l'accompagnement par un arbitre expérimenté, est un dispositif précieux qui permet aux jeunes officiels de bénéficier de conseils et de soutien dans leur développement psychologique et professionnel.`, duration: 25 },
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
          { title: "Fair-play et respect", type: "TEXTE", content: `Le fair-play est une valeur fondamentale du handball, inscrite dans l'esprit même de ce sport. Le handball est souvent considéré comme l'un des sports collectifs les plus exigeants en termes de respect mutuel, et cette réputation repose en grande partie sur l'engagement de tous les acteurs du jeu en faveur du fair-play. Cette valeur va au-delà du simple respect des règles : elle englobe l'attitude envers les adversaires, les coéquipiers, les arbitres et le public.

Le fair-play au handball se manifeste de nombreuses façons. Sur le terrain, un joueur fair-play aide un adversaire tombé à se relever, reconnaît ses propres fautes sans contestation excessive, et accepte les décisions de l'arbitre avec dignité. Hors du terrain, il respecte les installations, salue ses adversaires après le match et maintient une attitude exemplaire envers les supporters et les médias. L'IHF a codifié ces principes dans sa Charte du Fair-Play, qui sert de référence pour toutes les fédérations membres.

Le respect de l'arbitre est un aspect central du fair-play au handball. Les joueurs doivent comprendre que l'arbitre est un partenaire essentiel du jeu et non un adversaire. Les contestations excessives, les gestes d'agacement ou les remarques désobligeantes à l'encontre de l'arbitre sont considérées comme des comportements anti-sportifs et sont sévèrement sanctionnées. Les capitaines d'équipe ont un rôle particulier à jouer en matière de fair-play : ils sont les interlocuteurs privilégiés de l'arbitre et doivent montrer l'exemple à leurs coéquipiers.

La formation au fair-play commence dès les catégories de jeunes et se poursuit tout au long de la carrière sportive. Les clubs et les fédérations ont la responsabilité d'inculquer ces valeurs à travers des programmes éducatifs spécifiques. Le fair-play n'est pas une faiblesse mais une force : les équipes qui jouent avec fair-play obtiennent souvent de meilleurs résultats sur le long terme, car elles développent une meilleure cohésion, une plus grande résilience mentale et une réputation positive qui attire les talents et les supporters.`, duration: 15 },
          { title: "Intégrité et conduite", type: "TEXTE", content: `L'intégrité sportive est un concept qui englobe l'ensemble des comportements éthiques attendus des acteurs du handball. Elle implique un engagement envers l'honnêteté, la transparence et le respect des valeurs fondamentales du sport. L'intégrité sportive ne se limite pas au comportement sur le terrain : elle couvre également les aspects liés à la compétition, à l'arbitrage, à l'administration et à la gouvernance du handball à tous les niveaux.

L'une des menaces les plus graves à l'intégrité sportive est la triche sous toutes ses formes. Au handball, cela peut inclure la manipulation de matchs, le dopage, la falsification de licence ou d'identité, et la corruption d'arbitres ou de joueurs. La FRMHB, comme toutes les fédérations membres de l'IHF, a mis en place des mécanismes de prévention et de détection de ces comportements. Tout acteur du handball qui constate une violation de l'intégrité sportive a le devoir de la signaler aux autorités compétentes.

Le dopage est une violation particulièrement grave de l'intégrité sportive. Les joueurs de handball sont soumis aux mêmes réglementations antidopage que les autres sportifs de haut niveau, sous l'égide de l'Agence Mondiale Antidopage (AMA). Les contrôles peuvent être effectués à tout moment, en compétition ou hors compétition. Les substances interdites incluent les stéroïdes anabolisants, les stimulants, les diurétiques et les méthodes de manipulation du sang. L'éducation antidopage fait partie intégrante de la formation des joueurs et des entraîneurs.

La conduite exemplaire d'un arbitre est un pilier de l'intégrité sportive. L'arbitre doit être impartial, honnête et transparent dans toutes ses décisions. Il ne doit accepter aucun cadeau, aucune faveur ni aucune pression extérieure qui pourrait influencer son jugement. L'arbitre doit également déclarer tout conflit d'intérêts potentiel avant d'être désigné pour un match. La formation continue en matière d'éthique et d'intégrité est obligatoire pour tous les arbitres et doit être renouvelée périodiquement pour maintenir la certification.`, duration: 15 },
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
          { title: "Autorité et clarté", type: "TEXTE", content: `La communication verbale de l'arbitre est un outil puissant pour maintenir l'ordre et le respect sur le terrain. Une communication claire, ferme et respectueuse contribue significativement à la qualité du match et à la satisfaction de tous les participants. L'arbitre doit développer une voix autoritaire mais mesurée, capable de se faire entendre dans le bruit du match sans crier ou s'énerver.

L'autorité verbale de l'arbitre repose sur plusieurs principes. Premièrement, la clarté : chaque mot prononcé doit être compréhensible et sans ambiguïté. L'arbitre doit éviter les phrases vagues ou les instructions confuses. Deuxièmement, la concision : les messages doivent être brefs et directs. Les longues explications sont inutiles et peuvent même aggraver les tensions. Troisièmement, le calme : l'arbitre ne doit jamais élever la voix de manière agressive, même sous la pression. Un ton calme mais ferme est bien plus efficace qu'un cri pour imposer le respect.

L'arbitre utilise la communication verbale à plusieurs moments clés du match. Avant le match, il accueille les capitaines et rappelle les règles importantes. Pendant le match, il peut donner des instructions aux joueurs (« Attention au contact ! », « Relancez rapidement ! ») pour prévenir les fautes. Lors des sanctions, il doit expliquer brièvement la raison de sa décision au joueur concerné. Après le match, il remercie les participants et fait un bref débriefing si nécessaire.

Le ton et le vocabulaire de l'arbitre sont également importants. L'arbitre doit s'adresser aux joueurs avec respect, en utilisant un langage professionnel et courtois. Les expressions familières ou familièrement dédaigneuses sont à proscrire. L'arbitre doit adapter son style de communication au niveau du match : un match de jeunes nécessite une approche plus pédagogique, tandis qu'un match senior de haut niveau exige une communication plus directe et succincte. Dans tous les cas, l'arbitre doit maintenir une attitude professionnelle et neutre.`, duration: 20 },
          { title: "Gestion des conflits verbaux", type: "TEXTE", content: `La gestion des conflits verbaux est l'une des compétences les plus délicates que doit maîtriser un arbitre de handball. Les situations de contestation et de conflit font partie intégrante du sport, et l'arbitre doit savoir les gérer avec calme, intelligence et autorité. Un conflit mal géré peut rapidement dégénérer et affecter la qualité du match, voire la sécurité des participants.

Face à une contestation d'un joueur, l'arbitre doit d'abord écouter brièvement sans interrompre. Cette attitude montre un respect de base pour le joueur et contribue à désamorcer la tension. Ensuite, l'arbitre doit répondre de manière claire et ferme, en expliquant sa décision si nécessaire mais sans se justifier excessivement. Si le joueur persiste dans sa contestation, l'arbitre doit lever la main en signe d'arrêt et indiquer que la discussion est terminée. Si le comportement inapproprié continue, l'arbitre doit recourir à la progression disciplinaire : avertissement, puis exclusion.

Les conflits collectifs, impliquant plusieurs joueurs des deux équipes, nécessitent une approche différente. L'arbitre doit séparer les joueurs en s'interposant physiquement si nécessaire, tout en restant calme et en évitant tout geste qui pourrait être interprété comme agressif. Il doit identifier les protagonistes principaux du conflit et les sanctionner individuellement, plutôt que de pénaliser tout un groupe. L'arbitre peut utiliser son sifflet de manière courte et répétitive pour attirer l'attention et restaurer le calme.

La prévention des conflits est aussi importante que leur gestion. Un arbitre qui communique bien, qui est cohérent dans ses décisions et qui montre de l'empathie envers les joueurs prévient de nombreux conflits avant qu'ils ne surviennent. Les arbitres expérimentés savent repérer les signes avant-coureurs d'un conflit imminént, comme l'agitation croissante d'un joueur, les échanges verbaux entre adversaires ou la frustration accumulée d'une équipe. En intervenant tôt, par un mot d'avertissement ou un geste apaisant, l'arbitre peut souvent désamorcer une situation avant qu'elle ne dégénère en conflit ouvert. La formation à la gestion des conflits inclut des scénarios de simulation et des jeux de rôle qui permettent aux arbitres de pratiquer ces compétences dans un cadre sécurisé.`, duration: 20 },
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
          { title: "Périodisation de l'entraînement", type: "TEXTE", content: `La périodisation est un concept fondamental de la planification sportive qui divise l'année d'entraînement en cycles de durée variable, chacun ayant des objectifs spécifiques. Développée à l'origine par le scientifique soviétique Leo Matveyev, la périodisation a été adaptée au handball par de nombreux entraîneurs et préparateurs physiques pour optimiser la performance des joueurs tout au long de la saison.

La macrocycle correspond à l'année sportive complète, généralement d'une durée de 10 à 12 mois. Il est divisé en trois grandes périodes : la période de préparation (pré-saison), la période de compétition (saison), et la période de transition (intersaison). La période de préparation est elle-même subdivisée en deux phases : une phase générale axée sur le développement des qualités physiques de base, suivie d'une phase spécifique centrée sur les aspects techniques et tactiques du handball.

Le mésocycle est une unité de planification de 3 à 6 semaines qui vise un objectif précis. Par exemple, un mésocycle peut être dédié à l'amélioration de la puissance des tirs, au renforcement de la défense 6:0, ou au développement de l'endurance aérobie. Chaque mésocycle est conçu pour s'inscrire dans la logique du macrocycle et préparer le joueur aux exigences du niveau suivant.

Le microcycle est l'unité la plus fine, correspondant généralement à une semaine d'entraînement. C'est à ce niveau que l'entraîneur planifie concrètement les séances, en alternant les charges de travail et les phases de récupération. Un microcycle type comprend 3 à 5 séances d'entraînement intensif, 1 à 2 séances légères ou de récupération, et un jour de repos complet. La variation des charges au sein du microcycle est essentielle pour éviter la surentraînement et maximiser les adaptations physiologiques. L'entraîneur de handball doit maîtriser ces trois niveaux de planification pour concevoir un programme d'entraînement efficace et progressif.`, duration: 20 },
          { title: "Structure d'une séance type", type: "TEXTE", content: `Une séance d'entraînement de handball bien structurée suit généralement un schéma en plusieurs phases, chacune ayant un objectif précis et une durée déterminée. La qualité de la structuration de la séance influence directement l'efficacité de l'entraînement et la progression des joueurs. L'entraîneur doit planifier chaque séance avec soin en tenant compte des objectifs du microcycle, du niveau des joueurs et de la période de la saison.

L'échauffement est la première phase indispensable de toute séance d'entraînement. D'une durée de 15 à 20 minutes, il se compose de deux parties : un échauffement général (course légère, mobilité articulaire, étirements dynamiques) suivi d'un échauffement spécifique au handball (passes, dribbles, tirs à faible intensité). L'échauffement doit permettre d'élever progressivement la température corporelle, d'activer le système cardiovasculaire et de préparer les muscles et les articulations aux efforts spécifiques du handball. Un échauffement négligé augmente considérablement le risque de blessure.

Le corps principal de la séance occupe la plus grande partie du temps (40 à 60 minutes). C'est dans cette phase que sont travaillés les objectifs prioritaires de la séance : technique (passes, tirs, dribbles), tactique (systèmes de jeu, contre-attaque), physique (force, endurance, vitesse) ou psychologique (concentration, prise de décision). Le corps principal peut être organisé sous forme d'exercices progressifs, allant du plus simple au plus complexe, ou sous forme de situations de jeu réelles (exercices à thème, matchs réduits).

La phase de retour au calme (ou cool-down) dure 10 à 15 minutes et comprend des exercices de récupération active (jogging léger, marche), des étirements statiques et des exercices de relaxation. Cette phase est essentielle pour favoriser l'élimination des déchets métaboliques, réduire les courbatures et préparer le corps à la récupération. L'entraîneur termine généralement la séance par un debriefing oral, rappelant les points forts et les axes d'amélioration, et en annonçant les objectifs de la prochaine séance.`, duration: 15 },
          { title: "Objectifs pédagogiques", type: "TEXTE", content: `Chaque séance d'entraînement doit avoir des objectifs clairs, mesurables et adaptés au niveau des joueurs. La définition d'objectifs pédagogiques précis est un fondement de l'enseignement sportif et permet à l'entraîneur d'évaluer la progression de ses joueurs de manière objective. Un objectif pédagogique bien formulé répond à trois questions : que veut-on que le joueur apprenne ? Comment saura-t-on que l'objectif est atteint ? Dans quel délai l'objectif doit-il être réalisé ?

Les objectifs techniques sont parmi les plus fréquents dans l'entraînement handball. Ils portent sur l'amélioration des gestes spécifiques du jeu : la précision des passes, la puissance du tir, la qualité du dribble, la technique de duel, la fluidité des mouvements sans ballon. Un objectif technique doit être formulé de manière observable et quantifiable. Par exemple, « le joueur doit réaliser 8 passes sur 10 avec le bras droit sur une distance de 10 mètres » est un objectif beaucoup plus opérationnel que « le joueur doit améliorer ses passes ».

Les objectifs tactiques concernent la compréhension du jeu et la prise de décision. Ils incluent la capacité à lire la défense adverse, à choisir le bon moment pour tirer ou passer, à se positionner correctement dans un système de jeu, à participer efficacement à la contre-attaque. Ces objectifs sont plus complexes à évaluer car ils impliquent des capacités cognitives et de décision en situation de jeu réel. L'utilisation de vidéos d'entraînement et de matchs est un outil précieux pour l'évaluation des objectifs tactiques.

Les objectifs physiques visent le développement des qualités athlétiques spécifiques au handball. Ils sont généralement mesurables par des tests standardisés : temps sur un sprint de 30 mètres, nombre de répétitions d'un exercice de force, distance parcourue lors d'un test d'endurance. L'entraîneur doit fixer des objectifs physiques réalistes et progressifs, en tenant compte des capacités individuelles de chaque joueur. La différenciation pédagogique, c'est-à-dire l'adaptation des objectifs et des exercices au niveau de chaque joueur, est un principe clé d'un entraînement efficace et motivant.`, duration: 15 },
        ]},
        { title: "Planification", lessons: [
          { title: "Planification hebdomadaire", type: "TEXTE", content: `La planification hebdomadaire est le niveau de planification le plus concret et le plus opérationnel de l'entraînement handball. C'est à ce niveau que l'entraîneur organise ses séances jour par jour, en tenant compte de l'agenda compétitif, de la fatigue accumulée par les joueurs et des priorités d'entraînement du moment. Une semaine type bien planifiée permet d'optimiser la performance tout en prévenant la blessure et la surentraînement.

La semaine type d'un entraîneur de handball professionnel comprend généralement 5 à 6 séances d'entraînement et un match. Le lundi est souvent un jour de récupération active, avec une séance légère axée sur la mobilité, les étirements et la révision vidéo du match précédent. Le mardi et le mercredi sont consacrés à l'entraînement intensif, avec des séances centrées sur les objectifs tactiques et physiques prioritaires. Le jeudi est un jour de réduction de la charge (tapering), avec une séance plus courte et moins intense. Le vendredi est dédié à la préparation spécifique du match, avec des exercices tactiques ciblés et un travail sur les situations de jeu prévues. Le samedi est le jour de match, et le dimanche est un jour de repos complet.

En semaine de match unique (sans compétition le week-end), l'entraîneur peut programmer des séances plus longues et plus intenses, en particulier le milieu de semaine. Lors des semaines avec deux matchs, la planification doit être ajustée pour permettre une récupération suffisante entre les rencontres. Dans ce cas, les séances d'entraînement sont réduites en durée et en intensité, et davantage de temps est consacré à la récupération (étirements, massages, nutrition).

La gestion de la charge d'entraînement est un aspect crucial de la planification hebdomadaire. L'entraîneur doit surveiller les indicateurs de fatigue de ses joueurs : fréquence cardiaque au repos, qualité du sommeil, sensation subjective de fatigue, performances dans les exercices. Les outils de monitoring modernes (montres connectées, applications de suivi) facilitent cette surveillance. Si les signes de surentraînement apparaissent (baisse de performance, irritabilité, blessures récurrentes), l'entraîneur doit réduire la charge d'entraînement et accorder des périodes de repos supplémentaires. La qualité de la planification hebdomadaire est un indicateur important de la compétence de l'entraîneur.`, duration: 20 },
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
          { title: "Endurance spécifique", type: "TEXTE", content: `Le handball est un sport qui exige une endurance de type intermittent, c'est-à-dire la capacité à maintenir des efforts intenses et brefs entrecoupés de périodes de récupération. Cette exigence physiologique est liée à la nature même du jeu : les joueurs effectuent de nombreux sprints, changements de direction, sauts et duels, chacun demandant un effort explosif, suivi de périodes de récupération active ou de course à allure modérée.

Le développement de l'endurance spécifique au handball repose sur plusieurs méthodes d'entraînement. L'entraînement intermittent à haute intensité (HIIT) est particulièrement adapté : il consiste à alterner des phases de sprint ou d'effort maximal (15 à 30 secondes) avec des phases de récupération (15 à 60 secondes). Ce type d'entraînement améliore à la fois la capacité aérobie et la capacité anaérobie, qui sont toutes deux sollicitées au handball. Les exercices spécifiques au handball, comme les courses avec changements de direction ou les sprints avec tir en fin de course, sont privilégiés.

La capacité aérobie, c'est-à-dire la capacité de l'organisme à utiliser l'oxygène pour produire de l'énergie, est la base de l'endurance du handballeur. Elle se développe par des exercices de course continue à intensité modérée (60 à 80 % de la fréquence cardiaque maximale) d'une durée de 20 à 40 minutes. Ces exercices, connus sous le nom de « footing », sont généralement programmés en période de préparation générale et réduits progressivement pendant la saison de compétition.

La capacité anaérobie lactique, qui permet de maintenir un effort intense malgré l'accumulation d'acide lactique, est sollicitée lors des phases de jeu prolongé ou des attaques placées. Son développement se fait par des exercices répétés d'intensité maximale (30 secondes à 2 minutes) avec des temps de récupération courts. L'entraîneur doit planifier ces exercices avec précaution, car ils sont physiologiquement très exigeants et nécessitent des périodes de récupération suffisantes entre les séances.`, duration: 20 },
          { title: "Force et puissance", type: "TEXTE", content: `La force et la puissance sont des qualités physiques essentielles pour les joueurs de handball. La force est la capacité d'un muscle à développer une tension contre une résistance, tandis que la puissance est la capacité à développer cette tension rapidement. Au handball, ces qualités sont sollicitées dans de nombreuses situations : les duels avec les défenseurs, les tirs puissants, les sauts pour intercepter ou tirer, les blocs, et les relances rapides après un arrêt du gardien.

L'entraînement de la force au handball se déroule en plusieurs phases. En période de préparation générale, l'accent est mis sur le renforcement musculaire global, avec des exercices polyarticulaires comme les squats, les développés couchés, les tractions et les fentes. Ces exercices développent la force maximale et créent une base solide pour les mouvements spécifiques du handball. L'utilisation de charges lourdes (80 à 90 % de la charge maximale) avec peu de répétitions (3 à 6) est privilégiée.

En période de préparation spécifique et pendant la saison, l'entraînement de la force évolue vers des exercices plus dynamiques et spécifiques au handball. Le travail pliométrique (sauts en profondeur, bondissements) développe la puissance explosive des jambes, essentielle pour les sauts et les changements de direction. Le travail de force des membres supérieurs, avec des exercices de lancer et de poussée, améliore la puissance des tirs et des passes. Les exercices de gainage (planche, side-plank) renforcent la ceinture abdominale, qui joue un rôle crucial dans la transmission de la force et la stabilité du tronc.

La prévention des blessures est un objectif majeur de l'entraînement de la force. Le renforcement des muscles stabilisateurs des chevilles, des genoux et des épaules réduit significativement le risque de blessures, qui sont fréquentes au handball. L'entraîneur doit inclure des exercices de prévention dans chaque séance de renforcement, en particulier pour les zones les plus vulnérables : les entorses de cheville, les déchirures ligamentaires du genou (ligament croisé antérieur) et les lésions de l'épaule. Un programme de force bien conçu est un investissement dans la santé et la longévité sportive des joueurs.`, duration: 20 },
        ]},
        { title: "Tests et évaluation", lessons: [
          { title: "Batterie de tests physique", type: "TEXTE", content: `L'évaluation des qualités physiques est un élément indispensable de la préparation sportive au handball. Une batterie de tests standardisés permet à l'entraîneur de mesurer les capacités de ses joueurs, d'identifier les points faibles, de suivre la progression au cours de la saison et d'adapter le programme d'entraînement en conséquence. Les tests doivent être réalisés dans des conditions contrôlées et reproductibles pour garantir la fiabilité des résultats.

Plusieurs tests standardisés sont couramment utilisés dans l'évaluation des handballeurs. Le test de Cooper (course de 12 minutes) mesure la capacité aérobie maximale et permet d'estimer la VO2 max. Le test de sprint répété (RSA - Repeated Sprint Ability) évalue la capacité à répéter des efforts intenses avec des temps de récupération courts, ce qui est très représentatif des exigences du handball. Le test de sprint sur 10, 20 et 30 mètres mesure la vitesse de déplacement et l'accélération. Le test de détente verticale (saut en hauteur avec contre-mouvement) évalue la puissance explosive des jambes.

Les tests de force sont également essentiels. Le test de force maximale sur les principaux mouvements (squat, développé couché) permet d'évaluer les gains de force pendant la période de préparation. Le test de force de préhension (grip strength) mesure la force des mains et des avant-bras, importante pour la tenue du ballon. Les tests d'isocinétisme, réalisés en laboratoire, évaluent la force des muscles rotateurs de l'épaule et des fléchisseurs/extenseurs du genou, permettant de détecter les déséquilibres musculaires qui prédisposent aux blessures.

La fréquence recommandée des tests varie selon la période de la saison. En début de préparation, une batterie complète de tests est réalisée pour établir un profil physique de chaque joueur. Des tests intermédiaires (toutes les 4 à 6 semaines) permettent de suivre la progression et d'ajuster le programme. En fin de saison, un bilan complet est effectué pour évaluer les gains réalisés et identifier les axes de travail pour la saison suivante. Les résultats des tests doivent être communiqués individuellement aux joueurs de manière constructive, en les comparant aux valeurs de référence de leur poste et de leur catégorie d'âge.`, duration: 15 },
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
          { title: "Défense 6:0 et 5:1", type: "TEXTE", content: `La défense 6:0 est le système défensif le plus couramment utilisé au handball. Comme son nom l'indique, les six joueurs de champ se positionnent en ligne devant la surface de but (les 6 mètres), formant un mur défensif compact. Ce système est particulièrement efficace contre les équipes adverses qui possèdent des tireurs puissants depuis l'arrière, car il réduit les angles de tir et oblige les attaquants à chercher des solutions alternatives.

Dans la défense 6:0, chaque défenseur est responsable d'un corridor vertical devant la surface de but. Le défenseur doit maintenir une position baissée, les jambes fléchies, les bras écartés pour maximiser la couverture. La distance par rapport à la surface de but varie entre 1 et 2 mètres, selon la position du ballon et l'attaquant. Les défenseurs doivent constamment ajuster leur position en fonction du mouvement du ballon, en glissant latéralement sans croiser les pieds. La communication verbale entre défenseurs est essentielle pour assurer la cohésion de la ligne.

La défense 5:1 est une variante plus agressive de la défense 6:0. Dans ce système, cinq joueurs forment une ligne devant la surface de but, tandis qu'un sixième joueur (généralement le défenseur le plus rapide) avance sur le demi-centre adverse pour le presser et perturber son jeu de construction. Ce système est utilisé lorsque l'équipe adverse a un meneur de jeu particulièrement influent ou lorsque l'on souhaite augmenter la pression sur la construction adverse. Le risque de la défense 5:1 est qu'elle crée un espace dans la ligne défensive qui peut être exploité par l'attaque.

Le choix entre défense 6:0 et défense 5:1 dépend de plusieurs facteurs : les caractéristiques de l'équipe adverse, le score du match, le moment de la rencontre et les instructions de l'entraîneur. L'entraîneur peut également alterner entre ces deux systèmes au cours du même match pour surprendre l'adversaire et le forcer à s'adapter. La maîtrise des deux systèmes est indispensable pour tout défenseur de handball, car la capacité à changer rapidement de système est un atout tactique majeur.`, duration: 25 },
          { title: "Défense 3:2:1", type: "TEXTE", content: `La défense 3:2:1 est un système défensif avancé qui offre une couverture plus différenciée du terrain. Contrairement aux défenses 6:0 et 5:1 qui s'organisent en une ou deux lignes horizontales, la défense 3:2:1 répartit les défenseurs sur trois lignes : une première ligne de trois joueurs (les avants), une deuxième ligne de deux joueurs (les demis), et un dernier joueur plus reculé (le libéro). Cette disposition permet de couvrir plus efficacement les différentes zones de tir de l'attaque.

Les trois joueurs de la première ligne ont pour mission de presser les porteurs du ballon et de perturber la construction du jeu adverse. Ils doivent être mobiles, agressifs et avoir une bonne capacité de récupération. Les deux joueurs de la deuxième ligne couvrent les espaces entre les avants et le libéro, et sont responsables de la surveillance des arrières adverses et du pivot. Le libéro, positionné entre les deux lignes et la surface de but, est le dernier rempart avant le gardien. Il doit avoir une lecture du jeu exceptionnelle et une capacité d'anticipation supérieure.

La défense 3:2:1 est particulièrement efficace contre les équipes qui utilisent un jeu de passes rapides et des mouvements sans ballon pour créer des espaces de tir. En repoussant la pression plus loin de la surface de but, elle perturbe le timing de l'attaque et réduit la qualité des tirs. Cependant, ce système demande une excellente coordination entre les lignes et une grande intelligence tactique de la part des joueurs. Un décalage entre les lignes peut créer des espaces exploitables par l'attaque adverse.

L'entraînement de la défense 3:2:1 nécessite un travail approfondi sur les déplacements, les rotations et la communication entre les lignes. L'entraîneur doit insister sur la notion de « chaîne défensive » : chaque joueur doit comprendre que son positionnement dépend de celui de ses coéquipiers et de la position du ballon. Les exercices de défense 3:2:1 commencent généralement par des situations à effectif réduit (3 contre 3, 4 contre 4) avant de progresser vers des situations de jeu réel à 6 contre 6.`, duration: 25 },
        ]},
        { title: "Systèmes offensifs", lessons: [
          { title: "Attaque placée et rapide", type: "TEXTE", content: `L'attaque au handball se décline en deux formes principales : l'attaque placée et la contre-attaque. La maîtrise de ces deux formes offensives est essentielle pour toute équipe ambitionnant de performer au haut niveau. L'entraîneur doit développer ces deux aspects de manière équilibrée, en adaptant le contenu de l'entraînement aux caractéristiques de son effectif et au style de jeu de ses adversaires.

La contre-attaque est une arme redoutable au handball. Elle débute immédiatement après la récupération du ballon, que ce soit sur une interception, un arrêt du gardien ou une perte de balle adverse. Le principe de la contre-attaque est d'exploiter le déséquilibre défensif de l'adversaire avant qu'il n'ait pu se réorganiser. Les joueurs offensifs doivent sprinter vers le but adverse en utilisant les couloirs latéraux et le couloir central. Le porteur du ballon doit prendre rapidement la bonne décision : tirer si l'occasion se présente, ou passer à un coéquipier mieux placé. Une contre-attaque bien exécutée se déroule en moins de 5 secondes et donne souvent lieu à un but facile.

L'attaque placée est utilisée lorsque la défense adverse est bien organisée et que la contre-attaque n'est pas possible. Elle consiste à construire le jeu méthodiquement en utilisant des principes tactiques précis : circulation de balle, mouvements sans ballon, écrans, croisements et jeux à deux. L'objectif est de créer un déséquilibre dans la défense adverse en l'amenant à se déplacer, pour générer une situation de tir favorable. Le demi-centre joue un rôle central dans la conduite de l'attaque placée, organisant les mouvements et distribuant les ballons.

La transition entre défense et attaque est un moment clé du handball moderne. Les équipes de haut niveau travaillent spécifiquement cette phase de transition, qui nécessite une réactivité exceptionnelle et une bonne communication entre les joueurs. L'entraîneur doit concevoir des exercices spécifiques pour améliorer la vitesse de transition : exercices de récupération-relance, matchs à thème avec règles de transition, et situations de jeu à effectif réduit. La capacité à passer rapidement d'une phase de jeu à l'autre est un facteur déterminant de la performance collective.`, duration: 20 },
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
          { title: "Théories de la motivation", type: "TEXTE", content: `La motivation est un concept central en psychologie sportive et un facteur déterminant de la performance au handball. Comprendre les mécanismes de la motivation permet à l'entraîneur de mieux accompagner ses joueurs et de créer un environnement propice à l'engagement et à la progression. Les théories de la motivation les plus reconnues dans le domaine du sport sont la théorie de l'autodétermination de Deci et Ryan, la théorie des buts d'accomplissement de Nicholls et la théorie de l'expectation-valence de Vroom.

La théorie de l'autodétermination distingue deux types de motivation : la motivation intrinsèque et la motivation extrinsèque. La motivation intrinsèque provient de l'intérieur de l'individu et est liée au plaisir, à l'intérêt et à la satisfaction personnelle tirés de la pratique sportive. Un joueur intrinsèquement motivé s'entraîne parce qu'il aime le handball, qu'il prend du plaisir à progresser et qu'il se sent compétent dans sa pratique. La motivation extrinsèque, quant à elle, est liée à des facteurs externes : les récompenses (médailles, trophées), la reconnaissance sociale, la pression des parents ou la perspective d'un contrat professionnel.

La théorie des buts d'accomplissement distingue deux orientations motivationnelles : l'orientation vers la maîtrise (task orientation) et l'orientation vers l'ego (ego orientation). Un joueur orienté vers la maîtrise se concentre sur l'amélioration de ses compétences et la progression personnelle. Il perçoit les difficultés comme des opportunités d'apprentissage et persiste face aux échecs. Un joueur orienté vers l'ego se concentre sur la comparaison avec les autres et la démonstration de sa supériorité. Il est plus sensible à l'échec et peut abandonner plus facilement face à la difficulté.

Pour l'entraîneur de handball, la compréhension de ces théories a des implications pratiques directes. Il doit créer un environnement qui favorise la motivation intrinsèque en proposant des exercices variés et stimulants, en valorisant l'effort et la progression plutôt que le résultat, et en donnant aux joueurs un sentiment d'autonomie et de compétence. L'entraîneur doit être attentif aux signes de démotivation (baisse d'effort, désengagement, absentéisme) et intervenir rapidement pour identifier les causes et proposer des solutions adaptées.`, duration: 20 },
          { title: "Techniques de motivation", type: "TEXTE", content: `Plusieurs techniques éprouvées peuvent aider l'entraîneur à maintenir et stimuler la motivation de ses joueurs tout au long de la saison. La motivation n'est pas un état fixe mais un processus dynamique qui fluctue en fonction de nombreux facteurs internes et externes. L'entraîneur doit être capable de diagnostiquer les causes d'une baisse de motivation et d'intervenir avec les outils appropriés pour relancer l'engagement de ses joueurs.

La fixation d'objectifs est l'une des techniques les plus puissantes pour maintenir la motivation. Les objectifs doivent suivre les principes SMART : Spécifiques, Mesurables, Atteignables, Réalistes et Temporellement définis. L'entraîneur doit aider chaque joueur à se fixer des objectifs individuels en plus des objectifs collectifs de l'équipe. Les objectifs de processus (exécuter correctement une technique) sont souvent plus motivants que les objectifs de résultat (gagner le match), car ils dépendent davantage du contrôle du joueur lui-même.

Le renforcement positif est un autre outil essentiel. L'entraîneur doit valoriser les progrès, même modestes, et reconnaître publiquement les efforts et les comportements exemplaires. Le feedback constructif, qui souligne les points positifs avant d'identifier les axes d'amélioration, est plus efficace que la critique négative. La célébration des petites victoires (une bonne séance d'entraînement, une progression dans un test physique) contribue à maintenir un climat positif et motivant au sein du groupe.

La création d'un climat d'entraînement stimulant passe également par la variété des exercices et des situations de jeu. La monotonie est l'ennemi de la motivation : l'entraîneur doit régulièrement renouveler son contenu d'entraînement, proposer des défis nouveaux et intégrer des éléments ludiques. Les exercices sous forme de compétition (jeux réduits, défis individuels, tournois internes) sont particulièrement motivants. L'entraîneur peut également utiliser le modelage social en mettant en avant les joueurs exemplaires, dont l'attitude et l'engagement servent de référence pour le reste du groupe. Enfin, le développement d'un esprit d'équipe fort, basé sur la confiance mutuelle, le soutien et la solidarité, est un facteur de motivation collective puissant.`, duration: 20 },
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
          { title: "Macronutriments et performance", type: "TEXTE", content: `Les macronutriments sont les nutriments dont l'organisme a besoin en grande quantité pour fonctionner correctement. Pour un handballeur, trois macronutriments sont essentiels : les glucides, les protéines et les lipides. Chacun joue un rôle spécifique dans la performance sportive et doit être consommé en quantités adaptées aux exigences de l'entraînement et de la compétition.

Les glucides sont la source d'énergie principale du handballeur. Ils sont stockés dans les muscles et le foie sous forme de glycogène et constituent le carburant privilégié lors des efforts intenses et intermittents typiques du handball. Un handballeur doit consommer entre 5 et 8 grammes de glucides par kilogramme de poids corporel par jour, en privilégiant les glucides complexes (céréales complètes, pâtes, riz, pain complet, fruits et légumes) qui assurent une libération d'énergie progressive. Les glucides simples (confiseries, boissons sucrées) sont utiles pendant et après l'effort pour reconstituer rapidement les réserves de glycogène.

Les protéines sont indispensables pour la réparation et la construction des tissus musculaires. L'entraînement intensif de handball provoque des micro-déchirures musculaires qui nécessitent un apport protéique suffisant pour une récupération optimale. Un handballeur doit consommer entre 1,4 et 2 grammes de protéines par kilogramme de poids corporel par jour, en répartissant cet apport sur les différents repas de la journée. Les sources de protéines de haute qualité incluent la viande maigre, le poisson, les œufs, les produits laitiers, les légumineuses et les oléagineux.

Les lipides jouent un rôle important dans l'absorption des vitamines liposolubles (A, D, E, K), la production d'hormones et le fonctionnement du système nerveux. Ils constituent également une source d'énergie pendant les efforts de longue durée. Un handballeur doit consommer entre 1 et 1,5 gramme de lipides par kilogramme de poids corporel par jour, en privilégiant les acides gras insaturés (huile d'olive, avocats, noix, poissons gras) et en limitant les acides gras saturés et trans. L'équilibre entre ces trois macronutriments est fondamental pour optimiser la performance et la récupération.`, duration: 15 },
          { title: "Hydratation", type: "TEXTE", content: `L'hydratation est un facteur crucial pour la performance sportive au handball. La déshydratation, même modérée (perte de 2 % du poids corporel en eau), peut entraîner une baisse significative de la performance physique et cognitive : diminution de la force, de la vitesse, de la précision des passes et des tirs, altération de la prise de décision et augmentation du risque de blessure. Le handballeur doit adopter une stratégie d'hydratation rigoureuse avant, pendant et après l'effort.

Avant l'entraînement ou le match, le joueur doit s'hydrater de manière préventive en buvant 400 à 600 ml d'eau dans les 2 à 3 heures précédant l'effort, puis 200 à 300 ml d'eau dans les 15 minutes précédant le début. Cette hydratation préalable permet de partir avec des réserves hydriques optimales. L'urine doit être de couleur claire, signe d'une bonne hydratation. Les boissons contenant de la caféine doivent être consommées avec modération, car elles ont un effet diurétique qui peut contrebalancer les bénéfices de l'hydratation.

Pendant l'effort, le joueur doit boire régulièrement, même s'il n'a pas la sensation de soif. Le mécanisme de la soif n'est pas un indicateur fiable de l'état d'hydratation pendant l'exercice intense. Il est recommandé de boire 150 à 250 ml d'eau ou de boisson isotonique toutes les 15 à 20 minutes. Les boissons isotoniques sont particulièrement adaptées au handball car elles fournissent simultanément de l'eau, des électrolytes (sodium, potassium) et des glucides, compensant ainsi les pertes liées à la transpiration et apportant de l'énergie aux muscles en activité.

Après l'effort, la réhydratation est essentielle pour une récupération optimale. Le joueur doit boire au moins 150 % du poids perdu pendant l'effort, c'est-à-dire 1,5 litre d'eau pour chaque kilogramme perdu. La consommation d'une boisson de récupération contenant des protéines et des glucides dans les 30 minutes suivant l'effort favorise à la fois la réhydratation et la reconstitution des réserves de glycogène. Les joueurs doivent peser avant et après les séances d'entraînement pour évaluer leurs pertes hydriques individuelles et adapter leur stratégie d'hydratation en conséquence.`, duration: 10 },
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
          { title: "Les types de passes", type: "TEXTE", content: `La passe est le geste technique le plus fréquent au handball et constitue le fondement du jeu collectif. Selon les études statistiques, un handballeur effectue en moyenne entre 40 et 60 passes par match, ce qui souligne l'importance capitale de la maîtrise de ce geste. La qualité des passes détermine directement la vitesse de circulation du ballon et l'efficacité de l'attaque.

Il existe plusieurs types de passes au handball, chacune adaptée à une situation de jeu spécifique. La passe en appui (ou passe tendue) est la plus courante : elle est exécutée avec les deux pieds au sol, le bras balançant de l'arrière vers l'avant. Elle est utilisée pour des distances courtes et moyennes (3 à 8 mètres). La passe en suspension est réalisée pendant un saut, permettant de passer au-dessus des bras des défenseurs. La passe enroulée (ou rolled pass) utilise un mouvement circulaire du bras qui donne au ballon un effet rotatif, la rendant plus facile à attraper. La passe bras cassé est une passe courte et rapide, exécutée avec un mouvement limité du coude, idéale dans les espaces réduits.

La passe lobée est utilisée pour passer au-dessus de la défense, notamment vers le pivot. Elle nécessite une trajectoire parabolique précise et un timing parfait entre le passeur et le receveur. La passe à une main (ou passe basse) est utilisée principalement par les ailiers et les pivots dans les situations de proximité avec le défenseur. Enfin, la passe par-dessus l'épaule est une passe puissante utilisée dans les situations de contre-attaque rapide pour transmettre le ballon sur de longues distances.

La précision de la passe dépend de plusieurs facteurs techniques : la position des pieds (orientés vers la cible), la position des bras (le coude du bras passeur est à hauteur d'épaule), le mouvement du poignet (qui donne la rotation et la direction au ballon), et le suivi du geste (le bras doit accompagner le ballon dans la direction de la passe). L'entraînement régulier de la passe, sous forme d'exercices progressifs et de situations de jeu, est indispensable pour développer l'automatisme et la confiance dans ce geste fondamental.`, duration: 20 },
          { title: "Techniques de tir", type: "TEXTE", content: `Le tir est le geste technique qui permet de marquer un but et constitue l'objectif final de toute attaque au handball. La maîtrise des différentes techniques de tir est essentielle pour tout joueur, quelle que soit sa position sur le terrain. Un handballeur doit être capable de s'adapter à la situation de jeu et de choisir le type de tir le plus approprié en fonction de la position du gardien, de la défense et de sa propre position.

Le tir en appui est le tir le plus courant et le plus précis. Il est exécuté avec les deux pieds ancrés au sol, le corps orienté latéralement par rapport au but. Le mouvement part des pieds (transfert de poids de l'arrière vers l'avant), passe par la rotation du tronc et se termine par l'extension complète du bras, le poignet donnant la rotation finale au ballon. Le tir en appui est privilégié par les arrières à distance de 9 à 12 mètres du but, où la précision est plus importante que la puissance.

Le tir en suspension est le tir le plus spectaculaire et le plus difficile à arrêter pour le gardien. Le joueur prend une impulsion vers l'avant ou vers le haut, et tire au point culminant de son saut, ce qui lui permet de franchir la ligne de défense et de tirer au-dessus du gardien. Le tir en suspension est particulièrement utilisé par les ailiers à partir des angles du terrain. La technique demande une bonne coordination, un sens du timing précis et une grande confiance dans ses capacités.

Le tir à la hanche (ou tir bras cassé) est un tir rapide et surprenant, exécuté avec un mouvement limité du bras au niveau de la hanche. Il est utilisé dans les situations de proximité avec le gardien, notamment par le pivot. Le tir plongeant est une variante où le joueur se projette en avant pendant le saut, tirant en extension au-dessus de la ligne de la surface de but. Le tir du gardien, utilisé lors des jets de 7 mètres, est exécuté avec une course d'élan de trois pas, le joueur tirant en glissant sur le sol après le dernier appui. L'entraînement des tirs doit inclure toutes ces techniques, avec des exercices progressifs allant de la répétition technique isolée aux situations de jeu sous pression défensive.`, duration: 20 },
          { title: "Dribble et progression", type: "TEXTE", content: `Le dribble est la technique qui permet au joueur de progresser avec le ballon sur le terrain tout en se déplaçant. Au handball, le dribble est encadré par des règles strictes : un joueur ne peut dribbler qu'une seule fois entre deux passes ou tirs (pas de reprise de dribble), et il dispose de trois secondes ou trois pas pour effectuer une passe ou un tir après avoir arrêté le dribble. La maîtrise du dribble est essentielle pour tous les postes, mais particulièrement pour les ailiers et les arrières qui doivent souvent progresser avec le ballon.

Le dribble de base au handball se réalise avec le bout des doigts, la main légèrement en coupe sur le ballon. Le ballon doit être rebondi à hauteur de la hanche, ni trop haut (risque d'interception) ni trop bas (difficulté de contrôle). Le joueur dribble avec la main opposée à sa direction de progression : un joueur se déplaçant vers la droite dribble de la main gauche, et inversement. Cette technique permet de protéger le ballon du côté opposé au défenseur et de garder le champ de vision dégagé.

Le dribble de protection est utilisé lorsque le joueur est pressé par un défenseur. Le ballon est rebondi bas et proche du corps, le joueur se plaçant entre le ballon et le défenseur. Le dribble de vitesse, utilisé lors des contre-attaques, est plus haut et plus rapide pour maximiser la vitesse de progression. Le changement de main, qui consiste à passer le ballon d'une main à l'autre sans interruption, est une technique avancée qui permet de changer de direction rapidement.

La progression sans ballon est tout aussi importante que la progression avec ballon. Un joueur sans ballon doit se déplacer constamment pour créer des espaces, proposer des solutions de passe et déséquilibrer la défense adverse. Les principes de déplacement sans ballon incluent les décrochages (séparation soudaine du défenseur pour recevoir le ballon), les appels de balle (courses vers l'extérieur ou l'intérieur pour attirer la défense), les croissements (échange de position avec un coéquipier) et les écrans (blocage d'un défenseur par un attaquant sans ballon pour libérer un coéquipier). La coordination entre joueurs avec et sans ballon est la clé du jeu collectif efficace.`, duration: 15 },
        ]},
        { title: "Duels", lessons: [
          { title: "Attaquant face au défenseur", type: "TEXTE", content: `Le duel 1 contre 1 (1v1) est une situation clé du handball qui met en confrontation directe un attaquant et un défenseur. C'est dans ces duels que se joue une grande partie de l'issue des phases de jeu, et la capacité à les gagner est un facteur déterminant de la performance individuelle et collective. Le duel 1v1 sollicite à la fois les qualités techniques, physiques, tactiques et mentales du joueur.

Du côté de l'attaquant, le duel 1v1 commence souvent par un démarquage, c'est-à-dire une action visant à prendre un avantage de position sur le défenseur. Les techniques de démarquage incluent la feinte de départ (mouvement dans une direction suivi d'un changement rapide de direction), l'appel en profondeur (accélération vers le but), et le démarquage en croisant (utilisation d'un écran d'un coéquipier). L'attaquant doit également maîtriser les feintes de tir (rotation du bras sans lâcher le ballon), les feintes de passe (mouvement de bras simulant une passe dans une direction) et les changements de rythme pour déstabiliser le défenseur.

Du côté du défenseur, les principes du duel 1v1 reposent sur le positionnement et la lecture du jeu. Le défenseur doit se placer entre l'attaquant et le but, en adoptant une posture stable : jambes écartées à la largeur des épaules, légèrement fléchies, poids du corps sur l'avant des pieds. Les bras doivent être actifs mais placés de manière à ne pas commettre de faute. Le défenseur doit surveiller le bassin de l'attaquant plutôt que ses yeux ou son ballon, car le bassin indique la véritable direction du mouvement.

La gestion de la distance est un aspect crucial du duel 1v1. Le défenseur doit maintenir une distance suffisante pour avoir le temps de réagir aux changements de direction de l'attaquant, mais pas trop grande pour pouvoir intervenir en cas de tir. La règle des « deux bras de distance » est un bon repère. Le timing de l'intervention du défenseur est également essentiel : intervenir trop tôt donne l'avantage à l'attaquant (faute), intervenir trop tard permet le tir. L'entraînement régulier de situations de 1v1, dans des conditions variées et avec une pression progressive, est indispensable pour développer la confiance et l'efficacité dans ces duels décisifs.`, duration: 20 },
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
          { title: "Règles essentielles", type: "TEXTE", content: `Les règles de base du handball incluent un ensemble de dispositions fondamentales que tout joueur doit connaître pour pratiquer ce sport correctement. Comprendre les règles est essentiel non seulement pour les éviter des sanctions, mais aussi pour tirer le meilleur parti de ses capacités techniques et tactiques. Un joueur qui connaît parfaitement les règles a un avantage significatif sur un joueur qui les méconnaît.

La règle des trois pas est l'une des plus fondamentales. Un joueur en possession du ballon peut effectuer un maximum de trois pas avant de dribbler, de passer ou de tirer. Le décompte des pas commence dès que le joueur contrôle le ballon avec une ou deux mains. Le « marcher » est l'une des fautes les plus fréquemment sifflées, et sa maîtrise est indispensable. Le joueur peut également effectuer un dribble (rebondir le ballon au sol), mais la reprise de dribble est interdite : une fois le dribble arrêté, le joueur ne peut plus dribbler.

La règle des trois secondes s'applique dans la surface de but adverse : un joueur ne peut pas rester dans cette zone pendant plus de trois secondes consécutives, même s'il n'a pas le ballon. Cette règle empêche les bloqueurs de s'installer durablement devant le gardien et garantit la fluidité du jeu. La règle du contact interdit tout contact physique qui gêne le mouvement d'un adversaire : pousser, retenir, frapper ou charger un adversaire est sanctionné. Cependant, le handball est un sport de contact, et les contacts accidents ou mineurs sont tolérés dans la mesure où ils ne perturbent pas le jeu.

Le jeu passif est une règle qui impose aux équipes attaquantes de tenter de marquer dans un délai raisonnable. Si l'arbitre estime que l'équipe attaquante ne fait pas d'effort suffisant pour créer une occasion de but, il lève le bras en signe d'avertissement. Si l'équipe ne crée pas d'occasion après cet avertissement, l'arbitre siffle un jet franc en faveur de l'équipe adverse. Cette règle vise à maintenir un rythme de jeu attractif et à éviter les stériles phases de conservation de balle.`, duration: 15 },
          { title: "Sanctions et fair-play", type: "TEXTE", content: `Le respect des règles est fondamental pour le bon déroulement du handball. Les sanctions au handball suivent une progression claire et logique que tout joueur doit comprendre. Cette progression vise à encourager le fair-play et à sanctionner proportionnellement les infractions, en tenant compte de la gravité et de la répétition des fautes.

La première étape de la progression est l'avertissement (carton jaune). Un joueur peut recevoir au maximum un avertissement par match, et une équipe ne peut recevoir que trois avertissements au total. L'avertissement est utilisé pour les fautes qui nécessitent une signalisation sans justifier une exclusion temporaire. Le joueur averti doit être particulièrement vigilant pour la suite du match, car la prochaine faute entraînera automatiquement une exclusion de 2 minutes.

L'exclusion temporaire (2 minutes) est la sanction la plus courante pour les fautes répétées, les contacts dangereux ou les irrégularités techniques. Pendant l'exclusion, l'équipe joue en infériorité numérique (6 contre 7), ce qui est un désavantage tactique significatif. Le joueur exclu doit s'asseoir sur le banc des pénalités et ne peut pas être remplacé pendant la durée de l'exclusion. La troisième exclusion du même joueur entraîne une disqualification automatique avec un carton bleu.

Le fair-play va au-delà du simple respect des règles écrites. Il englobe des attitudes comme : reconnaître ses propres fautes, aider un adversaire tombé, ne pas simuler les blessures, accepter les décisions de l'arbitre sans contestation excessive, et serrer la main des adversaires et des officiels avant et après le match. L'IHF a mis en place des programmes de fair-play pour les jeunes joueurs, incluant des ateliers éducatifs et des chartes de bonne conduite. Un joueur fair-play contribue à l'image positive du handball et inspire le respect de tous les acteurs du jeu.`, duration: 15 },
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
          { title: "Blessures fréquentes au handball", type: "TEXTE", content: `Les blessures les plus courantes au handball sont liées à la nature intense et physique de ce sport. Comprendre les types de blessures fréquentes permet aux joueurs d'adopter des comportements préventifs adaptés et de réagir correctement en cas de survenue d'une blessure. Les études épidémiologiques montrent que la majorité des blessures au handball touchent les membres inférieurs, suivis des membres supérieurs.

Les entorses de la cheville sont les blessures les plus fréquentes au handball, représentant environ 20 à 25 % de l'ensemble des blessures. Elles surviennent principalement lors des atterrissages après des sauts ou lors des changements de direction brusques. La gravité varie de la simple distension ligamentaire (grade 1) à la rupture complète des ligaments (grade 3). Les lésions du ligament croisé antérieur (LCA) du genou sont les blessures les plus graves et les plus redoutées, nécessitant souvent une intervention chirurgicale et une longue période de rééducation de 6 à 9 mois.

Les blessures de l'épaule sont très fréquentes, particulièrement chez les arrières et les pivots qui effectuent de nombreux tirs puissants. Elles incluent les luxations de l'épaule (déboîtement de l'articulation), les lésions de la coiffe des rotateurs (tendons responsables de la stabilité de l'épaule) et le syndrome d'impingement (pincement des tendons). Les douleurs lombaires, causées par les mouvements de rotation et de flexion du tronc, sont également courantes, en particulier chez les pivots.

Les blessures aux doigts et aux mains (entorses, fractures, déchirures ligamentaires) sont fréquentes en raison des contacts fréquents avec le ballon et les adversaires. Les contusions (bleus) et les hématomes sont monnaie courante au handball en raison des contacts physiques inhérents au sport. Les blessures faciales (fractures du nez, plaies aux lèvres) peuvent survenir lors des duels rapprochés. La connaissance de ces blessures permet aux joueurs de mieux comprendre l'importance de la prévention et de signaler rapidement toute douleur inhabituelle au personnel médical.`, duration: 15 },
          { title: "Exercices de prévention", type: "TEXTE", content: `Des exercices spécifiques de prévention peuvent réduire significativement le risque de blessures au handball. Les programmes de prévention basés sur les preuves scientifiques ont démontré une réduction de 30 à 50 % du risque de blessures chez les handballeurs qui les suivent régulièrement. La prévention des blessures doit être intégrée à chaque séance d'entraînement, en complément de l'échauffement habituel.

Le programme FIFA 11+, adapté au handball, est l'un des programmes de prévention les plus étudiés et les plus efficaces. Il se compose d'une série d'exercices structurés en trois niveaux de difficulté progressive : course et échauffement, renforcement musculaire, et plyométrie. Les exercices incluent des fentes avant, des squats sur une jambe, des planches latérales, des sauts en boîte et des exercices d'équilibre. Ce programme, réalisé 2 à 3 fois par semaine en complément de l'entraînement habituel, a montré son efficacité dans la prévention des blessures aux membres inférieurs.

Le renforcement des muscles stabilisateurs est un pilier de la prévention. Pour les chevilles, les exercices d'équilibre sur un plan instable (balance board) et les exercices proprioceptifs améliorent la stabilité articulaire et réduisent le risque d'entorses. Pour les genoux, les exercices de renforcement des quadriceps, des ischio-jambiers et des fessiers améliorent la protection du ligament croisé antérieur. Pour les épaules, les exercices de renforcement des muscles rotateurs (rotation externe et interne avec élastique) et les exercices de gainage scapulaire préviennent les lésions de la coiffe des rotateurs.

L'échauffement adéquat est la première mesure de prévention. Un échauffement complet de 15 à 20 minutes, comprenant une phase de course légère pour élever la température corporelle, suivie d'étirements dynamiques et d'exercices spécifiques au handball, prépare le corps à l'effort et réduit le risque de blessures musculaires et tendineuses. Les joueurs doivent également porter des équipements de protection adaptés : genouillères pour les pivots, protège-dents pour les joueurs exposés aux contacts, et chaussures de handball avec un bon maintien de la cheville. La récupération après l'effort (étirements, glaçage, nutrition, sommeil) est tout aussi importante que la préparation pour maintenir l'intégrité physique du joueur.`, duration: 20 },
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
          { title: "Création d'espaces", type: "TEXTE", content: `Le jeu collectif repose sur la création d'espaces, un concept tactique fondamental qui détermine l'efficacité de l'attaque. Au handball, l'espace est la ressource la plus précieuse : c'est dans les espaces libres que les occasions de tir se créent. La capacité d'une équipe à créer, maintenir et exploiter les espaces est ce qui distingue les attaques performantes des attaques stériles.

La création d'espaces repose sur plusieurs principes tactiques. L'élargissement consiste à répartir les joueurs sur toute la largeur du terrain pour étirer la défense adverse. Plus les attaquants sont écartés, plus les espaces entre les défenseurs sont grands, créant des couloirs de tir potentiels. La profondeur est obtenue en utilisant les différents plans de jeu : un joueur près de la surface de but (pivot), un joueur à mi-distance (demi-centre) et des joueurs éloignés (arrières). Cette disposition en profondeur oblige la défense à s'étirer sur plusieurs lignes, créant des zones de faiblesse.

Les mouvements sans ballon sont le principal moteur de la création d'espaces. Chaque joueur de l'attaque doit se déplacer constamment, en alternant les décrochages (mouvements explosifs pour se libérer du marquage), les appels (courses vers un espace pour attirer la défense), et les replacements (retour à une position équilibrée après un mouvement). La synchronisation des mouvements entre joueurs est essentielle : un mouvement d'un attaquant doit être accompagné par le mouvement d'un coéquipier pour créer un déséquilibre durable dans la défense.

Le concept de surcharge (overload) est une tactique avancée de création d'espaces. Elle consiste à concentrer plus d'attaquants que de défenseurs dans une zone du terrain, créant ainsi un surnuméraire (2 contre 1 ou 3 contre 2). Cette surcharge locale attire les défenseurs et libère des espaces dans d'autres zones du terrain. Les écrans (blocage d'un défenseur par un attaquant sans ballon) sont un moyen efficace de créer des espaces de tir en libérant un coéquipier de son marquage. L'entraînement régulier de ces principes tactiques, dans des exercices à thème et des situations de jeu réelles, est indispensable pour développer une attaque collective performante.`, duration: 20 },
          { title: "Circulation de balle", type: "TEXTE", content: `Une bonne circulation de balle est la clé d'une attaque de handball performante. La circulation de balle désigne la capacité de l'équipe à faire voyager le ballon rapidement et efficacement entre les différents postes, forçant la défense à se déplacer et à se désorganiser. Plus la balle circule vite, plus la défense doit s'ajuster, et plus les occasions de tir se multiplient.

La vitesse de passe est le premier facteur d'une bonne circulation de balle. L'objectif est de réduire au minimum le temps de possession individuelle du ballon (idéalement moins de 3 secondes). Un ballon qui voyage vite entre les mains de plusieurs joueurs est beaucoup plus difficile à défendre qu'un ballon retenu par un seul joueur. L'entraînement doit développer la capacité des joueurs à recevoir, analyser et transmettre le ballon dans un mouvement fluide et continu. Les exercices de passe rapide (circulation en triangle, carré, étoile) sont des outils fondamentaux pour améliorer cette qualité.

Le choix du moment et du type de passe est tout aussi important que la vitesse. Le joueur doit apprendre à identifier le bon moment pour passer : trop tôt, et la passe peut être interceptée ; trop tard, et l'occasion est perdue. Le type de passe doit être adapté à la situation : passe tendue pour un coéquipier démarqué, passe lobée au-dessus de la défense vers le pivot, passe en suspension pour franchir le rideau défensif. La variété des types de passes rend la défense imprévisible et crée plus d'opportunités.

Le demi-centre est le chef d'orchestre de la circulation de balle. C'est lui qui décide du rythme, de la direction et du timing des passes. Il doit avoir une vision panoramique du jeu, une capacité de lecture rapide de la défense adverse et une excellente technique de passe. Les autres joueurs doivent bien comprendre les signaux et les intentions du demi-centre et se positionner en conséquence. L'entraînement de la circulation de balle doit inclure des exercices de lecture du jeu (identifier les espaces, anticiper les mouvements), des exercices de prise de décision (choisir entre tirer et passer) et des situations de jeu avec pression défensive progressive pour développer la vitesse d'exécution en conditions réelles.`, duration: 20 },
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
          { title: "Gestion des licences", type: "TEXTE", content: `La gestion des licences est une responsabilité clé de l'administration d'un club de handball. Chaque joueur, entraîneur et arbitre doit posséder une licence valide délivrée par la fédération (FRMHB) pour participer aux compétitions officielles. La licence est à la fois un document d'identité sportive, une preuve d'assurance et un droit de participation aux activités organisées par la fédération.

Le processus d'obtention d'une licence se déroule en plusieurs étapes. Tout d'abord, le club doit recueillir les informations personnelles du licencié (nom, prénom, date de naissance, adresse, photographie) et une copie de la carte d'identité. Ensuite, le club doit vérifier que le licencié est en règle d'un point de vue médical : un certificat médical de non contre-indication à la pratique du handball est exigé pour la première licence et pour chaque renouvellement. Le club transmet ensuite le dossier complet à la ligue régionale ou à la FRMHB, qui délivre la licence après traitement et paiement des frais.

Le gestionnaire du club doit mettre en place un système de suivi des licences pour éviter les oublis et les retards de renouvellement. Les licences sont généralement valables pour une saison sportive (du 1er septembre au 31 août de l'année suivante). Le renouvellement doit être effectué avant le début de chaque saison. Un joueur sans licence valide ne peut pas participer aux matchs officiels, et le club s'expose à des sanctions sportives et financières en cas de non-conformité.

La gestion des licences implique également la gestion des catégories d'âge, qui déterminent les compétitions dans lesquelles les joueurs peuvent participer. Les catégories au Maroc sont généralement : poussins (moins de 11 ans), benjamins (11-12 ans), minimes (13-14 ans), cadets (15-16 ans), juniors (17-18 ans) et seniors (18 ans et plus). Le responsable administratif doit s'assurer que chaque joueur est inscrit dans la bonne catégorie et que les transferts entre clubs sont effectués dans les règles. Les outils numériques modernes, comme les plateformes en ligne de la FRMHB, facilitent grandement la gestion administrative des licences.`, duration: 20 },
          { title: "Budget et comptabilité", type: "TEXTE", content: `Le budget d'un club de handball comprend l'ensemble des revenus et des dépenses prévus pour une saison sportive. Une gestion budgétaire rigoureuse est essentielle pour assurer la pérennité du club, financer ses activités sportives et respecter ses obligations légales et réglementaires. Le budget doit être élaboré en début de saison, approuvé par l'assemblée générale du club, et suivi régulièrement tout au long de l'année.

Les revenus d'un club de handball proviennent de plusieurs sources. Les subventions publiques (municipalité, conseil régional, ministère des Sports) constituent souvent la part la plus importante du budget, en particulier pour les clubs amateurs. Les cotisations des membres (licenciés) représentent une source de revenus stable mais souvent insuffisante pour couvrir l'ensemble des dépenses. Les sponsors et partenaires commerciaux apportent des contributions financières ou en nature (équipements, services) en échange de visibilité. Les recettes des matchs (billetterie, buvette, merchandise) et les revenus des événements (tournois, galas) complètent le budget.

Les dépenses d'un club sont variées et doivent être soigneusement planifiées. Les frais d'arbitrage (indemnités des arbitres), les frais de déplacement (transport, hébergement pour les matchs à l'extérieur), les frais d'équipement (maillots, ballons, matériel d'entraînement) et les frais de location de salle de sport constituent les dépenses sportives principales. Les frais administratifs (frais de licence, assurances) et les frais de fonctionnement (eau, électricité, téléphone) sont également à prendre en compte.

La comptabilité du club doit être tenue de manière transparente et conforme aux obligations légales. Le club doit établir un bilan comptable annuel, présenté à l'assemblée générale et, le cas échéant, aux autorités de tutelle. La trésorerie doit être gérée avec prudence : le club doit maintenir une réserve financière suffisante pour faire face aux imprévus (blessures, réparations d'urgence, abandons de sponsors). L'entraîneur et le président du club doivent travailler en étroite collaboration pour définir les priorités sportives en fonction des moyens financiers disponibles. Un club financièrement sain est un club capable de se concentrer pleinement sur ses objectifs sportifs et éducatifs.`, duration: 20 },
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
          { title: "Statuts et règlements", type: "TEXTE", content: `Les statuts de la FRMHB (Fédération Royale Marocaine de Handball) définissent le cadre juridique et institutionnel qui régit la pratique du handball au Maroc. Ces statuts établissent les règles de fonctionnement de la fédération, les droits et obligations de ses membres, et les procédures de prise de décision. Tout acteur du handball au Maroc (joueur, entraîneur, arbitre, dirigeant de club) doit avoir une connaissance au moins générale de ce cadre réglementaire.

Les statuts de la FRMHB sont conformes aux dispositions de la loi marocaine relative à l'éducation physique et aux sports, et aux statuts types de l'IHF. Ils définissent les organes de direction de la fédération : l'Assemblée Générale (instance suprême), le Comité Directeur (organe exécutif), le Bureau Fédéral (organe de gestion quotidienne) et les Commissions spécialisées (Commission d'Arbitrage, Commission Médicale, Commission de Formation, etc.). Chaque organe a des compétences et des responsabilités clairement définies.

Les statuts prévoient également les conditions d'affiliation et de radiation des clubs. Pour être affilié à la FRMHB, un club doit remplir plusieurs conditions : avoir un siège social au Maroc, disposer d'au moins une équipe active, avoir un minimum de licenciés fixé par la fédération, tenir une assemblée générale annuelle, et respecter les règles éthiques et sportives de la fédération. L'affiliation donne au club le droit de participer aux compétitions officielles organisées par la FRMHB et ses ligues régionales.

Le cadre disciplinaire est un aspect important des statuts de la FRMHB. La Commission de Discipline est compétente pour juger les infractions aux règles sportives et éthiques. Les sanctions disciplinaires peuvent aller de l'avertissement à la radiation temporaire ou définitive. Les clubs et les individus ont le droit de faire appel des décisions disciplinaires devant une instance d'appel indépendante. La transparence et l'équité des procédures disciplinaires sont des principes fondamentaux garantis par les statuts de la fédération.`, duration: 20 },
          { title: "Obligations des clubs", type: "TEXTE", content: `Les clubs affiliés à la FRMHB ont plusieurs obligations légales, réglementaires et sportives qu'ils doivent respecter pour maintenir leur statut et participer aux compétitions officielles. Le non-respect de ces obligations peut entraîner des sanctions allant de l'avertissement à la radiation de la fédération. Le dirigeant responsable du club doit connaître ces obligations et mettre en place les procédures nécessaires pour s'y conformer.

Les obligations sportives incluent la participation aux compétitions dans lesquelles le club est inscrit, le respect du calendrier officiel, la présence aux réunions de la ligue ou de la commission sportive, et l'application des règles du jeu telles que définies par l'IHF et adaptées par la FRMHB. Le club doit également s'assurer que tous ses joueurs sont en possession d'une licence valide, que ses entraîneurs possèdent les certifications requises, et que ses arbitres sont inscrits sur la liste officielle. L'utilisation de joueurs non licenciés ou de faux documents est une faute grave passible de sanctions disciplinaires sévères.

Les obligations administratives comprennent la tenue régulière de l'assemblée générale du club, l'établissement annuel des comptes, le paiement des cotisations fédérales et des frais de licence, la déclaration des résultats de matchs dans les délais impartis, et la communication des informations demandées par la fédération (listes de joueurs, modifications du bureau directeur, changement d'adresse). Le club doit également désigner un responsable administratif chargé de la liaison avec la fédération et les ligues régionales.

Les obligations éthiques et sportives incluent le respect des principes de fair-play, la lutte contre le dopage, la protection des mineurs, et la promotion des valeurs du sport. Le club doit mettre en place une politique de protection de l'enfance, désigner un référent pour la protection des mineurs, et former ses encadrants aux bonnes pratiques en matière de protection. Les obligations en matière de sécurité comprennent la mise en conformité des installations sportives, la présence d'un personnel médical qualifié lors des matchs, et la souscription d'une assurance couvrant les risques sportifs de tous les licenciés.`, duration: 20 },
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
          { title: "Médias et réseaux sociaux", type: "TEXTE", content: `La communication via les réseaux sociaux est devenue un outil essentiel pour les clubs de handball. À l'ère du numérique, la présence en ligne d'un club est un facteur déterminant pour sa visibilité, son attractivité et son développement. Les réseaux sociaux permettent au club de communiquer en temps réel avec ses supporters, de promouvoir ses activités, d'attirer de nouveaux licenciés et de renforcer son image de marque.

Les plateformes les plus pertinentes pour un club de handball sont Facebook, Instagram, TikTok et YouTube. Facebook est idéal pour les informations générales, les événements et les communautés de supporters. Instagram est particulièrement adapté pour le contenu visuel (photos de matchs, stories en coulisses, portraits de joueurs). TikTok permet de toucher un public jeune avec des contenus courts et dynamiques (résumés de matchs, défis, coulisses). YouTube est la plateforme privilégiée pour les vidéos longues (résumés complets de matchs, interviews, documentaires sur le club).

La stratégie de communication d'un club sur les réseaux sociaux doit être planifiée et cohérente. Un calendrier éditorial mensuel permet de planifier les publications en fonction des événements sportifs et des activités du club. La régularité des publications est importante : un club actif publie au minimum 3 à 4 fois par semaine. Les contenus doivent être variés : résultats de matchs, annonces de transferts, coulisses de l'entraînement, interviews de joueurs, informations sur les matchs à venir. Les publications doivent être accompagnées de médias de qualité (photos, vidéos) et utiliser des hashtags pertinents pour maximiser la portée.

La gestion des réseaux sociaux nécessite du temps, des compétences et un respect des règles déontologiques. Le club doit désigner un community manager ou un responsable de la communication numérique. Ce responsable doit veiller à la qualité du contenu, à l'orthographe, au ton des publications et au respect de la vie privée des joueurs (notamment des mineurs). En cas de crise (mauvais résultat, incident), la communication doit être transparente, mesurée et respectueuse. Les réseaux sociaux sont un outil puissant mais qui exige une utilisation responsable et professionnelle pour être véritablement bénéfique au club.`, duration: 15 },
          { title: "Relations avec les sponsors", type: "TEXTE", content: `Les sponsors sont des partenaires clés du club de handball, apportant des ressources financières et matérielles indispensables à son fonctionnement et à son développement. La relation avec les sponsors doit être gérée de manière professionnelle, transparente et mutuellement bénéfique. Un club qui sait fidéliser ses sponsors et en attirer de nouveaux dispose d'une base financière solide pour investir dans le sportif et l'infrastructure.

La recherche de sponsors commence par l'élaboration d'un dossier de partenariat (ou sponsorship proposal) complet et attrayant. Ce dossier présente le club, son palmarès, ses ambitions, son public cible et les bénéfices offerts au sponsor. Les bénéfices peuvent inclure la visibilité sur les maillots, les panneaux publicitaires autour du terrain, la présence sur les réseaux sociaux du club, les invitations aux événements du club et l'accès aux billetteries. Le dossier doit également inclure des données chiffrées sur l'audience du club (nombre de supporters, fréquentation des matchs, portée des réseaux sociaux) pour démontrer la valeur de l'investissement.

Les types de partenariats peuvent varier considérablement selon la taille du club et les objectifs du sponsor. Les partenariats financiers (apport de fonds en échange de visibilité) sont les plus courants. Les partenariats en nature (fourniture d'équipements, de services, de produits) sont également précieux, en particulier pour les clubs de taille modeste. Les partenariats institutionnels avec les collectivités locales (mairie, conseil régional) et les entreprises publiques apportent souvent une stabilité financière et une légitimité importante au club.

La fidélisation des sponsors est aussi importante que leur recrutement. Le club doit entretenir une relation régulière avec ses partenaires : comptes rendus d'activité, invitations aux événements, remise des contreparties contractuelles dans les délais, et évaluation régulière de la satisfaction du sponsor. Un partenaire satisfait est plus enclin à renouveler et à augmenter son engagement. Le club doit également diversifier ses sources de revenus pour ne pas dépendre d'un seul sponsor. La constitution d'un réseau de partenaires diversifié (entreprises locales, grandes entreprises, institutions publiques) est une stratégie de gestion financière prudente qui assure la pérennité du club dans la durée.`, duration: 15 },
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
