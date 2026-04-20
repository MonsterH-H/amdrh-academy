import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerStep1Schema = z.object({
  prenom: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Adresse email invalide"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
    .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

export type RegisterStep1Input = z.infer<typeof registerStep1Schema>;

export const registerStep2Schema = z.object({
  role: z.enum(["ARBITRE", "ENTRAINEUR", "JOUEUR"], {
    message: "Veuillez sélectionner un rôle",
  }),
  telephone: z.string().optional(),
  club: z.string().optional(),
  region: z.string().optional(),
  licenceNumber: z.string().optional(),
});

export type RegisterStep2Input = z.infer<typeof registerStep2Schema>;

const lessonSchema = z.object({
  title: z.string().min(1, "Le titre de la leçon est requis"),
  type: z.enum(["VIDEO", "PDF", "TEXTE", "INTERACTIF"]),
  content: z.string().default(""),
  duration: z.number().min(1, "La durée doit être d'au moins 1 minute"),
});

const sectionSchema = z.object({
  title: z.string().min(1, "Le titre de la section est requis"),
  lessons: z.array(lessonSchema).min(0).default([]),
});

export const courseCreateSchema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères"),
  category: z.enum(["ARBITRAGE", "ENTRAINEMENT", "JOUEURS", "ADMINISTRATION"]),
  difficulty: z.enum(["DEBUTANT", "INTERMEDIAIRE", "AVANCE", "EXPERT"]),
  duration: z.number().min(1),
  isCertifying: z.boolean().default(false),
  passingScore: z.number().min(50).max(100).default(70),
  maxAttempts: z.number().min(1).max(10).default(3),
  instructorId: z.string().min(1, "L'identifiant du formateur est requis"),
  sections: z.array(sectionSchema).default([]),
});

export type CourseCreateInput = z.infer<typeof courseCreateSchema>;
export type LessonInput = z.infer<typeof lessonSchema>;
export type SectionInput = z.infer<typeof sectionSchema>;

export const quizSubmitSchema = z.object({
  attemptId: z.string(),
  answers: z.array(
    z.object({
      questionId: z.string(),
      selectedAnswer: z.array(z.number()),
    })
  ),
});

export type QuizSubmitInput = z.infer<typeof quizSubmitSchema>;

export const messageCreateSchema = z.object({
  content: z.string().min(1, "Le message ne peut pas être vide").max(5000),
  receiverId: z.string().min(1),
});

export type MessageCreateInput = z.infer<typeof messageCreateSchema>;

export const userUpdateSchema = z.object({
  nom: z.string().min(2).optional(),
  prenom: z.string().min(2).optional(),
  telephone: z.string().optional(),
  club: z.string().optional(),
  region: z.string().optional(),
  bio: z.string().optional(),
  role: z.enum(["ADMIN", "FORMATEUR", "ARBITRE", "ENTRAINEUR", "JOUEUR"]).optional(),
  isActive: z.boolean().optional(),
});

export type UserUpdateInput = z.infer<typeof userUpdateSchema>;

export const profileUpdateSchema = z.object({
  userId: z.string().min(1, "L'identifiant utilisateur est requis"),
  prenom: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  telephone: z.string().optional().default(""),
  club: z.string().optional().default(""),
  region: z.string().optional().default(""),
  bio: z.string().optional().default(""),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
