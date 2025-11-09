import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { clinicName, adminName, adminEmail, adminPassword } = await req.json();

    if (!clinicName || !adminName || !adminEmail || !adminPassword) {
      return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
    }

    // Vérifie si une clinique du même nom existe déjà
    const existingClinic = await prisma.clinic.findUnique({
      where: { name: clinicName },
    });

    if (existingClinic) {
      return NextResponse.json({ error: "Une clinique avec ce nom existe déjà" }, { status: 400 });
    }

    // 1️⃣ Créer la clinique
    const clinic = await prisma.clinic.create({
      data: {
        name: clinicName,
      },
    });

    // 2️⃣ Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // 3️⃣ Créer l'admin
    const admin = await prisma.user.create({
      data: {
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: "ADMIN", // ✅ correspond à ton enum Role dans Prisma
        clinicId: clinic.id,
      },
    });

    // 4️⃣ (optionnel) Seed de patients ou données de test
    // await prisma.patient.createMany({...})

    return NextResponse.json({ message: "Onboarding réussi", clinic, admin });
  } catch (error) {
    console.error("Erreur Onboarding:", error);
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 });
  }
}
