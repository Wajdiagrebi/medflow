import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { consultationSchema } from "@/utils/validators";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Seuls les docteurs peuvent créer des consultations
    if (session.user.role !== "DOCTOR") {
      return NextResponse.json({ error: "Forbidden - Seuls les docteurs peuvent créer des consultations" }, { status: 403 });
    }

    // Vérifier que l'ID du docteur est présent
    if (!session.user.id) {
      console.error("Session user ID is missing:", session.user);
      return NextResponse.json({ error: "Session invalide - ID du docteur manquant" }, { status: 401 });
    }

    const body = await req.json();
    console.log("Consultation creation request:", { body, doctorId: session.user.id, sessionUser: session.user });
    
    // Nettoyer les données : convertir les chaînes vides en undefined
    const cleanedBody = {
      ...body,
      appointmentId: body.appointmentId && body.appointmentId.trim() !== "" ? body.appointmentId : undefined,
      notes: body.notes && body.notes.trim() !== "" ? body.notes : undefined,
      diagnosis: body.diagnosis?.trim() || "",
      patientId: body.patientId?.trim() || "",
    };
    
    console.log("Cleaned body:", cleanedBody);
    
    const parsed = consultationSchema.safeParse({
      ...cleanedBody,
      doctorId: session.user.id, // Utiliser l'ID du docteur connecté
    });

    if (!parsed.success) {
      console.error("Validation error:", JSON.stringify(parsed.error.flatten(), null, 2));
      console.error("Validation error details:", parsed.error.errors);
      
      // Créer un message d'erreur plus détaillé
      const errorMessages: string[] = [];
      parsed.error.errors.forEach((err) => {
        const field = err.path.join(".");
        const message = err.message;
        errorMessages.push(`${field}: ${message}`);
      });
      
      return NextResponse.json({ 
        error: parsed.error.flatten(),
        message: "Erreur de validation des données",
        details: errorMessages.join(", ")
      }, { status: 400 });
    }

    // Vérifier que le patient existe et appartient à la même clinique
    const patient = await prisma.patient.findUnique({
      where: { id: parsed.data.patientId },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient introuvable" }, { status: 404 });
    }

    if (patient.clinicId !== session.user.clinicId) {
      return NextResponse.json({ error: "Patient hors de votre clinique" }, { status: 403 });
    }

    // Si un appointmentId est fourni, vérifier qu'il existe et appartient au patient
    if (parsed.data.appointmentId) {
      const appointment = await prisma.appointment.findUnique({
        where: { id: parsed.data.appointmentId },
        include: {
          Patient: { select: { id: true } },
          Doctor: { select: { id: true } },
        },
      });

      if (!appointment) {
        console.error("Appointment not found:", parsed.data.appointmentId);
        return NextResponse.json({ 
          error: "Rendez-vous introuvable",
          message: `Le rendez-vous avec l'ID ${parsed.data.appointmentId} n'existe pas`
        }, { status: 404 });
      }

      if (appointment.patientId !== parsed.data.patientId) {
        console.error("Appointment patient mismatch:", {
          appointmentPatientId: appointment.patientId,
          providedPatientId: parsed.data.patientId
        });
        return NextResponse.json(
          { 
            error: "Le rendez-vous n'appartient pas à ce patient",
            message: `Le rendez-vous appartient au patient ${appointment.patientId}, mais vous avez sélectionné ${parsed.data.patientId}`
          },
          { status: 400 }
        );
      }

      if (appointment.doctorId !== session.user.id) {
        console.error("Appointment doctor mismatch:", {
          appointmentDoctorId: appointment.doctorId,
          currentDoctorId: session.user.id
        });
        return NextResponse.json(
          { 
            error: "Le rendez-vous n'appartient pas à ce médecin",
            message: `Vous ne pouvez lier que vos propres rendez-vous. Ce rendez-vous appartient à un autre médecin.`
          },
          { status: 403 }
        );
      }
    }

    // Vérifier si une consultation existe déjà pour ce rendez-vous (si appointmentId est fourni)
    if (parsed.data.appointmentId) {
      const existingConsultation = await prisma.consultation.findUnique({
        where: { appointmentId: parsed.data.appointmentId },
      });

      if (existingConsultation) {
        return NextResponse.json(
          { 
            error: "Une consultation existe déjà pour ce rendez-vous",
            message: `Ce rendez-vous a déjà une consultation associée (ID: ${existingConsultation.id})`
          },
          { status: 409 }
        );
      }
    }

    const consultation = await prisma.consultation.create({
      data: parsed.data,
      include: {
        patient: { select: { id: true, name: true, email: true } },
        doctor: { select: { id: true, name: true, email: true } },
      },
    });

    // Si un rendez-vous est lié, mettre à jour son statut à DONE
    if (parsed.data.appointmentId) {
      await prisma.appointment.update({
        where: { id: parsed.data.appointmentId },
        data: { status: "DONE" },
      });
    }

    console.log("Consultation created successfully:", consultation.id);
    return NextResponse.json(consultation, { status: 201 });
  } catch (err: any) {
    console.error("Error creating consultation:", err);
    // Si c'est une erreur Prisma unique constraint
    if (err.code === 'P2002') {
      return NextResponse.json(
        { 
          error: "Une consultation existe déjà pour ce rendez-vous",
          message: "Ce rendez-vous a déjà une consultation associée"
        },
        { status: 409 }
      );
    }
    return NextResponse.json({ 
      error: err.message || "Internal error",
      message: "Une erreur est survenue lors de la création de la consultation"
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Filtrer par clinique
    const consultations = await prisma.consultation.findMany({
      where: {
        patient: {
          clinicId: session.user.clinicId,
        },
      },
      include: {
        patient: { select: { id: true, name: true, email: true, age: true, condition: true } },
        doctor: { select: { id: true, name: true, email: true } },
        appointment: {
          select: {
            id: true,
            startTime: true,
            endTime: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(consultations);
  } catch (err: any) {
    console.error("Error fetching consultations:", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
