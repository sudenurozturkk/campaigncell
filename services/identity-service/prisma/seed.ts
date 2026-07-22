import { PrismaClient, RoleEnum } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Identity Service Database...');

  const passwordHash = await bcrypt.hash('Turkcell2026!', 10);

  // 1. Subscriber User
  await prisma.user.upsert({
    where: { gsmNumber: '05551112233' },
    update: {},
    create: {
      role: RoleEnum.SUBSCRIBER,
      gsmNumber: '05551112233',
      email: 'ahmet.yilmaz@gmail.com',
      passwordHash,
      firstName: 'Ahmet',
      lastName: 'Yılmaz',
      region: 'İstanbul - Kadıköy',
      expertiseTags: [],
    },
  });

  // 2. Campaign Expert User
  await prisma.user.upsert({
    where: { email: 'uzman@turkcell.com.tr' },
    update: {},
    create: {
      role: RoleEnum.CAMPAIGN_EXPERT,
      email: 'uzman@turkcell.com.tr',
      passwordHash,
      firstName: 'Ahmet',
      lastName: 'Yılmaz (Uzman)',
      region: 'İstanbul',
      expertiseTags: ['Churn Önleme', 'Ek Paket', 'Tarife Yükseltme'],
    },
  });

  // 3. Supervisor User
  await prisma.user.upsert({
    where: { email: 'supervisor@turkcell.com.tr' },
    update: {},
    create: {
      role: RoleEnum.SUPERVISOR,
      email: 'supervisor@turkcell.com.tr',
      passwordHash,
      firstName: 'Süpervizör',
      lastName: 'Yönetici',
      region: 'Genel Merkez',
      expertiseTags: ['Analitik', 'SLA', 'Liderlik'],
    },
  });

  console.log('Identity Service Seeding Completed Successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
