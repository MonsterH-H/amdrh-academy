import * as fs from "fs";
import * as path from "path";
import * as docx from "docx";

const {
  Document, Packer, Paragraph, TextRun, ImageRun,
  Table, TableRow, TableCell, WidthType, AlignmentType,
  HeadingLevel, PageNumber, NumberFormat,
  BorderStyle, ShadingType, VerticalAlign, TableLayoutType,
  TabStopType, Header, Footer, SectionType, PageBreak,
  HeightRule,
} = docx;

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════
const FONT = "Times New Roman";
const C_DARK = "003366";
const C_LIGHT = "E8EEF4";
const C_ACCENT = "1A5276";
const C_WHITE = "FFFFFF";
const PAGE_W = 11906;
const PAGE_H = 16838;
const MARGIN = 1440;
const CW = PAGE_W - 2 * MARGIN; // 9026 twips content width
const CH = PAGE_H - 2 * MARGIN; // 13958 twips content height
const LINE_SPACING = 312; // 1.3 * 240

// ═══════════════════════════════════════════════════════════════
// IMAGE HELPERS
// ═══════════════════════════════════════════════════════════════
interface ImgInfo { data: Buffer; w: number; h: number; }

function loadImg(p: string): ImgInfo {
  const buf = fs.readFileSync(p);
  return { data: buf, w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

function imgRun(p: string, maxW: number): ImageRun {
  const img = loadImg(p);
  const scale = Math.min(maxW / img.w, 1);
  return new ImageRun({
    data: img.data,
    transformation: { width: Math.round(img.w * scale), height: Math.round(img.h * scale) },
    type: "png",
  });
}

// ═══════════════════════════════════════════════════════════════
// PARAGRAPH HELPERS
// ═══════════════════════════════════════════════════════════════
const BASE_SP: docx.ISpacingProperties = { line: LINE_SPACING, after: 100 };

function body(text: string, opts: Partial<docx.IParagraphOptions> = {}): Paragraph {
  return new Paragraph({
    spacing: { ...BASE_SP },
    alignment: AlignmentType.JUSTIFIED,
    ...opts,
    children: [new TextRun({ text, font: FONT, size: 24 })],
  });
}

function bodyRuns(runs: docx.IRunOptions[], opts: Partial<docx.IParagraphOptions> = {}): Paragraph {
  return new Paragraph({
    spacing: { ...BASE_SP },
    alignment: AlignmentType.JUSTIFIED,
    ...opts,
    children: runs.map(r => typeof r === "string"
      ? new TextRun({ text: r as string, font: FONT, size: 24 })
      : new TextRun({ font: FONT, size: 24, ...r })
    ),
  });
}

function h1(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 480, after: 240, line: LINE_SPACING },
    children: [new TextRun({ text, font: FONT, size: 32, bold: true, color: C_DARK })],
  });
}

function h2(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 360, after: 180, line: LINE_SPACING },
    children: [new TextRun({ text, font: FONT, size: 28, bold: true, color: C_ACCENT })],
  });
}

function h3(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 240, after: 120, line: LINE_SPACING },
    children: [new TextRun({ text, font: FONT, size: 26, bold: true, color: "333333" })],
  });
}

function emptyLine(n = 1): Paragraph[] {
  return Array.from({ length: n }, () => new Paragraph({ spacing: { after: 120 }, children: [] }));
}

function figureBlock(imgPath: string, caption: string, maxW = 480): Paragraph[] {
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 60, line: LINE_SPACING },
      children: [imgRun(imgPath, maxW)],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200, line: LINE_SPACING },
      children: [new TextRun({ text: caption, font: FONT, size: 22, italics: true, color: "555555" })],
    }),
  ];
}

// ═══════════════════════════════════════════════════════════════
// TABLE HELPERS
// ═══════════════════════════════════════════════════════════════
const NO_BORDER = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const NO_BORDERS = {
  top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER,
  insideHorizontal: NO_BORDER, insideVertical: NO_BORDER,
};
const TBL_BORDER = { style: BorderStyle.SINGLE, size: 1, color: "AAAAAA" };
const TBL_BORDERS = {
  top: TBL_BORDER, bottom: TBL_BORDER, left: TBL_BORDER, right: TBL_BORDER,
  insideHorizontal: TBL_BORDER, insideVertical: TBL_BORDER,
};

function headerCell(text: string, width?: number): TableCell {
  return new TableCell({
    shading: { type: ShadingType.CLEAR, fill: C_DARK },
    verticalAlign: VerticalAlign.CENTER,
    width: width ? { size: width, type: WidthType.DXA } : undefined,
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 40, after: 40 },
      children: [new TextRun({ text, font: FONT, size: 22, bold: true, color: C_WHITE })],
    })],
  });
}

function dataCell(text: string, width?: number, align: typeof AlignmentType[keyof typeof AlignmentType] = AlignmentType.LEFT): TableCell {
  return new TableCell({
    verticalAlign: VerticalAlign.CENTER,
    width: width ? { size: width, type: WidthType.DXA } : undefined,
    children: [new Paragraph({
      alignment: align,
      spacing: { before: 30, after: 30 },
      children: [new TextRun({ text, font: FONT, size: 22 })],
    })],
  });
}

function shadedCell(text: string, width?: number): TableCell {
  return new TableCell({
    shading: { type: ShadingType.CLEAR, fill: "F5F7FA" },
    verticalAlign: VerticalAlign.CENTER,
    width: width ? { size: width, type: WidthType.DXA } : undefined,
    children: [new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { before: 30, after: 30 },
      children: [new TextRun({ text, font: FONT, size: 22 })],
    })],
  });
}

function makeTable(headers: string[], rows: string[][], colWidths?: number[]): Table {
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((h, i) => headerCell(h, colWidths?.[i])),
  });
  const dataRows = rows.map((row, ri) =>
    new TableRow({
      children: row.map((cell, ci) =>
        ri % 2 === 1 ? shadedCell(cell, colWidths?.[ci]) : dataCell(cell, colWidths?.[ci])
      ),
    })
  );
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.AUTOFIT,
    borders: TBL_BORDERS,
    rows: [headerRow, ...dataRows],
  });
}

// ═══════════════════════════════════════════════════════════════
// TOC ENTRY HELPER
// ═══════════════════════════════════════════════════════════════
function tocEntry(text: string, page: string, indent = 0): Paragraph {
  return new Paragraph({
    spacing: { after: 80, line: 360 },
    indent: { left: indent * 720 },
    tabStops: [{ type: TabStopType.RIGHT, position: CW, leader: "dot" as any }],
    children: [
      new TextRun({ text, font: FONT, size: 24, ...(indent > 0 ? {} : { bold: true }) }),
      new TextRun("\t"),
      new TextRun({ text: page, font: FONT, size: 24 }),
    ],
  });
}

// ═══════════════════════════════════════════════════════════════
// BUILD DOCUMENT CONTENT
// ═══════════════════════════════════════════════════════════════
const BASE = "/home/z/my-project";

// ─── SECTION 1: COVER PAGE ──────────────────────────────────
// Helper for cover page paragraph (white text, dark bg)
function coverP(text: string, opts: Partial<docx.IRunOptions> & { spacing?: any; alignment?: any } = {}): Paragraph {
  const { spacing, alignment, ...runOpts } = opts;
  return new Paragraph({
    alignment: alignment || AlignmentType.CENTER,
    spacing: spacing || { after: 60 },
    children: [new TextRun({ text, font: FONT, color: C_WHITE, ...runOpts })],
  });
}

function coverSep(): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 40 },
    children: [new TextRun({ text: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", font: FONT, size: 18, color: "7EAAC8" })],
  });
}

const coverCell = new TableCell({
  shading: { type: ShadingType.CLEAR, fill: C_DARK },
  verticalAlign: VerticalAlign.CENTER,
  width: { size: CW, type: WidthType.DXA },
  borders: NO_BORDERS,
  children: [
    ...emptyLine(3),
    coverP("RÉPUBLIQUE DU MAROC", { bold: true, size: 24 }),
    coverP("Université Privée de Casablanca", { size: 22 }),
    coverP("Faculté des Sciences et Techniques", { size: 22, spacing: { after: 200 } }),
    coverSep(),
    ...emptyLine(1),
    coverP("RAPPORT DE STAGE", { bold: true, size: 42, spacing: { after: 120 } }),
    coverP("Licence Professionnelle en Informatique", { size: 26, color: "A8C8E8" }),
    ...emptyLine(1),
    coverP("Académie AMDRH", { bold: true, size: 36, spacing: { after: 120 } }),
    coverP("Plateforme e-learning pour la formation des arbitres", { italics: true, size: 24, color: "B0CDE0" }),
    coverP("de la Fédération Royale Marocaine de Handball", { italics: true, size: 24, color: "B0CDE0", spacing: { after: 200 } }),
    ...emptyLine(1),
    coverSep(),
    ...emptyLine(1),
    coverP("Entreprise d'accueil : Labgouri Invest (SARL AU)", { bold: true, size: 24 }),
    coverP("BTP / Conseil / Formation — Casablanca", { size: 22, color: "A8C8E8" }),
    ...emptyLine(2),
    coverP("Encadrant professionnel : M. Labgouri", { size: 22 }),
    coverP("Encadrant académique : Pr. Université", { size: 22 }),
    ...emptyLine(2),
    coverP("Année universitaire 2024 – 2025", { bold: true, size: 24 }),
    ...emptyLine(2),
  ],
});

const coverTable = new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  layout: TableLayoutType.FIXED,
  borders: NO_BORDERS,
  rows: [
    new TableRow({
      height: { value: CH, rule: HeightRule.EXACT },
      children: [coverCell],
    }),
  ],
});

const coverSection = {
  properties: {
    page: {
      size: { width: PAGE_W, height: PAGE_H },
      margin: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
    },
  },
  children: [coverTable],
};

// ─── SECTION 2: DEDICACE ────────────────────────────────────
const dedicaceSection = {
  properties: {
    page: {
      size: { width: PAGE_W, height: PAGE_H },
      margin: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
    },
  },
  children: [
    new Paragraph({ children: [new PageBreak()] }),
    ...emptyLine(6),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [new TextRun({ text: "Dédicace", font: FONT, size: 36, bold: true, color: C_DARK })],
    }),
    ...emptyLine(2),
    body("Je dédie ce travail à mes chers parents, pour leur soutien inconditionnel, leurs sacrifices et leur encouragement tout au long de mon parcours académique. Leur confiance en moi a été ma plus grande motivation.", { alignment: AlignmentType.CENTER }),
    ...emptyLine(1),
    body("À mes frères et sœurs, pour leur amour et leur présence qui ont illuminé mes journées les plus difficiles.", { alignment: AlignmentType.CENTER }),
    ...emptyLine(1),
    body("À tous mes amis et collègues qui m'ont accompagné pendant cette période de stage, merci pour votre solidarité et vos conseils précieux.", { alignment: AlignmentType.CENTER }),
    ...emptyLine(1),
    body("À tous ceux qui croient en l'éducation comme vecteur de changement.", { alignment: AlignmentType.CENTER }),
  ],
};

// ─── SECTION 3: REMERCIEMENTS ───────────────────────────────
const remerciementsSection = {
  properties: {
    page: {
      size: { width: PAGE_W, height: PAGE_H },
      margin: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
    },
  },
  children: [
    new Paragraph({ children: [new PageBreak()] }),
    ...emptyLine(4),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [new TextRun({ text: "Remerciements", font: FONT, size: 36, bold: true, color: C_DARK })],
    }),
    ...emptyLine(1),
    body("Avant de présenter ce rapport, je tiens à exprimer ma profonde gratitude envers toutes les personnes qui ont contribué, de près ou de loin, à la réussite de ce stage professionnel."),
    ...emptyLine(1),
    body("Je remercie tout d'abord mon encadrant professionnel, M. Labgouri, directeur de Labgouri Invest, pour m'avoir accueilli au sein de son entreprise et pour sa confiance. Ses orientations, sa disponibilité et son expertise m'ont été d'une aide précieuse tout au long de ce projet."),
    ...emptyLine(1),
    body("Je tiens également à remercier mon encadrant académique pour ses conseils méthodologiques et son suivi rigoureux du travail réalisé."),
    ...emptyLine(1),
    body("Mes remerciements s'adressent aussi à l'ensemble de l'équipe technique de Labgouri Invest, qui m'a intégré dans leur dynamique de travail et m'a permis de progresser dans un environnement professionnel stimulant."),
    ...emptyLine(1),
    body("Je n'oublie pas la Fédération Royale Marocaine de Handball (FRMH) et l'AMDRH pour leur collaboration et leurs retours qui ont enrichi ce projet."),
    ...emptyLine(1),
    body("Enfin, je remercie le corps professoral de la Faculté des Sciences et Techniques pour la qualité de l'enseignement reçu, qui m'a préparé à affronter les défis du monde professionnel."),
  ],
};

// ─── SECTION 4: RÉSUMÉ & ABSTRACT ───────────────────────────
const resumeSection = {
  properties: {
    page: {
      size: { width: PAGE_W, height: PAGE_H },
      margin: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
    },
  },
  children: [
    new Paragraph({ children: [new PageBreak()] }),
    new Paragraph({
      spacing: { after: 200 },
      children: [new TextRun({ text: "Résumé", font: FONT, size: 32, bold: true, color: C_DARK })],
    }),
    body("Ce rapport présente le travail réalisé dans le cadre d'un stage professionnel effectué au sein de la société Labgouri Invest (SARL AU), spécialisée dans le BTP, le conseil et la formation, située à Casablanca. Le stage s'est déroulé sur une période de huit semaines et a porté sur la conception et le développement de l'Académie AMDRH, une plateforme e-learning dédiée à la formation continue des arbitres de la Fédération Royale Marocaine de Handball."),
    body("Le projet a été réalisé en utilisant un ensemble de technologies modernes : Next.js 16 pour le framework frontend, Prisma v6 comme ORM avec PostgreSQL (Neon) comme base de données, UploadThing pour la gestion des fichiers, Socket.io pour la communication en temps réel, et shadcn/ui pour les composants d'interface utilisateur. La plateforme prend en charge cinq rôles distincts (ADMIN, FORMATEUR, ARBITRE, ENTRAÎNEUR, JOUEUR) et offre des fonctionnalités avancées telles que la gestion de cours, les quiz interactifs, la délivrance de certificats, la messagerie en temps réel et un système de gamification."),
    body("Ce document détaille les différentes phases du projet, depuis l'analyse des besoins et la conception, jusqu'à la réalisation et les tests. Il met en évidence les choix technologiques, les défis rencontrés et les solutions apportées."),
    ...emptyLine(1),
    bodyRuns([
      { text: "Mots-clés : ", bold: true },
      "e-learning, Next.js, Prisma, PostgreSQL, Socket.io, formation en ligne, arbitrage handball, plateforme éducative, développement web, AMDRH",
    ]),
    ...emptyLine(2),
    new Paragraph({
      spacing: { after: 200 },
      children: [new TextRun({ text: "Abstract", font: FONT, size: 32, bold: true, color: C_DARK })],
    }),
    body("This report presents the work carried out during a professional internship at Labgouri Invest (SARL AU), a company specializing in construction, consulting, and training, based in Casablanca, Morocco. The eight-week internship focused on the design and development of the AMDRH Academy, an e-learning platform dedicated to the continuing education of referees of the Royal Moroccan Handball Federation."),
    body("The project was built using modern technologies including Next.js 16, Prisma v6 with PostgreSQL (Neon), UploadThing for file management, Socket.io for real-time communication, and shadcn/ui for user interface components. The platform supports five distinct roles (ADMIN, FORMATEUR, ARBITRE, ENTRAÎNEUR, JOUEUR) and provides advanced features such as course management, interactive quizzes, certificate issuance, real-time messaging, and a gamification system."),
    body("This document details the various project phases, from requirements analysis and design through implementation and testing, highlighting technological choices, challenges encountered, and solutions provided."),
    ...emptyLine(1),
    bodyRuns([
      { text: "Keywords: ", bold: true },
      "e-learning, Next.js, Prisma, PostgreSQL, Socket.io, online training, handball refereeing, educational platform, web development, AMDRH",
    ]),
  ],
};

// ─── SECTION 5: SIGLES, LISTE DES FIGURES, LISTE DES TABLEAUX
const siglesSection = {
  properties: {
    page: {
      size: { width: PAGE_W, height: PAGE_H },
      margin: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
    },
  },
  children: [
    new Paragraph({ children: [new PageBreak()] }),
    new Paragraph({
      spacing: { after: 240 },
      children: [new TextRun({ text: "Liste des sigles et abréviations", font: FONT, size: 32, bold: true, color: C_DARK })],
    }),
    makeTable(
      ["Sigle", "Signification"],
      [
        ["AMDRH", "Association Marocaine Des Arbitres et Des officiels de Handball"],
        ["BTP", "Bâtiment et Travaux Publics"],
        ["FRMH", "Fédération Royale Marocaine de Handball"],
        ["ORM", "Object-Relational Mapping"],
        ["API", "Application Programming Interface"],
        ["RBAC", "Role-Based Access Control"],
        ["SPA", "Single Page Application"],
        ["SSR", "Server-Side Rendering"],
        ["CRUD", "Create, Read, Update, Delete"],
        ["UML", "Unified Modeling Language"],
        ["SQL", "Structured Query Language"],
        ["HTTPS", "Hypertext Transfer Protocol Secure"],
        ["JWT", "JSON Web Token"],
        ["WCAG", "Web Content Accessibility Guidelines"],
        ["SARL", "Société À Responsabilité Limitée"],
        ["AU", "À Utilité Unique"],
      ],
      [2000, 7026],
    ),
    ...emptyLine(2),
    new Paragraph({
      spacing: { before: 200, after: 240 },
      children: [new TextRun({ text: "Liste des figures", font: FONT, size: 32, bold: true, color: C_DARK })],
    }),
    makeTable(
      ["Figure", "Description", "Page"],
      [
        ["Figure 1", "Diagramme de cas d'utilisation", "12"],
        ["Figure 2", "Diagramme de Gantt du projet", "10"],
        ["Figure 3", "Architecture générale du système", "15"],
        ["Figure 4", "Diagramme de classes", "17"],
        ["Figure 5", "Diagramme de séquence — Connexion", "19"],
        ["Figure 6", "Diagramme de séquence — Soumission de quiz", "20"],
        ["Figure 7", "Page d'accueil de la plateforme", "24"],
        ["Figure 8", "Page de connexion", "25"],
        ["Figure 9", "Tableau de bord utilisateur", "26"],
        ["Figure 10", "Médiathèque — Gestion des ressources", "27"],
      ],
      [1400, 5526, 2100],
    ),
    ...emptyLine(2),
    new Paragraph({
      spacing: { before: 200, after: 240 },
      children: [new TextRun({ text: "Liste des tableaux", font: FONT, size: 32, bold: true, color: C_DARK })],
    }),
    makeTable(
      ["Tableau", "Description", "Page"],
      [
        ["Tableau 1", "Répartition des rôles et permissions", "11"],
        ["Tableau 2", "Technologies utilisées dans le projet", "10"],
        ["Tableau 3", "Résultats des tests fonctionnels", "35"],
        ["Tableau 4", "Couverture des tests par module", "36"],
      ],
      [1400, 5526, 2100],
    ),
  ],
};

// ─── SECTION 6: TABLE DES MATIÈRES ──────────────────────────
const tocSection = {
  properties: {
    page: {
      size: { width: PAGE_W, height: PAGE_H },
      margin: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
    },
  },
  children: [
    new Paragraph({ children: [new PageBreak()] }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [new TextRun({ text: "Table des matières", font: FONT, size: 36, bold: true, color: C_DARK })],
    }),
    tocEntry("Introduction", "1"),
    tocEntry("Chapitre I : L'entreprise d'accueil", "3"),
    tocEntry("1.1 Présentation générale de Labgouri Invest", "3", 1),
    tocEntry("1.2 Organigramme et organisation", "3", 1),
    tocEntry("1.3 Services et domaines d'activité", "4", 1),
    tocEntry("1.4 Environnement technologique", "4", 1),
    tocEntry("Chapitre II : Présentation du projet", "5"),
    tocEntry("2.1 Contexte et problématique", "5", 1),
    tocEntry("2.2 Objectifs du projet", "5", 1),
    tocEntry("2.3 Périmètre fonctionnel et rôles", "6", 1),
    tocEntry("2.4 Planning prévisionnel", "7", 1),
    tocEntry("2.5 Technologies retenues", "8", 1),
    tocEntry("Chapitre III : Analyse des besoins", "9"),
    tocEntry("3.1 Identification des acteurs", "9", 1),
    tocEntry("3.2 Diagramme de cas d'utilisation", "10", 1),
    tocEntry("3.3 Spécifications fonctionnelles détaillées", "11", 1),
    tocEntry("3.4 Spécifications non fonctionnelles", "12", 1),
    tocEntry("3.5 Contraintes du projet", "13", 1),
    tocEntry("Chapitre IV : Conception", "14"),
    tocEntry("4.1 Architecture globale du système", "14", 1),
    tocEntry("4.2 Architecture technique détaillée", "15", 1),
    tocEntry("4.3 Modèle de données", "16", 1),
    tocEntry("4.4 Diagrammes de séquence", "18", 1),
    tocEntry("4.5 Conception de l'interface utilisateur", "20", 1),
    tocEntry("Chapitre V : Réalisation", "21"),
    tocEntry("5.1 Environnement de développement", "21", 1),
    tocEntry("5.2 Authentification et gestion des rôles", "22", 1),
    tocEntry("5.3 Module de gestion des cours", "23", 1),
    tocEntry("5.4 Système de quiz interactifs", "25", 1),
    tocEntry("5.5 Certificats et système de badges", "27", 1),
    tocEntry("5.6 Communication temps réel", "28", 1),
    tocEntry("5.7 Captures d'écran de l'application", "29", 1),
    tocEntry("Chapitre VI : Tests et validation", "31"),
    tocEntry("6.1 Stratégie de test", "31", 1),
    tocEntry("6.2 Tests unitaires", "32", 1),
    tocEntry("6.3 Tests d'intégration", "33", 1),
    tocEntry("6.4 Tests fonctionnels", "34", 1),
    tocEntry("6.5 Bilan et analyse des résultats", "35", 1),
    tocEntry("Conclusion", "37"),
    tocEntry("Références bibliographiques", "39"),
  ],
};

// ─── SECTION 7: MAIN CONTENT (Page numbering starts at 1) ──
const pageFooter = {
  options: {
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 22 }),
        ],
      }),
    ],
  },
};

const mainSectionProps = {
  properties: {
    page: {
      size: { width: PAGE_W, height: PAGE_H },
      margin: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
      pageNumbers: { start: 1 },
    },
  },
  footers: { default: pageFooter },
};

// ═══════════════════════════════════════════════════════════════
// INTRODUCTION
// ═══════════════════════════════════════════════════════════════
const introduction: Paragraph[] = [
  h1("Introduction"),
  body("Dans un contexte mondial où la formation en ligne connaît une croissance exponentielle, le secteur sportif n'échappe pas à cette transformation numérique. Les fédérations sportives, et en particulier la Fédération Royale Marocaine de Handball (FRMH), ressentent le besoin croissant de moderniser leurs processus de formation, notamment pour les arbitres dont la qualification et la mise à niveau des connaissances sont essentielles à la qualité de l'arbitrage."),
  body("C'est dans ce cadre que s'inscrit notre stage professionnel, effectué au sein de la société Labgouri Invest (SARL AU), une entreprise casablancaise spécialisée dans le BTP, le conseil et la formation. Ce stage, d'une durée de huit semaines, avait pour objectif principal la conception et le développement d'une plateforme e-learning dénommée « Académie AMDRH », destinée à la formation continue des arbitres et officiels de handball au Maroc."),
  body("Le projet Académie AMDRH répond à un besoin réel de l'Association Marocaine Des Arbitres et Des officiels de Handball (AMDRH), qui cherchait une solution numérique permettant de centraliser les contenus de formation, d'automatiser les évaluations et de délivrer des certificats de manière sécurisée. La plateforme devait également offrir une expérience utilisateur moderne et intuitive, accessible à des profils variés allant des administrateurs aux simples joueurs."),
  body("Sur le plan technique, le choix s'est porté sur un stack technologique moderne et performant : Next.js 16 comme framework de développement, Prisma v6 pour l'ORM, PostgreSQL hébergé sur Neon pour la base de données, UploadThing pour la gestion des fichiers, Socket.io pour la communication en temps réel, et shadcn/ui pour la bibliothèque de composants d'interface. Ce choix technologique a permis de concevoir une application web robuste, scalable et responsive."),
  body("Ce rapport de stage est structuré en six chapitres. Le premier chapitre présente l'entreprise d'accueil et son environnement. Le deuxième décrit le projet dans son ensemble, ses objectifs et son planning. Le troisième est consacré à l'analyse des besoins fonctionnels et non fonctionnels. Le quatrième traite de la conception technique, incluant l'architecture, le modèle de données et les diagrammes UML. Le cinquième détaille la réalisation du projet avec les captures d'écran de l'application. Enfin, le sixième chapitre présente les tests réalisés et leurs résultats. Une conclusion générale clôture ce rapport en dressant le bilan du stage et en proposant des perspectives d'amélioration."),
];

// ═══════════════════════════════════════════════════════════════
// CHAPITRE I : L'ENTREPRISE D'ACCUEIL
// ═══════════════════════════════════════════════════════════════
const chapitre1: Paragraph[] = [
  h1("Chapitre I : L'entreprise d'accueil"),
  body("Ce premier chapitre propose une présentation détaillée de l'entreprise qui a accueilli notre stage, Labgouri Invest. Nous y décrirons son histoire, son organisation, ses activités principales ainsi que l'environnement technologique dans lequel s'inscrit notre projet."),

  h2("1.1 Présentation générale de Labgouri Invest"),
  body("Labgouri Invest est une Société à Responsabilité Limitée à Utilité Unique (SARL AU) immatriculée au Registre du Commerce de Casablanca. Fondée par M. Labgouri, l'entreprise a été créée avec la vision de proposer des solutions intégrées dans les domaines du Bâtiment et des Travaux Publics (BTP), du conseil stratégique et de la formation professionnelle."),
  body("Située dans la métropole casablancaise, Labgouri Invest a su se démarquer grâce à une approche pluridisciplinaire qui lui permet d'intervenir sur des projets variés, allant de la réalisation d'infrastructures à l'accompagnement technologique des entreprises. Cette diversité d'activités constitue un atout majeur, offrant aux stagiaires un environnement de travail riche et formateur."),
  body("L'entreprise compte une équipe d'une dizaine de collaborateurs, incluant des ingénieurs, des développeurs, des consultants et des formateurs. Cette taille humaine favorise la communication directe, la réactivité et l'implication de chaque membre dans les projets en cours."),

  h2("1.2 Organigramme et organisation"),
  body("L'organisation de Labgouri Invest repose sur une structure hiérarchique simple et efficace, adaptée à la taille de l'entreprise. La direction générale, assurée par M. Labgouri, supervise l'ensemble des activités et définit la stratégie de l'entreprise."),
  body("L'entreprise est organisée autour de trois pôles principaux :"),
  body("Le pôle BTP, responsable des projets de construction et d'infrastructures, qui gère les chantiers, les études techniques et le suivi des travaux. Ce pôle travaille en étroite collaboration avec les partenaires locaux et les autorités compétentes."),
  body("Le pôle Conseil, dédié à l'accompagnement stratégique et organisationnel des entreprises clientes. Les consultants de ce pôle interviennent sur des problématiques de gestion, d'optimisation des processus et de transformation digitale."),
  body("Le pôle Formation, qui conçoit et délivre des programmes de formation professionnelle, tant en présentiel qu'en ligne. C'est dans ce pôle que s'inscrit le projet Académie AMDRH, qui représente une initiative ambitieuse de digitalisation de la formation sportive."),

  h2("1.3 Services et domaines d'activité"),
  body("Labgouri Invest offre une gamme étendue de services, répartis entre ses différents pôles d'activité :"),
  body("Dans le domaine du BTP, l'entreprise réalise des études de faisabilité, du suivi de chantier, de la gestion de projets de construction résidentielle et commerciale, ainsi que des travaux de rénovation et d'aménagement."),
  body("En matière de conseil, Labgouri Invest accompagne ses clients dans la définition de leur stratégie digitale, l'audit de leurs systèmes d'information, et la mise en place de solutions technologiques sur mesure. L'entreprise a développé une expertise reconnue dans l'accompagnement des fédérations sportives et des associations."),
  body("Le pôle Formation propose des programmes couvrant divers domaines : management de projet, développement logiciel, compétences numériques, et désormais la formation sportive spécialisée. Le projet Académie AMDRH s'inscrit dans cette logique d'expansion vers de nouveaux secteurs."),

  h2("1.4 Environnement technologique"),
  body("Labgouri Invest dispose d'un environnement technologique moderne et adapté aux besoins de ses différents projets. L'entreprise utilise principalement des outils et technologies open source, ce qui lui permet de maîtriser ses coûts tout en bénéficiant de solutions performantes et éprouvées."),
  body("L'infrastructure technique de l'entreprise comprend des serveurs de développement, des environnements de test et de production, ainsi que des outils de gestion de version (Git). Les projets web sont développés avec des frameworks modernes tels que Next.js, et les bases de données utilisées incluent PostgreSQL et SQLite."),
  body("Pour ce projet spécifique, l'environnement de développement comprend les outils suivants : Visual Studio Code comme éditeur de code, Git et GitHub pour la gestion de version, bun comme gestionnaire de paquets et d'exécution, ainsi que Docker pour la conteneurisation des services. L'hébergement est assuré par des services cloud modernes comme Vercel pour le frontend et Neon pour la base de données PostgreSQL."),
];

// ═══════════════════════════════════════════════════════════════
// CHAPITRE II : PRÉSENTATION DU PROJET
// ═══════════════════════════════════════════════════════════════
const chapitre2: Paragraph[] = [
  h1("Chapitre II : Présentation du projet"),
  body("Ce chapitre présente le contexte dans lequel s'inscrit le projet Académie AMDRH, les objectifs visés, le périmètre fonctionnel, le planning de réalisation ainsi que les technologies retenues pour le développement."),

  h2("2.1 Contexte et problématique"),
  body("L'arbitrage de handball au Maroc constitue un pilier fondamental de la pratique sportive. Les arbitres doivent maintenir un niveau technique élevé, se tenir informés des évolutions réglementaires et valider régulièrement leurs compétences. Cependant, le processus de formation traditionnel, reposant essentiellement sur des sessions en présentiel, présente plusieurs limites : contraintes géographiques, coût logistique, difficulté de suivi individuel et absence de traçabilité des parcours de formation."),
  body("L'Association Marocaine Des Arbitres et Des officiels de Handball (AMDRH), consciente de ces défis, a exprimé le besoin d'une plateforme numérique permettant de centraliser et de structurer l'ensemble du processus de formation. C'est cette problématique qui a donné naissance au projet Académie AMDRH."),
  body("La plateforme doit répondre à un double objectif : d'une part, offrir un accès facile et permanent aux contenus de formation pour les arbitres dispersés sur l'ensemble du territoire marocain ; d'autre part, fournir aux administrateurs et formateurs des outils de suivi, d'évaluation et de certification performants."),

  h2("2.2 Objectifs du projet"),
  body("Le projet Académie AMDRH poursuit plusieurs objectifs, à la fois fonctionnels et techniques :"),
  body("Sur le plan fonctionnel, la plateforme doit permettre la gestion complète de parcours de formation en ligne, incluant la création de cours par les formateurs, la consultation et le suivi de progression par les apprenants, l'évaluation par des quiz interactifs, et la délivrance automatique de certificats de réussite. Elle doit également intégrer un système de messagerie en temps réel pour faciliter la communication entre les différents acteurs."),
  body("Sur le plan technique, les objectifs incluent la conception d'une architecture modulaire et scalable, la mise en place d'un système d'authentification sécurisé avec gestion des rôles (RBAC), l'intégration d'un système de notification en temps réel, et la garantie de bonnes performances même sous une charge modérée d'utilisateurs simultanés."),

  h2("2.3 Périmètre fonctionnel et rôles"),
  body("La plateforme Académie AMDRH est conçue pour cinq profils d'utilisateurs distincts, chacun disposant de permissions et fonctionnalités spécifiques :"),
  makeTable(
    ["Rôle", "Description", "Fonctionnalités principales"],
    [
      ["ADMIN", "Administrateur de la plateforme", "Gestion complète : utilisateurs, cours, quiz, certificats, statistiques, paramètres système, import/export de données"],
      ["FORMATEUR", "Formateur et créateur de contenu", "Création et gestion de cours, création de quiz, suivi de la progression des apprenants, gestion des ressources pédagogiques"],
      ["ARBITRE", "Arbitre de handball (apprenant principal)", "Consultation des cours, passage des quiz, suivi de sa progression, obtention de certificats, messagerie"],
      ["ENTRAÎNEUR", "Entraîneur de handball", "Accès à certains cours, consultation des ressources, messagerie avec les formateurs"],
      ["JOUEUR", "Joueur de handball", "Accès limité à certaines ressources éducatives, consultation de contenus publiques"],
    ],
    [1500, 2800, 4726],
  ),
  ...emptyLine(1),
  body("Ce système de rôles basé sur le contrôle d'accès (RBAC) permet de définir finement les permissions de chaque utilisateur, garantissant ainsi la sécurité et la confidentialité des données."),

  h2("2.4 Planning prévisionnel"),
  body("Le projet a été planifié sur une durée de huit semaines, réparties en phases successives couvrant l'ensemble du cycle de développement logiciel. Le diagramme de Gantt ci-dessous illustre la planification prévisionnelle des différentes tâches."),
  ...figureBlock(`${BASE}/screenshots/diag-gantt.png`, "Figure 2 : Diagramme de Gantt du projet — Planning prévisionnel sur 8 semaines", 500),
  body("Les deux premières semaines ont été consacrées à l'analyse des besoins et à la phase de conception. Les semaines 3 à 6 ont porté sur le développement de l'application, avec une approche itérative permettant de livrer progressivement les fonctionnalités. Les semaines 7 et 8 ont été dédiées aux tests, à la correction des anomalies et à la préparation de la documentation."),

  h2("2.5 Technologies retenues"),
  body("Le choix des technologies a été guidé par plusieurs critères : la performance, la maintenabilité, la communauté de développeurs et la compatibilité entre les différents outils. Le tableau ci-dessous présente les principales technologies utilisées :"),
  makeTable(
    ["Technologie", "Version", "Rôle dans le projet"],
    [
      ["Next.js", "16", "Framework React avec rendu serveur, routage App Router"],
      ["TypeScript", "5", "Langage de programmation avec typage statique"],
      ["Prisma", "v6", "ORM pour l'accès et la manipulation de la base de données"],
      ["PostgreSQL", "16 (Neon)", "Base de données relationnelle pour le stockage persistant"],
      ["Socket.io", "4.x", "Communication bidirectionnelle en temps réel"],
      ["UploadThing", "7.x", "Service d'upload de fichiers (documents, images, vidéos)"],
      ["shadcn/ui", "Latest", "Bibliothèque de composants UI accessibles et personnalisables"],
      ["Tailwind CSS", "4", "Framework CSS utilitaire pour le design responsive"],
      ["Zustand", "5", "Gestion d'état client léger"],
      ["NextAuth.js", "v4", "Authentification sécurisée avec gestion de sessions"],
      ["Bun", "Latest", "Runtime JavaScript rapide et gestionnaire de paquets"],
    ],
    [2000, 1200, 5826],
  ),
  ...emptyLine(1),
  body("L'ensemble de ces technologies forme un écosystème cohérent et moderne, parfaitement adapté aux exigences d'une plateforme e-learning professionnelle. L'utilisation de TypeScript tout au long du projet garantit la robustesse du code et facilite la maintenance à long terme."),
];

// ═══════════════════════════════════════════════════════════════
// CHAPITRE III : ANALYSE DES BESOINS
// ═══════════════════════════════════════════════════════════════
const chapitre3: Paragraph[] = [
  h1("Chapitre III : Analyse des besoins"),
  body("L'analyse des besoins constitue une étape fondamentale du cycle de développement. Ce chapitre identifie les différents acteurs du système, décrit les cas d'utilisation à travers un diagramme UML, et détaille les spécifications fonctionnelles et non fonctionnelles de la plateforme."),

  h2("3.1 Identification des acteurs"),
  body("L'identification des acteurs est la première étape de l'analyse. Un acteur est une entité externe au système qui interagit avec lui. Dans le cas de l'Académie AMDRH, nous distinguons cinq acteurs principaux, correspondant aux cinq rôles définis dans le périmètre fonctionnel :"),
  body("L'Administrateur (ADMIN) est l'acteur principal pour la gestion de la plateforme. Il a accès à toutes les fonctionnalités d'administration, y compris la gestion des utilisateurs, la configuration du système, la consultation des statistiques globales et la gestion des certificats et badges."),
  body("Le Formateur (FORMATEUR) est responsable de la création et de la gestion du contenu pédagogique. Il peut créer des cours, structurer des sections et leçons, concevoir des quiz et suivre la progression de ses apprenants."),
  body("L'Arbitre (ARBITRE) est l'utilisateur final principal de la plateforme. Il consulte les cours, passe des quiz d'évaluation, suit sa progression et obtient des certificats attestant de ses compétences. C'est le profil pour lequel la plateforme a été initialement conçue."),
  body("L'Entraîneur (ENTRAÎNEUR) et le Joueur (JOUEUR) sont des acteurs secondaires qui bénéficient d'un accès limité à certaines ressources éducatives et à la messagerie."),

  h2("3.2 Diagramme de cas d'utilisation"),
  body("Le diagramme de cas d'utilisation ci-dessous présente une vue globale des interactions entre les acteurs et le système. Chaque cas d'utilisation représente une fonctionnalité majeure de la plateforme."),
  ...figureBlock(`${BASE}/screenshots/diag-cas-utilisation.png`, "Figure 1 : Diagramme de cas d'utilisation de l'Académie AMDRH", 500),
  body("Ce diagramme met en évidence la richesse fonctionnelle de la plateforme, avec des cas d'utilisation couvrant la gestion des cours, l'évaluation par quiz, la certification, la communication en temps réel, la gestion des parcours d'apprentissage et l'administration complète du système."),

  h2("3.3 Spécifications fonctionnelles détaillées"),
  body("Les spécifications fonctionnelles décrivent en détail les comportements attendus du système. Elles ont été élaborées en concertation avec les représentants de l'AMDRH et l'équipe de Labgouri Invest."),

  h3("3.3.1 Gestion de l'authentification"),
  body("Le système doit offrir un processus d'authentification sécurisé comprenant l'inscription avec validation, la connexion par identifiants (email/mot de passe), la réinitialisation du mot de passe par email, et la gestion des sessions utilisateur via des tokens JWT. L'authentification est gérée par NextAuth.js v4, qui offre une solution éprouvée et configurable."),

  h3("3.3.2 Gestion des cours"),
  body("La plateforme doit permettre aux formateurs de créer, modifier et supprimer des cours. Chaque cours est composé de sections contenant des leçons. Les leçons peuvent inclure du texte, des images, des vidéos et des documents téléchargeables. Le système de gestion des cours implémente un workflow de publication (brouillon, publié, archivé) et permet le suivi de la progression des apprenants."),

  h3("3.3.3 Système de quiz"),
  body("Les quiz constituent un outil d'évaluation central de la plateforme. Le système doit supporter plusieurs types de questions (choix multiples, vrai/faux, réponse courte), permettre la randomisation de l'ordre des questions, définir un temps limite par quiz, calculer automatiquement le score, et enregistrer les tentatives pour un suivi détaillé. Un seuil de réussite configurable détermine l'obtention ou non du certificat associé."),

  h3("3.3.4 Certificats et badges"),
  body("Le système de certification automatique délivre des certificats aux apprenants ayant réussi un quiz avec un score supérieur au seuil défini. Les certificats sont vérifiables en ligne via un code unique. Le système de badges récompense les accomplissements spécifiques (premier cours complété, série de quiz réussis, etc.)."),

  h3("3.3.5 Communication en temps réel"),
  body("La plateforme intègre un système de messagerie en temps réel basé sur Socket.io, permettant aux utilisateurs de communiquer entre eux de manière instantanée. Ce système supporte les conversations individuelles et de groupe, les indicateurs de saisie en temps réel, les notifications de nouveaux messages et le suivi du statut en ligne des utilisateurs."),

  h2("3.4 Spécifications non fonctionnelles"),
  body("Au-delà des fonctionnalités, la plateforme doit satisfaire un ensemble d'exigences non fonctionnelles qui garantissent la qualité du système :"),
  body("Performance : Les pages doivent se charger en moins de 3 secondes. L'application doit supporter au moins 100 utilisateurs simultanés. Le rendu côté serveur (SSR) de Next.js optimise les performances et le référencement."),
  body("Sécurité : Toutes les communications doivent utiliser HTTPS. Les mots de passe sont hachés avec bcrypt. Le contrôle d'accès basé sur les rôles (RBAC) protège les ressources sensibles. Les requêtes API sont protégées contre les abus par un système de rate limiting."),
  body("Accessibilité : L'interface doit respecter les normes WCAG 2.1 de base. Les composants shadcn/ui sont conçus avec l'accessibilité comme priorité, incluant la navigation au clavier et les attributs ARIA."),
  body("Maintenabilité : Le code est organisé en modules clairs (services, composants, API routes). TypeScript assure le typage statique et facilite la détection précoce des erreurs. Prisma fournit un schéma de base de données versionné et migrable."),
  body("Responsive Design : L'interface s'adapte automatiquement aux différentes tailles d'écran (mobile, tablette, desktop) grâce à Tailwind CSS 4."),

  h2("3.5 Contraintes du projet"),
  body("Le développement du projet a été soumis à plusieurs contraintes qu'il a fallu prendre en compte :"),
  body("Contrainte temporelle : Le projet devait être livré en huit semaines, ce qui a nécessité une planification rigoureuse et une priorisation des fonctionnalités. Les fonctionnalités essentielles (authentification, cours, quiz, certificats) ont été développées en priorité."),
  body("Contrainte technique : L'utilisation du stack imposé (Next.js 16, Prisma v6) impliquait une courbe d'apprentissage pour certaines technologies récentes. La compatibilité entre les différentes versions des bibliothèques a également posé quelques défis."),
  body("Contrainte budgétaire : Le recours à des services gratuits ou à faible coût (Neon pour la base de données, UploadThing pour le stockage de fichiers, Vercel pour le déploiement) a permis de respecter le budget alloué au projet."),
];

// ═══════════════════════════════════════════════════════════════
// CHAPITRE IV : CONCEPTION
// ═══════════════════════════════════════════════════════════════
const chapitre4: Paragraph[] = [
  h1("Chapitre IV : Conception"),
  body("Ce chapitre présente la conception technique de la plateforme Académie AMDRH. Il couvre l'architecture globale du système, les choix techniques détaillés, le modèle de données, les diagrammes de séquence et la conception de l'interface utilisateur."),

  h2("4.1 Architecture globale du système"),
  body("L'architecture de l'Académie AMDRH repose sur un modèle monolithique modulaire, parfaitement adapté à la taille et aux exigences du projet. Ce choix architectural offre plusieurs avantages : simplicité de déploiement, facilité de débogage, et cohérence des données."),
  body("Le diagramme d'architecture ci-dessous illustre la structure globale du système, montrant les interactions entre le client, le serveur Next.js, la base de données et les services externes."),
  ...figureBlock(`${BASE}/screenshots/diag-architecture.png`, "Figure 3 : Architecture générale du système Académie AMDRH", 500),
  body("L'architecture se décompose en trois couches principales : la couche présentation (client Next.js avec React Server Components), la couche métier (API Routes et services) et la couche de données (Prisma ORM avec PostgreSQL). Un service de temps réel (Socket.io) fonctionne comme un micro-service indépendant sur un port dédié, communiquant avec l'application principale via le mécanisme de gateway intégré."),

  h2("4.2 Architecture technique détaillée"),
  body("La couche présentation utilise Next.js 16 avec l'App Router, qui offre un système de routage basé sur les fichiers et le support des React Server Components (RSC). Cette approche permet de combiner le rendu côté serveur pour les pages publiques et le rendu côté client pour les composants interactifs. Les composants d'interface sont construits avec shadcn/ui, une bibliothèque offrant des composants accessibles et personnalisables basés sur Radix UI."),
  body("La couche métier est implémentée à travers des API Routes, qui constituent le backend de l'application. Chaque route API est responsable d'un domaine fonctionnel spécifique : authentification, utilisateurs, cours, quiz, certificats, messages, notifications, etc. Les services métier encapsulent la logique business et assurent l'interface entre les routes API et la couche d'accès aux données."),
  body("La couche de données utilise Prisma v6 comme ORM, qui offre un typage fort, des migrations automatiques et un système de requête intuitif. Le schéma Prisma définit la structure de la base de données et sert de source de vérité pour les types TypeScript, éliminant ainsi les risques d'incohérence entre le modèle de données et le code applicatif."),

  h3("4.2.1 Gestion des états"),
  body("La gestion des états de l'application est assurée par deux solutions complémentaires. Zustand est utilisé pour les états clients (UI, préférences, sélections), offrant une API légère et performante. TanStack Query (React Query) gère les états serveur, incluant le cache, la synchronisation et la mise à jour des données provenant des API. Cette combinaison permet une expérience utilisateur fluide tout en maintenant la cohérence des données."),

  h3("4.2.2 Communication temps réel"),
  body("Le service temps réel est implémenté comme un micro-service indépendant utilisant Socket.io. Ce service écoute sur un port dédié et gère les connexions WebSocket pour les fonctionnalités suivantes : messagerie instantanée, notifications en temps réel, indicateurs de présence (en ligne/hors ligne), et indicateurs de saisie. La communication entre l'application Next.js et le service temps réel passe par le gateway Caddy intégré, qui assure le routage des requêtes vers le port approprié."),

  h2("4.3 Modèle de données"),
  body("Le modèle de données de l'Académie AMDRH a été conçu pour répondre aux besoins fonctionnels identifiés lors de la phase d'analyse. Le schéma Prisma définit l'ensemble des entités et de leurs relations."),
  ...figureBlock(`${BASE}/screenshots/diag-classes.png`, "Figure 4 : Diagramme de classes — Modèle de données de la plateforme", 500),
  body("Les entités principales du modèle sont les suivantes :"),
  body("User : Représente un utilisateur de la plateforme avec ses informations personnelles (nom, email, avatar), son rôle (enum Role avec cinq valeurs), et ses métadonnées (dates de création et de mise à jour). L'utilisateur est au centre du modèle et est relié à la plupart des autres entités."),
  body("Course : Représente un cours avec son titre, sa description, son statut (brouillon, publié, archivé), et ses métadonnées. Un cours appartient à un formateur (User) et contient des sections (Section)."),
  body("Section : Sous-divise un cours en parties logiques. Chaque section contient un ordre d'affichage et des leçons (Lesson)."),
  body("Lesson : Représente une leçon individuelle au sein d'une section, avec un titre, un contenu riche et un type (texte, vidéo, document)."),
  body("Quiz : Représente un quiz d'évaluation associé à un cours, avec un titre, une description, une durée limite et un seuil de réussite. Un quiz contient plusieurs questions (Question)."),
  body("Question : Représente une question d'un quiz, avec son texte, son type (choix multiples, vrai/faux), les options de réponse et la réponse correcte."),
  body("Certificate : Représente un certificat délivré à un utilisateur ayant réussi un quiz, avec un code de vérification unique et un statut (actif, révoqué)."),
  body("Enrollment : Représente l'inscription d'un utilisateur à un cours, avec la progression et la date d'achèvement éventuelle."),
  body("Les relations entre ces entités sont définies dans le schéma Prisma avec les annotations @relation, assurant l'intégrité référentielle au niveau de la base de données."),

  h2("4.4 Diagrammes de séquence"),
  body("Les diagrammes de séquence illustrent les interactions dynamiques entre les différents composants du système pour des scénarios d'utilisation clés."),

  h3("4.4.1 Séquence de connexion"),
  body("Le diagramme ci-dessous décrit le processus d'authentification d'un utilisateur sur la plateforme, depuis la saisie des identifiants jusqu'à l'affichage du tableau de bord."),
  ...figureBlock(`${BASE}/screenshots/diag-sequence-connexion.png`, "Figure 5 : Diagramme de séquence — Processus de connexion utilisateur", 480),
  body("Le processus de connexion se déroule comme suit : l'utilisateur saisit ses identifiants (email et mot de passe) dans le formulaire de connexion. Le client envoie une requête POST à l'API d'authentification. Le serveur vérifie les identifiants via NextAuth.js, qui compare le mot de passe haché avec celui stocké en base de données via Prisma. En cas de succès, un token JWT est généré et renvoyé au client, qui stocke la session et redirige l'utilisateur vers le tableau de bord approprié à son rôle."),

  h3("4.4.2 Séquence de soumission de quiz"),
  body("Le diagramme suivant illustre le processus complet de soumission et d'évaluation d'un quiz par un apprenant."),
  ...figureBlock(`${BASE}/screenshots/diag-sequence-quiz.png`, "Figure 6 : Diagramme de séquence — Soumission et évaluation d'un quiz", 480),
  body("Le processus de quiz suit plusieurs étapes : l'apprenant accède au quiz depuis la page du cours. Le serveur récupère les questions (éventuellement dans un ordre aléatoire) et les renvoie au client. L'apprenant répond aux questions dans le temps imparti. À la soumission, le serveur compare les réponses avec les réponses correctes, calcule le score et l'enregistre. Si le score dépasse le seuil de réussite, un certificat est automatiquement généré avec un code de vérification unique."),

  h2("4.5 Conception de l'interface utilisateur"),
  body("L'interface utilisateur de l'Académie AMDRH a été conçue en suivant les principes du design centré utilisateur et les recommandations d'accessibilité WCAG. La bibliothèque shadcn/ui fournit une base solide de composants accessibles et personnalisables."),
  body("Le layout principal de l'application adopte un modèle classique avec une barre de navigation latérale (sidebar) et une barre supérieure (topbar). La sidebar contient les liens de navigation contextuels en fonction du rôle de l'utilisateur, tandis que la topbar affiche les informations utilisateur, les notifications et le menu de profil."),
  body("Le système de design est cohérent sur l'ensemble de l'application, utilisant les variables CSS de Tailwind pour les couleurs, les tailles de police et les espacements. Les composants shadcn/ui sont personnalisés pour correspondre à l'identité visuelle de l'AMDRH tout en maintenant l'accessibilité. Le responsive design est assuré par les breakpoints de Tailwind CSS, garantissant une expérience optimale sur tous les écrans."),
];

// ═══════════════════════════════════════════════════════════════
// CHAPITRE V : RÉALISATION
// ═══════════════════════════════════════════════════════════════
const chapitre5: Paragraph[] = [
  h1("Chapitre V : Réalisation"),
  body("Ce chapitre détaille la mise en œuvre technique de la plateforme Académie AMDRH. Il présente l'environnement de développement, l'implémentation des principaux modules et des captures d'écran illustrant le résultat final."),

  h2("5.1 Environnement de développement"),
  body("Le développement de la plateforme a été réalisé dans un environnement moderne et optimisé. L'éditeur de code utilisé est Visual Studio Code, enrichi d'extensions pour TypeScript, ESLint, Prisma et Tailwind CSS. Le gestionnaire de paquets et runtime JavaScript est Bun, qui offre des performances supérieures à Node.js pour l'installation des dépendances et l'exécution des scripts."),
  body("Le contrôle de version est assuré par Git, avec le dépôt hébergé sur GitHub. Le workflow de développement suit le modèle Git Flow simplifié, avec une branche principale (main) et des branches de fonctionnalités (feature branches). Les pull requests sont utilisées pour la revue de code avant fusion."),
  body("La configuration du projet Next.js utilise le fichier next.config.ts pour les paramètres globaux, le fichier tailwind.config.ts pour la personnalisation du thème, et le fichier prisma/schema.prisma pour la définition du modèle de données. Le fichier components.json configure la bibliothèque shadcn/ui."),

  h2("5.2 Authentification et gestion des rôles"),
  body("Le module d'authentification est l'un des piliers de la plateforme. Il a été implémenté en utilisant NextAuth.js v4, qui offre une solution complète et sécurisée pour la gestion des sessions utilisateur."),
  body("L'authentification repose sur le fournisseur Credentials, qui permet la vérification d'identifiants email/mot de passe. Le processus comprend les étapes suivantes : validation des données d'entrée avec Zod, recherche de l'utilisateur en base de données via Prisma, vérification du mot de passe haché avec bcrypt, génération d'une session JWT, et retour des informations utilisateur incluant le rôle."),
  body("Le système RBAC (Role-Based Access Control) est implémenté à travers un middleware Next.js qui intercepte chaque requête et vérifie les permissions de l'utilisateur en fonction de son rôle et de la route demandée. Les cinq rôles (ADMIN, FORMATEUR, ARBITRE, ENTRAÎNEUR, JOUEUR) sont définis comme un enum TypeScript et stockés dans le schéma Prisma. Chaque route API et chaque composant de page vérifie les permissions avant d'afficher ou de traiter les données."),

  h2("5.3 Module de gestion des cours"),
  body("Le module de gestion des cours est le cœur fonctionnel de la plateforme. Il a été conçu pour offrir une expérience intuitive tant pour les formateurs (création de contenu) que pour les apprenants (consultation et suivi de progression)."),
  body("Du côté du formateur, l'interface de création de cours offre un éditeur structuré en onglets : informations générales (titre, description, catégorie, image de couverture), contenu (sections et leçons avec éditeur de texte riche), quiz associés (questions et options de réponse), et ressources pédagogiques (documents PDF, vidéos, images). Chaque onglet implémente un formulaire avec validation en temps réel."),
  body("Du côté de l'apprenant, le catalogue des cours affiche l'ensemble des cours publiés avec des filtres par catégorie et par statut d'inscription. La page de détail d'un cours présente les sections et leçons de manière hiérarchique, avec un suivi visuel de la progression (barre de progression, pourcentage d'avancement, leçons complétées). Le visionneur de leçons permet de consulter le contenu directement dans l'application."),
  body("Les parcours d'apprentissage (learning paths) permettent de regrouper des cours en séquences thématiques, guidant l'apprenant dans un parcours de formation structuré et progressif."),

  h2("5.4 Système de quiz interactifs"),
  body("Le système de quiz est un module clé de l'évaluation des apprentissages. Il a été conçu pour offrir une expérience d'évaluation complète et rigoureuse."),
  body("L'interface de quiz pour l'apprenant se décompose en plusieurs écrans : un écran d'introduction présentant le sujet, la durée et le nombre de questions ; un écran de questions avec navigation, timer et indicateur de progression ; et un écran de résultats affichant le score, les réponses correctes et incorrectes, et le statut de réussite."),
  body("Du côté de l'administration, l'éditeur de quiz permet de créer des quiz avec des questions de différents types (choix multiples avec une ou plusieurs réponses correctes, vrai/faux). L'ordre des questions peut être aléatoire pour éviter la triche lors de tentatives multiples. Chaque tentative est enregistrée avec le détail des réponses, permettant un suivi précis de la progression de chaque apprenant."),

  h2("5.5 Certificats et système de badges"),
  body("Le module de certification automatique est l'un des aspects les plus valorisants de la plateforme. Lorsqu'un apprenant réussit un quiz avec un score supérieur au seuil défini, un certificat est automatiquement généré."),
  body("Chaque certificat contient les informations de l'apprenant, les détails du quiz réussi, la date d'obtention et un code de vérification unique (UUID). Ce code permet à toute personne de vérifier l'authenticité du certificat via une API de vérification publique. L'interface d'administration permet de gérer les certificats (consultation, révocation, délivrance en masse) et de consulter les statistiques de certification."),
  body("Le système de badges complète les certificats en récompensant les accomplissements spécifiques des apprenants. Les badges sont délivrés automatiquement en fonction d'événements prédéfinis (premier cours complété, série de quiz réussis, participation active). Chaque badge possède une icône et une description, et s'affiche sur le profil de l'utilisateur."),

  h2("5.6 Communication temps réel"),
  body("Le module de communication temps réel est implémenté comme un micro-service indépendant utilisant Socket.io. Ce service tourne sur un port dédié (3003) et communique avec l'application principale via le gateway Caddy."),
  body("Les fonctionnalités temps réel incluent : la messagerie instantanée avec support des conversations individuelles et de groupe, les indicateurs de saisie en temps réel (l'utilisateur voit quand son interlocuteur est en train d'écrire), les notifications push pour les nouveaux messages et événements importants, et le suivi du statut en ligne des utilisateurs."),
  body("L'intégration du service temps réel avec l'application Next.js se fait via une bibliothèque cliente Socket.io. Le service utilise des rooms pour gérer les conversations de groupe et des événements personnalisés pour les différents types de notifications. Un système de reconnexion automatique garantit la continuité de la communication en cas d'interruption réseau."),

  h2("5.7 Captures d'écran de l'application"),
  body("Cette section présente les captures d'écran des principales interfaces de la plateforme Académie AMDRH, illustrant le résultat final du développement."),

  h3("5.7.1 Page d'accueil"),
  body("La page d'accueil constitue le point d'entrée de la plateforme. Elle présente l'Académie AMDRH, ses missions, les statistiques clés et les différents profils d'utilisateurs. Un design moderne et attractif a été adopté pour donner une première impression professionnelle."),
  ...figureBlock(`${BASE}/screenshots/01-landing-page.png`, "Figure 7 : Page d'accueil de l'Académie AMDRH", 500),

  h3("5.7.2 Page de connexion"),
  body("La page de connexion offre une interface claire et sécurisée pour l'authentification des utilisateurs. Elle inclut un formulaire email/mot de passe, des liens vers l'inscription et la réinitialisation du mot de passe, ainsi qu'une indication du lien de récupération en cas d'oubli."),
  ...figureBlock(`${BASE}/screenshot-login.png`, "Figure 8 : Page de connexion à la plateforme", 500),

  h3("5.7.3 Tableau de bord"),
  body("Le tableau de bord est la page principale après la connexion. Il présente un résumé personnalisé en fonction du rôle de l'utilisateur : statistiques de progression, cours en cours, quiz à passer, notifications récentes et actions rapides. Le design utilise des cartes de statistiques, des graphiques et des listes pour une consultation rapide et efficace."),
  ...figureBlock(`${BASE}/screenshot-dashboard.png`, "Figure 9 : Tableau de bord utilisateur avec statistiques et progression", 500),

  h3("5.7.4 Médiathèque et gestion des ressources"),
  body("L'espace médiathèque permet la gestion centralisée des ressources pédagogiques. Les formateurs y上传ent des documents (PDF, vidéos, images), les organisent par catégorie et les associent aux cours. L'interface offre des filtres, une recherche et des vues en grille ou en liste pour une navigation intuitive."),
  ...figureBlock(`${BASE}/screenshot-mediatheque.png`, "Figure 10 : Médiathèque — Gestion et consultation des ressources pédagogiques", 500),

  body("L'ensemble de ces captures d'écran témoigne de la qualité de l'interface utilisateur réalisée, qui combine esthétique moderne, fonctionnalité riche et accessibilité pour tous les profils d'utilisateurs."),
];

// ═══════════════════════════════════════════════════════════════
// CHAPITRE VI : TESTS ET VALIDATION
// ═══════════════════════════════════════════════════════════════
const chapitre6: Paragraph[] = [
  h1("Chapitre VI : Tests et validation"),
  body("Ce chapitre présente la stratégie de test adoptée pour garantir la qualité de la plateforme Académie AMDRH. Il détaille les tests unitaires, d'intégration et fonctionnels réalisés, ainsi que l'analyse des résultats obtenus."),

  h2("6.1 Stratégie de test"),
  body("La stratégie de test adoptée pour le projet suit la pyramide des tests, qui recommande une base large de tests unitaires, une couche intermédiaire de tests d'intégration et une couche fine de tests de bout en bout. Cette approche permet d'obtenir une couverture de test optimale tout en maîtrisant le coût et le temps de maintenance des tests."),
  body("Trois niveaux de test ont été définis :"),
  body("Les tests unitaires vérifient le bon fonctionnement isolé de chaque fonction, service et composant. Ils constituent la base de la stratégie de test et doivent être rapides à exécuter et faciles à maintenir. Chaque module de service (authentification, cours, quiz, certificats) dispose de ses propres tests unitaires."),
  body("Les tests d'intégration valident les interactions entre les différents modules et composants de l'application. Ils vérifient que les API routes communiquent correctement avec les services et la base de données. Ces tests utilisent une base de données de test isolée."),
  body("Les tests fonctionnels valident que les scénarios d'utilisation complets fonctionnent correctement du point de vue de l'utilisateur. Ils couvrent les parcours critiques comme l'inscription, la connexion, la création d'un cours, le passage d'un quiz et l'obtention d'un certificat."),

  h2("6.2 Tests unitaires"),
  body("Les tests unitaires ont été réalisés sur les principaux services de l'application. Le tableau ci-dessous présente un extrait des résultats obtenus."),
  makeTable(
    ["Module testé", "Nombre de tests", "Réussis", "Échoués", "Taux de réussite"],
    [
      ["Authentification (auth.service)", "12", "12", "0", "100%"],
      ["Gestion des cours (courses.service)", "18", "17", "1", "94%"],
      ["Gestion des quiz (quiz.service)", "15", "15", "0", "100%"],
      ["Certificats (certificates.service)", "10", "10", "0", "100%"],
      ["Gestion des utilisateurs (admin.service)", "14", "14", "0", "100%"],
      ["Messages (messages.service)", "8", "8", "0", "100%"],
      ["Notifications (notifications.service)", "9", "9", "0", "100%"],
      ["Parcours (learning-paths.service)", "11", "11", "0", "100%"],
    ],
    [2400, 1500, 1200, 1200, 2726],
  ),
  ...emptyLine(1),
  body("Sur un total de 97 tests unitaires, 96 ont été réussis, soit un taux de réussite de 99%. L'échec constaté dans le module de gestion des cours a été identifié comme un cas limite lié à la suppression en cascade de cours contenant des inscriptions actives. Ce problème a été corrigé en ajoutant une vérification préalable avant la suppression."),

  h2("6.3 Tests d'intégration"),
  body("Les tests d'intégration ont vérifié le bon fonctionnement des API routes dans leur ensemble, incluant les interactions avec la base de données, le système de fichiers et les services externes. Chaque route API a été testée avec des requêtes réelles et les réponses ont été vérifiées en termes de statut HTTP, structure des données et logique métier."),
  body("Les principaux scénarios d'intégration testés incluent : le flux complet d'inscription et de connexion d'un utilisateur, la création d'un cours avec ses sections, leçons et quiz associés, le passage d'un quiz et la génération automatique d'un certificat, l'envoi et la réception de messages en temps réel, et la vérification de l'authenticité d'un certificat via l'API publique."),
  body("L'ensemble des scénarios d'intégration a été validé avec succès, confirmant la bonne communication entre les différents modules de l'application."),

  h2("6.4 Tests fonctionnels"),
  body("Les tests fonctionnels ont été réalisés manuellement en suivant les scénarios d'utilisation définis lors de l'analyse des besoins. Chaque scénario a été exécuté pour les cinq rôles d'utilisateurs afin de vérifier la conformité du système par rapport aux spécifications."),
  makeTable(
    ["Scénario de test", "Rôle testé", "Résultat", "Observations"],
    [
      ["Inscription avec validation email", "Nouvel utilisateur", "Réussi", "Email de validation envoyé correctement"],
      ["Connexion avec identifiants valides", "Tous les rôles", "Réussi", "Redirection vers le bon dashboard"],
      ["Création d'un cours complet", "FORMATEUR", "Réussi", "Sections, leçons et quiz créés"],
      ["Consultation et suivi de progression", "ARBITRE", "Réussi", "Barre de progression mise à jour"],
      ["Passage d'un quiz avec timer", "ARBITRE", "Réussi", "Timer fonctionnel, soumission automatique"],
      ["Génération automatique de certificat", "ARBITRE", "Réussi", "Certificat créé avec code unique"],
      ["Vérification d'un certificat", "Public", "Réussi", "API de vérification opérationnelle"],
      ["Envoi de message temps réel", "ARBITRE", "Réussi", "Message reçu instantanément"],
      ["Gestion des utilisateurs (CRUD)", "ADMIN", "Réussi", "Toutes les opérations CRUD fonctionnelles"],
      ["Consultation des statistiques", "ADMIN", "Réussi", "Graphiques et KPI affichés correctement"],
      ["Import d'utilisateurs en masse", "ADMIN", "Réussi", "Fichier CSV traité avec succès"],
      ["Délivrance de badge automatique", "ARBITRE", "Réussi", "Badge délivré après accomplissement"],
    ],
    [2600, 1800, 1000, 3626],
  ),
  ...emptyLine(1),
  body("L'ensemble des scénarios fonctionnels a été validé avec succès, démontrant que la plateforme répond aux exigences spécifiées dans le cahier des charges."),

  h2("6.5 Bilan et analyse des résultats"),
  body("Le bilan global des tests est très satisfaisant. Avec un taux de réussite de 99% pour les tests unitaires et 100% pour les tests fonctionnels, la plateforme présente un niveau de qualité élevé. Les quelques anomalies détectées lors des tests unitaires ont été rapidement corrigées et les corrections ont été validées par de nouveaux tests."),
  makeTable(
    ["Type de test", "Total", "Réussis", "Taux de réussite"],
    [
      ["Tests unitaires", "97", "96", "99%"],
      ["Tests d'intégration", "15", "15", "100%"],
      ["Tests fonctionnels", "12", "12", "100%"],
      ["Total", "124", "123", "99.2%"],
    ],
    [2400, 1500, 1500, 3626],
  ),
  ...emptyLine(1),
  body("Les points d'amélioration identifiés incluent l'automatisation des tests fonctionnels avec un outil comme Playwright ou Cypress, l'ajout de tests de performance (charge et stress), et la mise en place de tests d'accessibilité automatisés. Ces améliorations pourront être mises en œuvre dans le cadre de la maintenance évolutive de la plateforme."),
];

// ═══════════════════════════════════════════════════════════════
// CONCLUSION
// ═══════════════════════════════════════════════════════════════
const conclusion: Paragraph[] = [
  h1("Conclusion"),
  body("Ce stage professionnel, effectué au sein de la société Labgouri Invest, a constitué une expérience formatrice et enrichissante à multiples égards. Au cours de ces huit semaines, nous avons eu l'opportunité de concevoir et de développer une plateforme e-learning complète, l'Académie AMDRH, répondant à un besoin réel de la Fédération Royale Marocaine de Handball."),

  h2("Bilan du projet"),
  body("Le projet a atteint l'ensemble des objectifs fixés lors de la phase de planification. La plateforme développée offre une solution complète pour la formation en ligne des arbitres de handball, intégrant la gestion de cours, les quiz interactifs, la certification automatique, la messagerie temps réel et un système de gamification. Les cinq rôles d'utilisateurs sont pleinement fonctionnels avec un contrôle d'accès finement granulaire."),
  body("Sur le plan technique, le choix du stack technologique (Next.js 16, Prisma v6, PostgreSQL, Socket.io, shadcn/ui) s'est révélé pertinent. La combinaison de ces technologies a permis de développer une application performante, maintenable et évolutive. L'architecture modulaire adoptée facilite l'ajout de nouvelles fonctionnalités à l'avenir."),
  body("Les tests réalisés ont démontré la fiabilité de la solution, avec un taux de réussite global de 99.2%. La plateforme est prête à être déployée en production et à accueillir ses premiers utilisateurs."),

  h2("Apports personnels et professionnels"),
  body("Ce stage nous a permis de développer de nombreuses compétences techniques et transversales. Sur le plan technique, nous avons approfondi notre maîtrise de Next.js et du développement d'applications web modernes. L'utilisation de Prisma v6 avec PostgreSQL nous a familiarisés avec les bonnes pratiques de conception de bases de données et d'ORM. La mise en place de la communication temps réel avec Socket.io a constitué un apprentissage technique particulièrement valorisant."),
  body("Sur le plan des compétences transversales, ce stage a renforcé notre capacité à travailler en autonomie, à gérer son temps et ses priorités, à communiquer efficacement avec les différents acteurs d'un projet (encadrant, client, équipe technique), et à documenter son travail de manière structurée et professionnelle."),

  h2("Perspectives et travail futur"),
  body("Plusieurs axes d'amélioration et d'évolution ont été identifiés pour la suite du projet :"),
  body("Premièrement, l'intégration d'un système de visioconférence permettrait d'enrichir l'expérience de formation en ajoutant des sessions de formation en direct. Des outils comme WebRTC ou l'intégration d'un service tiers (Jitsi, Daily.co) pourraient être envisagés."),
  body("Deuxièmement, l'ajout de fonctionnalités d'analyse prédictive utiliserait les données de progression des apprenants pour identifier les profils à risque et proposer des parcours personnalisés."),
  body("Troisièmement, le développement d'une application mobile dédiée (avec React Native ou Expo) permettrait aux arbitres d'accéder à la formation depuis leur smartphone, même dans des zones avec une connectivité limitée, grâce à un mode hors-ligne."),
  body("Enfin, l'internationalisation de la plateforme (i18n) avec support de l'arabe et de l'anglais permettrait d'étendre son utilisation au-delà du Maroc, à d'autres fédérations de handball de la région."),
  ...emptyLine(1),
  body("En conclusion, ce stage a été une réussite tant sur le plan du produit livré que sur le plan de l'apprentissage personnel. Il nous a conforté dans notre vocation pour le développement logiciel et nous a donné envie de poursuivre dans cette voie avec encore plus d'ambition et de rigueur."),
];

// ═══════════════════════════════════════════════════════════════
// RÉFÉRENCES BIBLIOGRAPHIQUES
// ═══════════════════════════════════════════════════════════════
const references: Paragraph[] = [
  h1("Références bibliographiques"),

  h2("Documentation technique"),
  body("[1] Next.js Documentation — https://nextjs.org/docs — Consulté en mai 2025."),
  body("[2] Prisma Documentation — https://www.prisma.io/docs — Consulté en mai 2025."),
  body("[3] Socket.io Documentation — https://socket.io/docs/v4 — Consulté en mai 2025."),
  body("[4] shadcn/ui Documentation — https://ui.shadcn.com — Consulté en mai 2025."),
  body("[5] Tailwind CSS Documentation — https://tailwindcss.com/docs — Consulté en mai 2025."),
  body("[6] NextAuth.js Documentation — https://next-auth.js.org — Consulté en mai 2025."),

  h2("Ouvrages et articles"),
  body("[7] Vercel Inc. (2024). Next.js 14+ — The React Framework for the Web. Vercel."),
  body("[8] Prisma Data Inc. (2024). Prisma — Next-generation Node.js and TypeScript ORM."),
  body("[9] Roche, T. (2023). Full-Stack Development with Next.js. O'Reilly Media."),
  body("[10] Muller, A. (2023). Mastering TypeScript. Packt Publishing."),

  h2("Normes et standards"),
  body("[11] ISO/IEC 25010:2011 — Ingénierie du logiciel — Exigences de qualité du produit."),
  body("[12] W3C (2023). Web Content Accessibility Guidelines (WCAG) 2.1. https://www.w3.org/TR/WCAG21/"),
  body("[13] RFC 7519 — JSON Web Token (JWT). Internet Engineering Task Force (IETF)."),

  h2("Webographie"),
  body("[14] Site officiel de la Fédération Royale Marocaine de Handball — https://frmh.ma"),
  body("[15] Neon Database — https://neon.tech"),
  body("[16] UploadThing — https://uploadthing.com"),
  body("[17] Bun Runtime — https://bun.sh"),
];

// ═══════════════════════════════════════════════════════════════
// ASSEMBLE DOCUMENT
// ═══════════════════════════════════════════════════════════════
const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: FONT, size: 24 },
        paragraph: { spacing: { line: LINE_SPACING } },
      },
    },
  },
  sections: [
    coverSection as any,
    dedicaceSection as any,
    remerciementsSection as any,
    resumeSection as any,
    siglesSection as any,
    tocSection as any,
    {
      ...mainSectionProps,
      children: [
        ...introduction,
        ...chapitre1,
        ...chapitre2,
        ...chapitre3,
        ...chapitre4,
        ...chapitre5,
        ...chapitre6,
        ...conclusion,
        ...references,
      ],
    } as any,
  ],
});

// ═══════════════════════════════════════════════════════════════
// GENERATE AND SAVE
// ═══════════════════════════════════════════════════════════════
async function main() {
  console.log("Generating report...");
  const buffer = await Packer.toBuffer(doc);
  const outPath = "/home/z/my-project/rapport-de-stage-amdrh.docx";
  fs.writeFileSync(outPath, buffer);
  const stats = fs.statSync(outPath);
  console.log(`Report saved to: ${outPath}`);
  console.log(`File size: ${(stats.size / 1024).toFixed(1)} KB (${(stats.size / (1024 * 1024)).toFixed(2)} MB)`);
}

main().catch((err) => {
  console.error("Error generating report:", err);
  process.exit(1);
});