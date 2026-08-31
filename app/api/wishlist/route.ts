import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const wishlistSchema = z.object({
  productId: z.string().min(1, 'Product ID required'),
});

const db = prisma as any;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const wishlistItems = await db.wishlistItem.findMany({
      where: { user_id: userId },
      include: {
        product: true,
      },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json({ items: wishlistItems });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Please log in to save items to your wishlist' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const { productId } = wishlistSchema.parse(body);

    // Resolve target product in case ID is a slug/name
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { id: productId },
          { name: { equals: productId, mode: 'insensitive' } },
        ],
      },
    });

    const targetProductId = product ? product.id : productId;

    // Check if already wishlisted
    const existing = await db.wishlistItem.findUnique({
      where: {
        user_id_product_id: {
          user_id: userId,
          product_id: targetProductId,
        },
      },
    });

    if (existing) {
      // Toggle off -> remove from wishlist
      await db.wishlistItem.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ wished: false, message: 'Removed from wishlist' });
    } else {
      // Toggle on -> add to wishlist
      const item = await db.wishlistItem.create({
        data: {
          user_id: userId,
          product_id: targetProductId,
        },
        include: { product: true },
      });
      return NextResponse.json({ wished: true, item, message: 'Saved to wishlist' }, { status: 201 });
    }
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid payload', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
