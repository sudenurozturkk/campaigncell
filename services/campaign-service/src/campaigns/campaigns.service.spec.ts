import { Test, TestingModule } from '@nestjs/testing';
import { CampaignsService } from './campaigns.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service.js';
import { CampaignTypeEnum, TargetSegmentEnum, CampaignStatusEnum, CaseStatusEnum } from '@prisma/client';

describe('CampaignsService (CRUD & Degradation)', () => {
  let service: CampaignsService;
  let prisma: PrismaService;
  let rabbitmq: RabbitMQService;

  const mockPrisma = {
    campaign: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    optimizationCase: {
      create: jest.fn(),
    },
    campaignHistory: {
      create: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrisma)),
  };

  const mockRabbitMQ = {
    publishEvent: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampaignsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: RabbitMQService, useValue: mockRabbitMQ },
      ],
    }).compile();

    service = module.get<CampaignsService>(CampaignsService);
    prisma = module.get<PrismaService>(PrismaService);
    rabbitmq = module.get<RabbitMQService>(RabbitMQService);

    jest.clearAllMocks();
  });

  it('should create campaign with automatic case and emit campaign.created event', async () => {
    mockPrisma.campaign.findUnique.mockResolvedValue(null);
    mockPrisma.campaign.create.mockResolvedValue({
      id: 'camp-123',
      code: 'CMP-2026-123456',
      name: 'Yaz Taahhüt Kampanyası',
      type: CampaignTypeEnum.TARIFE_YUKSELTME,
      targetSegment: TargetSegmentEnum.YUKSEK_DEGER,
      status: CampaignStatusEnum.ACTIVE,
      createdBy: 'expert-uuid-1',
      createdAt: new Date(),
    });
    mockPrisma.optimizationCase.create.mockResolvedValue({
      id: 'case-123',
      caseCode: 'CMP-2026-123456',
      status: CaseStatusEnum.YENI,
    });

    const result = await service.create(
      {
        name: 'Yaz Taahhüt Kampanyası',
        type: CampaignTypeEnum.TARIFE_YUKSELTME,
        targetSegment: TargetSegmentEnum.YUKSEK_DEGER,
        discountPercent: 15,
      },
      'expert-uuid-1',
    );

    expect(result.id).toBe('camp-123');
    expect(mockPrisma.campaign.create).toHaveBeenCalled();
    expect(mockPrisma.optimizationCase.create).toHaveBeenCalled();
    expect(mockRabbitMQ.publishEvent).toHaveBeenCalledWith('campaign.created', expect.objectContaining({
      campaign_id: 'camp-123',
      created_by: 'expert-uuid-1',
    }));
  });

  it('should handle degradation fallback if targetSegment is BELIRSIZ', async () => {
    mockPrisma.campaign.findUnique.mockResolvedValue(null);
    mockPrisma.campaign.create.mockResolvedValue({
      id: 'camp-fallback',
      code: 'CMP-2026-654321',
      name: 'Manuel Optimizasyon Bekleyen Kampanya',
      type: CampaignTypeEnum.EK_PAKET,
      targetSegment: TargetSegmentEnum.BELIRSIZ,
      status: CampaignStatusEnum.MANUAL_OPTIMIZATION_REQUIRED,
      createdBy: 'expert-uuid-1',
      createdAt: new Date(),
    });

    const result = await service.create(
      {
        name: 'Manuel Optimizasyon Bekleyen Kampanya',
        type: CampaignTypeEnum.EK_PAKET,
        targetSegment: TargetSegmentEnum.BELIRSIZ,
      },
      'expert-uuid-1',
    );

    expect(result.status).toBe(CampaignStatusEnum.MANUAL_OPTIMIZATION_REQUIRED);
  });
});
