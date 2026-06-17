#!/usr/bin/env python3
"""Generate UML and architecture diagrams for the internship report."""

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
import numpy as np
import os

OUT = "/home/z/my-project/screenshots"
DPI = 200

# ── Color palette ──
DARK_BLUE = "#1B2A4A"
MED_BLUE = "#2C4A7C"
LIGHT_BLUE = "#4A7AB5"
ACCENT = "#E8A838"
BG = "#FFFFFF"
LIGHT_GRAY = "#F0F0F5"
BORDER = "#CCCCCC"
TEXT = "#222222"
WHITE = "#FFFFFF"
GREEN = "#2E8B57"
ORANGE = "#D2691E"
RED = "#C0392B"
PURPLE = "#6C3483"
TEAL = "#1ABC9C"


def setup_fig(w, h):
    fig, ax = plt.subplots(1, 1, figsize=(w, h))
    ax.set_xlim(0, w)
    ax.set_ylim(0, h)
    ax.set_aspect('equal')
    ax.axis('off')
    fig.patch.set_facecolor(BG)
    return fig, ax


def draw_box(ax, x, y, w, h, text, color=LIGHT_BLUE, text_color=WHITE, fontsize=8, bold=False, rounded=True):
    if rounded:
        box = FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.1", facecolor=color, edgecolor=DARK_BLUE, linewidth=1.2)
    else:
        box = mpatches.FancyBboxPatch((x, y), w, h, boxstyle="square,pad=0", facecolor=color, edgecolor=DARK_BLUE, linewidth=1.2)
    ax.add_patch(box)
    weight = 'bold' if bold else 'normal'
    ax.text(x + w/2, y + h/2, text, ha='center', va='center', fontsize=fontsize,
            color=text_color, fontweight=weight, wrap=True,
            fontfamily='serif')
    return box


def draw_stickman(ax, x, y, label, color=DARK_BLUE, fontsize=8):
    """Draw a UML stickman actor."""
    s = 0.15
    # Head
    head = plt.Circle((x, y + 3.5*s), s*0.5, fill=False, edgecolor=color, linewidth=1.8)
    ax.add_patch(head)
    # Body
    ax.plot([x, x], [y + 3*s, y + 1.5*s], color=color, linewidth=1.8)
    # Arms
    ax.plot([x - 0.7*s, x + 0.7*s], [y + 2.6*s, y + 2.6*s], color=color, linewidth=1.8)
    # Legs
    ax.plot([x, x - 0.6*s], [y + 1.5*s, y + 0.3*s], color=color, linewidth=1.8)
    ax.plot([x, x + 0.6*s], [y + 1.5*s, y + 0.3*s], color=color, linewidth=1.8)
    # Label
    ax.text(x, y - 0.3*s, label, ha='center', va='top', fontsize=fontsize,
            color=color, fontweight='bold', fontfamily='serif')


def draw_usecase(ax, x, y, w, h, text, color=LIGHT_BLUE, fontsize=7.5):
    """Draw a UML use case ellipse."""
    ellipse = mpatches.Ellipse((x + w/2, y + h/2), w, h, facecolor=color, edgecolor=DARK_BLUE, linewidth=1.2, alpha=0.9)
    ax.add_patch(ellipse)
    ax.text(x + w/2, y + h/2, text, ha='center', va='center', fontsize=fontsize,
            color=WHITE, fontweight='normal', fontfamily='serif', wrap=True)


def draw_arrow(ax, x1, y1, x2, y2, color=DARK_BLUE, style='->', lw=1.0):
    ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle=style, color=color, lw=lw))


# ═══════════════════════════════════════════════════════════════════
# 1. DIAGRAMME DES CAS D'UTILISATION
# ═══════════════════════════════════════════════════════════════════
def gen_use_case():
    fig, ax = setup_fig(14, 10)

    # System boundary
    boundary = FancyBboxPatch((3.5, 0.5), 7, 9, boxstyle="round,pad=0.3",
                               facecolor=LIGHT_GRAY, edgecolor=DARK_BLUE, linewidth=2, linestyle='--')
    ax.add_patch(boundary)
    ax.text(7, 9.2, "Académie AMDRH", ha='center', va='bottom', fontsize=13,
            color=DARK_BLUE, fontweight='bold', fontfamily='serif')

    # Actors
    draw_stickman(ax, 1.2, 7.5, "Administrateur", DARK_BLUE, 8)
    draw_stickman(ax, 1.2, 4.0, "Formateur", MED_BLUE, 8)
    draw_stickman(ax, 12.8, 7.5, "Arbitre", TEAL, 8)
    draw_stickman(ax, 12.8, 5.0, "Entraîneur", ORANGE, 8)
    draw_stickman(ax, 12.8, 2.0, "Joueur", GREEN, 8)

    # Admin use cases
    admin_ucs = [
        (5.0, 8.2, "Gérer les\nutilisateurs"),
        (8.0, 8.2, "Gérer les\ncours"),
        (5.0, 6.5, "Gérer les\nquiz"),
        (8.0, 6.5, "Gérer les\ncertificats"),
        (5.0, 5.0, "Consulter les\nanalyses"),
        (8.0, 5.0, "Gérer les\nbadges"),
    ]
    for (ux, uy, txt) in admin_ucs:
        draw_usecase(ax, ux, uy, 2.4, 1.0, txt, DARK_BLUE, 7.5)

    # Formateur use cases
    form_ucs = [
        (5.0, 3.5, "Créer des\ncours"),
        (8.0, 3.5, "Créer des\nquiz"),
        (5.0, 2.0, "Suivre les\napprenants"),
    ]
    for (ux, uy, txt) in form_ucs:
        draw_usecase(ax, ux, uy, 2.4, 1.0, txt, MED_BLUE, 7.5)

    # Learner use cases
    learner_ucs = [
        (8.0, 2.0, "Parcourir les\ncours"),
        (5.5, 0.8, "Passer des\nquiz"),
        (8.5, 0.8, "Consulter\nprogression"),
    ]
    for (ux, uy, txt) in learner_ucs:
        draw_usecase(ax, ux, uy, 2.4, 1.0, txt, TEAL, 7.5)

    # Arrows: Admin
    for (ux, uy, _) in admin_ucs:
        draw_arrow(ax, 2.0, 7.8, ux + 0.1, uy + 0.5, DARK_BLUE)
    # Arrows: Formateur
    for (ux, uy, _) in form_ucs:
        draw_arrow(ax, 2.0, 4.3, ux + 0.1, uy + 0.5, MED_BLUE)
    # Arrows: Learners
    draw_arrow(ax, 12.0, 7.8, 10.5, 2.5, TEAL)
    draw_arrow(ax, 12.0, 5.3, 10.5, 2.5, ORANGE)
    draw_arrow(ax, 12.0, 2.3, 10.5, 1.5, GREEN)

    fig.tight_layout()
    fig.savefig(f"{OUT}/diag-cas-utilisation.png", dpi=DPI, bbox_inches='tight', facecolor=BG)
    plt.close(fig)
    print("✓ diag-cas-utilisation.png")


# ═══════════════════════════════════════════════════════════════════
# 2. DIAGRAMME D'ARCHITECTURE
# ═══════════════════════════════════════════════════════════════════
def gen_architecture():
    fig, ax = setup_fig(14, 9)

    # Title
    ax.text(7, 8.7, "Architecture Générale du Système", ha='center', va='bottom',
            fontsize=14, color=DARK_BLUE, fontweight='bold', fontfamily='serif')

    # Client layer
    draw_box(ax, 4.5, 7.5, 5, 0.9, "Navigateur Web (Client)", DARK_BLUE, WHITE, 10, True)
    draw_box(ax, 5.0, 6.2, 4, 0.9, "Next.js 16 + React\n(Frontend)", MED_BLUE, WHITE, 9, True)

    # Gateway
    draw_box(ax, 5.5, 4.8, 3, 0.8, "Caddy (Gateway)", ACCENT, DARK_BLUE, 9, True)

    # Backend
    draw_box(ax, 1.0, 3.2, 3.5, 0.9, "Next.js API Routes\n(Backend)", LIGHT_BLUE, WHITE, 9, True)
    draw_box(ax, 5.3, 3.2, 3.5, 0.9, "Auth (NextAuth.js)\nJWT + RBAC", PURPLE, WHITE, 9, True)
    draw_box(ax, 9.5, 3.2, 3.5, 0.9, "Socket.io Service\n(Temps réel)", TEAL, WHITE, 9, True)

    # Data layer
    draw_box(ax, 1.0, 1.5, 3.5, 0.9, "PostgreSQL (Neon)\nBase de données", GREEN, WHITE, 9, True)
    draw_box(ax, 5.3, 1.5, 3.5, 0.9, "UploadThing\nStockage fichiers", ORANGE, WHITE, 9, True)
    draw_box(ax, 9.5, 1.5, 3.5, 0.9, "Prisma ORM\nCouche d'accès", RED, WHITE, 9, True)

    # Deployment
    draw_box(ax, 4.5, 0.2, 5, 0.7, "Vercel (Hébergement + CDN)", "#555555", WHITE, 9, True)

    # Arrows
    draw_arrow(ax, 7, 7.5, 7, 7.1, DARK_BLUE, '->', 1.5)
    draw_arrow(ax, 7, 6.2, 7, 5.6, DARK_BLUE, '->', 1.5)
    draw_arrow(ax, 5.5, 4.8, 3.5, 4.1, DARK_BLUE, '->', 1.2)
    draw_arrow(ax, 7, 4.8, 7, 4.1, DARK_BLUE, '->', 1.2)
    draw_arrow(ax, 8.5, 4.8, 10.5, 4.1, DARK_BLUE, '->', 1.2)

    draw_arrow(ax, 2.75, 3.2, 2.75, 2.4, GREEN, '->', 1.2)
    draw_arrow(ax, 7.05, 3.2, 7.05, 2.4, ORANGE, '->', 1.2)
    draw_arrow(ax, 11.25, 3.2, 11.25, 2.4, RED, '->', 1.2)

    draw_arrow(ax, 7, 1.5, 7, 0.9, "#555555", '->', 1.2)

    # Bidirectional arrow for Socket.io
    ax.annotate('', xy=(13.2, 4.2), xytext=(13.2, 6.2),
                arrowprops=dict(arrowstyle='<->', color=TEAL, lw=1.5, linestyle='dashed'))
    ax.text(13.5, 5.2, "WebSocket", fontsize=7, color=TEAL, fontfamily='serif', rotation=90, va='center')

    fig.tight_layout()
    fig.savefig(f"{OUT}/diag-architecture.png", dpi=DPI, bbox_inches='tight', facecolor=BG)
    plt.close(fig)
    print("✓ diag-architecture.png")


# ═══════════════════════════════════════════════════════════════════
# 3. DIAGRAMME DE SÉQUENCE - CONNEXION
# ═══════════════════════════════════════════════════════════════════
def gen_sequence_connexion():
    fig, ax = setup_fig(14, 10)

    ax.text(7, 9.7, "Diagramme de Séquence — Connexion", ha='center', va='bottom',
            fontsize=14, color=DARK_BLUE, fontweight='bold', fontfamily='serif')

    actors = [
        (1.5, "Utilisateur"),
        (4.5, "Interface\n(React)"),
        (7.5, "API Route\n/auth/login"),
        (10.5, "NextAuth.js"),
        (12.5, "Base de\ndonnées"),
    ]
    actor_x = [a[0] for a in actors]
    actor_labels = [a[1] for a in actors]

    # Draw actor boxes at top
    for x, label in actors:
        draw_box(ax, x - 0.8, 8.8, 1.6, 0.7, label, DARK_BLUE, WHITE, 7.5, True)

    # Lifelines
    for x in actor_x:
        ax.plot([x, x], [8.8, 0.5], color=BORDER, linewidth=1, linestyle='-')

    # Messages (y positions going down)
    msgs = [
        (1.5, 4.5, 8.2, "1: Saisir email/mot de passe", DARK_BLUE),
        (4.5, 7.5, 7.6, "2: POST /api/auth/login {email, pwd}", MED_BLUE),
        (7.5, 10.5, 7.0, "3: signIn('credentials')", LIGHT_BLUE),
        (10.5, 12.5, 6.4, "4: SELECT * FROM User WHERE email=?", TEAL),
        (12.5, 10.5, 5.8, "5: Résultat utilisateur", GREEN),
        (10.5, 10.5, 5.2, "6: Vérification mot de passe (bcrypt)", ORANGE),
        (10.5, 7.5, 4.6, "7: JWT Token + Session", PURPLE),
        (7.5, 4.5, 4.0, "8: Response {token, user}", RED),
        (4.5, 1.5, 3.4, "9: Redirection vers /dashboard", DARK_BLUE),
    ]

    for (x1, x2, y, label, color) in msgs:
        ax.annotate('', xy=(x2, y - 0.15), xytext=(x1, y + 0.15),
                    arrowprops=dict(arrowstyle='->', color=color, lw=1.3))
        mid_x = (x1 + x2) / 2
        if x1 < x2:
            ax.text(mid_x + 0.1, y + 0.22, label, fontsize=7, color=color, fontfamily='serif', va='bottom')
        else:
            ax.text(mid_x - 0.1, y + 0.22, label, fontsize=7, color=color, fontfamily='serif', va='bottom', ha='right')

    # Activation boxes
    for x in [4.5, 7.5, 10.5]:
        rect = mpatches.FancyBboxPatch((x - 0.05, 7.6), 0.1, -3.2, boxstyle="square,pad=0",
                                        facecolor=LIGHT_BLUE, edgecolor=DARK_BLUE, linewidth=0.8, alpha=0.3)
        ax.add_patch(rect)

    # Alt frame for error
    frame = FancyBboxPatch((0.5, 1.0), 13, 1.8, boxstyle="round,pad=0.1",
                            facecolor='none', edgecolor=RED, linewidth=1.5, linestyle='--')
    ax.add_patch(frame)
    ax.text(0.7, 2.6, "[échec auth]", fontsize=7.5, color=RED, fontfamily='serif', fontweight='bold')
    ax.text(1.0, 2.1, "Erreur 401 : identifiants invalides", fontsize=7, color=RED, fontfamily='serif')

    fig.tight_layout()
    fig.savefig(f"{OUT}/diag-sequence-connexion.png", dpi=DPI, bbox_inches='tight', facecolor=BG)
    plt.close(fig)
    print("✓ diag-sequence-connexion.png")


# ═══════════════════════════════════════════════════════════════════
# 4. DIAGRAMME DE SÉQUENCE - QUIZ
# ═══════════════════════════════════════════════════════════════════
def gen_sequence_quiz():
    fig, ax = setup_fig(14, 10)

    ax.text(7, 9.7, "Diagramme de Séquence — Soumission de Quiz", ha='center', va='bottom',
            fontsize=14, color=DARK_BLUE, fontweight='bold', fontfamily='serif')

    actors = [
        (1.2, "Apprenant"),
        (3.8, "Interface\nQuiz"),
        (6.5, "API\n/quiz/[id]"),
        (9.2, "Service\nQuiz"),
        (11.8, "Base de\ndonnées"),
    ]
    actor_x = [a[0] for a in actors]

    for x, label in actors:
        draw_box(ax, x - 0.8, 8.8, 1.6, 0.7, label, DARK_BLUE, WHITE, 7.5, True)

    for x in actor_x:
        ax.plot([x, x], [8.8, 0.5], color=BORDER, linewidth=1, linestyle='-')

    msgs = [
        (1.2, 3.8, 8.2, "1: Répondre aux questions", DARK_BLUE),
        (3.8, 6.5, 7.5, "2: POST /api/quiz/[id] {answers}", MED_BLUE),
        (6.5, 9.2, 6.9, "3: submitQuiz(quizId, answers)", LIGHT_BLUE),
        (9.2, 11.8, 6.3, "4: Récupérer quiz + bonnes réponses", TEAL),
        (11.8, 9.2, 5.7, "5: Données du quiz", GREEN),
        (9.2, 9.2, 5.1, "6: Calculer le score", ORANGE),
        (9.2, 11.8, 4.5, "7: INSERT QuizAttempt", PURPLE),
        (11.8, 9.2, 3.9, "8: Confirmation insertion", GREEN),
        (9.2, 6.5, 3.3, "9: Résultat {score, passed}", RED),
        (6.5, 3.8, 2.7, "10: Afficher résultat + feedback", DARK_BLUE),
    ]

    for (x1, x2, y, label, color) in msgs:
        ax.annotate('', xy=(x2, y - 0.15), xytext=(x1, y + 0.15),
                    arrowprops=dict(arrowstyle='->', color=color, lw=1.3))
        mid_x = (x1 + x2) / 2
        if x1 < x2:
            ax.text(mid_x + 0.1, y + 0.22, label, fontsize=6.8, color=color, fontfamily='serif', va='bottom')
        else:
            ax.text(mid_x - 0.1, y + 0.22, label, fontsize=6.8, color=color, fontfamily='serif', va='bottom', ha='right')

    # Loop frame
    frame = FancyBboxPatch((0.4, 6.2), 12.5, 1.8, boxstyle="round,pad=0.1",
                            facecolor='none', edgecolor=PURPLE, linewidth=1.5, linestyle='--')
    ax.add_patch(frame)
    ax.text(0.6, 7.8, "[loop] Pour chaque question", fontsize=7.5, color=PURPLE, fontfamily='serif', fontweight='bold')

    # Alt frame for certificate
    frame2 = FancyBboxPatch((0.4, 1.0), 12.5, 1.5, boxstyle="round,pad=0.1",
                             facecolor='none', edgecolor=GREEN, linewidth=1.5, linestyle='--')
    ax.add_patch(frame2)
    ax.text(0.6, 2.3, "[score ≥ seuil] Générer certificat", fontsize=7.5, color=GREEN, fontfamily='serif', fontweight='bold')

    for x in [3.8, 6.5, 9.2]:
        rect = mpatches.FancyBboxPatch((x - 0.05, 7.5), 0.1, -4.2, boxstyle="square,pad=0",
                                        facecolor=LIGHT_BLUE, edgecolor=DARK_BLUE, linewidth=0.8, alpha=0.3)
        ax.add_patch(rect)

    fig.tight_layout()
    fig.savefig(f"{OUT}/diag-sequence-quiz.png", dpi=DPI, bbox_inches='tight', facecolor=BG)
    plt.close(fig)
    print("✓ diag-sequence-quiz.png")


# ═══════════════════════════════════════════════════════════════════
# 5. DIAGRAMME DE CLASSES
# ═══════════════════════════════════════════════════════════════════
def gen_class_diagram():
    fig, ax = setup_fig(16, 12)

    ax.text(8, 11.7, "Diagramme de Classes — Modèle de Données", ha='center', va='bottom',
            fontsize=14, color=DARK_BLUE, fontweight='bold', fontfamily='serif')

    def draw_class_box(ax, x, y, w, h, name, attrs, methods, color=LIGHT_BLUE):
        # Class name box
        draw_box(ax, x, y + h - 0.6, w, 0.6, name, color, WHITE, 8, True)
        # Separator
        ax.plot([x, x + w], [y + h - 0.6, y + h - 0.6], color=DARK_BLUE, linewidth=1)
        # Attributes
        attr_y = y + h - 0.9
        for a in attrs:
            ax.text(x + 0.1, attr_y, a, fontsize=6.5, color=TEXT, fontfamily='serif', va='top')
            attr_y -= 0.32
        # Separator
        sep_y = attr_y + 0.05
        ax.plot([x, x + w], [sep_y, sep_y], color=DARK_BLUE, linewidth=0.8)
        # Methods
        method_y = sep_y - 0.1
        for m in methods:
            ax.text(x + 0.1, method_y, m, fontsize=6.5, color=TEXT, fontfamily='serif', va='top', style='italic')
            method_y -= 0.32
        # Border
        rect = FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.05",
                               facecolor='none', edgecolor=DARK_BLUE, linewidth=1.2)
        ax.add_patch(rect)

    # User
    draw_class_box(ax, 0.3, 7.5, 3.2, 3.8, "User", [
        "+ id: String",
        "+ name: String",
        "+ email: String",
        "+ password: String",
        "+ role: Role",
        "+ avatar: String?",
        "+ createdAt: DateTime",
    ], [
        "+ getFullName(): String",
        "+ hasRole(r: Role): Boolean",
    ], DARK_BLUE)

    # Course
    draw_class_box(ax, 5.0, 8.0, 3.2, 3.2, "Course", [
        "+ id: String",
        "+ title: String",
        "+ description: String",
        "+ status: Status",
        "+ categoryId: String?",
        "+ thumbnail: String?",
        "+ createdAt: DateTime",
    ], [
        "+ getProgress(u): Number",
    ], MED_BLUE)

    # Section
    draw_class_box(ax, 9.5, 8.5, 3.0, 2.5, "Section", [
        "+ id: String",
        "+ title: String",
        "+ order: Int",
        "+ courseId: String",
    ], [], LIGHT_BLUE)

    # Lesson
    draw_class_box(ax, 13.2, 8.5, 3.0, 2.5, "Lesson", [
        "+ id: String",
        "+ title: String",
        "+ content: String",
        "+ type: LessonType",
        "+ sectionId: String",
        "+ order: Int",
    ], [], TEAL)

    # Quiz
    draw_class_box(ax, 9.5, 5.0, 3.0, 3.0, "Quiz", [
        "+ id: String",
        "+ title: String",
        "+ courseId: String",
        "+ passingScore: Int",
        "+ timeLimit: Int?",
        "+ maxAttempts: Int",
    ], [], PURPLE)

    # Question
    draw_class_box(ax, 13.2, 5.0, 3.0, 2.8, "Question", [
        "+ id: String",
        "+ text: String",
        "+ type: QType",
        "+ options: Json",
        "+ correctAnswer: String",
        "+ quizId: String",
        "+ order: Int",
    ], [], ORANGE)

    # QuizAttempt
    draw_class_box(ax, 5.0, 4.5, 3.5, 2.5, "QuizAttempt", [
        "+ id: String",
        "+ userId: String",
        "+ quizId: String",
        "+ score: Int",
        "+ passed: Boolean",
        "+ answers: Json",
        "+ completedAt: DateTime",
    ], [], RED)

    # Certificate
    draw_class_box(ax, 0.3, 3.5, 3.2, 2.5, "Certificate", [
        "+ id: String",
        "+ userId: String",
        "+ courseId: String",
        "+ certificateId: String",
        "+ issuedAt: DateTime",
        "+ pdfUrl: String?",
    ], [], GREEN)

    # Badge
    draw_class_box(ax, 0.3, 0.5, 3.2, 2.5, "Badge", [
        "+ id: String",
        "+ name: String",
        "+ description: String",
        "+ icon: String",
        "+ criteria: Json",
    ], [], ACCENT)

    # Enrollment
    draw_class_box(ax, 9.5, 1.5, 3.0, 2.5, "Enrollment", [
        "+ id: String",
        "+ userId: String",
        "+ courseId: String",
        "+ progress: Float",
        "+ enrolledAt: DateTime",
        "+ completedAt: DateTime?",
    ], [], TEAL)

    # Relationships
    # User -> QuizAttempt (1:N)
    draw_arrow(ax, 1.9, 7.5, 5.8, 7.0, DARK_BLUE, '->', 1.2)
    ax.text(3.2, 7.5, "1", fontsize=7, color=DARK_BLUE, fontfamily='serif')
    ax.text(5.2, 7.2, "*", fontsize=7, color=DARK_BLUE, fontfamily='serif')

    # Course -> Section (1:N)
    draw_arrow(ax, 8.2, 9.0, 9.5, 9.5, MED_BLUE, '->', 1.2)
    ax.text(8.5, 9.4, "1", fontsize=7, color=MED_BLUE, fontfamily='serif')
    ax.text(9.3, 9.7, "*", fontsize=7, color=MED_BLUE, fontfamily='serif')

    # Section -> Lesson (1:N)
    draw_arrow(ax, 12.5, 9.5, 13.2, 9.5, LIGHT_BLUE, '->', 1.2)
    ax.text(12.6, 9.7, "1..*", fontsize=7, color=LIGHT_BLUE, fontfamily='serif')

    # Course -> Quiz (1:N)
    draw_arrow(ax, 8.2, 8.2, 9.8, 8.0, MED_BLUE, '->', 1.2)

    # Quiz -> Question (1:N)
    draw_arrow(ax, 12.5, 6.5, 13.2, 6.5, PURPLE, '->', 1.2)
    ax.text(12.6, 6.7, "1..*", fontsize=7, color=PURPLE, fontfamily='serif')

    # QuizAttempt -> Quiz (N:1)
    draw_arrow(ax, 8.5, 5.8, 9.5, 6.5, RED, '->', 1.2)

    # User -> Certificate (1:N)
    draw_arrow(ax, 1.9, 7.5, 1.9, 6.0, DARK_BLUE, '->', 1.2)

    # User -> Enrollment (1:N)
    draw_arrow(ax, 3.5, 8.0, 11.0, 4.0, DARK_BLUE, '->', 0.8)

    fig.tight_layout()
    fig.savefig(f"{OUT}/diag-classes.png", dpi=DPI, bbox_inches='tight', facecolor=BG)
    plt.close(fig)
    print("✓ diag-classes.png")


# ═══════════════════════════════════════════════════════════════════
# 6. DIAGRAMME DE BASE DE DONNÉES (ER)
# ═══════════════════════════════════════════════════════════════════
def gen_db_diagram():
    fig, ax = setup_fig(16, 11)

    ax.text(8, 10.7, "Schéma de la Base de Données (Modèle Entité-Association)", ha='center', va='bottom',
            fontsize=14, color=DARK_BLUE, fontweight='bold', fontfamily='serif')

    def draw_table(ax, x, y, w, h, name, fields, pk_color=DARK_BLUE):
        # Header
        draw_box(ax, x, y + h - 0.55, w, 0.55, name, pk_color, WHITE, 8, True)
        # Fields
        fy = y + h - 0.85
        for i, (fname, ftype, is_pk) in enumerate(fields):
            bg = "#E8EDF5" if is_pk else (LIGHT_GRAY if i % 2 == 0 else WHITE)
            rect = FancyBboxPatch((x, fy - 0.28), w, 0.3, boxstyle="square,pad=0",
                                   facecolor=bg, edgecolor=BORDER, linewidth=0.5)
            ax.add_patch(rect)
            prefix = "🔑 " if is_pk else "    "
            ax.text(x + 0.1, fy - 0.05, f"{prefix}{fname}", fontsize=6, color=TEXT, fontfamily='serif', va='center')
            ax.text(x + w - 0.1, fy - 0.05, ftype, fontsize=5.5, color="#666", fontfamily='serif', va='center', ha='right')
            fy -= 0.3
        # Border
        rect = FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.05",
                               facecolor='none', edgecolor=pk_color, linewidth=1.5)
        ax.add_patch(rect)

    # Users table
    draw_table(ax, 0.2, 5.5, 3.8, 4.6, "users", [
        ("id", "UUID", True),
        ("name", "VARCHAR(255)", False),
        ("email", "VARCHAR(255)", False),
        ("password", "VARCHAR(255)", False),
        ("role", "ENUM", False),
        ("avatar", "TEXT", False),
        ("emailVerified", "DATETIME", False),
        ("createdAt", "DATETIME", False),
        ("updatedAt", "DATETIME", False),
    ], DARK_BLUE)

    # courses
    draw_table(ax, 5.0, 6.5, 3.8, 3.6, "courses", [
        ("id", "UUID", True),
        ("title", "VARCHAR(255)", False),
        ("description", "TEXT", False),
        ("status", "ENUM", False),
        ("thumbnail", "TEXT", False),
        ("createdById", "UUID", False),
        ("createdAt", "DATETIME", False),
        ("categoryId", "UUID", False),
    ], MED_BLUE)

    # sections
    draw_table(ax, 9.8, 7.5, 3.4, 2.4, "sections", [
        ("id", "UUID", True),
        ("title", "VARCHAR(255)", False),
        ("order", "INT", False),
        ("courseId", "UUID", False),
    ], LIGHT_BLUE)

    # lessons
    draw_table(ax, 13.5, 7.5, 3.2, 2.6, "lessons", [
        ("id", "UUID", True),
        ("title", "VARCHAR(255)", False),
        ("content", "TEXT", False),
        ("type", "ENUM", False),
        ("sectionId", "UUID", False),
        ("order", "INT", False),
    ], TEAL)

    # quizzes
    draw_table(ax, 5.0, 2.5, 3.8, 3.4, "quizzes", [
        ("id", "UUID", True),
        ("title", "VARCHAR(255)", False),
        ("courseId", "UUID", False),
        ("passingScore", "INT", False),
        ("timeLimit", "INT", False),
        ("maxAttempts", "INT", False),
        ("createdAt", "DATETIME", False),
    ], PURPLE)

    # questions
    draw_table(ax, 9.8, 2.5, 3.4, 3.2, "questions", [
        ("id", "UUID", True),
        ("text", "TEXT", False),
        ("type", "ENUM", False),
        ("options", "JSON", False),
        ("correctAnswer", "VARCHAR", False),
        ("quizId", "UUID", False),
        ("order", "INT", False),
    ], ORANGE)

    # quiz_attempts
    draw_table(ax, 13.5, 4.0, 3.2, 3.0, "quiz_attempts", [
        ("id", "UUID", True),
        ("userId", "UUID", False),
        ("quizId", "UUID", False),
        ("score", "INT", False),
        ("passed", "BOOLEAN", False),
        ("answers", "JSON", False),
        ("completedAt", "DATETIME", False),
    ], RED)

    # certificates
    draw_table(ax, 0.2, 1.5, 3.8, 3.0, "certificates", [
        ("id", "UUID", True),
        ("userId", "UUID", False),
        ("courseId", "UUID", False),
        ("certificateId", "VARCHAR", False),
        ("issuedAt", "DATETIME", False),
        ("pdfUrl", "TEXT", False),
    ], GREEN)

    # enrollments
    draw_table(ax, 0.2, 0.0, 3.8, 1.2, "enrollments", [
        ("id", "UUID", True),
        ("userId", "UUID", False),
        ("courseId", "UUID", False),
        ("progress", "FLOAT", False),
    ], TEAL)

    # Relationships
    # users -> courses (createdById)
    draw_arrow(ax, 4.0, 8.5, 5.0, 8.8, DARK_BLUE, '->', 1.2)
    ax.text(4.3, 8.9, "1:N", fontsize=6.5, color=DARK_BLUE, fontfamily='serif')

    # courses -> sections
    draw_arrow(ax, 8.8, 8.5, 9.8, 9.0, MED_BLUE, '->', 1.2)
    ax.text(9.1, 9.0, "1:N", fontsize=6.5, color=MED_BLUE, fontfamily='serif')

    # sections -> lessons
    draw_arrow(ax, 13.2, 8.8, 13.5, 8.8, LIGHT_BLUE, '->', 1.2)

    # courses -> quizzes
    draw_arrow(ax, 6.9, 6.5, 6.9, 5.9, MED_BLUE, '->', 1.2)

    # quizzes -> questions
    draw_arrow(ax, 8.8, 4.2, 9.8, 4.2, PURPLE, '->', 1.2)

    # users -> quiz_attempts
    draw_arrow(ax, 4.0, 7.5, 13.5, 5.8, DARK_BLUE, '->', 0.8)

    # quizzes -> quiz_attempts
    draw_arrow(ax, 8.8, 4.5, 13.5, 5.0, PURPLE, '->', 0.8)

    # users -> certificates
    draw_arrow(ax, 2.1, 5.5, 2.1, 4.5, DARK_BLUE, '->', 1.2)

    # users -> enrollments
    draw_arrow(ax, 2.1, 5.5, 2.1, 1.2, DARK_BLUE, '->', 0.8)

    fig.tight_layout()
    fig.savefig(f"{OUT}/diag-bdd.png", dpi=DPI, bbox_inches='tight', facecolor=BG)
    plt.close(fig)
    print("✓ diag-bdd.png")


# ═══════════════════════════════════════════════════════════════════
# 7. DIAGRAMME DE GANTT
# ═══════════════════════════════════════════════════════════════════
def gen_gantt():
    fig, ax = setup_fig(14, 8)

    ax.text(7, 7.7, "Planning Prévisionnel — Diagramme de Gantt", ha='center', va='bottom',
            fontsize=14, color=DARK_BLUE, fontweight='bold', fontfamily='serif')

    tasks = [
        ("Analyse des besoins", 0, 1.0, DARK_BLUE),
        ("Conception (UML, Maquettes)", 0.5, 1.5, MED_BLUE),
        ("Configuration projet", 1.0, 0.5, LIGHT_BLUE),
        ("Authentification & Autorisation", 1.5, 1.0, PURPLE),
        ("Module Cours", 2.0, 2.0, TEAL),
        ("Module Quiz", 2.5, 2.0, ORANGE),
        ("Module Certificats & Badges", 3.5, 1.5, GREEN),
        ("Tableau de bord & Analytics", 4.0, 1.5, RED),
        ("Médiathèque & Ressources", 4.5, 1.0, ACCENT),
        ("Tests & Corrections", 5.5, 1.5, "#888888"),
        ("Déploiement & Documentation", 6.5, 1.5, DARK_BLUE),
    ]

    n = len(tasks)
    bar_height = 0.45

    for i, (name, start, duration, color) in enumerate(tasks):
        y = 6.8 - i * 0.6
        # Task name
        ax.text(0.2, y, name, fontsize=8, color=TEXT, fontfamily='serif', va='center', ha='left')
        # Bar
        bar = FancyBboxPatch((5.0 + start, y - bar_height/2), duration, bar_height,
                              boxstyle="round,pad=0.05", facecolor=color, edgecolor=DARK_BLUE,
                              linewidth=0.8, alpha=0.85)
        ax.add_patch(bar)

    # Week headers
    for w in range(9):
        x = 5.0 + w
        ax.text(x + 0.5, 7.1, f"S{w+1}", fontsize=8, color=DARK_BLUE, fontfamily='serif',
                ha='center', fontweight='bold')
        ax.axvline(x=x, ymin=0.05, ymax=0.82, color=BORDER, linewidth=0.5, linestyle='--')

    # X axis line
    ax.plot([5.0, 13.0], [6.5, 6.5], color=DARK_BLUE, linewidth=1.5)

    # Y axis line
    ax.plot([5.0, 5.0], [0.3, 7.1], color=DARK_BLUE, linewidth=1.5)

    # Legend
    ax.text(5.0, 0.15, "Durée totale : 8 semaines", fontsize=8, color=DARK_BLUE,
            fontfamily='serif', fontweight='bold')

    fig.tight_layout()
    fig.savefig(f"{OUT}/diag-gantt.png", dpi=DPI, bbox_inches='tight', facecolor=BG)
    plt.close(fig)
    print("✓ diag-gantt.png")


# ═══════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════
if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    gen_use_case()
    gen_architecture()
    gen_sequence_connexion()
    gen_sequence_quiz()
    gen_class_diagram()
    gen_db_diagram()
    gen_gantt()
    print("\n✅ Tous les diagrammes ont été générés avec succès !")