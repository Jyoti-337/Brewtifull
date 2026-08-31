import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const syncCartSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      quantity: z.number(),
      size: z.string().optional(),
    })
  ),
});

const db = prisma as any;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const cartItems = await db.dbCartItem.findMany({
      where: { user_id: userId },
      include: { product: true },
    });

    const formattedItems = cartItems
      .filter((ci: any) => ci.product !== null && ci.quantity > 0)
      .map((ci: any) => ({
        id: ci.product_id,
        name: ci.product.name,
        price: ci.product.price,
        image: ci.product.image_url,
        quantity: Math.max(1, Math.min(99, Math.floor(ci.quantity))),
        size: ci.size || undefined,
      }));

    return NextResponse.json({ items: formattedItems });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * Bulk save / sync cart - Replaces user DB cart items with exact provided quantities.
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const parsed = syncCartSchema.parse(body);

    // Fetch existing database products to validate IDs
    const dbProducts = await db.product.findMany();
    const validProductMap = new Map<string, any>(dbProducts.map((p: any) => [p.id, p]));

    // Transaction to replace cart items atomically
    await db.$transaction(async (tx: any) => {
      // 1. Clear current cart items for user
      await tx.dbCartItem.deleteMany({
        where: { user_id: userId },
      });

      // 2. Insert valid items with sanitized exact quantities
      for (const item of parsed.items) {
        const validProduct = validProductMap.get(item.id);
        if (!validProduct) continue;

        const sanitizedQty = Math.max(1, Math.min(99, Math.floor(item.quantity)));
        await tx.dbCartItem.create({
          data: {
            user_id: userId,
            product_id: validProduct.id,
            quantity: sanitizedQty,
            size: item.size || null,
          },
        });
      }
    });

    // Fetch updated cart from database
    const updatedCart = await db.dbCartItem.findMany({
      where: { user_id: userId },
      include: { product: true },
    });

    const formattedItems = updatedCart
      .filter((ci: any) => ci.product !== null && ci.quantity > 0)
      .map((ci: any) => ({
        id: ci.product_id,
        name: ci.product.name,
        price: ci.product.price,
        image: ci.product.image_url,
        quantity: ci.quantity,
        size: ci.size || undefined,
      }));

    return NextResponse.json({ items: formattedItems });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid cart payload', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * Clear entire cart
 */
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    await db.dbCartItem.deleteMany({
      where: { user_id: userId },
    });

    return NextResponse.json({ success: true, items: [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
