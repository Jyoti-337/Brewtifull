import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const productSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().min(5, 'Description is required'),
  price: z.number().positive('Price must be greater than 0'),
  category: z.string().min(1, 'Category is required'),
  image_url: z.string().min(1, 'Image URL is required'),
  stock: z.number().int().nonnegative('Stock must be 0 or higher').default(50),
  is_available: z.boolean().default(true),
  is_popular: z.boolean().default(false),
  is_new: z.boolean().default(false),
  features: z.array(z.string()).optional(),
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

    const products = await prisma.product.findMany({
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json({ products });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!(await checkAdmin(session))) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const data = productSchema.parse(body);

    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        image_url: data.image_url,
        stock: data.stock,
        is_available: data.is_available,
        is_popular: data.is_popular,
        is_new: data.is_new,
        features: JSON.stringify(data.features || []),
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid product data', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!(await checkAdmin(session))) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const { id, ...body } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    const data = productSchema.partial().parse(body);

    const updateData: any = { ...data };
    if (data.features) {
      updateData.features = JSON.stringify(data.features);
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ product });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid product data', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!(await checkAdmin(session))) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
