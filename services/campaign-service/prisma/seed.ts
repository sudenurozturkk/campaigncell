import {
  PrismaClient,
  CampaignTypeEnum,
  TargetSegmentEnum,
  CampaignStatusEnum,
  CasePriorityEnum,
  CaseStatusEnum
} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Campaign Service Database...');

  // Create Sample Campaign
  const campaign1 = await prisma.campaign.upsert({
    where: { code: 'CMP-2026-000101' },
    update: {},
    create: {
      code: 'CMP-2026-000101',
      name: 'Yüksek Değerli Abone 20GB Ek Paket',
      description: 'Yüksek veri kullanan müşteriler için kişiselleştirilmiş %30 indirimli ek paket teklifi.',
      type: CampaignTypeEnum.EK_PAKET,
      discountPercent: 30.00,
      targetSegment: TargetSegmentEnum.YUKSEK_DEGER,
      status: CampaignStatusEnum.ACTIVE,
      aiRecommendationScore: 0.940,
      aiConversionProbability: 0.850,
      createdBy: 'a0000000-0000-0000-0000-000000000001',
    },
  });

  // Create Optimization Case
  await prisma.optimizationCase.upsert({
    where: { caseCode: 'CMP-2026-000101' },
    update: {},
    create: {
      caseCode: 'CMP-2026-000101',
      campaignId: campaign1.id,
      segment: 'YUKSEK_DEGER',
      priority: CasePriorityEnum.YUKSEK,
      status: CaseStatusEnum.OPTIMIZE_EDILIYOR,
      aiScore: 0.940,
      aiConversionProb: 0.850,
      aiReasoning: 'AI Analizi: Aylık 35 GB yüksek veri tüketimi ve 24 aylık sadakat baz alınarak hazırlanmıştır.',
      isAiMisclassified: false,
      optimizationNote: 'Ekstra %5 sadakat indirimi tanımlandı.',
      slaDeadline: new Date(Date.now() + 6 * 60 * 60 * 1000),
      slaBreached: false,
    },
  });

  // Churn Prevention Case
  const campaign2 = await prisma.campaign.upsert({
    where: { code: 'CMP-2026-000102' },
    update: {},
    create: {
      code: 'CMP-2026-000102',
      name: 'Churn Önleme Cihaz Fırsatı',
      description: 'Riskli gruptaki aboneler için özel 5G akıllı cihaz ve taahhüt yenileme teklifi.',
      type: CampaignTypeEnum.CIHAZ_FIRSATI,
      discountPercent: 40.00,
      targetSegment: TargetSegmentEnum.RISKLI_KAYIP,
      status: CampaignStatusEnum.MANUAL_OPTIMIZATION_REQUIRED,
      aiRecommendationScore: 0.720,
      aiConversionProbability: 0.650,
      createdBy: 'a0000000-0000-0000-0000-000000000001',
    },
  });

  await prisma.optimizationCase.upsert({
    where: { caseCode: 'CMP-2026-000102' },
    update: {},
    create: {
      caseCode: 'CMP-2026-000102',
      campaignId: campaign2.id,
      segment: 'RISKLI_KAYIP',
      priority: CasePriorityEnum.KRITIK,
      status: CaseStatusEnum.YENI,
      aiScore: 0.720,
      aiConversionProb: 0.650,
      aiReasoning: 'AI Analizi: Cihaz değişim dönemi ve rakip operatör geçiş riski yüksek.',
      isAiMisclassified: false,
      slaDeadline: new Date(Date.now() + 1.5 * 60 * 60 * 1000),
      slaBreached: false,
    },
  });

  console.log('Campaign Service Seeding Completed Successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
