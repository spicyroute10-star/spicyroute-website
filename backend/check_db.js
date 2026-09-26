import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.findMany();
  const restaurants = await prisma.restaurant.findMany({
    include: { menuItems: true, owner: true }
  });
  console.log('--- USERS ---');
  console.log(users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role })));
  console.log('--- RESTAURANTS ---');
  console.log(restaurants.map(r => ({
    id: r.id,
    name: r.name,
    cuisine: r.cuisine,
    address: r.address,
    rating: r.rating,
    itemsCount: r.menuItems.length,
    items: r.menuItems.map(i => i.name),
    owner: r.owner ? r.owner.name : null
  })));
}

check().catch(console.error).finally(() => prisma.$disconnect());
