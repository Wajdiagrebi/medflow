import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { generatePrescriptionPdf } from "@/lib/prescription-pdf";
import { uploadInvoicePdf } from "@/lib/storage";
import { z } from "zod";

const prescriptionSchema = z.object({
  consultationId: z.string().min(1),
  medications: z.string().optional(),
  instructions: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Seuls les docteurs peuvent créer des prescriptions
    if (session.user.role !== "DOCTOR") {
      return NextResponse.json(
        { error: "Forbidden - Seuls les docteurs peuvent créer des prescriptions" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = prescriptionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    // Récupérer la consultation pour vérifier les permissions
    const consultation = await prisma.consultation.findUnique({
      where: { id: parsed.data.consultationId },
      include: {
        patient: true,
        doctor: { select: { id: true, name: true } },
      },
    });

    if (!consultation) {
      return NextResponse.json({ error: "Consultation introuvable" }, { status: 404 });
    }

    // Vérifier que la consultation appartient à la même clinique
    if (consultation.patient.clinicId !== session.user.clinicId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Vérifier que le docteur connecté est le docteur de la consultation
    if (consultation.doctorId !== session.user.id) {
      return NextResponse.json(
        { error: "Vous ne pouvez créer des prescriptions que pour vos propres consultations" },
        { status: 403 }
      );
    }

    // Créer la prescription
    const prescription = await prisma.prescription.create({
      data: {
        consultationId: parsed.data.consultationId,
        doctorId: session.user.id,
        patientId: consultation.patientId,
        medications: parsed.data.medications || null,
        instructions: parsed.data.instructions || null,
      },
      include: {
        patient: { select: { name: true, age: true } },
        doctor: { select: { name: true } },
        consultation: true,
      },
    });

    // Générer le PDF
    try {
      const pdfBuffer = await generatePrescriptionPdf({
        id: prescription.id,
        clinicName: "Clinique Demo",
        doctorName: consultation.doctor.name,
        patientName: consultation.patient.name,
        patientAge: consultation.patient.age,
        medications: prescription.medications || undefined,
        instructions: prescription.instructions || undefined,
        createdAt: prescription.createdAt,
      });

      const filename = `prescription-${prescription.id}.pdf`;
      const url = await uploadInvoicePdf(pdfBuffer, filename);

      // Mettre à jour la prescription avec l'URL du PDF
      const updated = await prisma.prescription.update({
        where: { id: prescription.id },
        data: { pdfUrl: url },
        include: {
          patient: { select: { name: true, email: true } },
          doctor: { select: { name: true, email: true } },
          consultation: {
            include: {
              patient: { select: { name: true } },
            },
          },
        },
      });

      return NextResponse.json(updated, { status: 201 });
    } catch (pdfError: any) {
      console.warn("PDF generation failed:", pdfError);
      // Retourner la prescription même si le PDF a échoué
      return NextResponse.json(prescription, { status: 201 });
    }
  } catch (err: any) {
    console.error("Error creating prescription:", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Filtrer par clinique
    const prescriptions = await prisma.prescription.findMany({
      where: {
        patient: {
          clinicId: session.user.clinicId,
        },
      },
      include: {
        patient: { select: { id: true, name: true, email: true } },
        doctor: { select: { id: true, name: true, email: true } },
        consultation: {
          select: {
            id: true,
            diagnosis: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(prescriptions);
  } catch (err: any) {
    console.error("Error fetching prescriptions:", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
