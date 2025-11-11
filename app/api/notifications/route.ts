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
      return NextResponse.json({ notifications: [], unreadCount: 0 });
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
        return NextResponse.json({ notifications: [], unreadCount: 0 });
      }
    }

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);

    // Rendez-vous à venir (dans les 24 prochaines heures)
    // Si c'est un docteur, filtrer uniquement ses rendez-vous
    // Si c'est un patient, filtrer uniquement ses rendez-vous
    const upcomingAppointments = await prisma.appointment.findMany({
      where: {
        Patient: { clinicId },
        ...(isDoctor && doctorId ? { doctorId } : {}), // Filtrer par docteur si c'est un DOCTOR
        ...(isPatient && patientId ? { patientId } : {}), // Filtrer par patient si c'est un PATIENT
        startTime: { gte: now, lte: tomorrow },
        status: "SCHEDULED",
      },
      include: {
        Patient: { select: { name: true, email: true } },
        Doctor: { select: { name: true } },
      },
      orderBy: { startTime: "asc" },
      take: 5,
    });

    // Factures en attente
    // Les docteurs ne voient pas les factures (seulement ADMIN, RECEPTIONIST et PATIENT)
    // Les patients ne voient que leurs propres factures
    const pendingInvoices = !isDoctor
      ? await prisma.invoice.findMany({
          where: {
            clinicId,
            ...(isPatient && patientId ? { patientId } : {}), // Filtrer par patient si c'est un PATIENT
            status: "PENDING",
          },
          include: {
            patient: { select: { name: true, email: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        })
      : [];
    
    // Rendez-vous annulés récemment
    // Si c'est un docteur, filtrer uniquement ses rendez-vous annulés
    // Si c'est un patient, filtrer uniquement ses rendez-vous annulés
    const recentCancellations = await prisma.appointment.findMany({
      where: {
        Patient: { clinicId },
        ...(isDoctor && doctorId ? { doctorId } : {}), // Filtrer par docteur si c'est un DOCTOR
        ...(isPatient && patientId ? { patientId } : {}), // Filtrer par patient si c'est un PATIENT
        status: "CANCELLED",
        endTime: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) }, // Dernières 24h
      },
      include: {
        Patient: { select: { name: true } },
      },
      orderBy: { endTime: "desc" },
      take: 3,
    });

    // Construire les notifications
    const notifications = [
      ...upcomingAppointments.map((apt) => ({
        id: `apt-${apt.id}`,
        type: "appointment",
        title: "Rendez-vous à venir",
        message: isPatient 
          ? `Avec Dr. ${apt.Doctor.name} - ${new Date(apt.startTime).toLocaleString("fr-FR", {
              day: "2-digit",
              month: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}`
          : `${apt.Patient.name} - ${new Date(apt.startTime).toLocaleString("fr-FR", {
              day: "2-digit",
              month: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}`,
        icon: "calendar",
        url: isPatient 
          ? "/patient/appointments" 
          : isDoctor 
          ? "/doctor/consultations" 
          : "/admin/appointments",
        read: false,
        createdAt: apt.startTime.toISOString(),
      })),
      ...pendingInvoices.map((inv) => ({
        id: `inv-${inv.id}`,
        type: "invoice",
        title: "Facture en attente",
        message: isPatient
          ? `Montant: ${inv.amount} €`
          : `${inv.patient.name} - ${inv.amount} €`,
        icon: "invoice",
        url: isPatient ? "/patient/dashboard/invoices" : "/admin/invoices",
        read: false,
        createdAt: inv.createdAt.toISOString(),
      })),
      ...recentCancellations.map((apt) => ({
        id: `cancel-${apt.id}`,
        type: "cancellation",
        title: "Rendez-vous annulé",
        message: isPatient
          ? `Votre rendez-vous a été annulé`
          : `${apt.Patient.name} - Annulé récemment`,
        icon: "cancel",
        url: isPatient
          ? "/patient/appointments"
          : isDoctor 
          ? "/doctor/consultations" 
          : "/admin/appointments",
        read: false,
        createdAt: apt.endTime.toISOString(),
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const unreadCount = notifications.filter((n) => !n.read).length;

    return NextResponse.json({
      notifications: notifications.slice(0, 10), // Limiter à 10 notifications
      unreadCount,
    });
  } catch (error: any) {
    console.error("Erreur lors de la récupération des notifications:", error);
    return NextResponse.json(
      { error: error.message || "Erreur serveur", notifications: [], unreadCount: 0 },
      { status: 500 }
    );
  }
}

