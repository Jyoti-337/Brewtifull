import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const db = prisma as any;

async function main() {
  console.log('Seeding sample coupons...');

  const welcomeCoupon = await db.coupon.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      code: 'WELCOME10',
      discount_type: 'percentage',
      discount_value: 10, // 10% off
      min_order_value: 100, // min ₹100
      max_uses: 500,
      times_used: 0,
      is_active: true,
    },
  });

  const brewCoupon = await db.coupon.upsert({
    where: { code: 'BREW20' },
    update: {},
    create: {
      code: 'BREW20',
      discount_type: 'fixed_amount',
      discount_value: 20, // ₹20 off
      min_order_value: 150, // min ₹150
      max_uses: 200,
      times_used: 0,
      is_active: true,
    },
  });

  console.log('Sample coupons seeded successfully:', { welcomeCoupon, brewCoupon });
}

main()
  .catch((e) => {
    console.error('Error seeding coupons:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
