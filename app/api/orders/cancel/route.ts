import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';
import { z } from 'zod';
import { sendOrderStatusUpdateEmail } from '@/lib/email';

const stripeSecret = process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key_for_build';
const stripe = new Stripe(stripeSecret, {
  apiVersion: '2025-02-24.acacia' as any,
});

const cancelSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  reason: z.string().optional(),
});

const db = prisma as any;

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized: Please log in' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const userRole = (session.user as any).role?.toUpperCase();
    const isAdmin = userRole === 'ADMIN';

    const body = await req.json();
    const { orderId, reason } = cancelSchema.parse(body);

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Verify ownership if not admin
    if (!isAdmin && order.user_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized: You do not own this order' }, { status: 403 });
    }

    // Customer cancellation constraint check: ONLY allowed while status is PENDING or CONFIRMED
    const allowedCustomerStatuses = ['PENDING', 'CONFIRMED'];
    if (!isAdmin && !allowedCustomerStatuses.includes(order.status)) {
      return NextResponse.json(
        {
          error: `Orders cannot be cancelled once they are in '${order.status.replace('_', ' ')}' stage. Please contact support.`,
        },
        { status: 400 }
      );
    }

    if (order.status === 'CANCELLED') {
      return NextResponse.json({ error: 'Order is already cancelled' }, { status: 400 });
    }

    // =========================================================================
    // STRIPE REFUND API HOOK (Placeholder / Integration Note):
    // If the order was paid online via Stripe and is in PAID status, issue refund:
    //
    // if (order.payment_method === 'stripe' && order.stripe_session_id) {
    //   try {
    //     const checkoutSession = await stripe.checkout.sessions.retrieve(order.stripe_session_id);
    //     if (checkoutSession.payment_intent) {
    //       const refund = await stripe.refunds.create({
    //         payment_intent: typeof checkoutSession.payment_intent === 'string'
    //           ? checkoutSession.payment_intent
    //           : checkoutSession.payment_intent.id,
    //         reason: 'requested_by_customer',
    //       });
    //       console.log(`[STRIPE REFUND] Issued refund ID: ${refund.id} for order ${order.order_number}`);
    //     }
    //   } catch (refundErr) {
    //     console.error('[STRIPE REFUND ERROR]', refundErr);
    //   }
    // }
    // =========================================================================

    const cancellationReason = reason || (isAdmin ? 'Cancelled by admin' : 'Cancelled by customer');

    const updatedOrder = await db.order.update({
      where: { id: orderId },
      data: {
        status: 'CANCELLED',
        cancellation_reason: cancellationReason,
      },
    });

    // Trigger status update email
    try {
      if (order.user?.email || session.user.email) {
        await sendOrderStatusUpdateEmail(updatedOrder, order.user?.email || session.user.email);
      }
    } catch (err) {
      console.error('Failed to send cancellation email:', err);
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: 'Order cancelled successfully',
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input payload' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
