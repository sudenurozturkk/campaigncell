import { PrismaClient, CampaignTypeEnum, TargetSegmentEnum, CampaignStatusEnum, CasePriorityEnum, CaseStatusEnum } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding campaign database...');

  // 1. Initial Segments
  const defaultSegments = [
    { name: 'YUKSEK_DEGER', description: 'Yüksek ARPU veren sadık müşteriler' },
    { name: 'RISKLI_KAYIP', description: 'Churn riski yüksek müşteriler' },
    { name: 'YENI_ABONE', description: 'Son 30 günde katılan yeni aboneler' },
    { name: 'PASIF', description: 'Kullanım oranı düşük aboneler' },
    { name: 'BELIRSIZ', description: 'AI taraflı segmentasyonu tamamlanmamış aboneler' },
  ];

  for (const seg of defaultSegments) {
    await prisma.segment.upsert({
      where: { name: seg.name },
      update: { description: seg.description },
      create: seg,
    });
  }

  // 2. Demo Campaigns & Cases
  const mockUserId = randomUUID();
  const mockExpertId = randomUUID();

  const mockCampaigns = [
    {
      code: 'CMP-2026-000101',
      name: 'Yüksek Değerli Abone İnternet Fırsatı',
      description: 'Sadık 5G kullanıcılarına özel 20GB Ek Paket hediyesi',
      type: CampaignTypeEnum.EK_PAKET,
      discountPercent: 25.0,
      targetSegment: TargetSegmentEnum.YUKSEK_DEGER,
      status: CampaignStatusEnum.ACTIVE,
      aiRecommendationScore: 0.92,
      aiConversionProbability: 0.78,
      createdBy: mockUserId,
    },
    {
      code: 'CMP-2026-000102',
      name: 'Churn Önleme Cihaz Teklifi',
      description: 'Rakibe geçme riski olan aboneye akıllı telefon taahhüt indirimi',
      type: CampaignTypeEnum.CIHAZ_FIRSATI,
      discountPercent: 40.0,
      targetSegment: TargetSegmentEnum.RISKLI_KAYIP,
      status: CampaignStatusEnum.MANUAL_OPTIMIZATION_REQUIRED,
      aiRecommendationScore: 0.85,
      aiConversionProbability: 0.65,
      createdBy: mockUserId,
    },
  ];

  for (const campData of mockCampaigns) {
    const existing = await prisma.campaign.findUnique({ where: { code: campData.code } });
    if (!existing) {
      const created = await prisma.campaign.create({ data: campData });

      const slaDeadline = new Date(Date.now() + 48 * 3600 * 1000);
      const optCase = await prisma.optimizationCase.create({
        data: {
          caseCode: campData.code,
          campaignId: created.id,
          segment: campData.targetSegment,
          priority: campData.targetSegment === TargetSegmentEnum.RISKLI_KAYIP ? CasePriorityEnum.KRITIK : CasePriorityEnum.YUKSEK,
          status: CaseStatusEnum.ATANDI,
          assignedExpertId: mockExpertId,
          aiScore: campData.aiRecommendationScore,
          aiConversionProb: campData.aiConversionProbability,
          aiReasoning: 'Müşteri profili ve geçmiş kampanya etkileşim skorlarına dayanmaktadır.',
          slaDeadline,
        },
      });

      await prisma.campaignHistory.create({
        data: {
          caseId: optCase.id,
          fromStatus: CaseStatusEnum.YENI,
          toStatus: CaseStatusEnum.ATANDI,
          changedBy: mockUserId,
          note: 'Seed scripti ile vaka açıldı ve uzmana atandı.',
        },
      });
    }
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
