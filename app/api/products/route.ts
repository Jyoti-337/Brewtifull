import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const querySchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;

    querySchema.parse({ category, search });

    const whereClause: any = {
      is_available: true,
    };

    if (category && category !== 'All') {
      whereClause.category = category;
    }

    if (search && search.trim() !== '') {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      orderBy: { created_at: 'desc' },
    });

    // Format products for frontend consumption
    const formattedProducts = products.map((p) => {
      let parsedFeatures: string[] = [];
      try {
        parsedFeatures = typeof p.features === 'string' ? JSON.parse(p.features) : (p.features || []);
      } catch (e) {
        parsedFeatures = [];
      }
      return {
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        category: p.category,
        image: p.image_url,
        rating: p.rating,
        stock: p.stock,
        isPopular: p.is_popular,
        isNew: p.is_new,
        features: parsedFeatures,
      };
    });

    return NextResponse.json({ products: formattedProducts });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid search params', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
