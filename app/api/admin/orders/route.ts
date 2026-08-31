import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateStatusSchema = z.object({
  orderId: z.string(),
  status: z.enum([
    'PENDING',
    'CONFIRMED',
    'PAID',
    'PREPARING',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'COMPLETED',
    'CANCELLED',
  ]),
});

async function checkAdmin(session: any) {
  const role = session?.user?.role;
  return role === 'ADMIN' || role === 'admin';
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!(await checkAdmin(session))) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const orders = await prisma.order.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        order_items: {
          include: { product: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json({ orders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { sendOrderStatusUpdateEmail } from '@/lib/email';

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!(await checkAdmin(session))) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { orderId, status } = updateStatusSchema.parse(body);

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        user: { select: { email: true, name: true } },
      },
    });

    sendOrderStatusUpdateEmail(updatedOrder, updatedOrder.user?.email || '').catch(err =>
      console.error('Status update email error:', err)
    );

    return NextResponse.json({ order: updatedOrder });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid payload', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
