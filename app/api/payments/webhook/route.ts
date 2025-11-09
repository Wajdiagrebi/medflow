import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const payload = await req.text();
  const sig = req.headers.get("stripe-signature");

  try {
    if (!stripe) throw new Error('Stripe not configured');
    const event = stripe.webhooks.constructEvent(
      payload,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;
      const invoiceId = session.metadata?.invoiceId;

      if (invoiceId) {
        await prisma.invoice.update({
          where: { id: invoiceId },
          data: { status: "PAID" },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Webhook Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
