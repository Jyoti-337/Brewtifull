import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createReviewSchema = z.object({
  productId: z.string().min(1, 'Product ID required'),
  rating: z.number().int().min(1, 'Rating must be between 1 and 5').max(5, 'Rating must be between 1 and 5'),
  comment: z.string().min(3, 'Comment must be at least 3 characters'),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    const whereCondition = productId ? { product_id: productId } : {};

    const reviews = await prisma.review.findMany({
      where: whereCondition,
      include: {
        user: { select: { id: true, name: true } },
        product: { select: { id: true, name: true, image_url: true } },
      },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json({ reviews });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Please sign in to leave a review' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const { productId, rating, comment } = createReviewSchema.parse(body);

    // Find real product by ID or name to prevent stale ID mismatches
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { id: productId },
          { name: { equals: productId, mode: 'insensitive' } },
        ],
      },
    });

    const targetProductId = product ? product.id : productId;

    // Verify user has purchased the product in any non-cancelled order (including COD / PENDING)
    const hasPurchased = await prisma.orderItem.findFirst({
      where: {
        product_id: targetProductId,
        order: {
          user_id: userId,
          status: { not: 'CANCELLED' },
        },
      },
    });

    if (!hasPurchased) {
      return NextResponse.json(
        { error: 'You can only review products you have ordered and purchased.' },
        { status: 403 }
      );
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        product_id: targetProductId,
        user_id: userId,
        rating: Number(rating),
        comment,
      },
      include: {
        user: { select: { id: true, name: true } },
        product: { select: { id: true, name: true, image_url: true } },
      },
    });

    // Recalculate product average rating
    const allReviews = await prisma.review.findMany({
      where: { product_id: targetProductId },
      select: { rating: true },
    });

    const avgRating = allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length;

    await prisma.product.update({
      where: { id: targetProductId },
      data: { rating: Number(avgRating.toFixed(1)) },
    });

    return NextResponse.json({ review, avgRating }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid review input', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
