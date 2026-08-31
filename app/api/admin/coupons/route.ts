import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createCouponSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  discount_type: z.enum(['percentage', 'fixed_amount']),
  discount_value: z.number().min(0.01, 'Discount value must be greater than 0'),
  min_order_value: z.number().default(0),
  max_uses: z.number().default(1000),
  expires_at: z.string().nullable().optional(),
});

const db = prisma as any;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role?.toUpperCase();

    if (!session?.user || role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const coupons = await db.coupon.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });

    return NextResponse.json({ coupons });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role?.toUpperCase();

    if (!session?.user || role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const data = createCouponSchema.parse(body);

    const codeUpper = data.code.trim().toUpperCase();

    const existing = await db.coupon.findUnique({
      where: { code: codeUpper },
    });

    if (existing) {
      return NextResponse.json({ error: `Promo code "${codeUpper}" already exists` }, { status: 400 });
    }

    const coupon = await db.coupon.create({
      data: {
        code: codeUpper,
        discount_type: data.discount_type,
        discount_value: data.discount_value,
        min_order_value: data.min_order_value,
        max_uses: data.max_uses,
        expires_at: data.expires_at ? new Date(data.expires_at) : null,
        is_active: true,
      },
    });

    return NextResponse.json({ success: true, coupon }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation Error', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role?.toUpperCase();

    if (!session?.user || role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { id, is_active } = body;

    if (!id) {
      return NextResponse.json({ error: 'Coupon ID is required' }, { status: 400 });
    }

    const coupon = await db.coupon.update({
      where: { id },
      data: { is_active: Boolean(is_active) },
    });

    return NextResponse.json({ success: true, coupon });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
