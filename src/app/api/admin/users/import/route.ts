import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { ROLE_LABELS } from "@/lib/constants";

const VALID_ROLES = Object.keys(ROLE_LABELS);
const REQUIRED_HEADERS = ["email", "prenom", "nom"];

interface ImportRow {
  email: string;
  prenom: string;
  nom: string;
  role: string;
  telephone: string;
  club: string;
  region: string;
  licenceNumber: string;
}

interface ImportResult {
  row: number;
  email: string;
  success: boolean;
  error?: string;
}

function parseCSV(text: string): ImportRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const rows: ImportRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => { row[h] = values[idx] || ""; });
    rows.push({
      email: row.email || "",
      prenom: row.prenom || "",
      nom: row.nom || "",
      role: row.role || "ARBITRE",
      telephone: row.telephone || "",
      club: row.club || "",
      region: row.region || "",
      licenceNumber: row.licencenumber || row.licence_number || row.licence || "",
    });
  }
  return rows;
}

function validateRow(row: ImportRow, rowNumber: number): ImportResult | null {
  const errors: string[] = [];

  if (!row.email) errors.push("email manquant");
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) errors.push("email invalide");

  if (!row.prenom) errors.push("prénom manquant");
  if (!row.nom) errors.push("nom manquant");

  if (row.role && !VALID_ROLES.includes(row.role.toUpperCase())) {
    errors.push(`rôle invalide: ${row.role}`);
  }

  if (errors.length > 0) {
    return { row: rowNumber, email: row.email, success: false, error: errors.join(", ") };
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });
    }

    if (!file.name.endsWith(".csv")) {
      return NextResponse.json({ error: "Le fichier doit être au format CSV" }, { status: 400 });
    }

    const text = await file.text();
    const rows = parseCSV(text);

    if (rows.length === 0) {
      return NextResponse.json({ error: "Le fichier CSV est vide ou ne contient pas de données valides" }, { status: 400 });
    }

    if (rows.length > 500) {
      return NextResponse.json({ error: "Maximum 500 utilisateurs par import" }, { status: 400 });
    }

    const results: ImportResult[] = [];
    let successCount = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const validationError = validateRow(row, i + 2);

      if (validationError) {
        results.push(validationError);
        continue;
      }

      try {
        const normalizedEmail = row.email.toLowerCase();
        const normalizedRole = row.role ? row.role.toUpperCase() : "ARBITRE";

        // Check for existing email
        const existing = await db.user.findUnique({ where: { email: normalizedEmail } });
        if (existing) {
          results.push({ row: i + 2, email: normalizedEmail, success: false, error: "email déjà existant" });
          continue;
        }

        // Generate default password
        const defaultPassword = `AMDRH@${Date.now().toString(36)}`;
        const passwordHash = await bcrypt.hash(defaultPassword, 12);

        await db.user.create({
          data: {
            email: normalizedEmail,
            prenom: row.prenom.trim(),
            nom: row.nom.trim(),
            role: normalizedRole,
            telephone: row.telephone || null,
            club: row.club || null,
            region: row.region || null,
            licenceNumber: row.licenceNumber || null,
            passwordHash,
            isActive: true,
          },
        });

        successCount++;
        results.push({ row: i + 2, email: normalizedEmail, success: true });
      } catch (err) {
        results.push({ row: i + 2, email: row.email, success: false, error: "Erreur de création en base de données" });
      }
    }

    return NextResponse.json({
      totalRows: rows.length,
      successCount,
      errorCount: results.filter((r) => !r.success).length,
      results,
    });
  } catch (error) {
    console.error("User import error:", error);
    return NextResponse.json({ error: "Erreur interne lors de l'import" }, { status: 500 });
  }
}
