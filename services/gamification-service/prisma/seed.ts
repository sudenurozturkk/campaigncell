import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding gamification database...');

  // 1. Levels Seed
  const defaultLevels = [
    { name: 'Bronz', minPoints: 0, maxPoints: 49 },
    { name: 'Gümüş', minPoints: 50, maxPoints: 149 },
    { name: 'Altın', minPoints: 150, maxPoints: 299 },
    { name: 'Platin', minPoints: 300, maxPoints: null },
  ];

  for (const lvl of defaultLevels) {
    await prisma.level.upsert({
      where: { name: lvl.name },
      update: { minPoints: lvl.minPoints, maxPoints: lvl.maxPoints },
      create: lvl,
    });
  }

  // 2. Badges Seed
  const defaultBadges = [
    {
      code: 'ILK_KAMPANYA',
      name: 'İlk Adım Ustası',
      description: 'İlk kampanya optimizasyon vakasını başarıyla tamamlayan uzmana verilir.',
    },
    {
      code: 'HIZ_USTASI',
      name: 'Hız Şampiyonu',
      description: 'SLA süresi dolmadan 5 vaka optimizasyonunu başarıyla tamamlayan uzmana verilir.',
    },
    {
      code: 'SLA_SAMPIYONU',
      name: 'Kusursuz SLA',
      description: 'Hiç SLA ihlali yapmadan 50 puana ulaşan uzmana verilir.',
    },
    {
      code: 'OPTIMIZASYON_KRALI',
      name: 'Optimizasyon Kralı',
      description: 'Toplam 100 puana ulaşan uzmana verilen en prestijli rozet.',
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
