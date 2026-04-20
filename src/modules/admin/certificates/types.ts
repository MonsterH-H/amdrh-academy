"use client";

export interface CertificateItem {
  id: string;
  code: string;
  type: string;
  status: string;
  userId: string;
  courseId: string;
  courseTitle: string;
  userName: string;
  score: number;
  maxScore: number;
  issuedAt: string;
  expiresAt: string | null;
  revokedAt: string | null;
  revokeReason: string | null;
  qrCodeUrl: string | null;
  pdfUrl: string | null;
  user: { id: string; nom: string; prenom: string; email: string; role: string } | null;
  course: { id: string; title: string } | null;
}

export interface BadgeItem {
  id: string;
  name: string;
  description: string;
  level: string;
  icon: string;
  criteria: string;
  createdAt: string;
  _count: { userBadges: number };
}

export interface CertStats {
  total: number;
  thisMonth: number;
  valid: number;
  expired: number;
}

export async function handleReactivate(cert: CertificateItem) {
  const { useAppStore } = await import("@/store/app");
  const { user } = useAppStore.getState();
  try {
    const authParams = new URLSearchParams();
    if (user) {
      authParams.set("userId", user.id);
      authParams.set("role", user.role);
    }
    const res = await fetch(`/api/admin/certificates/${cert.id}?${authParams}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "ACTIVE" }),
    });
    if (res.ok) {
      const { toast } = await import("@/hooks/use-toast");
      toast({ title: "Certificat réactivé", description: `Le certificat ${cert.code} a été réactivé.` });
    } else {
      const { toast } = await import("@/hooks/use-toast");
      toast({ title: "Erreur", description: "Impossible de réactiver", variant: "destructive" });
    }
  } catch {
    const { toast } = await import("@/hooks/use-toast");
    toast({ title: "Erreur serveur", variant: "destructive" });
  }
}
