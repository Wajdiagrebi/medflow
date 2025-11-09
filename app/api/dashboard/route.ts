import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Compter le nombre de patients
    const patientsCount = await prisma.patient.count();

    // Compter les rendez-vous du jour
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const appointmentsToday = await prisma.appointment.count({
      where: ({
        startTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
      } as any),
    });

    // Valeur de démo pour les recettes
    const revenue = 1500;

    return NextResponse.json({
      patients: patientsCount,
      appointmentsToday,
      revenue,
    });
  } catch (error) {
    console.error("Erreur Dashboard:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
