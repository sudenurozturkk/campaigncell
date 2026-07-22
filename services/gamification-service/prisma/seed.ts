import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding gamification database...');

  // 1. Levels Seed (Case §6.3)
  const defaultLevels = [
    { name: 'Bronz', minPoints: 0, maxPoints: 499 },
    { name: 'Gümüş', minPoints: 500, maxPoints: 1499 },
    { name: 'Altın', minPoints: 1500, maxPoints: 2999 },
    { name: 'Platin', minPoints: 3000, maxPoints: null },
  ];

  for (const lvl of defaultLevels) {
    await prisma.level.upsert({
      where: { name: lvl.name },
      update: { minPoints: lvl.minPoints, maxPoints: lvl.maxPoints },
      create: lvl,
    });
  }

  // 2. Badges Seed (Case §6.2)
  const defaultBadges = [
    {
      code: 'ILK_KAMPANYA',
      name: 'İlk Kampanya',
      description: 'İlk optimizasyonu tamamlama.',
    },
    {
      code: 'HIZ_USTASI',
      name: 'Hız Ustası',
      description: '2 saatin altında 10 optimizasyon tamamlama.',
    },
    {
      code: 'DONUSUM_KRALI',
      name: 'Dönüşüm Kralı',
      description: '10 kampanyada hedef dönüşüm oranını aşma.',
    },
    {
      code: 'MARATONCU',
      name: 'Maratoncu',
      description: 'Bir günde 20 optimizasyon tamamlama.',
    },
    {
      code: 'CHURN_AVCISI',
      name: 'Churn Avcısı',
      description: '10 RISKLI_KAYIP vakasını başarıyla kurtarma.',
    },
    {
      code: 'UZMAN',
      name: 'Uzman',
      description: 'Tek bir segmentte 50 optimizasyon tamamlama.',
    },
  ];

  for (const b of defaultBadges) {
    await prisma.badge.upsert({
      where: { code: b.code },
      update: { name: b.name, description: b.description },
      create: b,
    });
  }

  console.log('Gamification database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
