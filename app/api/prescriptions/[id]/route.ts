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
    const prescriptionId = resolvedParams.id;

    if (!prescriptionId || prescriptionId.trim() === "") {
      return NextResponse.json({ error: "ID de prescription invalide" }, { status: 400 });
    }

    const prescription = await prisma.prescription.findUnique({
      where: { id: prescriptionId },
      include: {
        patient: { select: { id: true, name: true, email: true, age: true } },
        doctor: { select: { id: true, name: true, email: true } },
        consultation: {
          include: {
            patient: { select: { name: true } },
          },
        },
      },
    });

    if (!prescription) {
      return NextResponse.json({ error: "Prescription not found" }, { status: 404 });
    }

    // Vérifier que la prescription appartient à la même clinique
    // Récupérer le patient avec clinicId
    const patient = await prisma.patient.findUnique({
      where: { id: prescription.patientId },
      select: { clinicId: true },
    });

    if (!patient || patient.clinicId !== session.user.clinicId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(prescription);
  } catch (err: any) {
    console.error("Error fetching prescription:", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}

