import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email: parsed.email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      );
    }

    const password_hash = await bcrypt.hash(parsed.password, 10);

    const user = await prisma.user.create({
      data: {
        name: parsed.name,
        email: parsed.email.toLowerCase(),
        password_hash,
        role: 'CUSTOMER',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        created_at: true,
      },
    });

    return NextResponse.json(
      { message: 'Account created successfully', user },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || 'Invalid input data' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
