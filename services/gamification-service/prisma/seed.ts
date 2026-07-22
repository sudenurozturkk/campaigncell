import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Gamification Service Database...');

  // Badges
  const badges = [
    { code: 'ILK_KAMPANYA', name: 'İlk Kampanya', description: 'İlk kampanyayı başarıyla tamamlayan uzmana verilir.' },
    { code: 'HIZ_USTASI', name: 'Hız Ustası', description: '2 saatten kısa sürede vaka optimizasyonu yapan uzmana verilir.' },
    { code: 'DONUSUM_KRALI', name: 'Dönüşüm Kralı', description: '%80+ dönüşüm oranına ulaşan uzmana verilir.' },
    { code: 'MARATONCU', name: 'Maratoncu', description: '20+ vaka tamamlayan uzmana verilir.' },
    { code: 'CHURN_AVCISI', name: 'Churn Avcısı', description: '5+ churn riski bulunan vakayı çözen uzmana verilir.' },
    { code: 'UZMAN', name: 'Uzman', description: '50+ vaka tamamlayan kıdemli uzmana verilir.' },
  ];

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { code: badge.code },
      update: {},
      create: badge,
    });
  }

  // Levels
  const levels = [
    { name: 'Bronz', minPoints: 0, maxPoints: 499 },
    { name: 'Gümüş', minPoints: 500, maxPoints: 1499 },
    { name: 'Altın', minPoints: 1500, maxPoints: 2999 },
    { name: 'Platin', minPoints: 3000, maxPoints: 5000 },
  ];

  for (const level of levels) {
    await prisma.level.upsert({
      where: { name: level.name },
      update: {},
      create: level,
    });
  }

  console.log('Gamification Service Seeding Completed Successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
