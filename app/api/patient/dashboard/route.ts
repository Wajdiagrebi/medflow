import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "PATIENT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const clinicId = session.user.clinicId;
    if (!clinicId) {
      return NextResponse.json({ error: "ClinicId manquant" }, { status: 400 });
    }

    // Trouver le patient correspondant à l'utilisateur connecté
    if (!session.user.email) {
      return NextResponse.json({ error: "Email manquant" }, { status: 400 });
    }
    
    const patient = await prisma.patient.findFirst({
      where: {
        email: session.user.email,
        clinicId: session.user.clinicId,
      },
    });

    if (!patient) {
      return NextResponse.json({
        upcomingAppointments: 0,
        consultations: 0,
        pendingInvoices: 0,
        prescriptions: 0,
        chartData: [],
      });
    }

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Lundi de cette semaine
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Rendez-vous à venir
    const upcomingAppointments = await prisma.appointment.count({
      where: {
        patientId: patient.id,
        startTime: { gte: now },
        status: "SCHEDULED",
      },
    });

    // Consultations
    const consultations = await prisma.consultation.count({
      where: {
        patientId: patient.id,
      },
    });

    // Factures en attente
    const pendingInvoices = await prisma.invoice.count({
      where: {
        patientId: patient.id,
        status: "PENDING",
      },
    });

    // Prescriptions
    const prescriptions = await prisma.prescription.count({
      where: {
        patientId: patient.id,
      },
    });

    // Données pour les graphiques (7 derniers jours)
    const chartData = [];
    const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
    
    for (let i = 0; i < 7; i++) {
      const dayStart = new Date(startOfWeek);
      dayStart.setDate(startOfWeek.getDate() + i);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const dayAppointments = await prisma.appointment.count({
        where: {
          patientId: patient.id,
          startTime: {
            gte: dayStart,
            lte: dayEnd,
          },
        },
      });

      const dayConsultations = await prisma.consultation.count({
        where: {
          patientId: patient.id,
          createdAt: {
            gte: dayStart,
            lte: dayEnd,
          },
        },
      });

      chartData.push({
        name: days[i],
        rendezvous: dayAppointments,
        consultations: dayConsultations,
      });
    }

    return NextResponse.json({
      upcomingAppointments,
      consultations,
      pendingInvoices,
      prescriptions,
      chartData,
    });
  } catch (error: any) {
    console.error("Erreur lors de la récupération du dashboard patient:", error);
    return NextResponse.json(
      { error: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}

