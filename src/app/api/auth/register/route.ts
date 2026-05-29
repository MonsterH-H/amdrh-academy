import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "L'inscription publique est désactivée. Les comptes sont créés par les administrateurs." },
    { status: 403 }
  );
}
