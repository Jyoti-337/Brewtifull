import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';
import { z } from 'zod';
import { validateCouponLogic } from '@/lib/coupons';
import { sendOrderConfirmationEmail } from '@/lib/email';

const stripeSecret = process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key_for_build';
const stripe = new Stripe(stripeSecret, {
  apiVersion: '2025-02-24.acacia' as any,
});

const checkoutSchema = z.object({
  order_type: z.enum(['dine_in', 'take_away', 'delivery']),
  payment_method: z.enum(['stripe', 'COD']).default('stripe'),
  customer_name: z.string().min(1, 'Name is required'),
  customer_phone: z.string().min(1, 'Phone is required'),
  items: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      price: z.number(),
      quantity: z.number().min(1),
      size: z.string().optional(),
    })
  ).min(1, 'Cart cannot be empty'),
  delivery_fee: z.number().default(0),
  tax: z.number().default(0),
  coupon_code: z.string().nullable().optional(),
  discount_amount: z.number().default(0),
  table_number: z.number().nullable().optional(),
  guests: z.number().nullable().optional(),
  pickup_time: z.string().nullable().optional(),
  address_line1: z.string().nullable().optional(),
  address_line2: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  pincode: z.string().nullable().optional(),
  delivery_instructions: z.string().nullable().optional(),
  special_requests: z.string().nullable().optional(),
});

const db = prisma as any;

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Please log in to place your order' },
        { status: 401 }
      );
    }
    const userId = (session.user as any).id;

    const body = await req.json();
    const data = checkoutSchema.parse(body);

    const subtotal = data.items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    // Coupon verification
    let couponId: string | null = null;
    let appliedCouponCode: string | null = null;
    let discountAmount = 0;

    if (data.coupon_code) {
      const coupon = await db.coupon.findUnique({
        where: { code: data.coupon_code.trim().toUpperCase() },
      });
      const result = validateCouponLogic(coupon, subtotal);
      if (result.valid && result.coupon) {
        couponId = result.coupon.id || null;
        appliedCouponCode = result.coupon.code;
        discountAmount = result.discountAmount;

        // Increment times_used
        if (couponId) {
          await db.coupon.update({
            where: { id: couponId },
            data: { times_used: { increment: 1 } },
          });
        }
      }
    }

    const calculatedTax = Math.max(0, (subtotal - discountAmount) * 0.05);
    const total = Math.max(0, subtotal - discountAmount + data.delivery_fee + calculatedTax);
    const orderNumber = `BTC-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Fetch existing products to validate product IDs
    const dbProducts = await prisma.product.findMany();
    const dbProductMap = new Map<string, any>(dbProducts.map((p: any) => [p.id, p]));
    const dbProductNameMap = new Map<string, any>(dbProducts.map((p: any) => [p.name.toLowerCase(), p]));
    const defaultProduct = dbProducts[0];

    const resolvedOrderItems = data.items.map((item: any) => {
      let matched = dbProductMap.get(item.id);
      if (!matched) {
        matched = dbProductNameMap.get(item.name.toLowerCase());
      }
      return {
        product_id: matched ? matched.id : (defaultProduct ? defaultProduct.id : item.id),
        quantity: item.quantity,
        price_at_purchase: item.price,
      };
    });

    // Create order in database
    const order = await db.order.create({
      data: {
        order_number: orderNumber,
        user_id: userId,
        coupon_id: couponId,
        coupon_code: appliedCouponCode,
        discount_amount: discountAmount,
        status: 'PENDING',
        subtotal,
        delivery_fee: data.delivery_fee,
        tax: calculatedTax,
        total,
        payment_method: data.payment_method,
        customer_name: data.customer_name,
        customer_phone: data.customer_phone,
        order_type: data.order_type,
        table_number: data.table_number || null,
        guests: data.guests || null,
        pickup_time: data.pickup_time || null,
        address_line1: data.address_line1 || null,
        address_line2: data.address_line2 || null,
        city: data.city || null,
        pincode: data.pincode || null,
        delivery_instructions: data.delivery_instructions || null,
        special_requests: data.special_requests || null,
        order_items: {
          create: resolvedOrderItems,
        },
      },
      include: {
        order_items: {
          include: {
            product: true,
          },
        },
      },
    });

    // If Cash on Delivery selected -> bypass Stripe
    if (data.payment_method === 'COD') {
      // Trigger order confirmation email
      try {
        await sendOrderConfirmationEmail(order, session.user.email || '');
      } catch (err) {
        console.error('Failed to send order confirmation email:', err);
      }

      return NextResponse.json({
        success: true,
        payment_method: 'COD',
        isCod: true,
        orderNumber: order.order_number,
        orderId: order.id,
        message: 'Your order has been placed successfully via Cash on Delivery!',
      });
    }

    // Stripe checkout session flow
    const lineItems: any[] = data.items.map((item: any) => ({
      price_data: {
        currency: 'inr',
        product_data: {
          name: item.name,
          description: item.size ? `Size: ${item.size}` : undefined,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    if (discountAmount > 0) {
      lineItems.push({
        price_data: {
          currency: 'inr',
          product_data: {
            name: `Promo Discount (${appliedCouponCode})`,
            description: undefined,
          },
          unit_amount: -Math.round(discountAmount * 100),
        },
        quantity: 1,
      });
    }

    if (data.delivery_fee > 0) {
      lineItems.push({
        price_data: {
          currency: 'inr',
          product_data: { name: 'Delivery Fee', description: undefined },
          unit_amount: Math.round(data.delivery_fee * 100),
        },
        quantity: 1,
      });
    }

    if (calculatedTax > 0) {
      lineItems.push({
        price_data: {
          currency: 'inr',
          product_data: { name: 'Taxes & Fees (5%)', description: undefined },
          unit_amount: Math.round(calculatedTax * 100),
        },
        quantity: 1,
      });
    }

    const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${appUrl}/orders?session_id={CHECKOUT_SESSION_ID}&order_number=${orderNumber}`,
      cancel_url: `${appUrl}/checkout?canceled=true`,
      client_reference_id: order.id,
      metadata: {
        order_number: orderNumber,
        user_id: userId,
      },
    };

    const stripeSession = await stripe.checkout.sessions.create(sessionConfig);

    await db.order.update({
      where: { id: order.id },
      data: { stripe_session_id: stripeSession.id },
    });

    // Trigger order confirmation email
    try {
      await sendOrderConfirmationEmail(order, session.user.email || '');
    } catch (err) {
      console.error('Failed to send order confirmation email:', err);
    }

    return NextResponse.json({ url: stripeSession.url, orderNumber: order.order_number });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation Error', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
