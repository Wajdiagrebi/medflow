import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const resolvedParams = await Promise.resolve(params);
    const consultationId = resolvedParams.id;

    if (!consultationId || consultationId.trim() === "") {
      return NextResponse.json({ error: "ID de consultation invalide" }, { status: 400 });
    }

    const consultation = await prisma.consultation.findUnique({
      where: { id: consultationId },
      include: {
        patient: true,
        doctor: { select: { id: true, name: true, email: true } },
        appointment: {
          include: {
            Patient: { select: { name: true } },
            Doctor: { select: { name: true } },
          },
        },
      },
    });

    if (!consultation) {
      return NextResponse.json({ error: "Consultation not found" }, { status: 404 });
    }

    // Vérifier que la consultation appartient à la même clinique
    if (consultation.patient.clinicId !== session.user.clinicId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(consultation);
  } catch (err: any) {
    console.error("Error fetching consultation:", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}

