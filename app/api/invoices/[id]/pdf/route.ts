import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { generateInvoicePdf } from "@/lib/pdf";
import { uploadInvoicePdf } from "@/lib/storage";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const resolvedParams = await Promise.resolve(params);
    const invoiceId = resolvedParams.id;

    // Récupérer la facture
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        patient: { select: { name: true, email: true } },
        appointment: { select: { startTime: true } },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });
    }

    // Vérifier les permissions
    if (invoice.clinicId !== session.user.clinicId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Si le PDF existe déjà, retourner l'URL
    if (invoice.pdfUrl) {
      return NextResponse.json({ pdfUrl: invoice.pdfUrl, alreadyExists: true });
    }

    // Générer le PDF
    const pdfBuffer = await generateInvoicePdf({
      id: invoice.id,
      clinicName: "Clinique Demo",
      patientName: invoice.patient?.name || "N/A",
      items: [],
      amount: invoice.amount,
    });

    const filename = `invoice-${invoice.id}.pdf`;
    const url = await uploadInvoicePdf(pdfBuffer, filename);

    // Mettre à jour la facture avec l'URL du PDF
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { pdfUrl: url },
    });

    return NextResponse.json({ pdfUrl: url, alreadyExists: false });
  } catch (err: any) {
    console.error("Error generating PDF:", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}

