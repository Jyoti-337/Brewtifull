import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

async function checkAdmin(session: any) {
  const role = session?.user?.role;
  return role === 'ADMIN' || role === 'admin';
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!(await checkAdmin(session))) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    // 1. Orders by Status
    const ordersByStatusGroup = await prisma.order.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    const ordersByStatus = ordersByStatusGroup.map((item) => ({
      status: item.status,
      count: item._count.id,
    }));

    // 2. Revenue Over Time (Last 30 Days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentOrders = await prisma.order.findMany({
      where: {
        created_at: { gte: thirtyDaysAgo },
        status: { not: 'CANCELLED' },
      },
      select: {
        total: true,
        created_at: true,
      },
      orderBy: { created_at: 'asc' },
    });

    // Aggregate by date (YYYY-MM-DD)
    const dateRevenueMap = new Map<string, number>();
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      dateRevenueMap.set(dateKey, 0);
    }

    for (const order of recentOrders) {
      const dateKey = new Date(order.created_at).toISOString().split('T')[0];
      if (dateRevenueMap.has(dateKey)) {
        dateRevenueMap.set(dateKey, (dateRevenueMap.get(dateKey) || 0) + Number(order.total));
      }
    }

    const revenueOverTime = Array.from(dateRevenueMap.entries()).map(([date, revenue]) => ({
      date: new Date(date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
      revenue: Number(revenue.toFixed(2)),
    }));

    // 3. Top 5 Best-Selling Products
    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          status: { not: 'CANCELLED' },
        },
      },
      include: {
        product: { select: { name: true, image_url: true } },
      },
    });

    const productSalesMap = new Map<string, { name: string; quantity: number; revenue: number }>();

    for (const item of orderItems) {
      const pName = item.product?.name || 'Coffee Item';
      const existing = productSalesMap.get(pName) || { name: pName, quantity: 0, revenue: 0 };
      existing.quantity += item.quantity;
      existing.revenue += item.quantity * item.price_at_purchase;
      productSalesMap.set(pName, existing);
    }

    const topProducts = Array.from(productSalesMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    return NextResponse.json({
      ordersByStatus,
      revenueOverTime,
      topProducts,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
