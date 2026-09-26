import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Purging all data to leave a clean, production-ready baseline database...');

  // Delete all existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.deliveryPartner.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.restaurant.deleteMany();
  await prisma.user.deleteMany();
  await prisma.platformSetting.deleteMany();

  const hashedPasswordAdmin = await bcrypt.hash('admin123', 10);

  await prisma.platformSetting.create({
    data: {
      key: 'global_commission_rate',
      value: '15'
    }
  });

  // Only create the initial Super Admin account for platform administration
  await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: 'admin@spiceroute.com',
      password: hashedPasswordAdmin,
      role: 'ADMIN',
      phone: '+91 98765 43210',
      address: 'Spice Route HQ, Hitec City, Hyderabad'
    }
  });

  console.log('✅ All sample data successfully removed! Clean baseline created.');
}

main()
  .catch((e) => {
    console.error('❌ Error during data purge:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
