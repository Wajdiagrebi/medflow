import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { z } from 'zod';
import { createCheckoutSession } from '@/lib/stripe';
import { generateInvoicePdf } from '@/lib/pdf';
import { uploadInvoicePdf } from '@/lib/storage';

const invoiceSchema = z.object({
  patientId: z.string(),
  appointmentId: z.string().optional(),
  amount: z.number().positive(),
  status: z.string().optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!["ADMIN", "RECEPTIONIST"].includes(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const invoices = await prisma.invoice.findMany({
    where: { clinicId: session.user.clinicId },
    include: { patient: true, appointment: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(invoices);
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const parsed = invoiceSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    // Require auth and RBAC for creation
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!["ADMIN", "RECEPTIONIST"].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const invoice = await prisma.invoice.create({
      data: {
        clinicId: session.user.clinicId,
        patientId: parsed.data.patientId,
        appointmentId: parsed.data.appointmentId ?? null,
        amount: Number(parsed.data.amount),
        status: (parsed.data.status as any) ?? 'PENDING',
      },
    });
    // Early return basic creation
    // return NextResponse.json(invoice, { status: 201 });

    // Otherwise create invoice and return a Stripe checkout session URL
    // For demo: continue with PDF + Stripe if available

    // generate PDF (buffer) and upload to storage (public or S3)
    try {
      const pdfBuffer = await generateInvoicePdf({
        id: invoice.id,
        clinicName: 'Clinique Demo',
        patientName: 'Patient',
        items: [],
        amount: Number(parsed.data.amount),
      });
      const filename = `invoice-${invoice.id}.pdf`;
      const url = await uploadInvoicePdf(pdfBuffer, filename);
      // save pdfUrl on invoice
  await prisma.invoice.update({ where: { id: invoice.id }, data: { pdfUrl: url } });
    } catch (e) {
      console.warn('PDF generation or upload failed', e);
    }

    const origin = req.headers.get('origin') || `http://localhost:3000`;
    const sessionCheckout = await createCheckoutSession({
      amount: Number(parsed.data.amount),
      invoiceId: invoice.id,
      successUrl: `${origin}/payments/success?invoice=${invoice.id}`,
      cancelUrl: `${origin}/payments/cancel?invoice=${invoice.id}`,
      currency: 'usd',
    });

    await prisma.invoice.update({ where: { id: invoice.id }, data: { stripeSession: sessionCheckout.id } });

    return NextResponse.json({ url: sessionCheckout.url, invoice });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const { id, status } = await req.json();
  if (!id) return NextResponse.json({ error: 'Missing invoice id' }, { status: 400 });

  const updated = await prisma.invoice.update({ where: { id }, data: { status } });
  return NextResponse.json(updated);
}
