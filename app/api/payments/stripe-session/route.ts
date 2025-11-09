import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { invoiceId } = await req.json();
    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

  if (!stripe) return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });

  const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: `Facture #${invoice.id}` },
            unit_amount: Math.round(invoice.amount * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/patient/invoices?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/patient/invoices?canceled=true`,
      metadata: { invoiceId: invoice.id },
    });

    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { stripeSession: session.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
