# Fiche Projet — Académie AMDRH

> Document de référence portfolio — généré lors de l'audit du portefeuille GitHub (nov. 2026).
> Vérification : contenu réel du dépôt (README, structure `src/`, schéma Prisma).

## Classification

| Champ | Valeur |
|---|---|
| Catégorie portfolio | **E — Full Stack Applications** (plateforme e-learning complète) |
| Statut | `COMPLET` — L4 |
| Visibilité | `PUBLIC` — code consultable |
| Dépôt | [MonsterH-H/amdrh-academy](https://github.com/MonsterH-H/amdrh-academy) |
| Langage principal | TypeScript (Next.js 16, App Router) |

## Problématique

La formation continue des arbitres de handball au Maroc est centralisée sur des supports papier et des déplacements : pas de catalogue structuré, pas de suivi de progression, pas de certification vérifiable en ligne, et une communication fédération/membres dispersée.

## Objectifs

1. Digitaliser la formation continue des arbitres, entraîneurs et joueurs de la FRMHB dans une seule plateforme multi-rôles.
2. Garantir des certifications vérifiables (QR code) et une traçabilité complète des parcours.
3. Offrir une administration autonome à l'association (cours, quiz, badges, annonces, permissions).

## Fonctionnalités clés

- Catalogue de cours avec sections/leçons (vidéo, PDF, texte, interactif) et suivi de progression granulaire (visionnage, scroll, temps).
- Constructeur de quiz (QCM simple/multiple, Vrai/Faux, shuffle, limite de temps) avec tentatives et résultats détaillés.
- Certificats générés automatiquement avec QR code + vérification en ligne, émission unitaire ou en masse, révocation.
- Gamification : badges Bronze/Argent/Or/Platine, streaks, score d'engagement.
- Messagerie interne, forum par cours, notifications ciblées, annonces avec ciblage par rôle.
- Administration : 13 sous-modules, import CSV d'utilisateurs, 40+ permissions granulaires, logs d'audit, synchronisation fédération (licences/certifications).
- Temps réel via Socket.IO (utilisateurs en ligne, indicateur de frappe).

## Architecture technique

```
Client SPA (Next.js App Router, Zustand, React Query, Framer Motion)
   → API Layer : 72 Route Handlers (auth, RBAC, rate limiting)
   → Prisma 6 + @prisma/adapter-neon → PostgreSQL (Neon), 30 modèles
src/modules/      feature modules lazy-loaded (admin, auth, learner, courses,
                  quiz, certificates, learning-paths, messages, notifications,
                  announcements, profile, formateur, landing)
src/lib/          db (Neon adapter), auth NextAuth, auth-helpers (requireRole),
                  api-rate-limit, permissions (40+), validations Zod
```

## Stack — réel vs périmètre

| Couche | Réel |
|---|---|
| Framework | Next.js 16 (App Router, standalone) + TypeScript 5 |
| Données | PostgreSQL (Neon) + Prisma 6 — 30 modèles |
| Auth | NextAuth v4 (JWT + Credentials), bcrypt 12 rounds, tokens de reset |
| UI | shadcn/ui (48 composants), Tailwind CSS 4, Recharts, @dnd-kit, Framer Motion |
| Temps réel | Socket.IO 4 |
| Validation | Zod 4 (client + serveur) |
| Runtime | Bun |

## KPIs vérifiables

- **72 routes API** documentées section par section (auth : 5 · admin : 26 · courses : 9 · quiz/messages/forum : 6 · autres : 18+).
- **30 modèles Prisma** listés par catégorie dans le README.
- **5 rôles** · **40+ permissions** serveur (`src/lib/permissions.ts`, `constants.ts`).
- **48 composants UI** shadcn/ui dans `src/components/ui/`.
- Rate limiting par IP sur login/register, headers de sécurité (X-Frame-Options, CSP, HSTS), audit logs sur actions sensibles.

## Preuves (captures & diagrammes)

- Diagramme d'architecture en couches : README (section Architecture technique).
- Schéma des modèles et du chemin de connexion pooler/direct : README (section Base de données).
- Déploiement Vercel pas-à-pas documenté (README, section Déploiement).
- Aucune capture simulée ; les captures publiées proviennent d'exécutions réelles de la plateforme.

## Limites connues (honnêteté)

- Une fuite d'identifiants de configuration a été détectée dans l'historique du README et **corrigée par redaction** (nov. 2026) : les credentials concernés doivent être révolétés/regénérés côté Neon et NextAuth avant tout usage en production.
- Le déploiement de production dépend des variables d'environnement Vercel (Neon + NextAuth) — procédure documentée, non vérifiable publiquement.
