# CAHIER DES CHARGES
## Académie d'Apprentissage à Distance — Partenaire Académique AMDRH
### Plateforme e-Learning Fédérale · Édition 2026

---

> **Référence document :** CDC-ACAD-AMDRH-2026-v1.0
> **Statut :** Version initiale
> **Date de création :** 08 avril 2026
> **Confidentialité :** Document interne — usage restreint
> **Partenaire académique officiel :** Association Marocaine pour le Développement des Ressources Humaines (AMDRH)

---

## TABLE DES MATIÈRES

1. [Présentation générale du projet](#1-présentation-générale-du-projet)
2. [Contexte et enjeux](#2-contexte-et-enjeux)
3. [Objectifs du projet](#3-objectifs-du-projet)
4. [Périmètre fonctionnel](#4-périmètre-fonctionnel)
5. [Acteurs, rôles et droits d'accès](#5-acteurs-rôles-et-droits-daccès)
6. [Modules fonctionnels détaillés](#6-modules-fonctionnels-détaillés)
   - 6.1 Module Gestion des Comptes & Identités
   - 6.2 Module Création & Organisation des Cours
   - 6.3 Module Learning Paths (Parcours de Formation)
   - 6.4 Module Quiz, Examens & Évaluation
   - 6.5 Module Certification & Badges
   - 6.6 Module Tableau de Bord & Analytics
   - 6.7 Module Messagerie & Notifications
   - 6.8 Module Intégration Fédération & AMDRH
   - 6.9 Module Administration Globale
7. [Cas d'usage (User Stories) par rôle](#7-cas-dusage-user-stories-par-rôle)
8. [Workflows détaillés](#8-workflows-détaillés)
9. [Architecture technique](#9-architecture-technique)
10. [Sécurité et conformité](#10-sécurité-et-conformité)
11. [Exigences UX/UI](#11-exigences-uxui)
12. [Normes et standards du secteur](#12-normes-et-standards-du-secteur)
13. [Indicateurs de performance (KPIs)](#13-indicateurs-de-performance-kpis)
14. [Plan de tests et recette](#14-plan-de-tests-et-recette)
15. [Gouvernance et gestion de projet](#15-gouvernance-et-gestion-de-projet)
16. [Contraintes et hypothèses](#16-contraintes-et-hypothèses)
17. [Glossaire](#17-glossaire)
18. [Annexes](#18-annexes)

---

## 1. Présentation Générale du Projet

### 1.1 Intitulé

**Académie d'Apprentissage à Distance** — plateforme e-learning fédérale développée en partenariat avec l'Association Marocaine pour le Développement des Ressources Humaines (AMDRH), au service de la Fédération.

### 1.2 Portée

La plateforme est destinée à former l'ensemble des acteurs du milieu sportif fédéral : **arbitres**, **entraîneurs**, **joueurs** et **administrateurs**. Elle constitue le bras académique numérique de la Fédération, avec une accréditation AMDRH garantissant la valeur et la reconnaissance internationale des certifications délivrées.

### 1.3 Parties prenantes principales

| Partie prenante | Rôle |
|---|---|
| **Fédération** | Maître d'ouvrage, décideur institutionnel |
| **AMDRH** | Partenaire académique, validateur des standards |
| **Équipe projet** | Maître d'œuvre technique et fonctionnel |
| **Apprenants** | Utilisateurs finaux (arbitres, entraîneurs, joueurs, administrateurs) |
| **Formateurs** | Créateurs et animateurs de contenu pédagogique |
| **Administrateurs plateforme** | Gestionnaires opérationnels de la plateforme |

### 1.4 Livrable attendu

Une plateforme web responsive et/ou application mobile e-learning complète, sécurisée, conforme aux normes internationales de formation en ligne (SCORM, xAPI, IMS LTI), intégrée à l'écosystème numérique de la Fédération.

---

## 2. Contexte et Enjeux

### 2.1 Contexte institutionnel

La Fédération souhaite professionnaliser et standardiser la formation de ses membres à travers un dispositif d'apprentissage à distance centralisé. Face à la dispersion géographique des arbitres, entraîneurs et joueurs, et aux contraintes de disponibilité inhérentes au milieu sportif, une solution digitale s'impose comme levier de montée en compétence continue.

### 2.2 Enjeux stratégiques

- **Enjeu de qualité :** Harmoniser le niveau de formation sur l'ensemble du territoire national.
- **Enjeu de reconnaissance :** Obtenir des certifications reconnues par la Fédération et l'AMDRH, avec une portée internationale.
- **Enjeu d'accessibilité :** Permettre à chaque membre de se former à son rythme, en tout lieu, sur tout support.
- **Enjeu de traçabilité :** Disposer d'un historique complet des formations suivies, en lien avec la gestion des licences fédérales.
- **Enjeu d'innovation :** Positionner la Fédération comme une institution pionnière dans l'adoption du e-learning sportif.

### 2.3 Problématiques identifiées

- Absence de dispositif de formation numérique unifié pour les membres.
- Processus manuels de délivrance des certifications, sources d'erreurs et de délais.
- Manque de suivi individualisé des parcours de formation.
- Déconnexion entre les données de formation et la base de gestion des licences.

---

## 3. Objectifs du Projet

### 3.1 Objectifs fonctionnels

| Priorité | Objectif |
|---|---|
| **MUST** | Création et gestion des comptes apprenants et formateurs |
| **MUST** | Gestion fine des droits d'accès par profil et rôle |
| **MUST** | Création, organisation et diffusion des cours multi-formats |
| **MUST** | Catégorisation des cours par profil (arbitres, entraîneurs, joueurs) |
| **MUST** | Parcours de formation structurés (Learning Paths) par profil |
| **MUST** | Évaluation via quiz et examens avec correction automatique |
| **MUST** | Attribution de certificats numériques et badges reconnus |
| **MUST** | Tableau de bord de suivi des performances |
| **MUST** | Messagerie interne et système de notifications |
| **MUST** | Intégration avec la plateforme Fédération (licences / certifications) |
| **SHOULD** | Coordination académique avec l'AMDRH |
| **COULD** | Application mobile native (iOS / Android) |
| **COULD** | Intelligence artificielle pour recommandation de cours |

### 3.2 Objectifs non-fonctionnels

- **Performance :** Temps de chargement des pages < 3 secondes, support de 5 000 utilisateurs simultanés.
- **Disponibilité :** SLA ≥ 99,5% (hors maintenance planifiée).
- **Sécurité :** Conformité RGPD, chiffrement des données sensibles, authentification forte.
- **Scalabilité :** Architecture capable de multiplier par 10 la charge sans refonte majeure.
- **Accessibilité :** Conformité WCAG 2.1 niveau AA.
- **Maintenabilité :** Code documenté, couverture de tests ≥ 80%.

---

## 4. Périmètre Fonctionnel

### 4.1 Dans le périmètre (In Scope)

- Gestion complète du cycle de vie des comptes utilisateurs
- Création, édition et publication de contenus pédagogiques
- Gestion des parcours de formation par profil
- Système d'évaluation et de certification
- Tableau de bord analytique pour toutes les typologies d'utilisateurs
- Messagerie interne et notifications push/email
- Intégration API avec le système de gestion des licences fédérales
- Module de validation académique AMDRH
- Génération de rapports et exports (PDF, Excel, CSV)

### 4.2 Hors périmètre (Out of Scope)

- Développement de l'application mobile (phase 2)
- Système de paiement en ligne (les formations sont gratuites pour les membres)
- Création de contenu vidéo (production externalisée, seule l'intégration est dans le scope)
- Refonte du site web principal de la Fédération
- Formation des formateurs à la pédagogie (hors scope digital)

---

## 5. Acteurs, Rôles et Droits d'Accès

### 5.1 Matrice des rôles

| Rôle | Description | Niveau d'accès |
|---|---|---|
| **Super Administrateur** | Équipe technique, gestion globale de la plateforme | Accès total |
| **Administrateur Fédération** | Gestionnaire institutionnel, paramétrage des règles fédérales | Élevé |
| **Coordinateur AMDRH** | Validation académique, supervision des standards | Élevé (validation) |
| **Formateur** | Création et animation des cours, suivi des apprenants | Modéré (périmètre cours) |
| **Arbitre (Apprenant)** | Accès aux cours arbitrage, parcours dédié | Basique (lecture/participation) |
| **Entraîneur (Apprenant)** | Accès aux cours coaching, parcours dédié | Basique (lecture/participation) |
| **Joueur (Apprenant)** | Accès aux cours joueurs, parcours dédié | Basique (lecture/participation) |
| **Administrateur Club** | Suivi des membres de son club | Limité (lecture club) |

### 5.2 Matrice des droits d'accès détaillée

| Fonctionnalité | Super Admin | Admin Féd. | Coord. AMDRH | Formateur | Arbitre | Entraîneur | Joueur | Admin Club |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Créer/supprimer des comptes | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Gérer les rôles | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Créer des cours | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Publier des cours | ✅ | ✅ | ✅ (validation) | ⬜ (soumettre) | ❌ | ❌ | ❌ | ❌ |
| Créer des quiz/examens | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Valider certifications | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Accéder aux cours assignés | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Voir tableau de bord global | ✅ | ✅ | ✅ (partiel) | ⬜ (ses cours) | ⬜ (soi) | ⬜ (soi) | ⬜ (soi) | ⬜ (club) |
| Envoyer messages | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Exporter rapports | ✅ | ✅ | ✅ | ⬜ (partiel) | ❌ | ❌ | ❌ | ⬜ (club) |
| Configurer intégration API | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

> ✅ Accès complet · ⬜ Accès partiel · ❌ Aucun accès

### 5.3 Profils apprenants détaillés

#### Profil Arbitre
- Accès exclusif aux modules : Règles du jeu, Gestion des situations de jeu, Éthique sportive, Techniques d'arbitrage.
- Parcours obligatoires définis par la Fédération et validés par l'AMDRH.
- Certifications liées au niveau d'arbitrage (régional, national, international).

#### Profil Entraîneur
- Accès exclusif aux modules : Méthodologie d'entraînement, Préparation physique, Tactique et stratégie, Psychologie sportive, Nutrition.
- Parcours différenciés selon le niveau de diplôme visé.

#### Profil Joueur
- Accès aux modules : Développement technique individuel, Règles du jeu, Éthique et fair-play, Prévention des blessures.
- Contenu adapté aux catégories d'âge (jeunes, seniors).

#### Profil Administrateur Club
- Modules : Gestion administrative d'un club, Réglementation fédérale, Finances sportives, Communication.

---

## 6. Modules Fonctionnels Détaillés

---

### 6.1 Module — Gestion des Comptes & Identités

#### Description
Système complet de gestion du cycle de vie des utilisateurs : inscription, activation, modification de profil, désactivation, suppression conforme RGPD.

#### Fonctionnalités

**Création de compte**
- Inscription en ligne via formulaire ou invitation par email.
- Import en masse depuis un fichier CSV/Excel (réservé administrateurs).
- Synchronisation automatique depuis la base des licenciés fédéraux.
- Champs obligatoires : Nom, Prénom, Email, Numéro de licence, Rôle/Profil, Club d'appartenance.
- Vérification d'email avec lien de confirmation (validité 48h).
- Mot de passe sécurisé : minimum 12 caractères, majuscule, chiffre, caractère spécial.

**Gestion du profil utilisateur**
- Photo de profil, biographie, coordonnées de contact.
- Numéro de licence fédérale (synchronisé automatiquement).
- Historique des formations suivies et certifications obtenues.
- Préférences de notification (email, push, in-app).
- Langue d'interface (Français, Arabe, Anglais).

**Authentification et sécurité**
- Authentification multi-facteurs (MFA/2FA) obligatoire pour formateurs et administrateurs.
- Connexion SSO (Single Sign-On) avec le portail fédéral.
- OAuth 2.0 / OpenID Connect.
- Gestion des sessions (expiration automatique après inactivité de 30 minutes).
- Journal d'activité de connexion (horodatage, IP, appareil).

**Gestion des droits**
- Attribution et révocation de rôles par les administrateurs.
- Héritage de droits par groupe/profil.
- Profils spéciaux multi-rôles (ex : un arbitre qui est aussi formateur).

#### Règles métier
- Un utilisateur sans licence fédérale active ne peut pas accéder aux parcours certifiants.
- Tout changement de rôle est journalisé et nécessite une validation administrateur.
- Un compte inactif depuis 12 mois est automatiquement archivé (non supprimé).
- La suppression définitive d'un compte requiert une validation à deux niveaux.

---

### 6.2 Module — Création & Organisation des Cours

#### Description
Environnement complet de création, d'organisation, de gestion éditoriale et de diffusion des contenus pédagogiques.

#### Fonctionnalités

**Création de cours**
- Éditeur de cours intégré WYSIWYG (What You See Is What You Get).
- Support multi-formats de contenu :
  - Vidéos (MP4, intégration YouTube/Vimeo, streaming HLS adaptatif).
  - Documents PDF (prévisualisation intégrée, téléchargement contrôlé).
  - Présentations (PowerPoint/Google Slides intégrés, HTML5).
  - Audio (MP3, podcasts pédagogiques).
  - Images et infographies.
  - Contenus interactifs : H5P, simulations, exercices pratiques.
  - Texte structuré avec éditeur riche (titres, listes, tableaux, code).
- Modèles (templates) de cours prédéfinis par la Fédération.
- Mode brouillon, prévisualisation avant publication.

**Structure d'un cours**
```
Cours
 ├── Informations générales (titre, description, durée estimée, niveau)
 ├── Prérequis (cours obligatoires avant inscription)
 ├── Objectifs pédagogiques (compétences visées)
 ├── Sections (chapitres)
 │    ├── Leçons (vidéo, texte, PDF, interactif)
 │    ├── Ressources annexes téléchargeables
 │    └── Quiz intermédiaire (optionnel)
 ├── Évaluation finale (quiz/examen)
 └── Ressources complémentaires
```

**Organisation et catégorisation**
- Catégories primaires : Arbitrage, Entraînement, Joueurs, Administration.
- Sous-catégories librement configurables par les administrateurs.
- Tags libres pour la recherche transversale.
- Niveaux de difficulté : Débutant, Intermédiaire, Avancé, Expert.
- Durée estimée de completion.
- Langue du cours (Français / Arabe / Anglais).

**Cycle de vie éditorial**
```
Brouillon → En révision → Validé AMDRH → Publié → Archivé
```
- Versionning des cours (historique des modifications).
- Commentaires internes entre formateur et coordinateur AMDRH lors de la révision.
- Notifications automatiques à chaque changement de statut.

**Restrictions d'accès**
- Cours libre (tous les apprenants du profil concerné).
- Cours conditionné (complétion d'un cours prérequis).
- Cours réservé (invitation nominative uniquement).
- Cours avec date de début et fin de disponibilité.

#### Règles métier
- Tout cours certifiant doit obligatoirement passer par la validation de l'AMDRH avant publication.
- Un cours sans examen final ne peut pas générer de certificat.
- La suppression d'un cours publié est interdite si des apprenants sont en cours de complétion ; il doit être archivé.
- Les vidéos de plus de 2 Go sont automatiquement compressées à l'import.

---

### 6.3 Module — Learning Paths (Parcours de Formation)

#### Description
Système de construction et de gestion de parcours pédagogiques structurés, adaptés à chaque profil, avec progression séquentielle ou flexible.

#### Fonctionnalités

**Création d'un Learning Path**
- Nom, description, objectif global, durée totale estimée.
- Profil cible : Arbitre, Entraîneur, Joueur, Administrateur.
- Niveau d'entrée requis.
- Sélection et ordonnancement des cours composant le parcours.
- Configuration du mode de progression :
  - **Séquentiel :** Les cours doivent être suivis dans l'ordre défini.
  - **Flexible :** L'apprenant choisit l'ordre, tous les cours sont accessibles.
  - **Hybride :** Certains cours sont obligatoires en séquence, d'autres libres.

**Jalons et points de contrôle**
- Définition de jalons intermédiaires (étapes clés dans le parcours).
- Score minimum requis pour passer au module suivant.
- Période de rattrapage en cas d'échec.

**Parcours obligatoires vs. optionnels**
- Parcours obligatoires : définis par la Fédération, assignés automatiquement selon le profil.
- Parcours optionnels : disponibles à l'inscription libre de l'apprenant.
- Parcours recommandés : suggérés par l'algorithme en fonction du profil et de l'historique.

**Parcours prédéfinis par profil**

| Profil | Parcours obligatoires | Exemple de contenu |
|---|---|---|
| **Arbitre** | Formation initiale arbitrage, Mise à niveau annuelle | Règles du jeu, Gestion du jeu, Communication |
| **Entraîneur** | Certification entraîneur niveau 1, niveau 2 | Méthodologie, Tactique, Préparation physique |
| **Joueur** | Initiation, Développement technique | Fondamentaux, Règles, Éthique |
| **Administrateur** | Gestion administrative de base | Réglementation, Finances, Communication |

**Suivi du parcours**
- Barre de progression globale et par cours.
- Estimation du temps restant pour compléter le parcours.
- Rappels automatiques si inactivité prolongée (> 7 jours).
- Reprise exacte où l'apprenant s'est arrêté (bookmark automatique).

#### Règles métier
- Un parcours certifiant ne peut être créé que par un Administrateur ou Formateur accrédité AMDRH.
- La modification d'un parcours en cours de réalisation par des apprenants nécessite une validation et une communication préalable.
- Un apprenant ne peut être inscrit simultanément qu'à 3 parcours maximum.

---

### 6.4 Module — Quiz, Examens & Évaluation

#### Description
Système complet de création et de gestion des évaluations formatives (quiz intermédiaires) et sommatives (examens finaux), avec correction automatique et notation.

#### Fonctionnalités

**Types d'évaluation**
- **Quiz formatif :** En cours de leçon, sans note officielle, nombre de tentatives illimité.
- **Quiz de chapitre :** À la fin d'une section, limité à 3 tentatives, note intégrée au score global.
- **Examen final :** À la fin du cours, encadré (durée limitée), 1 à 3 tentatives selon le paramétrage.

**Types de questions**
- QCM à réponse unique (choix simple).
- QCM à réponses multiples (choix multiples).
- Vrai/Faux.
- Réponse courte (correction automatique par comparaison lexicale ou IA).
- Glisser-déposer (appariement).
- Ordre chronologique (remise en ordre).
- Remplissage de lacunes (texte à compléter).
- Question avec image (cliquer sur la bonne zone).

**Paramétrage des évaluations**
- Durée maximale (chronomètre intégré, soumission automatique à expiration).
- Score de passage (seuil de réussite configurable, ex : 70%).
- Ordre des questions : fixe ou aléatoire.
- Ordre des réponses : fixe ou aléatoire.
- Affichage des résultats : immédiat, différé, ou en fin de correction.
- Affichage des corrections détaillées : avec explications par réponse.
- Pénalité pour mauvaise réponse (configurable).
- Anti-triche basique : plein écran forcé, alerte si changement d'onglet.

**Banque de questions**
- Bibliothèque partagée de questions par catégorie et sous-catégorie.
- Import de questions depuis CSV/XML (format QTI standard).
- Export de la banque de questions.
- Niveau de difficulté par question (Facile, Moyen, Difficile).
- Tirage aléatoire depuis la banque selon paramétrage.

**Notation et résultats**
- Score en points et en pourcentage.
- Statut : Réussi / Échoué / En cours.
- Historique de toutes les tentatives avec dates et scores.
- Feedback personnalisé selon la plage de score.
- Rapport de résultats détaillé accessible à l'apprenant et au formateur.

#### Règles métier
- Un examen final raté 3 fois consécutives déclenche automatiquement une alerte au formateur et à l'administrateur.
- Le score final d'un cours = pondération configurable entre quiz intermédiaires et examen final.
- Aucun certificat ne peut être émis si le score de l'examen final est inférieur au seuil de passage.
- Les questions et réponses sont chiffrées en base de données (anti-triche).

---

### 6.5 Module — Certification & Badges

#### Description
Système de reconnaissance et de valorisation des réussites académiques par des certificats numériques et des badges conformes aux standards internationaux (Open Badges, PDF signé).

#### Fonctionnalités

**Certificats numériques**

- Génération automatique à la complétion réussie d'un cours ou parcours certifiant.
- Certificat au format PDF avec :
  - Logo de la Fédération et logo AMDRH.
  - Nom complet du titulaire et numéro de licence.
  - Intitulé du cours/parcours complété.
  - Score obtenu.
  - Date d'obtention et date d'expiration (si applicable).
  - Signatures numériques du Président de la Fédération et du Directeur AMDRH.
  - QR Code unique de vérification d'authenticité.
  - Numéro de certificat unique (UUID).
- Envoi automatique par email au titulaire.
- Stockage sécurisé et accessible dans le profil utilisateur.
- Téléchargement disponible à tout moment.

**Badges numériques**

- Attribution automatique selon des règles configurables :
  - Complétion d'un cours.
  - Obtention d'un score exceptionnel (ex : > 95%).
  - Complétion d'un parcours complet.
  - Régularité (ex : connecté 30 jours d'affilée).
  - Premier cours complété (badge "Démarrage").
- Conformité Open Badges 2.0 / 3.0 (IMS Global).
- Badge partageable sur LinkedIn, réseaux sociaux, email.
- Intégration au profil apprenant.
- Galerie publique des badges (optionnel, paramétrable par l'utilisateur).

**Vérification d'authenticité**
- Page publique de vérification via QR Code ou numéro de certificat.
- API de vérification exposée pour les partenaires (clubs, employeurs).
- Lien direct entre le certificat et la licence fédérale dans la base de données.

**Expiration et renouvellement**
- Certificats avec date de validité configurables par type de formation.
- Alertes automatiques 30, 15 et 7 jours avant expiration.
- Parcours de renouvellement simplifié (mise à niveau, pas le parcours complet).

#### Règles métier
- Tout certificat certifiant doit être approuvé numériquement par un Coordinateur AMDRH avant émission.
- Les certificats sont non-modifiables après émission (immutabilité cryptographique).
- La révocation d'un certificat (ex : fraude) nécessite une procédure formelle double-validation.
- Les données de certification sont synchronisées avec la base fédérale des licences dans les 24h.

---

### 6.6 Module — Tableau de Bord & Analytics

#### Description
Espace centralisé de visualisation des données de performance, d'engagement et de progression, personnalisé selon le rôle de l'utilisateur.

#### Fonctionnalités

**Tableau de bord Apprenant**
- Progression globale (% de complétion des parcours assignés).
- Cours en cours avec reprise rapide (dernier module consulté).
- Prochains cours recommandés.
- Liste des badges et certificats obtenus.
- Calendrier des formations (dates limites, examens planifiés).
- Temps total d'apprentissage (cumul des heures).
- Score moyen sur les évaluations.
- Comparatif avec la moyenne du groupe (anonymisé).

**Tableau de bord Formateur**
- Vue globale des cours créés : statut, nombre d'inscrits, taux de complétion.
- Statistiques par cours : engagement vidéo (durée moyenne de visionnage), score moyen aux quiz.
- Liste des apprenants avec leur progression détaillée.
- Alertes apprenants en difficulté (score < seuil, inactivité prolongée).
- Questions les plus échouées aux examens (analyse qualité du contenu).
- Comparaison des performances entre promotions/sessions.

**Tableau de bord Administrateur Fédération**
- Vue macro : nombre d'inscrits, taux de complétion global, certifications délivrées.
- Répartition par profil (arbitres, entraîneurs, joueurs, administrateurs).
- Répartition géographique (par région/club).
- Tendances temporelles (courbes d'évolution mensuelles).
- Top 10 des cours les plus suivis.
- Alertes systèmes (cours expirés, comptes inactifs, certificats à renouveler).
- Export des rapports en PDF, Excel, CSV.

**Tableau de bord Coordinateur AMDRH**
- Statut de validation des cours soumis (en attente, validés, rejetés).
- Conformité des certifications avec les standards académiques.
- Rapport de qualité pédagogique globale.
- Suivi des formations co-développées AMDRH.

**Tableau de bord Administrateur Club**
- Progression des membres du club par parcours.
- Taux de complétion et certifications obtenues dans le club.
- Membres en retard sur leurs formations obligatoires.

**Analytics avancés**
- Heatmaps d'engagement sur les vidéos (segments les plus vus/ignorés).
- Funnel d'abandon par module.
- Analyse des questions d'examen (taux de réussite par question).
- Corrélation entre engagement et performance.

#### Règles métier
- Les données personnelles des apprenants ne sont accessibles au niveau Administrateur Club que si l'apprenant appartient à ce club.
- Les rapports d'analytics sont générés avec un délai de 24h maximum après l'événement source.
- Les données sont conservées 5 ans minimum (conformité RGPD en contexte formation professionnelle).

---

### 6.7 Module — Messagerie & Notifications

#### Description
Système de communication interne sécurisé et système de notifications multicanal pour fluidifier les échanges entre tous les acteurs de la plateforme.

#### Fonctionnalités

**Messagerie interne**
- Messagerie directe (1 à 1) entre utilisateurs de la plateforme.
- Messagerie de groupe (canaux de cours, groupes de promotion).
- Forum de discussion par cours (threads thématiques).
- Riche éditeur de texte dans les messages (gras, liens, fichiers joints).
- Pièces jointes : images, PDF, liens.
- Modération des messages par formateurs et administrateurs.
- Signalement de contenu inapproprié.
- Archivage automatique des conversations après 1 an.
- Recherche plein-texte dans l'historique des messages.

**Canaux de communication**
- **Cours :** Forum dédié à chaque cours, visible par tous les inscrits et le formateur.
- **Promotion/Groupe :** Canal spécifique à une cohorte d'apprenants.
- **Annonces :** Canal broadcast (administrateurs → tous les membres d'un profil).
- **Support technique :** Canal dédié aux demandes d'assistance.

**Système de notifications**

| Événement déclencheur | Canal | Destinataire |
|---|---|---|
| Inscription à un cours | Email + In-app | Apprenant |
| Nouveau cours publié dans sa catégorie | Email + Push | Apprenants du profil |
| Quiz/Examen disponible | Email + In-app | Apprenant |
| Résultat d'examen disponible | Email + In-app | Apprenant |
| Certificat émis | Email + In-app | Apprenant |
| Certificat bientôt expiré | Email | Apprenant |
| Nouveau message reçu | Push + In-app | Destinataire |
| Cours soumis à validation | Email + In-app | Coordinateur AMDRH |
| Cours validé/rejeté | Email + In-app | Formateur |
| Apprenant en difficulté | Email | Formateur + Admin |
| Rapport hebdomadaire | Email | Administrateurs |

**Gestion des préférences de notification**
- L'utilisateur peut activer/désactiver chaque type de notification.
- Choix du canal préféré par type d'événement.
- Heures de quiet mode (pas de notifications entre 22h et 7h).

#### Règles métier
- Les messages privés sont chiffrés de bout en bout.
- Un formateur ne peut pas envoyer de message direct non sollicité à un apprenant (anti-spam).
- Les messages de forums sont conservés pendant toute la durée de vie du cours + 2 ans.

---

### 6.8 Module — Intégration Fédération & AMDRH

#### Description
Couche d'intégration technique et fonctionnelle assurant la synchronisation bidirectionnelle avec le système d'information de la Fédération et la coordination avec l'AMDRH.

#### Fonctionnalités

**Intégration avec la Fédération**

*Synchronisation des licences :*
- Import automatique quotidien (ou temps réel via webhook) des licenciés actifs depuis la base fédérale.
- Création/mise à jour automatique des comptes selon le statut de la licence.
- Désactivation automatique du compte si la licence est suspendue ou expirée.
- Synchronisation du numéro de licence, du profil, du club, de la région.

*Synchronisation des certifications :*
- Export automatique des certifications obtenues vers la base fédérale.
- Mise à jour du profil fédéral du licencié avec ses certifications e-learning.
- Vérification de la cohérence entre les niveaux de certification et les droits fédéraux (ex : niveau d'arbitrage).

*API d'exposition :*
- API REST sécurisée exposée pour interrogation par le portail fédéral.
- Endpoints : statut d'un apprenant, liste des certifications, progression dans un parcours.
- Documentation API complète (OpenAPI 3.0 / Swagger).
- Rate limiting et authentification par API Key + JWT.

**Intégration AMDRH**

*Processus de validation académique :*
- Soumission des cours à valider directement dans la plateforme.
- Workflow de révision : annotions, commentaires, demandes de modifications.
- Validation ou rejet avec rapport motivé.
- Signature numérique AMDRH apposée sur les certifications validées.

*Normes et référentiels :*
- Import du référentiel de compétences AMDRH.
- Alignement des objectifs pédagogiques sur les standards académiques.
- Rapport de conformité AMDRH générable à la demande.

*Co-gestion des certifications :*
- Accès lecture au tableau de bord des certifications pour l'AMDRH.
- Génération de rapports académiques co-signés.

#### Règles métier
- La synchronisation avec la Fédération doit être idempotente (exécuter 2 fois le même import ne doit pas créer de doublons).
- Toute erreur de synchronisation est journalisée et génère une alerte immédiate à l'équipe technique.
- L'API Fédération doit être versionnée et rétrocompatible sur au moins 2 versions majeures.
- La validation AMDRH est obligatoire pour tout cours émettant un certificat reconnu.

---

### 6.9 Module — Administration Globale

#### Description
Interface d'administration centralisée pour la configuration et la supervision de l'ensemble de la plateforme.

#### Fonctionnalités

**Configuration de la plateforme**
- Paramètres généraux : nom, logo, couleurs (branding), langue par défaut.
- Configuration des rôles et permissions (matrice d'accès configurable).
- Gestion des catégories et sous-catégories de cours.
- Paramétrage des politiques de mot de passe et de session.
- Configuration SMTP pour l'envoi des emails.
- Gestion des templates d'emails et de notifications.

**Gestion des utilisateurs**
- Recherche, filtrage et export de la liste des utilisateurs.
- Actions en masse : activer, désactiver, changer de rôle.
- Import/Export CSV/Excel.
- Visualisation du journal d'activité par utilisateur.

**Gestion du contenu**
- Vue d'ensemble de tous les cours : statut, formateur, inscrits.
- Gestion des cours orphelins, obsolètes, en brouillon.
- Configuration du workflow de validation.
- Gestion de la médiathèque (fichiers, vidéos, documents).

**Rapports système**
- Rapport d'utilisation de l'espace de stockage.
- Rapport d'activité des connexions.
- Rapport de performance technique (temps de réponse, erreurs).
- Audit trail complet (qui a fait quoi, quand).

**Maintenance**
- Mode maintenance activable (page de maintenance affichée aux utilisateurs).
- Planification de sauvegardes automatiques.
- Gestion des intégrations tierces (statut, logs d'erreur).

---

## 7. Cas d'Usage (User Stories) par Rôle

### 7.1 User Stories — Arbitre (Apprenant)

| ID | En tant que... | Je veux... | Afin de... | Critères d'acceptation |
|---|---|---|---|---|
| US-ARB-01 | Arbitre | M'inscrire à la plateforme | Accéder aux formations | Compte créé, email de confirmation reçu, accès à mon tableau de bord |
| US-ARB-02 | Arbitre | Voir les cours disponibles dans ma catégorie | Choisir les formations pertinentes | Liste filtrée sur "Arbitrage", triable par durée/niveau/note |
| US-ARB-03 | Arbitre | Suivre une vidéo de formation | Acquérir les connaissances | Lecteur vidéo fonctionnel, progression sauvegardée, reprise possible |
| US-ARB-04 | Arbitre | Télécharger les supports PDF | Travailler hors-ligne | PDF téléchargeable depuis la fiche de la leçon |
| US-ARB-05 | Arbitre | Passer un quiz intermédiaire | Tester mes connaissances | Quiz accessible, résultats immédiats, corrections affichées |
| US-ARB-06 | Arbitre | Passer l'examen final de certification | Valider mes acquis | Examen chronométré, score calculé, résultat affiché sous 48h |
| US-ARB-07 | Arbitre | Recevoir mon certificat | Prouver ma certification | Certificat PDF disponible dans mon profil + reçu par email |
| US-ARB-08 | Arbitre | Voir ma progression globale | Rester motivé | Tableau de bord avec % complétion, badges, temps passé |
| US-ARB-09 | Arbitre | Poser une question dans le forum du cours | Obtenir de l'aide | Question publiée, formateur notifié, réponse accessible à tous |
| US-ARB-10 | Arbitre | Recevoir une alerte avant l'expiration de mon certificat | Renouveler à temps | Notification email 30/15/7 jours avant expiration |

### 7.2 User Stories — Entraîneur (Apprenant)

| ID | En tant que... | Je veux... | Afin de... | Critères d'acceptation |
|---|---|---|---|---|
| US-ENT-01 | Entraîneur | Accéder à mon parcours de formation défini | Suivre la progression recommandée | Parcours visible dès connexion, modules ordonnés |
| US-ENT-02 | Entraîneur | Reprendre un cours là où je me suis arrêté | Gérer mon temps | Système de bookmark automatique, reprise au bon endroit |
| US-ENT-03 | Entraîneur | Comparer mes scores avec la moyenne du groupe | Me situer parmi mes pairs | Données agrégées et anonymisées affichées sur mon tableau de bord |
| US-ENT-04 | Entraîneur | Partager un badge sur LinkedIn | Valoriser ma formation | Bouton de partage LinkedIn sur chaque badge |
| US-ENT-05 | Entraîneur | Contacter directement mon formateur | Poser une question privée | Messagerie directe accessible depuis la fiche cours |

### 7.3 User Stories — Formateur

| ID | En tant que... | Je veux... | Afin de... | Critères d'acceptation |
|---|---|---|---|---|
| US-FOR-01 | Formateur | Créer un nouveau cours avec vidéos et PDF | Partager mes connaissances | Éditeur complet disponible, upload multi-formats fonctionnel |
| US-FOR-02 | Formateur | Organiser mon cours en sections et leçons | Structurer la progression | Structure drag-and-drop de sections/leçons |
| US-FOR-03 | Formateur | Créer une banque de questions pour mes quiz | Varier les évaluations | Interface de création de questions avec tous les types supportés |
| US-FOR-04 | Formateur | Soumettre mon cours à la validation AMDRH | Obtenir l'accréditation | Bouton "Soumettre pour validation", notification à l'AMDRH envoyée |
| US-FOR-05 | Formateur | Voir les statistiques d'engagement de mes cours | Améliorer le contenu | Dashboard formateur avec métriques détaillées |
| US-FOR-06 | Formateur | Identifier les apprenants en difficulté | Intervenir proactivement | Alerte automatique + liste des apprenants sous le seuil |
| US-FOR-07 | Formateur | Répondre aux questions du forum de cours | Animer la communauté | Interface de réponse aux threads avec notification à l'auteur |
| US-FOR-08 | Formateur | Mettre à jour un cours existant sans rompre la progression | Maintenir la qualité | Versionning activé, apprenants en cours non impactés |

### 7.4 User Stories — Administrateur Fédération

| ID | En tant que... | Je veux... | Afin de... | Critères d'acceptation |
|---|---|---|---|---|
| US-ADM-01 | Administrateur | Créer des comptes en masse depuis un fichier CSV | Onboarder des promotions | Import CSV avec validation des données, rapport d'erreurs |
| US-ADM-02 | Administrateur | Configurer les parcours obligatoires par profil | Uniformiser la formation | Interface de gestion des parcours avec assignation par profil |
| US-ADM-03 | Administrateur | Voir le tableau de bord global de la plateforme | Piloter la performance | Dashboard avec KPIs en temps réel |
| US-ADM-04 | Administrateur | Exporter un rapport de certifications | Fournir des données à la Fédération | Export PDF/Excel filtrable par période, profil, région |
| US-ADM-05 | Administrateur | Synchroniser manuellement avec la base des licences | Corriger une désynchronisation | Bouton de synchronisation manuelle avec rapport de résultat |
| US-ADM-06 | Administrateur | Révoquer un certificat frauduleux | Maintenir l'intégrité | Workflow de révocation documenté, certificat invalidé et notifié |

### 7.5 User Stories — Coordinateur AMDRH

| ID | En tant que... | Je veux... | Afin de... | Critères d'acceptation |
|---|---|---|---|---|
| US-AMDRH-01 | Coordinateur AMDRH | Recevoir les cours soumis à validation | Effectuer la révision académique | Notification, accès au cours en mode révision avec annotations |
| US-AMDRH-02 | Coordinateur AMDRH | Annoter les sections d'un cours | Demander des modifications | Outil d'annotation inline dans le cours, commentaires reçus par formateur |
| US-AMDRH-03 | Coordinateur AMDRH | Valider ou rejeter un cours avec un rapport motivé | Exercer le rôle académique | Interface de validation avec champ de commentaire, statut mis à jour |
| US-AMDRH-04 | Coordinateur AMDRH | Accéder au rapport des certifications délivrées | Assurer le suivi académique | Rapport accessible, filtrable, exportable |

---

## 8. Workflows Détaillés

### 8.1 Workflow : Inscription et Onboarding Apprenant

```
[Début]
    │
    ▼
Réception invitation email / inscription spontanée
    │
    ▼
Remplissage du formulaire d'inscription
(Nom, Prénom, Email, N° Licence, Profil)
    │
    ▼
Vérification automatique du numéro de licence
dans la base fédérale
    │
    ├──[Licence valide]──────────────────────────────────────┐
    │                                                        │
    └──[Licence invalide/introuvable]                        │
            │                                               │
            ▼                                               │
    Message d'erreur + contact administrateur               │
            │                                               │
           [Fin]                                            │
                                                            ▼
                                              Envoi email de confirmation
                                                            │
                                                            ▼
                                              Clic sur lien de confirmation
                                              (valide 48h)
                                                            │
                                                            ▼
                                              Création du compte activé
                                                            │
                                                            ▼
                                              Assignation automatique du profil
                                              (Arbitre / Entraîneur / Joueur / Admin)
                                                            │
                                                            ▼
                                              Assignation des parcours obligatoires
                                                            │
                                                            ▼
                                              Email de bienvenue + guide de démarrage
                                                            │
                                                            ▼
                                              Accès au tableau de bord personnalisé
                                                            │
                                                          [Fin]
```

### 8.2 Workflow : Création et Publication d'un Cours

```
[Formateur]
    │
    ▼
Création d'un nouveau cours (brouillon)
    │
    ▼
Ajout du contenu (vidéos, PDF, textes, quiz)
    │
    ▼
Prévisualisation du cours
    │
    ├──[Contenu satisfaisant]──────────────────────────────┐
    │                                                       │
    └──[Modifications nécessaires]                          │
            │                                              │
            ▼                                              │
    Édition et correction du contenu                       │
            │                                              │
    [retour à l'étape précédente]                          │
                                                           ▼
                                             Soumission à validation AMDRH
                                                           │
                                                           ▼
                                  ┌────────────────────────────────────────┐
                                  │         [AMDRH - Révision]             │
                                  │  Examen du cours (contenu, pédagogie,  │
                                  │  conformité aux standards)              │
                                  └────────────────────────────────────────┘
                                                           │
                                      ┌────────────────────┴────────────────────┐
                                      │                                          │
                               [Validé]                                   [Rejeté]
                                      │                                          │
                                      ▼                                          ▼
                            Notification formateur                Rapport de rejet + commentaires
                                      │                                          │
                                      ▼                                          ▼
                            Cours en statut "Publié"           Retour en statut "En révision"
                                      │                         avec annotations AMDRH
                                      ▼                                          │
                            Disponible aux apprenants          Formateur modifie le cours
                            du profil cible                                      │
                                      │                         [retour à la soumission]
                                    [Fin]
```

### 8.3 Workflow : Passage d'un Examen et Certification

```
[Apprenant]
    │
    ▼
Complétion de tous les modules du cours
(≥ 100% du contenu visionné/parcouru)
    │
    ▼
Accès débloqué à l'examen final
    │
    ▼
Démarrage de l'examen (chronomètre lancé)
    │
    ▼
Réponse aux questions (soumission manuelle
ou automatique à expiration du temps)
    │
    ▼
Calcul automatique du score
    │
    ├──[Score ≥ Seuil de passage]──────────────────────────┐
    │                                                       │
    └──[Score < Seuil]                                     │
            │                                             │
            ▼                                             │
    Affichage du score + corrections                      │
            │                                             │
            ├──[Tentatives restantes]                     │
            │        │                                    │
            │        ▼                                    │
            │   Période d'attente (configurable)          │
            │        │                                    │
            │        ▼                                    │
            │   Nouvelle tentative                        │
            │        │                                    │
            │  [retour à démarrage examen]                │
            │                                             │
            └──[Plus de tentatives]                       │
                     │                                    │
                     ▼                                    ▼
              Alerte formateur               Affichage des résultats
              + administrateur              (Réussi + score)
                     │                                    │
                   [Fin]                                  ▼
                                           Génération du certificat numérique
                                                          │
                                                          ▼
                                           Validation automatique
                                           (ou manuelle AMDRH si requis)
                                                          │
                                                          ▼
                                           Email avec certificat PDF
                                                          │
                                                          ▼
                                           Mise à jour du profil apprenant
                                                          │
                                                          ▼
                                           Synchronisation avec base fédérale
                                                        [Fin]
```

### 8.4 Workflow : Synchronisation avec la Base Fédérale

```
[Système]
    │
    ▼
Déclenchement (planifié quotidien 02h00 ou webhook)
    │
    ▼
Appel API base fédérale des licenciés
    │
    ├──[Succès]──────────────────────────────────────────────┐
    │                                                         │
    └──[Erreur de connexion]                                  │
            │                                                │
            ▼                                                │
    Retry × 3 (délai exponentiel)                           │
            │                                                │
            ├──[Succès]──────────────────────────────────────┤
            │                                                │
            └──[Échec définitif]                             │
                    │                                        │
                    ▼                                        │
            Alerte critique                                  │
            (email + SMS équipe tech)                        │
                    │                                        │
                  [Fin]                                      │
                                                             ▼
                                              Traitement des données reçues
                                                             │
                                              Pour chaque licencié :
                                              ┌──────────────────────────────────┐
                                              │ Compte existant → Mise à jour    │
                                              │ Nouveau licencié → Création auto  │
                                              │ Licence expirée → Désactivation  │
                                              │ Licence suspendue → Blocage accès│
                                              └──────────────────────────────────┘
                                                             │
                                                             ▼
                                              Génération du rapport de synchronisation
                                                             │
                                                             ▼
                                              Envoi rapport par email aux admins
                                                           [Fin]
```

---

## 9. Architecture Technique

### 9.1 Vue d'ensemble de l'architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTS                              │
│   Navigateur Web (Chrome, Firefox, Safari, Edge)            │
│   Application Mobile iOS / Android (Phase 2)                │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS / WSS
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    CDN (CloudFront)                         │
│       Fichiers statiques · Vidéos · Assets                  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              API GATEWAY / Load Balancer                    │
│          Rate Limiting · SSL Termination · WAF              │
└──────────────────────┬──────────────────────────────────────┘
                       │
          ┌────────────┼────────────┐
          │            │            │
          ▼            ▼            ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ API Backend │ │  Service    │ │  Service    │
│  (REST +    │ │  Vidéo /   │ │  Notif. /  │
│  GraphQL)   │ │  Streaming  │ │  Email      │
└──────┬──────┘ └─────────────┘ └─────────────┘
       │
       ├──── Base de données principale (PostgreSQL)
       ├──── Cache distribué (Redis)
       ├──── File d'attente de tâches (RabbitMQ / Kafka)
       ├──── Stockage objets (S3-compatible)
       └──── Service de recherche (Elasticsearch)
```

### 9.2 Stack technique recommandée

| Couche | Technologies recommandées |
|---|---|
| **Frontend** | React.js / Next.js, TypeScript, Tailwind CSS |
| **Backend API** | Node.js (NestJS) ou Python (FastAPI/Django REST) |
| **Base de données** | PostgreSQL (données relationnelles), MongoDB (contenu) |
| **Cache** | Redis |
| **File de messages** | RabbitMQ ou Apache Kafka |
| **Stockage médias** | AWS S3 ou compatible (vidéos, PDF, images) |
| **Streaming vidéo** | AWS CloudFront + MediaConvert (transcodage HLS) |
| **Recherche** | Elasticsearch ou Meilisearch |
| **Authentification** | Keycloak (SSO, OAuth2, OpenID Connect) |
| **Emails** | AWS SES ou SendGrid |
| **Push notifications** | Firebase Cloud Messaging (FCM) |
| **Monitoring** | Prometheus + Grafana, Sentry (erreurs) |
| **CI/CD** | GitLab CI / GitHub Actions |
| **Containerisation** | Docker + Kubernetes |
| **Infrastructure** | AWS / Azure / OVHcloud (souveraineté option) |

### 9.3 Patterns d'architecture

- **Architecture microservices** pour les services critiques (auth, certification, notification).
- **API RESTful** pour les intégrations tierces, documentée OpenAPI 3.0.
- **Event-driven** pour les actions asynchrones (certification, notifications, sync).
- **CQRS** (Command Query Responsibility Segregation) pour les modules d'analytics.
- **Hexagonal (Ports & Adapters)** pour l'isolation des dépendances techniques.

### 9.4 Exigences de performance

| Métrique | Cible |
|---|---|
| Temps de réponse API (p95) | < 500 ms |
| Temps de chargement page initiale | < 3 secondes |
| Disponibilité (SLA) | ≥ 99,5% |
| Utilisateurs simultanés supportés | 5 000 |
| Temps de chargement vidéo (démarrage) | < 2 secondes |
| Capacité de stockage vidéo | 10 To extensible |
| Temps de génération d'un certificat | < 5 secondes |

### 9.5 Stratégie de sauvegarde

- Sauvegardes automatiques de la base de données : toutes les 6 heures.
- Rétention des sauvegardes : 30 jours.
- Test de restauration : mensuel.
- Réplication géographique des données (actif-passif, RTO < 4h, RPO < 1h).

---

## 10. Sécurité et Conformité

### 10.1 Principes de sécurité (Security by Design)

- **Moindre privilège :** Chaque composant n'a accès qu'aux ressources strictement nécessaires.
- **Défense en profondeur :** Plusieurs couches de protection indépendantes.
- **Zero Trust :** Aucune confiance implicite, vérification systématique.
- **Secure by Default :** La configuration par défaut est la plus sécurisée.

### 10.2 Authentification et autorisation

- Authentification multi-facteurs (TOTP, SMS) obligatoire pour les rôles sensibles.
- Tokens JWT avec durée de vie courte (15 minutes) + Refresh Token (rotation).
- OAuth 2.0 + OpenID Connect pour le SSO.
- Politique de mot de passe stricte (OWASP guidelines).
- Blocage du compte après 5 tentatives échouées (déverrouillage par email).
- Liste blanche d'IPs pour l'accès aux interfaces d'administration.

### 10.3 Chiffrement

- Toutes les communications : TLS 1.3 minimum.
- Données sensibles en base : chiffrement AES-256.
- Mots de passe : hachage bcrypt (coût ≥ 12).
- Questions/réponses d'examen : chiffrées au repos.
- Certificats numériques : signature RSA-4096 ou ECDSA.

### 10.4 Conformité RGPD

- **Registre des traitements** documenté pour tous les traitements de données personnelles.
- **Consentement explicite** collecté lors de l'inscription.
- **Droit à l'oubli :** Processus de suppression ou d'anonymisation des données à la demande.
- **Droit d'accès et de portabilité :** Export des données personnelles en JSON/CSV.
- **Minimisation des données :** Seules les données nécessaires sont collectées.
- **DPO (Data Protection Officer)** désigné (ou rôle assumé par un administrateur formé).
- **Politique de confidentialité** claire et accessible.

### 10.5 Audit et journalisation

- Log complet de toutes les actions sensibles (connexion, modification de rôle, émission de certificat, accès aux données).
- Logs immuables (write-once) conservés 1 an minimum.
- Alertes en temps réel sur les événements suspects (brute force, accès hors-horaires, volume anormal).
- Rapport de sécurité mensuel pour les administrateurs.

### 10.6 Tests de sécurité

- Tests de pénétration (Pentest) : annuel par prestataire externe certifié OSCP.
- OWASP Top 10 : audit à chaque release majeure.
- Analyse des dépendances (SAST/DAST) : intégrée dans la CI/CD.
- Scan de vulnérabilités : hebdomadaire.

---

## 11. Exigences UX/UI

### 11.1 Principes de design

- **Minimalisme :** Interface épurée, informations essentielles en premier plan.
- **Clarté :** Hiérarchie visuelle claire, typographie lisible, contrastes respectant les normes WCAG.
- **Cohérence :** Design system unifié (composants réutilisables, palette de couleurs, typographie définie).
- **Progressivité :** Révéler la complexité progressivement selon le niveau de l'utilisateur.
- **Feedback immédiat :** Toute action utilisateur doit produire un retour visuel dans les 200ms.

### 11.2 Accessibilité

- Conformité **WCAG 2.1 niveau AA** minimum.
- Support des lecteurs d'écran (ARIA labels).
- Navigation entièrement possible au clavier.
- Sous-titres obligatoires sur toutes les vidéos pédagogiques.
- Mode contraste élevé disponible.
- Taille de police ajustable.

### 11.3 Responsive design

- **Mobile-first** : conception prioritairement pour mobile, adaptation tablette et desktop.
- Points de rupture : 375px (mobile), 768px (tablette), 1024px (desktop), 1440px (large desktop).
- Adaptation du lecteur vidéo en plein écran sur mobile.
- Navigation simplifiée sur petit écran (menu hamburger, navigation inférieure).

### 11.4 Composants UX prioritaires

| Composant | Exigence |
|---|---|
| **Lecteur vidéo** | Contrôles complets, vitesse variable (0.5x à 2x), sous-titres, plein écran, reprise auto |
| **Lecteur PDF** | Prévisualisation intégrée, navigation pages, zoom, téléchargement |
| **Quiz** | Interface claire, progression visible, timer discret mais présent |
| **Barre de progression** | Affichée systématiquement dans le parcours, mise à jour en temps réel |
| **Tableau de bord** | Widgets réorganisables, graphiques interactifs, filtre par période |
| **Messagerie** | Interface temps réel (WebSocket), indicateurs de lecture, notifications |

### 11.5 Charte graphique

- Palette de couleurs aux couleurs de la Fédération (à définir avec le commanditaire).
- Logos Fédération et AMDRH intégrés dans le header et les certificats.
- Typographie : font lisible, support de l'arabe (RTL) et du latin.
- Iconographie cohérente (bibliothèque d'icônes standard : Phosphor Icons ou Lucide).

---

## 12. Normes et Standards du Secteur

### 12.1 Standards e-Learning

| Standard | Description | Application |
|---|---|---|
| **SCORM 1.2 / 2004** | Standard d'emballage et de communication des cours | Import/export de cours, compatibilité LMS |
| **xAPI (Tin Can API)** | Tracking avancé des apprentissages | Activités hors-ligne, VR, simulations |
| **IMS LTI 1.3** | Interopérabilité entre outils pédagogiques | Intégration d'outils externes dans les cours |
| **IMS QTI 2.1** | Format des questions et tests | Import/export de banques de questions |
| **Open Badges 3.0** | Standard de badges numériques | Émission de badges vérifiables et partageables |
| **W3C VC (Verifiable Credentials)** | Credentials numériques vérifiables | Certificats tamper-proof |

### 12.2 Standards de développement logiciel

| Domaine | Standard / Pratique |
|---|---|
| **Code** | Clean Code (Robert C. Martin), SOLID, DRY, KISS |
| **API** | REST guidelines, versioning sémantique (SemVer), OpenAPI 3.0 |
| **Sécurité** | OWASP Top 10, ASVS niveau 2, CWE/SANS |
| **Tests** | TDD (Test-Driven Development), couverture ≥ 80%, pyramide de tests |
| **Documentation** | Documentation as Code, OpenAPI, ADR (Architecture Decision Records) |
| **CI/CD** | Git Flow ou Trunk-Based Development, automated testing pipeline |
| **Accessibilité** | WCAG 2.1 AA, ARIA 1.2 |
| **Performance** | Web Vitals (LCP, FID, CLS), RAIL Model |

### 12.3 Standards de données

- ISO/IEC 27001 : Gestion de la sécurité de l'information.
- ISO/IEC 27018 : Protection des données personnelles dans le cloud.
- RGPD (UE 2016/679) : Protection des données personnelles.
- Loi 09-08 marocaine : Protection des données personnelles (contexte Maroc).

### 12.4 Bonnes pratiques pédagogiques

- Alignement constructiviste (objectifs → activités → évaluations).
- Charge cognitive maîtrisée (segmentation des contenus, micro-learning).
- Rétention espacée (espaced repetition) pour les révisions.
- Gamification mesurée (badges, progression, classements) pour l'engagement.
- Diversité des modalités pédagogiques (vidéo, texte, interactif, quiz).

---

## 13. Indicateurs de Performance (KPIs)

### 13.1 KPIs d'adoption

| Indicateur | Cible à 6 mois | Cible à 12 mois |
|---|---|---|
| Taux d'activation des comptes | > 80% | > 90% |
| Utilisateurs actifs mensuels (MAU) | > 60% des inscrits | > 75% des inscrits |
| Nombre de cours complétés / utilisateur / mois | > 1 | > 2 |
| Taux de retour (>= 2 sessions/semaine) | > 40% | > 55% |

### 13.2 KPIs de performance pédagogique

| Indicateur | Cible |
|---|---|
| Taux de complétion des cours | > 70% |
| Taux de réussite aux examens finaux | > 75% |
| Score moyen aux examens | > 78% |
| Taux de satisfaction des apprenants (NPS) | > 7/10 |
| Délai moyen de completion d'un parcours | Conforme au parcours théorique ± 20% |

### 13.3 KPIs de certification

| Indicateur | Cible |
|---|---|
| Certificats émis / mois | Croissance de 10% MoM |
| Délai de génération d'un certificat | < 5 secondes |
| Taux de renouvellement avant expiration | > 80% |
| Taux de vérification de certificats (via QR) | Traçable |

### 13.4 KPIs techniques

| Indicateur | Cible |
|---|---|
| Disponibilité de la plateforme | ≥ 99,5% |
| Temps de réponse API (p95) | < 500 ms |
| Taux d'erreurs HTTP (5xx) | < 0,1% |
| Délai de résolution des incidents critiques | < 4 heures |
| Couverture de tests | ≥ 80% |

### 13.5 KPIs de contenu

| Indicateur | Cible |
|---|---|
| Nombre de cours publiés à 6 mois | ≥ 30 |
| Délai moyen de validation AMDRH | < 5 jours ouvrés |
| Taux de cours rejetés à la première soumission | < 20% |
| Taux de mise à jour des cours (qualité) | Revue annuelle de 100% des cours |

---

## 14. Plan de Tests et Recette

### 14.1 Stratégie de tests

La stratégie s'appuie sur la pyramide de tests :

```
                    ▲
                   /|\
                  / | \  Tests End-to-End (E2E)
                 /  |  \  (Cypress / Playwright)
                /   |   \  — Parcours utilisateurs critiques
               /─────────\
              /           \  Tests d'intégration
             /      ██    \  (Jest / Supertest)
            /   ████████   \  — Modules, APIs, intégrations
           /─────────────────\
          /                   \  Tests unitaires
         /   ████████████████  \  (Jest / Vitest / PyTest)
        /─────────────────────────\  — Fonctions, composants
```

### 14.2 Niveaux de tests

**Tests unitaires**
- Couverture ≥ 80% du code métier.
- Exécution dans la CI/CD à chaque push.
- Durée d'exécution cible < 5 minutes.

**Tests d'intégration**
- Tests des API endpoints (contrats, codes HTTP, formats de réponse).
- Tests des interactions avec la base de données.
- Tests des intégrations tierces (Fédération API, AMDRH, emails).
- Exécution dans la CI/CD à chaque merge request.

**Tests E2E**
- Parcours critiques couverts :
  - Inscription et onboarding complet.
  - Accès et completion d'un cours.
  - Passage d'un examen et génération de certificat.
  - Workflow de création et validation de cours (formateur + AMDRH).
  - Synchronisation avec la Fédération.
- Exécution avant chaque déploiement en production.

**Tests de performance**
- Tests de charge : simulation de 5 000 utilisateurs simultanés (k6 / Locust).
- Tests de stress : montée en charge jusqu'à la rupture pour identifier les limites.
- Tests de streaming vidéo : 1 000 flux simultanés.

**Tests de sécurité**
- SAST (Static Application Security Testing) : à chaque push.
- DAST (Dynamic Application Security Testing) : hebdomadaire sur l'environnement de staging.
- Pentest : annuel.

**Tests d'accessibilité**
- Audit automatique avec aXe ou Lighthouse à chaque déploiement.
- Audit manuel (lecteur d'écran) avant chaque release majeure.

### 14.3 Environnements

| Environnement | Usage |
|---|---|
| **Développement (dev)** | Travail quotidien des développeurs |
| **Test / Staging** | Validation avant production, tests E2E |
| **Pré-production** | Recette client, tests utilisateurs |
| **Production** | Plateforme en ligne pour les utilisateurs |

### 14.4 Critères d'acceptation (Definition of Done)

Un développement est considéré terminé si :
- ✅ Le code est reviewé par au moins 1 pair.
- ✅ Les tests unitaires passent (couverture ≥ 80%).
- ✅ Les tests d'intégration passent.
- ✅ La fonctionnalité est testée en environnement staging.
- ✅ La documentation est mise à jour.
- ✅ Les critères d'acceptation des User Stories sont validés.
- ✅ Aucune régression détectée.
- ✅ Les normes de sécurité et d'accessibilité sont respectées.

### 14.5 Recette Utilisateur (UAT)

- Phase de recette de 4 semaines en pré-production.
- Testeurs : représentants de chaque profil (arbitres, formateurs, administrateurs AMDRH).
- Protocole de test formalisé avec scénarios prédéfinis.
- Outil de remontée de bugs : Jira ou équivalent.
- Critère de go-live : 0 bug critique, < 5 bugs majeurs documentés et planifiés.

---

## 15. Gouvernance et Gestion de Projet

### 15.1 Méthodologie

- **Approche Agile Scrum** avec sprints de 2 semaines.
- Backlog priorisé par le Product Owner (représentant Fédération).
- Revues de sprint (Sprint Review) avec démonstration aux parties prenantes.
- Rétrospectives pour amélioration continue.
- Definition of Ready et Definition of Done formalisées.

### 15.2 Instances de gouvernance

| Instance | Participants | Fréquence | Objectif |
|---|---|---|---|
| **Comité de pilotage** | Direction Fédération, AMDRH, Équipe projet | Mensuel | Décisions stratégiques, validation des jalons |
| **Sprint Review** | Équipe projet, PO, parties prenantes | Bi-mensuel | Validation des livraisons, feedback |
| **Daily Standup** | Équipe projet | Quotidien | Synchronisation, blocages |
| **Comité technique** | Architectes, Tech leads | Hebdomadaire | Décisions techniques |
| **Revue AMDRH** | Coordinateur AMDRH, Formateurs, PO | Mensuel | Validation académique, contenu |

### 15.3 Jalons (Milestones)

| Jalon | Livrable | Délai indicatif |
|---|---|---|
| **M0** | Validation du cahier des charges | J+0 |
| **M1** | Architecture technique validée + Design system | J+30 |
| **M2** | MVP : Comptes, Cours basiques, Quiz, Tableau de bord | J+90 |
| **M3** | Certification, Badges, Messagerie, Learning Paths | J+150 |
| **M4** | Intégration Fédération + AMDRH + Analytics avancés | J+210 |
| **M5** | Tests de charge, Sécurité, Accessibilité | J+240 |
| **M6** | Recette utilisateur (UAT) | J+270 |
| **M7** | Go-Live production | J+300 |

### 15.4 Gestion des risques

| Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|
| Retard dans la validation AMDRH | Moyen | Élevé | Processus de validation défini dès M0, SLA engagé |
| Problème d'intégration API Fédération | Moyen | Élevé | Contractualisation de l'API, environnement sandbox disponible dès M1 |
| Adoption faible par les utilisateurs | Faible | Élevé | Formation des utilisateurs, UX soigné, communication institutionnelle |
| Défaillance de performance sous charge | Faible | Moyen | Tests de charge avant go-live |
| Faille de sécurité | Faible | Très élevé | Pentest, SAST/DAST, Security by Design |
| Dérive du périmètre (scope creep) | Moyen | Moyen | Backlog strictement priorisé, process de change request formalisé |

---

## 16. Contraintes et Hypothèses

### 16.1 Contraintes

- **Budget :** Le budget est fixé et validé par la Fédération.
- **Délai :** Go-live cible à J+300.
- **Langue :** Support obligatoire du Français et de l'Arabe dès le lancement ; Anglais en phase 2.
- **Hébergement :** Données hébergées de préférence en dehors du territoire étranger ou conformément aux exigences réglementaires locales (Loi 09-08).
- **Compatibilité navigateurs :** Chrome, Firefox, Safari, Edge (2 dernières versions majeures).
- **Accessibilité réseau :** La plateforme doit être utilisable avec une connexion de qualité moyenne (3G) pour l'accès aux fonctionnalités textuelles ; vidéo requiert une connexion 4G ou Wi-Fi.

### 16.2 Hypothèses

- La Fédération fournit une API documentée pour l'accès à la base des licenciés avant le démarrage du module d'intégration.
- L'AMDRH désigne un Coordinateur dédié disponible minimum 1 jour par semaine pour les validations.
- Les formateurs sont recrutés et formés à l'utilisation de la plateforme avant le lancement.
- Le contenu pédagogique initial (vidéos, PDF) est fourni par les formateurs dans les délais convenus.
- La Fédération dispose d'une infrastructure email (SMTP ou service SaaS) pour l'envoi des notifications.

---

## 17. Glossaire

| Terme | Définition |
|---|---|
| **AMDRH** | Association Marocaine pour le Développement des Ressources Humaines — partenaire académique officiel |
| **Apprenant** | Tout utilisateur de la plateforme suivant des formations (arbitre, entraîneur, joueur, administrateur) |
| **Badge numérique** | Reconnaissance visuelle et vérifiable d'une compétence ou d'un accomplissement, conforme Open Badges |
| **Certificat numérique** | Document officiel PDF horodaté et signé numériquement, attestant la réussite d'une formation |
| **CQRS** | Command Query Responsibility Segregation — pattern d'architecture séparant les opérations de lecture et d'écriture |
| **DAST** | Dynamic Application Security Testing — test de sécurité sur une application en cours d'exécution |
| **IMS LTI** | Learning Tools Interoperability — standard permettant à des outils externes de s'intégrer dans un LMS |
| **Learning Path** | Parcours de formation structuré, assemblage ordonné de cours visant un objectif pédagogique global |
| **LMS** | Learning Management System — système de gestion de l'apprentissage |
| **MFA / 2FA** | Multi-Factor Authentication — authentification multi-facteurs |
| **Open Badges** | Standard ouvert de l'IMS Global pour les badges numériques vérifiables |
| **PO** | Product Owner — responsable de la vision produit et du backlog |
| **RGPD** | Règlement Général sur la Protection des Données (UE 2016/679) |
| **RPO** | Recovery Point Objective — durée maximale de perte de données acceptable |
| **RTO** | Recovery Time Objective — durée maximale de remise en service acceptable |
| **SAST** | Static Application Security Testing — analyse statique du code source |
| **SCORM** | Sharable Content Object Reference Model — standard d'e-learning |
| **SLA** | Service Level Agreement — accord de niveau de service |
| **SSO** | Single Sign-On — authentification unique permettant l'accès à plusieurs systèmes |
| **UAT** | User Acceptance Testing — tests de recette utilisateur |
| **UUID** | Universally Unique Identifier — identifiant unique universel |
| **WCAG** | Web Content Accessibility Guidelines — normes d'accessibilité web |
| **xAPI** | Experience API — standard de suivi des apprentissages (aussi appelé Tin Can API) |

---

## 18. Annexes

### Annexe A — Matrice de traçabilité

| Objectif | Module(s) | User Stories | KPI |
|---|---|---|---|
| Gestion des comptes | 6.1 | US-ARB-01, US-ADM-01 | Taux d'activation > 80% |
| Formation par profil | 6.2, 6.3 | US-ARB-02, US-ENT-01 | Taux complétion > 70% |
| Évaluation | 6.4 | US-ARB-05, US-ARB-06 | Taux réussite > 75% |
| Certification | 6.5 | US-ARB-07, US-ADM-06 | Certificats / mois |
| Suivi performance | 6.6 | US-ENT-03, US-ADM-03 | NPS > 7/10 |
| Communication | 6.7 | US-ARB-09, US-FOR-07 | — |
| Intégration | 6.8 | US-ADM-05, US-AMDRH-04 | Sync < 24h |

### Annexe B — Checklist de lancement (Go-Live)

- [ ] Infrastructure de production déployée et testée.
- [ ] Tests de charge validés (5 000 utilisateurs simultanés).
- [ ] Pentest réalisé, vulnérabilités critiques/hautes corrigées.
- [ ] Accessibilité auditée (WCAG 2.1 AA).
- [ ] UAT validée par les parties prenantes.
- [ ] Documentation utilisateur (guides par profil) disponible.
- [ ] Formation des administrateurs et formateurs réalisée.
- [ ] Plan de communication de lancement approuvé.
- [ ] Procédures de support et d'escalade définies.
- [ ] Plan de sauvegarde et de reprise d'activité testé.
- [ ] Intégration API Fédération testée en production.
- [ ] Processus de validation AMDRH opérationnel.
- [ ] Politique de confidentialité publiée.
- [ ] Mentions légales conformes.

### Annexe C — Contacts clés du projet

| Rôle | Responsabilité |
|---|---|
| Directeur de projet (Fédération) | Décision et validation côté maître d'ouvrage |
| Coordinateur AMDRH | Validation académique et standards |
| Chef de projet technique | Planification et suivi de la réalisation |
| Product Owner | Vision produit, priorisation du backlog |
| Lead architecte | Décisions architecturales |
| Responsable sécurité (RSSI) | Conformité sécurité et RGPD |

### Annexe D — Références normatives

- SCORM 1.2 / 2004 : https://scorm.com/scorm-explained/
- xAPI (Tin Can) : https://xapi.com/
- IMS LTI 1.3 : https://www.imsglobal.org/
- Open Badges 3.0 : https://openbadges.org/
- WCAG 2.1 : https://www.w3.org/TR/WCAG21/
- OWASP Top 10 : https://owasp.org/Top10/
- RGPD : https://eur-lex.europa.eu/
- ISO/IEC 27001 : https://www.iso.org/
- Loi 09-08 (Maroc) : https://www.cndp.ma/

---

*Fin du document — Cahier des Charges v1.0*

---

> **Document préparé par :** Équipe Projet Académie AMDRH
> **Validé par :** Direction de la Fédération · AMDRH
> **Prochain jalon de révision :** À la fin du sprint 1 (J+14)
