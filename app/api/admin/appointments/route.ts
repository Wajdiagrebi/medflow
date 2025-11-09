import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { z } from "zod";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    if (!["ADMIN", "RECEPTIONIST"].includes(session.user.role)) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const filterSchema = z
      .enum(["day", "week", "month"]) 
      .default("day");
    const filter = filterSchema.parse(searchParams.get("filter") ?? undefined);

    const today = new Date();
    let start = new Date(today);
    let end = new Date(today);

    start.setHours(0, 0, 0, 0);

    if (filter === "day") {
      end.setDate(start.getDate() + 1);
    } else if (filter === "week") {
      const day = start.getDay(); // 0 = dimanche
      const diffToMonday = (day + 6) % 7; // calcule le lundi
      start.setDate(start.getDate() - diffToMonday);
      end = new Date(start);
      end.setDate(start.getDate() + 7);
    } else if (filter === "month") {
      start.setDate(1);
      end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
    }

    const appointments = await prisma.appointment.findMany({
      where: ({
        startTime: { gte: start, lt: end },
        Patient: { clinicId: session.user.clinicId },
      } as any),
      include: {
        Patient: { select: { name: true, email: true } },
        Doctor: { select: { name: true, email: true } },
      },
    });

    return NextResponse.json({ appointments });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Impossible de récupérer les rendez-vous" },
      { status: 500 }
    );
  }
}


export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    if (!["ADMIN", "RECEPTIONIST"].includes(session.user.role)) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const body = await req.json();
    const schema = z
      .object({
        patientId: z.string().min(1),
        doctorId: z.string().min(1),
        startTime: z.coerce.date(),
        endTime: z.coerce.date(),
        status: z.enum(["SCHEDULED", "CANCELLED", "DONE"]).default("SCHEDULED"),
        reason: z.string().optional(),
      })
      .refine((v) => v.endTime > v.startTime, {
        message: "endTime doit être après startTime",
        path: ["endTime"],
      });
    const { patientId, doctorId, startTime, endTime, status, reason } = schema.parse(body);

    // Vérifier que patient et docteur appartiennent à la même clinique que l'utilisateur
    const [patient, doctor] = await Promise.all([
      prisma.patient.findUnique({ where: { id: patientId } }),
      prisma.user.findUnique({ where: { id: doctorId } }),
    ]);

    if (!patient || !doctor) {
      return NextResponse.json({ error: "Patient ou médecin introuvable" }, { status: 404 });
    }
    if (patient.clinicId !== session.user.clinicId || (doctor.clinicId ?? "") !== session.user.clinicId) {
      return NextResponse.json({ error: "Ressources hors de votre clinique" }, { status: 403 });
    }

    // Vérifier que l'utilisateur sélectionné est bien un médecin
    if (doctor.role !== "DOCTOR") {
      return NextResponse.json({ error: "L'utilisateur sélectionné n'est pas un médecin" }, { status: 400 });
    }

    // Vérifier overlap: existing.start < newEnd AND existing.end > newStart
    const existing = await prisma.appointment.findFirst({
      where: ({
        doctorId,
        AND: [{ startTime: { lt: endTime } }, { endTime: { gt: startTime } }],
      } as any),
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json({ error: "Créneau déjà réservé pour ce médecin" }, { status: 409 });
    }

    const created = await prisma.appointment.create({
      data: ({ patientId, doctorId, startTime, endTime, status, reason } as any),
      include: {
        Patient: { select: { name: true, email: true } },
        Doctor: { select: { name: true, email: true } },
      },
    });

    return NextResponse.json({ appointment: created }, { status: 201 });
  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Impossible de créer le rendez-vous" },
      { status: 500 }
    );
  }
}

