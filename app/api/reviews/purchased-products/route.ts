import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Find all distinct products the user has ordered in non-cancelled orders
    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          user_id: userId,
          status: { not: 'CANCELLED' },
        },
      },
      include: {
        product: {
          select: { id: true, name: true, image_url: true, category: true },
        },
      },
    });

    // Remove duplicates by product ID
    const productMap = new Map();
    for (const item of orderItems) {
      if (item.product && !productMap.has(item.product.id)) {
        productMap.set(item.product.id, item.product);
      }
    }

    const products = Array.from(productMap.values());

    return NextResponse.json({ products });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
