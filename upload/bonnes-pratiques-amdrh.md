# RÈGLES, BONNES PRATIQUES & ERREURS À ÉVITER
## Académie AMDRH — Next.js 16 / Prisma / PostgreSQL

---

## 1. ARCHITECTURE NEXT.JS 16

### Bonnes pratiques

- Tout composant dans `app/` est un Server Component par défaut. Ne jamais ajouter `"use client"` sauf si le composant utilise useState, useEffect, onClick, onChange ou un hook navigateur. La majorité de ton app doit rester côté serveur.
- Les Server Actions remplacent les API Routes pour toutes les mutations (créer, modifier, supprimer). Garder les Route Handlers uniquement pour les webhooks, les endpoints tiers, et les lectures complexes avec query params.
- Chaque route group doit avoir son propre `loading.tsx` (Skeleton), `error.tsx` (avec bouton retry), et `not-found.tsx`. Ne jamais laisser un écran blanc pendant le chargement ou en cas d'erreur.
- Utiliser les layouts imbriqués intelligemment : le layout `(dashboard)/layout.tsx` contient la Sidebar + TopBar et le auth guard. Le layout `admin/layout.tsx` ajoute un guard rôle ADMIN/FORMATEUR par-dessus. Ne jamais dupliquer la logique d'auth dans chaque page.
- Le fichier `middleware.ts` à la racine de `src/` gère la protection des routes au niveau HTTP avant même que le composant ne se charge. C'est la première ligne de défense, pas un remplacement du guard dans le layout.
- Utiliser `revalidatePath()` ou `revalidateTag()` après chaque Server Action qui modifie des données. Sans ça, la page affiche des données périmées après une mutation.
- Préférer `redirect()` de `next/navigation` dans les Server Actions plutôt que de retourner un booléen et gérer la redirection côté client.
- Organiser les routes par feature, pas par type technique. `/cours/[courseId]/quiz` est correct. `/quiz/[quizId]` séparé du cours est une erreur d'architecture.

### Erreurs à éviter

- Ne jamais mettre `"use client"` sur un layout parent. Si le layout `(dashboard)/layout.tsx` est client, TOUS les enfants deviennent client et tu perds les Server Components, le data fetching serveur, et les Server Actions directs.
- Ne jamais faire de fetch dans un `useEffect` pour charger des données initiales. En Next.js 16, les données se chargent directement dans le Server Component avec `await prisma.xxx.findMany()`. Le useEffect pour le data fetching est un anti-pattern hérité de React SPA.
- Ne jamais utiliser `router.push()` dans une Server Action. Les Server Actions s'exécutent côté serveur, `useRouter()` n'y existe pas. Utiliser `redirect()` de `next/navigation`.
- Ne jamais importer un composant client dans un Server Component sans vérifier que les props passées sont sérialisables. Les fonctions, les classes, les Date objects complexes ne passent pas la frontière serveur→client.
- Ne pas confondre `cookies()` et `headers()` : en Next.js 16, ces fonctions sont asynchrones. Toujours les `await`.
- Ne jamais créer d'API Route quand une Server Action suffit. Chaque API Route est un endpoint public exposé qui nécessite sa propre validation, son propre auth check, et sa propre gestion d'erreurs. Les Server Actions sont plus sécurisées par défaut.

---

## 2. PRISMA & BASE DE DONNÉES

### Bonnes pratiques

- Utiliser le pattern singleton pour PrismaClient. En développement, Next.js fait du hot reload qui crée une nouvelle instance à chaque sauvegarde. Sans singleton sur `globalThis`, tu finis avec des dizaines de connexions ouvertes et la BDD refuse les nouvelles.
- Toujours utiliser `select` ou `include` de manière explicite. Ne jamais faire `prisma.user.findMany()` sans filtrer les champs. Tu exposes le passwordHash et des données inutiles, et tu charges trop de données en mémoire.
- Les relations doivent être chargées avec `include` seulement quand tu en as besoin dans le rendu. Charger un cours avec ses 50 leçons, leurs 200 progressions, et les 30 quiz juste pour afficher une carte est un gaspillage massif.
- Utiliser la pagination cursor-based pour toute liste qui peut dépasser 50 items. La pagination offset (`skip/take`) devient lente à partir de quelques milliers d'entrées. Le cursor-based reste performant quelle que soit la taille de la table.
- Mettre des index sur les colonnes utilisées dans les WHERE et les ORDER BY fréquents : `email` (unique déjà indexé), `role`, `courseId` dans enrollments, `userId` dans enrollments, `isPublished`, `category`, `createdAt`.
- Utiliser `@@unique` pour les contraintes composites. Un utilisateur ne peut pas s'inscrire deux fois au même cours : `@@unique([userId, courseId])` sur Enrollment.
- Les opérations liées doivent être dans une transaction. Quand un quiz est réussi, tu dois en une seule transaction : mettre à jour le score, vérifier si le cours est terminé, émettre un certificat si c'est le cas, et créer les notifications. Si une étape échoue, tout doit être annulé.
- Utiliser les enums Prisma plutôt que des strings libres. Un rôle est un `UserRole`, pas un `string`. Ça garantit l'intégrité au niveau de la BDD et donne l'autocomplétion TypeScript.
- Toujours utiliser `onDelete: Cascade` sur les relations enfant→parent qui n'ont pas de sens sans le parent. Si un cours est supprimé, ses leçons et enrollments doivent partir aussi. Mais attention : un User supprimé ne doit PAS cascade-delete ses certificats si tu veux les garder en archive.

### Erreurs à éviter

- Ne jamais exposer la connexion string dans le code client ou dans un fichier accessible au navigateur. Elle va dans `.env.local` uniquement, jamais dans un fichier préfixé `NEXT_PUBLIC_`.
- Ne jamais faire de requêtes Prisma dans un composant `"use client"`. Prisma fonctionne côté serveur uniquement. Si tu as besoin de données dynamiques côté client, passe par une Server Action ou un Route Handler.
- Ne jamais stocker les mots de passe en clair ou avec un hashing faible. Bcrypt avec salt rounds 12 minimum. Ne jamais utiliser MD5, SHA256 seul, ou un chiffrement réversible.
- Ne jamais faire N+1 queries. Si tu affiches 20 cours avec le nom du formateur, ne fais pas 1 requête pour les cours puis 20 requêtes pour chaque formateur. Utilise `include: { instructor: { select: { nom: true, prenom: true } } }` dans la requête initiale.
- Ne jamais faire confiance aux données venant du client même dans une Server Action. Toujours revalider avec Zod côté serveur. Le client peut être manipulé.
- Ne pas oublier le `?sslmode=require` dans la connection string Neon. Sans SSL, la connexion est refusée.
- Ne jamais utiliser `prisma.$queryRaw` sauf absolue nécessité. Les requêtes brutes contournent le typage Prisma et ouvrent la porte aux injections SQL si tu interpoles des variables.

---

## 3. AUTHENTIFICATION & SÉCURITÉ

### Bonnes pratiques

- NextAuth v5 avec le Credentials provider nécessite une configuration soignée. Le callback `authorize()` doit vérifier l'email, comparer le hash bcrypt, vérifier que le compte est actif, puis retourner l'objet user minimal (id, role, nom). Ne jamais retourner le passwordHash dans l'objet session.
- Enrichir le token JWT avec le rôle de l'utilisateur via le callback `jwt`. Ainsi, `session.user.role` est disponible partout sans requête BDD supplémentaire à chaque page.
- Le middleware doit matcher les routes protégées avec un pattern précis. Protéger `/dashboard/:path*` et `/admin/:path*`. Ne pas protéger `/api/auth` sinon le login lui-même est bloqué.
- Implémenter un rate limiting sur les endpoints sensibles : login (5 tentatives par minute par IP), register (3 par heure par IP), reset password (2 par heure par email). Sans ça, le brute force est trivial.
- Les Server Actions qui modifient des données doivent TOUJOURS vérifier la session au début. Ne jamais supposer que parce que la page est protégée par le middleware, l'action l'est aussi. Les Server Actions sont des endpoints POST appelables directement.
- Pour les routes admin, vérifier le rôle dans le layout ET dans chaque Server Action admin. Le layout empêche l'affichage, mais l'action peut être appelée par un POST direct.
- Stocker les tokens de reset password avec une expiration courte (15 minutes) et les invalider après usage. Un token de reset qui ne expire jamais est une faille de sécurité permanente.
- Implémenter le CSRF protection. NextAuth v5 le gère nativement pour ses propres routes, mais tes Server Actions custom doivent valider l'origine de la requête.

### Erreurs à éviter

- Ne jamais stocker des informations sensibles dans le localStorage. Les tokens JWT sont gérés par NextAuth via des cookies httpOnly, secure, sameSite. Le localStorage est accessible à n'importe quel script JS sur la page.
- Ne jamais logger les mots de passe, les tokens, ou les données personnelles dans la console serveur. Les logs sont souvent accessibles à l'équipe ops et parfois stockés en clair.
- Ne jamais retourner des messages d'erreur spécifiques sur le login comme "Email non trouvé" ou "Mot de passe incorrect". Toujours retourner "Identifiants invalides". Les messages spécifiques permettent l'énumération de comptes.
- Ne pas oublier de hasher le token de reset password en BDD. Si la table est compromise, les tokens en clair permettent de prendre le contrôle de n'importe quel compte.
- Ne jamais faire confiance au rôle envoyé par le client lors du register. Un utilisateur choisit son profil cible (arbitre, joueur, etc.) mais le rôle ADMIN ne doit JAMAIS être sélectionnable. Le rôle admin est assigné manuellement en BDD.
- Ne pas exposer les IDs séquentiels dans les URLs. Utiliser des CUIDs ou UUIDs. Un ID incrémental permet de deviner les ressources voisines et de les énumérer.

---

## 4. UI / UX & DESIGN

### Bonnes pratiques

- Mobile-first signifie que tu codes d'abord la version mobile puis tu ajoutes les adaptations avec `md:` et `lg:`. Pas l'inverse. Si tu commences par le desktop, le mobile sera toujours un afterthought bancal.
- La Sidebar doit être un composant client avec un store Zustand pour gérer son état ouvert/fermé. Sur mobile, elle devient un Sheet (overlay) déclenché par un hamburger dans la TopBar. Sur desktop, elle est visible par défaut avec un toggle collapse.
- Le MobileBottomNav remplace la Sidebar sur mobile. Il affiche 5 icônes maximum (Accueil, Cours, Parcours, Messages, Profil). L'icône active a la couleur primary + un label texte. Les inactives sont grises sans label. Prévoir le padding bottom pour le safe area iOS.
- Chaque interaction utilisateur doit avoir un feedback immédiat. Bouton cliqué → état loading (spinner + désactivé). Formulaire soumis → toast de confirmation ou d'erreur. Donnée chargée → skeleton puis contenu. Ne jamais laisser l'utilisateur dans le doute.
- Les formulaires multi-step (register, création cours) doivent sauvegarder chaque étape en état local pour ne pas perdre les données si l'utilisateur revient en arrière. Un indicateur de progression (dots ou barre) doit toujours être visible.
- Utiliser le composant Toast de shadcn/ui pour tous les feedbacks non bloquants (succès, erreurs mineures). Utiliser Dialog/AlertDialog pour les actions destructives (supprimer un cours, désactiver un compte).
- Les tableaux de données admin doivent être construits avec le pattern DataTable réutilisable : header fixe, colonnes triables, filtre global, pagination, actions par ligne dans un DropdownMenu.
- Les images de couverture des cours doivent avoir un fallback visuel (gradient bleu AMDRH avec le titre en blanc) quand aucune image n'est uploadée. Ne jamais afficher une image cassée ou un espace vide.
- Typographie : les titres principaux en Plus Jakarta Sans bold/semibold, le corps en Inter regular/medium. Les tailles doivent suivre une échelle cohérente. Ne jamais utiliser plus de 4 tailles de police différentes sur un même écran.
- Les badges de rôle doivent avoir des couleurs distinctes et constantes dans toute l'app : bleu pour arbitre, vert pour entraîneur, orange pour joueur, violet pour administrateur, rouge pour admin système, indigo pour formateur.

### Erreurs à éviter

- Ne jamais laisser un écran vide. Chaque liste qui peut être vide doit afficher un EmptyState avec une icône, un message explicatif, et un bouton d'action. "Aucun cours trouvé" avec un bouton "Explorer le catalogue" est correct. Un écran blanc est inacceptable.
- Ne jamais bloquer l'UI avec un spinner plein écran. Utiliser des Skeletons qui reproduisent la forme du contenu attendu. L'utilisateur doit voir la structure de la page avant même que les données arrivent.
- Ne pas utiliser des modals pour des formulaires complexes (création de cours, édition de quiz). Les modals sont pour les actions courtes (confirmation, composition rapide). Les formulaires longs méritent leur propre page.
- Ne jamais mettre du texte blanc sur fond jaune/or ou du texte gris clair sur fond blanc. Vérifier les contrastes WCAG AA minimum (ratio 4.5:1 pour le texte, 3:1 pour les éléments UI).
- Ne pas empiler plus de 3 niveaux de cartes imbriquées. Une carte dans une carte dans une carte crée une confusion visuelle. Aplatir la hiérarchie.
- Ne pas utiliser les animations comme décoration. Chaque animation doit servir un but : indiquer un changement d'état, guider l'attention, ou donner un feedback. Un bouton qui bounce sans raison est une distraction.
- Ne jamais hardcoder des breakpoints dans le style inline. Utiliser exclusivement les classes Tailwind responsive `sm:` `md:` `lg:` `xl:`.
- Ne pas oublier les états hover, focus, active, et disabled sur CHAQUE élément interactif. Un bouton sans état disabled pendant le loading sera cliqué plusieurs fois par l'utilisateur impatient, créant des doublons en BDD.

---

## 5. QUIZ & GAMIFICATION

### Bonnes pratiques

- Le quiz doit être un composant client avec un store Zustand dédié qui contient : les questions (chargées au démarrage), l'index courant, les réponses sélectionnées, le temps restant, et l'état (intro/en_cours/soumis/résultats).
- Le timer doit utiliser `setInterval` avec correction de drift. Un `setInterval(fn, 1000)` simple dérive de plusieurs secondes sur un quiz de 30 minutes. Comparer avec `Date.now()` à chaque tick.
- Les questions doivent être mélangées côté serveur au moment du chargement, pas côté client. Le client reçoit un ordre déjà randomisé avec un seed lié à la tentative, pour que le même ordre soit reproductible si l'utilisateur recharge la page.
- La soumission du quiz doit être une Server Action qui recalcule le score côté serveur en comparant les réponses aux bonnes réponses stockées en BDD. Ne jamais faire confiance au score calculé côté client.
- Après un quiz réussi, la Server Action doit vérifier en chaîne : le cours est-il terminé → le parcours est-il terminé → des badges sont-ils débloqués → un certificat doit-il être émis. Tout ça dans une transaction Prisma.
- Les badges doivent avoir des critères clairs et automatiques. "Premier cours terminé" se déclenche quand le count d'enrollments terminés passe de 0 à 1. "Quiz Master" se déclenche quand le count de quiz réussis du premier coup atteint 10. Vérifier les critères après chaque action pertinente.

### Erreurs à éviter

- Ne jamais envoyer les bonnes réponses au client avec les questions. Le client reçoit uniquement le texte des questions et les options. Les bonnes réponses restent côté serveur et ne sont révélées qu'après soumission.
- Ne pas permettre la soumission multiple du même quiz en exploitant un race condition. Vérifier en BDD que le nombre de tentatives n'a pas atteint le maximum avant de créer une nouvelle tentative. Utiliser une contrainte ou un lock.
- Ne pas perdre la tentative en cours si l'utilisateur ferme le navigateur. Sauvegarder les réponses partielles en localStorage (ou en BDD via une Server Action toutes les 60 secondes) pour permettre la reprise.
- Ne pas attribuer un certificat sans vérifier que TOUS les quiz obligatoires du parcours sont réussis. Un certificat de parcours nécessite la complétion de chaque étape.

---

## 6. PERFORMANCE & OPTIMISATION

### Bonnes pratiques

- Utiliser `next/image` pour toutes les images avec les propriétés `width`, `height`, `sizes`, et le format automatique WebP/AVIF. Configurer `remotePatterns` dans `next.config.ts` pour les domaines d'images externes.
- Les pages catalogue qui changent rarement doivent utiliser ISR avec `revalidate: 60` (1 minute). Les pages dynamiques (profil, quiz en cours) restent en SSR.
- Lazy-loader les composants lourds avec `dynamic()` de Next.js : le Recharts des dashboards, l'éditeur de quiz drag-and-drop, le viewer PDF. Ces composants font souvent 100-300kb et ne doivent pas être dans le bundle initial.
- Utiliser `Suspense` boundaries autour de chaque section indépendante du dashboard. Les stats cards, le graphique, et la liste récente se chargent en parallèle plutôt que séquentiellement.
- Les requêtes Prisma de listing doivent TOUJOURS avoir un `take` (limit). Ne jamais faire un `findMany()` sans limit sur une table qui peut avoir des milliers d'entrées.
- Déduplication des requêtes : Next.js 16 déduplique automatiquement les `fetch()` identiques dans un même rendu serveur. Mais Prisma n'est pas `fetch()`. Si deux composants serveur ont besoin du même utilisateur, passer la donnée en prop plutôt que de refaire la requête.
- Compresser les payloads JSON des API Routes avec le header `Content-Encoding`. Pour les listes longues, considérer le streaming avec `ReadableStream`.

### Erreurs à éviter

- Ne jamais charger tous les cours ou tous les utilisateurs d'un coup. Paginer avec cursor-based dès le premier jour, même si la BDD est petite. Quand elle grandira, tout refactorer sera douloureux.
- Ne pas oublier le `loading.tsx` dans chaque segment de route. Sans lui, la navigation entre pages donne l'impression que l'app est cassée pendant le chargement des données serveur.
- Ne pas mettre des `console.log` de debug en production. Configurer un logger conditionnel qui ne log qu'en développement.
- Ne pas ignorer les Core Web Vitals. Le LCP (Largest Contentful Paint) doit être sous 2.5s. Les images non optimisées et les fonts non préchargées sont les causes principales de LCP lent.
- Ne pas importer des librairies entières quand tu n'utilises qu'une fonction. `import { format } from "date-fns"` est correct. `import dayjs from "dayjs"` charge tout. Vérifier le tree-shaking de chaque dépendance.

---

## 7. GESTION DES FORMULAIRES

### Bonnes pratiques

- Utiliser `useActionState` (React 19 / Next.js 16) pour connecter les formulaires aux Server Actions. Ça donne nativement l'état pending, le résultat, et la gestion d'erreurs côté serveur.
- La validation doit se faire à deux niveaux : côté client avec Zod pour le feedback instantané (onChange debounce 300ms), côté serveur dans la Server Action pour la sécurité. Le même schéma Zod est partagé entre les deux.
- Les formulaires multi-step doivent avoir un schéma Zod par étape. Valider chaque étape avant de permettre le passage à la suivante. Le schéma final est la composition des schémas d'étapes.
- Désactiver le bouton submit pendant le pending. Ajouter un spinner. Empêcher le double-submit qui crée des doublons en BDD.
- Les champs avec autocomplete (sélection destinataire message, sélection cours pour un parcours) doivent utiliser un Combobox avec recherche debounce côté serveur, pas un Select avec toutes les options préchargées.
- Afficher les erreurs de validation inline sous chaque champ, en rouge, avec le message Zod traduit en français. Ne jamais afficher un message d'erreur générique en haut du formulaire sans indiquer quel champ est fautif.

### Erreurs à éviter

- Ne jamais utiliser un `<form>` non contrôlé sans `action` dans Next.js 16. Soit tu utilises l'attribut `action` avec une Server Action, soit tu utilises `onSubmit` avec `preventDefault()` côté client. Mélanger les deux crée des comportements imprévisibles.
- Ne pas rediriger avant d'avoir confirmé que la mutation a réussi. Vérifier le retour de la Server Action avant de naviguer. Sinon, l'utilisateur est redirigé vers une page où sa donnée n'existe pas encore.
- Ne pas permettre l'upload de fichiers sans validation côté serveur du type MIME et de la taille. Un utilisateur peut renommer un exécutable en .pdf et l'uploader. Vérifier les magic bytes du fichier, pas juste l'extension.
- Ne pas stocker les fichiers uploadés dans le filesystem du serveur. Utiliser un service de stockage objet (Vercel Blob, S3, UploadThing). Le filesystem serveur est éphémère sur les plateformes serverless.

---

## 8. MESSAGERIE & NOTIFICATIONS

### Bonnes pratiques

- La messagerie interne utilise un polling côté client (toutes les 10 secondes) sur un Route Handler qui retourne les nouveaux messages. Le polling est simple, fiable, et suffisant pour une plateforme éducative. Les WebSockets sont overkill ici.
- Les notifications doivent être créées automatiquement par les Server Actions lors des événements clés : inscription à un cours, quiz terminé, certificat émis, message reçu, badge obtenu. Ne jamais dépendre de l'utilisateur pour créer une notification.
- Le compteur de notifications non lues dans la TopBar doit se rafraîchir via un polling léger (toutes les 30 secondes) qui ne retourne que le count, pas la liste complète.
- Grouper les notifications du même type qui arrivent en rafale. Si un formateur publie 5 cours en 10 minutes, l'apprenant reçoit une seule notification "5 nouveaux cours disponibles" plutôt que 5 notifications séparées.

### Erreurs à éviter

- Ne pas permettre à un apprenant d'envoyer des messages à n'importe qui. Un apprenant ne peut écrire qu'à ses formateurs et aux admins. Un formateur peut écrire à ses apprenants et aux admins. Seul l'admin peut écrire à tout le monde. Vérifier ces permissions dans la Server Action, pas juste dans l'UI.
- Ne pas oublier de marquer les notifications comme lues quand l'utilisateur accède au centre de notifications. Sinon, le compteur reste indéfiniment actif et l'utilisateur perd confiance dans l'indicateur.
- Ne pas envoyer d'emails pour chaque notification. Regrouper les emails en digests quotidiens ou permettre à l'utilisateur de configurer ses préférences de notification.

---

## 9. CERTIFICATS & PDF

### Bonnes pratiques

- Le code unique du certificat doit être généré côté serveur avec un format lisible : `AMDRH-2026-XXXXX` où XXXXX est un identifiant aléatoire alphanumérique. Vérifier l'unicité en BDD avant de persister.
- Le PDF est généré côté serveur via un Route Handler dédié (`/api/certificates/[id]/pdf`) qui utilise @react-pdf/renderer. Le client reçoit un blob PDF téléchargeable. Ne jamais générer le PDF côté client.
- Le template PDF doit inclure : bordure dorée, logos AMDRH et FRMHB, titre "Certificat de Réussite", nom complet, intitulé du cours/parcours, date, code unique, QR code de vérification (URL vers une page publique `/verify/[code]`), mention "Reconnu par la FRMHB".
- Prévoir une page publique `/verify/[code]` qui permet à quiconque de vérifier l'authenticité d'un certificat en scannant le QR code. Cette page affiche les infos du certificat sans nécessiter de login.

### Erreurs à éviter

- Ne pas utiliser html2canvas ou des outils de screenshot DOM pour générer des PDF. Le résultat est pixelisé et non accessible. @react-pdf/renderer génère de vrais PDF vectoriels.
- Ne pas permettre le téléchargement d'un certificat pour un cours non terminé. Vérifier le statut de l'enrollment avant de générer le PDF.
- Ne pas oublier qu'un certificat émis est permanent. Même si le cours est modifié après, le certificat reflète ce qui a été validé à la date d'émission. Stocker les métadonnées au moment de l'émission, ne pas les calculer dynamiquement.

---

## 10. INTERNATIONALISATION & CONTENU

### Bonnes pratiques

- L'app est en français marocain. Tous les textes UI, messages d'erreur, labels de formulaire, empty states, et notifications sont en français. Pas de mélange anglais/français.
- Les dates sont formatées en format français : "15 avril 2026", pas "April 15, 2026". Utiliser `Intl.DateTimeFormat('fr-MA')` ou `date-fns/locale/fr`.
- Les nombres suivent le format français : séparateur de milliers avec espace, décimales avec virgule. "1 250,00" pas "1,250.00".
- Le contenu seed doit être réaliste et spécifique au handball marocain : noms marocains, villes marocaines, cours liés aux règles IHF, termes techniques du handball, références à la FRMHB.

### Erreurs à éviter

- Ne pas hardcoder les textes dans les composants. Centraliser les chaînes dans des constantes ou un fichier de traduction, même si l'app n'est qu'en français. Ça facilite la maintenance et une éventuelle internationalisation future.
- Ne pas utiliser `new Date().toLocaleDateString()` sans spécifier la locale. Le résultat dépend du navigateur de l'utilisateur et sera incohérent.

---

## 11. DÉPLOIEMENT & ENVIRONNEMENT

### Bonnes pratiques

- Séparer les variables d'environnement : `.env.local` pour le développement local, variables d'environnement Vercel pour la production. Ne jamais commiter de `.env` contenant des secrets.
- Les variables accessibles côté client doivent être préfixées `NEXT_PUBLIC_`. Toutes les autres (DATABASE_URL, NEXTAUTH_SECRET, RESEND_API_KEY) restent côté serveur uniquement.
- Configurer un seed Prisma idempotent : vérifier si les données existent avant de les créer (upsert). Pouvoir relancer le seed sans créer de doublons.
- Mettre en place les migrations Prisma dès le début. Ne jamais modifier le schéma et faire `prisma db push` en production. Utiliser `prisma migrate dev` en local et `prisma migrate deploy` en production.
- Avoir un script `postinstall` qui exécute `prisma generate` pour que le client Prisma soit toujours en sync avec le schéma après un `npm install`.

### Erreurs à éviter

- Ne jamais commiter le fichier `.env.local` ou tout fichier contenant la connection string, les API keys, ou le NEXTAUTH_SECRET. Ajouter `.env*.local` dans le `.gitignore` dès la création du projet.
- Ne pas utiliser `prisma db push` en production. Ça peut supprimer des colonnes et perdre des données. Toujours passer par les migrations.
- Ne pas oublier de configurer `NEXTAUTH_URL` en production. Sans ça, les redirections après login pointent vers localhost.
- Ne pas déployer sans tester le build de production localement (`next build && next start`). Le mode développement masque beaucoup d'erreurs de typage, d'imports, et de sérialisation qui explosent en production.

---

## 12. STRUCTURE DU CODE & CONVENTIONS

### Bonnes pratiques

- Un fichier = une responsabilité. Un composant par fichier. Une Server Action par domaine (auth.ts, courses.ts, quizzes.ts). Pas de fichier fourre-tout de 500 lignes.
- Nommer les Server Actions avec des verbes : `createCourse`, `enrollInCourse`, `submitQuiz`, `issueCertificate`. Les composants avec des noms : `CourseCard`, `QuizPlayer`, `CertificateViewer`.
- Les types Prisma générés (`Prisma.UserGetPayload<...>`) sont tes types principaux. Ne pas recréer manuellement des interfaces qui dupliquent le schéma. Créer des types dérivés seulement pour les payloads spécifiques avec `select`.
- Centraliser les schémas Zod dans `lib/validations.ts` et les exporter. Les mêmes schémas sont utilisés dans les formulaires client ET dans les Server Actions serveur.
- Les constantes métier (couleurs par rôle, icônes par catégorie, labels en français, durées en texte lisible) vont dans `lib/constants.ts`. Ne jamais hardcoder "Arbitre" ou "#1D4ED8" dans un composant.
- Utiliser `cn()` (clsx + tailwind-merge) pour combiner les classes conditionnelles. Pas de template literals fragiles avec des espaces en trop.

### Erreurs à éviter

- Ne pas mélanger logique métier et logique UI dans le même composant. Le composant affiche, la Server Action traite. Si tu as un `if/else` qui calcule un score dans un composant React, c'est au mauvais endroit.
- Ne pas créer de dossier `utils/` fourre-tout. Avoir des fichiers spécifiques : `utils.ts` pour les helpers génériques (cn, formatDate), `validations.ts` pour Zod, `constants.ts` pour les constantes, `auth.ts` pour NextAuth.
- Ne pas ignorer les warnings TypeScript. `any` est interdit. `@ts-ignore` est interdit. Si TypeScript se plaint, le type est probablement faux. Le corriger, pas le masquer.
- Ne pas copier-coller du code entre composants. Si deux composants partagent une logique, extraire un hook custom ou un composant partagé. La duplication est la source numéro 1 de bugs.

---

## RÉSUMÉ — LES 10 COMMANDEMENTS

1. Server Components par défaut, `"use client"` uniquement quand le navigateur est requis.
2. Server Actions pour les mutations, Prisma direct dans les Server Components pour les lectures.
3. Zod partout : client pour le feedback, serveur pour la sécurité.
4. Jamais de données en dur, tout vient de PostgreSQL via Prisma.
5. Chaque page a son loading.tsx, error.tsx, et empty state.
6. Mobile-first, responsive, bottom nav sur mobile, sidebar sur desktop.
7. Les bonnes réponses du quiz restent côté serveur, le score est calculé côté serveur.
8. Les certificats sont générés en PDF côté serveur avec un code unique vérifiable.
9. Pagination cursor-based, images optimisées, lazy loading des composants lourds.
10. Zéro `any`, zéro `console.log` en prod, zéro `.env` commité.
