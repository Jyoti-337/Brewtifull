import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateCouponLogic } from '@/lib/coupons';
import { z } from 'zod';

const validateSchema = z.object({
  code: z.string().min(1, 'Promo code is required'),
  subtotal: z.number().min(0),
});

const db = prisma as any;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, subtotal } = validateSchema.parse(body);

    const coupon = await db.coupon.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    const result = validateCouponLogic(coupon, subtotal);

    if (!result.valid) {
      return NextResponse.json({ valid: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      valid: true,
      discountAmount: result.discountAmount,
      coupon: {
        id: result.coupon?.id,
        code: result.coupon?.code,
        discount_type: result.coupon?.discount_type,
        discount_value: result.coupon?.discount_value,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ valid: false, error: 'Invalid input payload' }, { status: 400 });
    }
    return NextResponse.json({ valid: false, error: error.message }, { status: 500 });
  }
}
