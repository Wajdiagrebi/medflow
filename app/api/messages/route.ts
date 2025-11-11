import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const clinicId = session.user.clinicId;
    if (!clinicId) {
      return NextResponse.json({ messages: [], unreadCount: 0 });
    }

    const isDoctor = session.user.role === "DOCTOR";
    const isPatient = session.user.role === "PATIENT";
    const doctorId = isDoctor ? session.user.id : undefined;
    
    // Si c'est un patient, trouver le patient correspondant
    let patientId: string | undefined;
    if (isPatient && session.user.email) {
      const patient = await prisma.patient.findFirst({
        where: {
          email: session.user.email,
          clinicId: session.user.clinicId,
        },
      });
      if (patient) {
        patientId = patient.id;
      } else {
        // Si aucun patient trouvé, retourner un tableau vide
        return NextResponse.json({ messages: [], unreadCount: 0 });
      }
    }

    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Consultations récentes (messages de type consultation)
    // Si c'est un docteur, filtrer uniquement ses consultations
    // Si c'est un patient, filtrer uniquement ses consultations
    const recentConsultations = await prisma.consultation.findMany({
      where: {
        patient: { clinicId },
        ...(isDoctor && doctorId ? { doctorId } : {}), // Filtrer par docteur si c'est un DOCTOR
        ...(isPatient && patientId ? { patientId } : {}), // Filtrer par patient si c'est un PATIENT
        createdAt: { gte: last7Days },
      },
      include: {
        patient: { select: { name: true, email: true } },
        doctor: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    // Prescriptions récentes
    // Si c'est un docteur, filtrer uniquement ses prescriptions
    // Si c'est un patient, filtrer uniquement ses prescriptions
    const recentPrescriptions = await prisma.prescription.findMany({
      where: {
        patient: { clinicId },
        ...(isDoctor && doctorId ? { doctorId } : {}), // Filtrer par docteur si c'est un DOCTOR
        ...(isPatient && patientId ? { patientId } : {}), // Filtrer par patient si c'est un PATIENT
        createdAt: { gte: last7Days },
      },
      include: {
        patient: { select: { name: true, email: true } },
        doctor: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    // Factures payées récemment
    // Les docteurs ne voient pas les factures (seulement ADMIN, RECEPTIONIST et PATIENT)
    // Les patients ne voient que leurs propres factures payées
    const paidInvoices = !isDoctor
      ? await prisma.invoice.findMany({
          where: {
            clinicId,
            ...(isPatient && patientId ? { patientId } : {}), // Filtrer par patient si c'est un PATIENT
            status: "PAID",
            createdAt: { gte: last7Days },
          },
          include: {
            patient: { select: { name: true, email: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        })
      : [];

    // Construire les messages
    const messages = [
      ...recentConsultations.map((cons) => ({
        id: `cons-${cons.id}`,
        type: "consultation",
        title: isPatient ? "Votre consultation" : "Nouvelle consultation",
        message: isPatient
          ? `Diagnostic: ${cons.diagnosis.substring(0, 50)}...`
          : `${cons.patient.name} - Diagnostic: ${cons.diagnosis.substring(0, 50)}...`,
        sender: cons.doctor.name || cons.doctor.email,
        icon: "consultation",
        url: isPatient ? "/patient/consultations" : "/doctor/consultations",
        read: false,
        createdAt: cons.createdAt.toISOString(),
      })),
      ...recentPrescriptions.map((pres) => ({
        id: `pres-${pres.id}`,
        type: "prescription",
        title: isPatient ? "Votre prescription" : "Nouvelle prescription",
        message: isPatient
          ? `Prescription créée par Dr. ${pres.doctor.name}`
          : `${pres.patient.name} - Prescription créée`,
        sender: pres.doctor.name || pres.doctor.email,
        icon: "prescription",
        url: isPatient ? "/patient/prescriptions" : "/doctor/prescriptions",
        read: false,
        createdAt: pres.createdAt.toISOString(),
      })),
      ...paidInvoices.map((inv) => ({
        id: `paid-${inv.id}`,
        type: "payment",
        title: "Facture payée",
        message: isPatient
          ? `Votre facture de ${inv.amount} € a été payée`
          : `${inv.patient.name} - ${inv.amount} € payé`,
        sender: "Système",
        icon: "payment",
        url: isPatient ? "/patient/dashboard/invoices" : "/admin/invoices",
        read: false,
        createdAt: inv.createdAt.toISOString(),
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const unreadCount = messages.filter((m) => !m.read).length;

    return NextResponse.json({
      messages: messages.slice(0, 10), // Limiter à 10 messages
      unreadCount,
    });
  } catch (error: any) {
    console.error("Erreur lors de la récupération des messages:", error);
    return NextResponse.json(
      { error: error.message || "Erreur serveur", messages: [], unreadCount: 0 },
      { status: 500 }
    );
  }
}
