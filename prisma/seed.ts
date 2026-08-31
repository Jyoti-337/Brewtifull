import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create Admin User
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@brewtiful.com' },
    update: {
      role: 'ADMIN',
      password_hash: adminPasswordHash
    },
    create: {
      name: 'Brew Master (Admin)',
      email: 'admin@brewtiful.com',
      password_hash: adminPasswordHash,
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin user created:', adminUser.email);

  // Create Test Customer User
  const customerPasswordHash = await bcrypt.hash('customer123', 10);
  const customerUser = await prisma.user.upsert({
    where: { email: 'customer@brewtiful.com' },
    update: {},
    create: {
      name: 'Jane Doe',
      email: 'customer@brewtiful.com',
      password_hash: customerPasswordHash,
      role: 'CUSTOMER',
    },
  });
  console.log('✅ Customer user created:', customerUser.email);

  // Seed Products
  const productsData = [
    {
      id: 'cappuccino-signature',
      name: 'Cappuccino',
      description: 'Rich espresso topped with equal parts steamed milk and velvety foam, finished with a fine dust of dark cocoa powder.',
      price: 280,
      category: 'Hot Coffee',
      image_url: '/coffee/cappuccino.jpg',
      rating: 4.9,
      stock: 50,
      is_available: true,
      is_popular: true,
      is_new: false,
      features: JSON.stringify(['Espresso', 'Steamed Milk', 'Velvety Foam'])
    },
    {
      id: 'latte-signature',
      name: 'Latte',
      description: 'Smooth, creamy espresso infused with silky steamed milk and a delicate layer of micro-foam.',
      price: 300,
      category: 'Hot Coffee',
      image_url: '/coffee/latte.jpg',
      rating: 5.0,
      stock: 50,
      is_available: true,
      is_popular: true,
      is_new: false,
      features: JSON.stringify(['Espresso', 'Steamed Milk', 'Light Foam'])
    },
    {
      id: 'mocha-signature',
      name: 'Mocha',
      description: 'Decadent dark espresso meeting luxurious Dutch cocoa, steamed milk, and whipped cream.',
      price: 320,
      category: 'Hot Coffee',
      image_url: '/coffee/mocha.jpg',
      rating: 4.7,
      stock: 50,
      is_available: true,
      is_popular: true,
      is_new: false,
      features: JSON.stringify(['Espresso', 'Chocolate', 'Steamed Milk'])
    },
    {
      id: 'espresso-classic',
      name: 'Espresso',
      description: 'Pure, intense double shot of our single-origin artisanal coffee beans.',
      price: 200,
      category: 'Hot Coffee',
      image_url: '/coffee/latte.jpg',
      rating: 4.8,
      stock: 60,
      is_available: true,
      is_popular: false,
      is_new: false,
      features: JSON.stringify(['Strong', 'Single Origin'])
    },
    {
      id: 'flat-white',
      name: 'Flat White',
      description: 'Double ristretto blended with micro-foamed milk for a velvety finish.',
      price: 280,
      category: 'Hot Coffee',
      image_url: '/coffee/latte.jpg',
      rating: 4.9,
      stock: 45,
      is_available: true,
      is_popular: true,
      is_new: false,
      features: JSON.stringify(['Smooth', 'Micro-foam'])
    },
    {
      id: 'cold-brew-nitro',
      name: 'Nitro Cold Brew',
      description: 'Signature cold brew coffee steeped for 18 hours and infused with nitrogen draft.',
      price: 420,
      category: 'Cold Drinks',
      image_url: '/coffee/nitro_cold_brew_1775555494236.png',
      rating: 4.9,
      stock: 40,
      is_available: true,
      is_popular: true,
      is_new: false,
      features: JSON.stringify(['Nitrogen Draft', '18hr Steep'])
    },
    {
      id: 'iced-matcha-latte',
      name: 'Iced Matcha Latte',
      description: 'Ceremonial grade Uji matcha whisked with fresh oat milk over ice.',
      price: 360,
      category: 'Cold Drinks',
      image_url: '/coffee/iced_matcha_1775555672609.png',
      rating: 4.9,
      stock: 35,
      is_available: true,
      is_popular: true,
      is_new: true,
      features: JSON.stringify(['Ceremonial Matcha', 'Antioxidant Rich'])
    },
    {
      id: 'butter-croissant',
      name: 'French Butter Croissant',
      description: 'Flaky, multi-layered French butter pastry baked fresh every morning.',
      price: 180,
      category: 'Pastries',
      image_url: '/coffee/croissant_1775555590339.png',
      rating: 4.8,
      stock: 30,
      is_available: true,
      is_popular: true,
      is_new: false,
      features: JSON.stringify(['Freshly Baked', 'Pure Butter'])
    },
    {
      id: 'chocolate-muffin',
      name: 'Dark Chocolate Muffin',
      description: 'Rich Belgian chocolate muffin stuffed with melted chocolate chips.',
      price: 160,
      category: 'Pastries',
      image_url: '/coffee/chocolate_muffin_1775555639813.png',
      rating: 4.6,
      stock: 25,
      is_available: true,
      is_popular: false,
      is_new: false,
      features: JSON.stringify(['Belgian Cocoa', 'Double Choc'])
    },
    {
      id: 'pumpkin-spice-latte',
      name: 'Pumpkin Spice Latte',
      description: 'Signature espresso blended with warm autumn spices, pumpkin puree, and steamed milk.',
      price: 380,
      category: 'Seasonal',
      image_url: '/coffee/cappuccino.jpg',
      rating: 4.8,
      stock: 30,
      is_available: true,
      is_popular: false,
      is_new: true,
      features: JSON.stringify(['Seasonal Spice', 'Limited Edition'])
    }
  ];

  for (const product of productsData) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: product,
      create: product,
    });
  }

  console.log(`✅ Seeded ${productsData.length} products successfully.`);

  // Create sample review for Cappuccino
  await prisma.review.create({
    data: {
      product_id: 'cappuccino-signature',
      user_id: customerUser.id,
      rating: 5,
      comment: 'Best cappuccino in town! The foam texture and cocoa dusting are absolute perfection.',
    }
  }).catch(() => console.log('Sample review already exists'));

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
