import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { z } from "zod";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Gérer params de manière synchrone ou asynchrone selon la version de Next.js
    const resolvedParams = await Promise.resolve(params);
    const appointmentId = resolvedParams.id;

    if (!appointmentId || appointmentId.trim() === "") {
      return NextResponse.json({ error: "ID de rendez-vous invalide" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!["ADMIN", "RECEPTIONIST", "DOCTOR"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const schema = z
      .object({
        status: z.enum(["SCHEDULED", "CANCELLED", "DONE"]).optional(),
        patientId: z.string().optional(),
        doctorId: z.string().optional(),
        startTime: z.string().optional(),
        endTime: z.string().optional(),
        reason: z.string().optional(),
      })
      .refine(
        (data) => {
          // Si startTime et endTime sont fournis, vérifier que endTime > startTime
          if (data.startTime && data.endTime) {
            return new Date(data.endTime) > new Date(data.startTime);
          }
          return true;
        },
        {
          message: "endTime doit être après startTime",
          path: ["endTime"],
        }
      );

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { Patient: true },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    // Vérifier que l'appointment appartient à la même clinique
    if (appointment.Patient.clinicId !== session.user.clinicId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Si patientId est modifié, vérifier que le patient existe et appartient à la clinique
    if (parsed.data.patientId) {
      const patient = await prisma.patient.findUnique({
        where: { id: parsed.data.patientId },
      });
      if (!patient) {
        return NextResponse.json({ error: "Patient introuvable" }, { status: 404 });
      }
      if (patient.clinicId !== session.user.clinicId) {
        return NextResponse.json({ error: "Patient hors de votre clinique" }, { status: 403 });
      }
    }

    // Si doctorId est modifié, vérifier que le docteur existe et est bien un DOCTOR
    if (parsed.data.doctorId) {
      const doctor = await prisma.user.findUnique({
        where: { id: parsed.data.doctorId },
      });
      if (!doctor) {
        return NextResponse.json({ error: "Médecin introuvable" }, { status: 404 });
      }
      if (doctor.role !== "DOCTOR") {
        return NextResponse.json({ error: "L'utilisateur sélectionné n'est pas un médecin" }, { status: 400 });
      }
      if ((doctor.clinicId ?? "") !== session.user.clinicId) {
        return NextResponse.json({ error: "Médecin hors de votre clinique" }, { status: 403 });
      }
    }

    // Si dates ou docteur sont modifiés, vérifier les conflits de créneaux
    if (parsed.data.startTime || parsed.data.endTime || parsed.data.doctorId) {
      const startTime = parsed.data.startTime ? new Date(parsed.data.startTime) : appointment.startTime;
      const endTime = parsed.data.endTime ? new Date(parsed.data.endTime) : appointment.endTime;
      const doctorId = parsed.data.doctorId || appointment.doctorId;

      // Vérifier les conflits (exclure le rendez-vous actuel)
      const existing = await prisma.appointment.findFirst({
        where: {
          doctorId,
          id: { not: appointmentId }, // Exclure le rendez-vous actuel
          AND: [
            { startTime: { lt: endTime } },
            { endTime: { gt: startTime } },
            { status: { not: "CANCELLED" } }, // Ignorer les rendez-vous annulés
          ],
        } as any,
        select: { id: true },
      });

      if (existing) {
        return NextResponse.json(
          { error: "Créneau déjà réservé pour ce médecin" },
          { status: 409 }
        );
      }
    }

    const updateData: any = {};
    if (parsed.data.status !== undefined) updateData.status = parsed.data.status;
    if (parsed.data.patientId !== undefined) updateData.patientId = parsed.data.patientId;
    if (parsed.data.doctorId !== undefined) updateData.doctorId = parsed.data.doctorId;
    if (parsed.data.startTime !== undefined) updateData.startTime = new Date(parsed.data.startTime);
    if (parsed.data.endTime !== undefined) updateData.endTime = new Date(parsed.data.endTime);
    if (parsed.data.reason !== undefined) updateData.reason = parsed.data.reason;

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: updateData,
      include: {
        Patient: { select: { name: true, email: true } },
        Doctor: { select: { name: true, email: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("Error updating appointment:", err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}

