<div align="center">

# 🏐 Académie AMDRH

**Plateforme e-learning pour la formation des arbitres de handball au Maroc**

Partenaire académique officiel de la **FRMHB** — Fédération Royale Marocaine de Handball

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-PostgreSQL-2D3748)](https://prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Private-red)]()

</div>

---

## 📋 Table des matières

- [À propos](#-à-propos)
- [Fonctionnalités](#-fonctionnalités)
- [Architecture technique](#-architecture-technique)
- [Stack technologique](#-stack-technologique)
- [Structure du projet](#-structure-du-projet)
- [Base de données](#-base-de-données)
- [Installation](#-installation)
- [Configuration environnement](#-configuration-environnement)
- [Déploiement sur Vercel](#-déploiement-sur-vercel)
- [Rôles et permissions](#-rôles-et-permissions)
- [Modules détaillés](#-modules-détaillés)
- [API Routes](#-api-routes)
- [Scripts disponibles](#-scripts-disponibles)
- [Sécurité](#-sécurité)
- [Contribuer](#-contribuer)

---

## 📖 À propos

L'**Académie AMDRH** est une plateforme e-learning complète conçue pour la formation continue des arbitres, entraîneurs et joueurs de handball au Maroc. Développée pour l'Association Marocaine Des arbitres de Handball (AMDRH), elle sert de centre de formation virtuel pour les membres de la FRMHB.

La plateforme permet la gestion de cours, quiz, certifications, parcours d'apprentissage, messagerie interne, forum de discussion, et un système complet de gamification avec badges et certificats.

---

## ✨ Fonctionnalités

### 🎓 Formation
- **Catalogue de cours** avec filtrage par catégorie, difficulté, statut
- **Création de cours** par formateurs : sections, leçons (vidéo, PDF, texte, interactif)
- **Suivi de progression** détaillé par leçon (pourcentage de visionnage, scroll, temps)
- **Quiz et évaluations** : QCM simple/multiple, Vrai/Faux, shuffle, limite de temps
- **Parcours d'apprentissage** : séquentiel, flexible, hybride
- **Certificats** générés automatiquement avec QR code et vérification en ligne

### 👥 Gestion des utilisateurs
- **5 rôles** : ADMIN, FORMATEUR, ARBITRE, ENTRAINEUR, JOUEUR
- **Inscription en 2 étapes** avec validation Zod
- **Authentification** : email/password avec bcrypt + NextAuth JWT
- **Récupération de mot de passe** avec tokens sécurisés
- **Profils utilisateur** : avatar, bio, licence, club, région
- **Import en masse** des utilisateurs (CSV)

### 📊 Administration
- **Dashboard admin** : KPIs, graphiques, métriques temps réel
- **Gestion des cours** : CRUD, statuts, actions en masse
- **Gestion des quiz** : constructeur de quiz, banque de questions
- **Gestion des certificats** : émission unitaire/en masse, révocation
- **Gestion des badges** : création, attribution automatique/manuelle
- **Gestion des annonces** : ciblage par rôle, épinglage, expiration
- **Gestion des permissions** : 40+ permissions granulaires
- **Logs d'audit** : traçabilité complète des actions
- **Synchronisation fédération** : licences et certifications

### 💬 Communication
- **Messagerie interne** : conversations, liste, indicateurs de frappe
- **Forum de discussion** par cours : sujets, réponses, résolution
- **Notifications** : système, cours, certificats, quiz, badges
- **Annonces** : info, urgent, événement, formation, résultats

### 🏆 Gamification
- **Badges** : Bronze, Argent, Or, Platine
- **Tableau de progression** avec streaks
- **Score d'engagement** et recommandations
- **Alimentation temps réel** des activités

### 🔧 Technique
- **Mode sombre/clair** avec persistance
- **Interface responsive** : desktop, tablette, mobile
- **Navigation mobile** : barre latérale + bottom nav
- **Chargement lazy** des modules (code splitting)
- **Gestion d'erreurs** avec Error Boundaries
- **Rate limiting** sur les routes sensibles
- **Headers de sécurité** (X-Frame-Options, CSP, HSTS)

---

## 🏗️ Architecture technique

```
┌─────────────────────────────────────────────┐
│                  Client (SPA)               │
│  Next.js 16 App Router — "use client"        │
│  Zustand (state) + React Query + Framer Motion│
├─────────────────────────────────────────────┤
│              API Layer (72 routes)           │
│  Route Handlers — Auth, RBAC, Rate Limiting  │
├─────────────────────────────────────────────┤
│           Prisma ORM + Neon Adapter         │
│  PostgreSQL (Neon) — 30 models              │
└─────────────────────────────────────────────┘
```

### Patterns utilisés
- **SPA-like routing** : navigation client-side avec Zustand (`currentView`)
- **API fetch wrapper** (`apiFetch.ts`) : auth automatique, gestion d'erreurs
- **Lazy loading** : tous les modules chargés dynamiquement
- **Module-based architecture** : feature modules dans `src/modules/`
- **RBAC (Role-Based Access Control)** : permissions granulaires par rôle

---

## 💻 Stack technologique

| Catégorie | Technologie |
|-----------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Langage** | TypeScript 5 |
| **Base de données** | PostgreSQL (Neon) |
| **ORM** | Prisma 6 + @prisma/adapter-neon |
| **Authentification** | NextAuth v4 (JWT + Credentials) |
| **UI Components** | shadcn/ui (New York style) |
| **Styling** | Tailwind CSS 4 + tw-animate-css |
| **State Management** | Zustand 5 |
| **Server State** | TanStack Query 5 |
| **Icons** | Lucide React |
| **Charts** | Recharts 2 |
| **Forms** | React Hook Form + Zod 4 |
| **Animations** | Framer Motion 12 |
| **Drag & Drop** | @dnd-kit |
| **Temps réel** | Socket.IO 4 |
| **Date Utils** | date-fns 4 |
| **Markdown** | react-markdown + react-syntax-highlighter |
| **Runtime** | Bun |

---

## 📁 Structure du projet

```
amdrh-academy/
├── prisma/
│   ├── schema.prisma          # 30 modèles PostgreSQL
│   └── seed.ts                 # Données initiales
├── public/
│   ├── logo.svg               # Logo AMDRH
│   └── robots.txt
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Layout racine (fonts, ThemeProvider, Toasters)
│   │   ├── page.tsx           # Routeur SPA (lazy-loaded views)
│   │   ├── globals.css        # Tailwind + CSS variables
│   │   ├── error.tsx          # Error boundary global
│   │   ├── global-error.tsx   # Error boundary racine
│   │   ├── proxy.ts           # Middleware proxy (headers, CORS, rate-limit)
│   │   └── api/
│   │       ├── auth/          # Login, Register, Forgot/Reset Password, NextAuth
│   │       ├── admin/         # 26 routes admin protégées
│   │       ├── courses/        # CRUD cours, inscriptions, progression, sections
│   │       ├── quiz/           # Quiz, soumission, résultats
│   │       ├── certificates/  # Création, vérification, PDF
│   │       ├── messages/       # Conversations, messages
│   │       ├── notifications/  # CRUD + lecture/non-lecture
│   │       ├── forum/          # Discussions + réponses par cours
│   │       ├── learning-paths/ # Parcours d'apprentissage
│   │       ├── profile/       # Profil utilisateur, avatar, mot de passe
│   │       ├── resources/      # Médiathèque, upload, téléchargement
│   │       ├── badges/         # Badges et gamification
│   │       ├── announcements/  # Annonces publiques
│   │       ├── dashboard/      # Dashboard étudiant
│   │       ├── stats/          # Statistiques générales
│   │       ├── sync/           # Synchronisation fédération
│   │       ├── realtime/       # Push temps réel, utilisateurs en ligne
│   │       ├── formateur/      # Progression étudiants (formateur)
│   │       ├── users/          # Gestion utilisateurs
│   │       └── files/          # Serveur de fichiers
│   ├── components/
│   │   └── ui/                 # 48 composants shadcn/ui
│   ├── hooks/
│   │   ├── use-realtime.ts     # Hook Socket.IO temps réel
│   │   ├── use-mobile.ts      # Hook responsive
│   │   └── use-toast.ts       # Hook notifications toast
│   ├── lib/
│   │   ├── db.ts               # Client Prisma (Neon adapter)
│   │   ├── auth.ts             # Configuration NextAuth
│   │   ├── auth-helpers.ts     # requireAuth, requireRole, checkRole
│   │   ├── api-fetch.ts        # Fetch wrapper avec auth auto
│   │   ├── api-rate-limit.ts   # Rate limiting par IP
│   │   ├── permissions.ts      # 40+ permissions définitions
│   │   ├── constants.ts        # Rôles, permissions par rôle
│   │   ├── validations.ts      # Schémas Zod (login, register, course, quiz…)
│   │   ├── rate-limit.ts       # Rate limiting utilitaire
│   │   ├── certificate-utils.ts # Génération certificats
│   │   └── utils.ts            # Utilitaires généraux (cn, etc.)
│   ├── modules/
│   │   ├── admin/              # Dashboard, Users, Courses, Quiz, Certificates,
│   │   │                       # Analytics, Notifications, Sync, Traceability,
│   │   │                       # Permissions, Announcements, Settings, Resources
│   │   ├── auth/               # Login, Register, Forgot/Reset Password
│   │   ├── learner/            # Dashboard étudiant, Traçabilité
│   │   ├── courses/            # Catalogue, Détail, Création de cours
│   │   ├── quiz/               # Interface quiz
│   │   ├── certificates/       # Certificats et badges
│   │   ├── learning-paths/      # Parcours d'apprentissage
│   │   ├── messages/            # Messagerie interne
│   │   ├── notifications/      # Centre de notifications
│   │   ├── announcements/       # Annonces
│   │   ├── profile/            # Profil utilisateur
│   │   ├── formateur/          # Dashboard formateur
│   │   ├── landing/            # Page d'accueil publique
│   │   └── shared/
│   │       └── layout/         # Sidebar, TopBar, MobileBottomNav
│   ├── services/               # Services client (auth, courses, quiz, messages…)
│   ├── store/                   # Zustand stores (app, auth, ui, navigation)
│   ├── types/                   # TypeScript types (user, course, quiz, etc.)
│   └── utils/                   # Utilitaires (format, navigation, course)
├── .env.example                # Template des variables d'environnement
├── next.config.ts              # Configuration Next.js (standalone)
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## 🗄️ Base de données

### 30 Modèles Prisma (PostgreSQL)

| Catégorie | Modèles |
|-----------|---------|
| **Utilisateurs** | `User` |
| **Cours** | `Course`, `Section`, `Lesson` |
| **Inscriptions** | `Enrollment`, `LessonProgress` |
| **Quiz** | `Quiz`, `Question`, `QuizAttempt`, `QuizAnswer` |
| **Certificats** | `Certificate`, `Badge`, `UserBadge` |
| **Parcours** | `LearningPath`, `LearningPathCourse`, `LearningPathEnrollment` |
| **Messages** | `Conversation`, `ConversationParticipant`, `Message` |
| **Notifications** | `Notification` |
| **Ressources** | `Resource` |
| **Forum** | `ForumDiscussion`, `ForumReply` |
| **Annonces** | `Announcement` |
| **Audit** | `AuditLog` |
| **Permissions** | `Permission`, `RolePermission` |
| **Auth** | `PasswordResetToken`, `VerificationToken` |
| **Sync** | `FederationSync` |

### Schéma de connexion

```
DATABASE_URL → Pooler (production) → pgbouncer → PostgreSQL
DIRECT_URL  → Direct (migrations)  → PostgreSQL
```

---

## 🚀 Installation

### Prérequis
- **Node.js** 18+ ou **Bun** 1.0+
- **Compte Neon** (PostgreSQL serverless)

### 1. Cloner le projet

```bash
git clone https://github.com/MonsterH-H/amdrh-academy.git
cd amdrh-academy
```

### 2. Installer les dépendances

```bash
bun install
```

### 3. Configurer l'environnement

```bash
cp .env.example .env
# Éditer .env avec vos valeurs
```

### 4. Générer le client Prisma

```bash
bun run db:generate
```

### 5. Créer les tables dans la base

```bash
bun run db:push
```

### 6. Insérer les données initiales

```bash
bun run seed:run
```

### 7. Lancer en développement

```bash
bun run dev
```

L'application est disponible sur **http://localhost:3000**.

---

## ⚙️ Configuration environnement

| Variable | Description | Exemple |
|----------|-------------|---------|
| `DATABASE_URL` | Neon Pooler URL (production) | `postgresql://user:pass@ep-xxx-pooler.neon.tech/db?sslmode=require` |
| `DIRECT_URL` | Neon Direct URL (migrations) | `postgresql://user:pass@ep-xxx.neon.tech/db?sslmode=require` |
| `NEXTAUTH_URL` | URL de l'application | `https://amdrh-academy.vercel.app` |
| `NEXTAUTH_SECRET` | Secret NextAuth (32+ chars) | `77cadc0af581ebe11076d79c2370e...` |

### Générer un NEXTAUTH_SECRET

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🌐 Déploiement sur Vercel

### Étape 1 — Connecter le repo

1. Aller sur [vercel.com](https://vercel.com)
2. **New Project** → Importer le repo GitHub
3. Framework détecté automatiquement : **Next.js**

### Étape 2 — Variables d'environnement

Dans **Settings → Environment Variables**, ajouter :

| Nom | Valeur |
|-----|--------|
| `DATABASE_URL` | `postgresql://neondb_owner:npg_BJ1sINw6ChyU@ep-empty-meadow-amjci1oh-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require` |
| `DIRECT_URL` | `postgresql://neondb_owner:npg_BJ1sINw6ChyU@ep-empty-meadow-amjci1oh.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require` |
| `NEXTAUTH_URL` | `https://votre-domaine.vercel.app` |
| `NEXTAUTH_SECRET` | `77cadc0af581ebe11076d79c2370e4ce1da5ad7eb504576e862cabd6edf7a063` |

### Étape 3 — Build

Le build est configuré en mode **standalone** dans `next.config.ts` :

```javascript
const nextConfig = {
  output: "standalone",
  // ...
};
```

### Étape 4 — Initialiser la base

Après le premier déploiement, exécuter les migrations et le seed :

```bash
# Depuis un terminal avec accès à la DB Neon
bun run db:push
bun run seed:run
```

Ou via le dashboard Neon (SQL Editor) en copiant le contenu de `prisma/schema.prisma`.

---

## 👥 Rôles et permissions

### 5 Rôles utilisateur

| Rôle | Description | Permissions |
|------|-------------|-------------|
| `ADMIN` | Administrateur plateforme | Accès total à tous les modules |
| `FORMATEUR` | Formateur / Instructeur | Création de cours, quiz, suivi étudiants |
| `ARBITRE` | Arbitre de handball | Inscription cours, quiz, certifications |
| `ENTRAINEUR` | Entraîneur | Cours entrainement, quiz, progression |
| `JOUEUR` | Joueur de handball | Cours joueurs, quiz, progression |

### 40+ Permissions

```
courses.view        courses.create       courses.edit        courses.delete
courses.manage      courses.publish      courses.enroll
quiz.view           quiz.create          quiz.edit            quiz.delete
quiz.manage         quiz.submit          quiz.grade
certificates.view   certificates.create  certificates.revoke  certificates.verify
users.view          users.create         users.edit           users.delete
users.manage        users.import
badges.view         badges.create         badges.award
announcements.view  announcements.create announcements.manage
forum.view          forum.create         forum.manage
messages.view       messages.create      messages.manage
notifications.view  notifications.manage
admin.dashboard     admin.analytics      admin.settings       admin.sync
learning-paths.view learning-paths.create learning-paths.manage
resources.view      resources.create     resources.manage
audit.view          permissions.manage
```

---

## 📦 Modules détaillés

### `admin/` — Administration (13 sous-modules)
- **Dashboard** : KPIs temps réel, graphiques Recharts, métriques plateforme
- **Users** : CRUD, import CSV, activité, activation/désactivation
- **Courses** : Gestion complète, actions en masse, statistiques inscriptions
- **Quiz** : Constructeur visuel, banque de questions, résultats tentatives
- **Certificates** : Émission unitaire/en masse, vérification QR, révocation
- **Badges** : Création, attribution manuelle/automatique
- **Analytics** : Distribution, progression, revenus, tendances
- **Notifications** : Envoi global, modèle de notification
- **Announcements** : Ciblage par rôle, épinglage, expiration
- **Permissions** : Gestion des 40+ permissions par rôle
- **Settings** : Apparence, email, sécurité, data management
- **Sync** : Synchronisation licences/certifications fédération
- **Traceability** : Traçabilité complète des inscriptions et activités
- **Resources** : Médiathèque, upload, gestion des fichiers

### `learner/` — Espace apprenant
- **Dashboard** : Statistiques, cours en cours, streaks, recommandations
- **Traceability** : Historique quiz, progression, badges obtenus

### `courses/` — Module de cours
- **Catalogue** : Grille filtrée (catégorie, difficulté, recherche)
- **Détail** : Sections/leçons, progression, forum, ressources
- **Création** : Éditeur complet (général, contenu, quiz, ressources)

### `quiz/` — Module d'évaluation
- Interface de quiz avec timer, navigation, barre de progression
- Résultats détaillés avec explications

### `certificates/` — Certificats et badges
- Liste des certificats avec vérification
- Grille des badges obtenus
- Vérification par code

### `messages/` — Messagerie
- Liste des conversations avec recherche
- Vue conversation avec messages
- Nouvelle conversation
- Indicateur de frappe

### `notifications/` — Centre de notifications
- Liste groupée par date
- Actions en masse (marquer lu/non-lu)
- Préférences de notification

### `profile/` — Profil utilisateur
- En-tête avec avatar et complétion
- Édition profil, onglets
- Statistiques améliorées
- Paramètres sécurité, préférences

### `landing/` — Page d'accueil publique
- Hero section, features, rôles, statistiques, témoignages, footer

### `formateur/` — Espace formateur
- Dashboard : cours gérés, étudiants, progression

---

## 🔌 API Routes (72 endpoints)

### Authentification (5)
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/auth/login` | Connexion email/password |
| POST | `/api/auth/register` | Inscription 2 étapes |
| POST | `/api/auth/forgot-password` | Demande reset mot de passe |
| POST | `/api/auth/reset-password` | Reset mot de passe avec token |
| GET/POST | `/api/auth/[...nextauth]` | NextAuth handlers |

### Admin (26)
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/admin/dashboard` | KPIs dashboard admin |
| GET | `/api/admin/users` | Liste utilisateurs |
| POST | `/api/admin/users/import` | Import CSV |
| GET | `/api/admin/courses` | Liste cours |
| GET | `/api/admin/quizzes` | Liste quiz |
| GET/POST/PUT/DELETE | `/api/admin/quizzes/[id]` | CRUD quiz |
| GET | `/api/admin/certificates` | Liste certificats |
| POST | `/api/admin/certificates/bulk-issue` | Émission en masse |
| GET/POST/PUT/DELETE | `/api/admin/announcements` | CRUD annonces |
| GET | `/api/admin/audit-logs` | Logs d'audit |
| ... | *+ 16 endpoints* | analytics, settings, sync, badges, etc. |

### Courses (9)
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/courses` | Catalogue cours |
| POST | `/api/courses` | Créer un cours |
| GET | `/api/courses/[id]` | Détail cours |
| PUT | `/api/courses/[id]` | Modifier cours |
| DELETE | `/api/courses/[id]` | Supprimer cours |
| POST | `/api/courses/[id]/enroll` | S'inscrire |
| GET | `/api/courses/[id]/progress` | Progression |
| GET/POST | `/api/courses/[id]/sections` | Sections |
| POST | `/api/courses/[id]/duplicate` | Dupliquer cours |

### Quiz (2)
| POST | `/api/quiz/[id]` | Démarrer tentative |
| POST | `/api/quiz/[id]/result` | Soumettre réponses |

### Messages (2)
| GET | `/api/messages` | Conversations |
| GET/POST/DELETE | `/api/messages/[id]` | Messages |

### Forum (2)
| GET/POST | `/api/forum/[courseId]` | Discussions cours |
| GET/POST/PUT/DELETE | `/api/forum/[courseId]/[id]` | Discussion CRUD |

### Autres (18)
Profile, Certificates, Notifications, Resources, Learning Paths, Dashboard, Stats, Sync, Realtime, Gamification, Formateur, Users, Files, Badges, Announcements.

---

## 🛠️ Scripts disponibles

```bash
# Développement
bun run dev          # Serveur de développement (port 3000)
bun run lint          # ESLint

# Base de données
bun run db:generate   # Générer le client Prisma
bun run db:push       # Pousser le schéma vers la DB (sans migration)
bun run db:migrate    # Créer et appliquer une migration
bun run db:reset      # Reset la DB
bun run db:studio     # Ouvrir Prisma Studio
bun run seed:run      # Exécuter le seed (données initiales)

# Production
bun run build         # Build Next.js standalone
bun run start         # Lancer le serveur de production
```

---

## 🔒 Sécurité

- **Hashage des mots de passe** : bcrypt (12 rounds)
- **JWT sessions** : 30 jours max, token dans cookie HttpOnly
- **Rate limiting** : Protection brute-force sur login/register
- **Headers de sécurité** : X-Frame-Options, X-Content-Type-Options, HSTS, Referrer-Policy
- **CORS** : Origines autorisées configurables
- **RBAC** : 40+ permissions vérifiées côté serveur
- **Audit logs** : Traçabilité de toutes les actions sensibles
- **Validation** : Schémas Zod côté serveur et client

---

## 🤝 Contribuer

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/nom-feature`)
3. Committer les changements (`git commit -m 'feat: description'`)
4. Push vers la branche (`git push origin feature/nom-feature`)
5. Ouvrir une Pull Request

---

<div align="center">

**Académie AMDRH** © 2025 — Association Marocaine Des Arbitres de Handball

Partenaire académique officiel **FRMHB**

</div>
