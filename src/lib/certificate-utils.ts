import { db } from "@/lib/db";

/**
 * Génère un code de certificat unique.
 * Format: AMDRH-YYYY-XXXXX
 * Gère les collisions avec retry.
 */
export async function generateUniqueCertCode(year?: number): Promise<string> {
  const certYear = year || new Date().getFullYear();

  for (let attempt = 0; attempt < 10; attempt++) {
    const count = await db.certificate.count();
    const code = `AMDRH-${certYear}-${String(count + attempt + 1).padStart(5, "0")}`;

    const existing = await db.certificate.findUnique({ where: { code } });
    if (!existing) return code;
  }

  // Fallback: use random suffix
  const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `AMDRH-${certYear}-${randomSuffix}`;
}
