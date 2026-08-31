import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripeSecret = process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key_for_build';
const stripe = new Stripe(stripeSecret, {
  apiVersion: '2025-02-24.acacia' as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature') || '';

  let event: Stripe.Event;

  try {
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      // In dev mode without webhook secret configured, parse body directly
      event = JSON.parse(body);
    }
  } catch (err: any) {
    console.error(`❌ Stripe Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.order_id;

    if (orderId) {
      try {
        await prisma.order.update({
          where: { id: orderId },
          data: { status: 'PAID' },
        });
        console.log(`✅ Order ${orderId} status updated to PAID via Stripe Webhook.`);
      } catch (e: any) {
        console.error(`❌ Failed to update order status for ${orderId}: ${e.message}`);
      }
    }
  }

  return NextResponse.json({ received: true });
}
