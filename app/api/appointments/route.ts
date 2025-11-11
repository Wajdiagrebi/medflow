import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { z } from "zod";

const appointmentSchema = z.object({
  patientId: z.string().min(1),
  doctorId: z.string().min(1),
  startTime: z.string(), // ISO datetime
  endTime: z.string(), // ISO datetime
  reason: z.string().optional(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Si c'est un patient, filtrer par son ID
    const whereClause: any = {
      Patient: { clinicId: session.user.clinicId },
    };

    if (session.user.role === "PATIENT" && session.user.id && session.user.email) {
      // Trouver le patient correspondant à l'utilisateur connecté
      const patient = await prisma.patient.findFirst({
        where: {
          email: session.user.email,
          clinicId: session.user.clinicId,
        },
      });
      
      if (patient) {
        whereClause.patientId = patient.id;
      } else {
        // Si aucun patient trouvé, retourner un tableau vide
        return NextResponse.json([]);
      }
    }

    const appts = await prisma.appointment.findMany({
      where: whereClause,
      include: { Patient: true, Doctor: { select: { id: true, name: true, email: true } } },
      orderBy: { startTime: "desc" },
    });

    return NextResponse.json(appts);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = appointmentSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const created = await prisma.appointment.create({
      data: {
        patientId: parsed.data.patientId,
        doctorId: parsed.data.doctorId,
        startTime: new Date(parsed.data.startTime),
        endTime: new Date(parsed.data.endTime),
        reason: parsed.data.reason,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
