import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service.js';
import { CreateCampaignDto } from './dto/create-campaign.dto.js';
import { UpdateCampaignDto } from './dto/update-campaign.dto.js';
import { QueryCampaignDto } from './dto/query-campaign.dto.js';
import { CampaignStatusEnum, TargetSegmentEnum, CasePriorityEnum, CaseStatusEnum } from '@prisma/client';

@Injectable()
export class CampaignsService {
  private readonly logger = new Logger(CampaignsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly rabbitmq: RabbitMQService,
  ) {}

  private async generateUniqueCode(): Promise<string> {
    const year = new Date().getFullYear();
    for (let i = 0; i < 10; i++) {
      const randomNum = Math.floor(100000 + Math.random() * 900000);
      const code = `CMP-${year}-${randomNum}`;
      const existing = await this.prisma.campaign.findUnique({ where: { code } });
      if (!existing) return code;
    }
    return `CMP-${year}-${Date.now().toString().slice(-6)}`;
  }

  private calculateSlaDeadline(priority: CasePriorityEnum): Date {
    const now = new Date();
    let hoursToAdd = 72; // ORTA varsayılan
    if (priority === CasePriorityEnum.KRITIK) hoursToAdd = 24;
    else if (priority === CasePriorityEnum.YUKSEK) hoursToAdd = 48;
    else if (priority === CasePriorityEnum.ORTA) hoursToAdd = 72;
    else if (priority === CasePriorityEnum.DUSUK) hoursToAdd = 120;

    return new Date(now.getTime() + hoursToAdd * 60 * 60 * 1000);
  }

  async create(dto: CreateCampaignDto, userId: string) {
    const code = await this.generateUniqueCode();
    
    // AI Service Degredation Check
    let targetSegment = dto.targetSegment || TargetSegmentEnum.BELIRSIZ;
    let status: CampaignStatusEnum = CampaignStatusEnum.ACTIVE;
    let priority: CasePriorityEnum = CasePriorityEnum.ORTA;
    let aiScore = 0.75;
    let aiConversionProb = 0.45;
    let aiReasoning = 'Standart kural tabanlı ilk analiz.';

    if (targetSegment === TargetSegmentEnum.BELIRSIZ) {
      status = CampaignStatusEnum.MANUAL_OPTIMIZATION_REQUIRED;
      priority = CasePriorityEnum.ORTA;
      aiReasoning = 'AI servis erişilemediği için manuel optimizasyon kuyruğuna alındı.';
    } else if (targetSegment === TargetSegmentEnum.RISKLI_KAYIP) {
      priority = CasePriorityEnum.KRITIK;
    } else if (targetSegment === TargetSegmentEnum.YUKSEK_DEGER) {
      priority = CasePriorityEnum.YUKSEK;
    }

    const campaign = await this.prisma.$transaction(async (tx) => {
      const createdCampaign = await tx.campaign.create({
        data: {
          code,
          name: dto.name,
          description: dto.description,
          type: dto.type,
          discountPercent: dto.discountPercent,
          targetSegment,
          startDate: dto.startDate ? new Date(dto.startDate) : null,
          endDate: dto.endDate ? new Date(dto.endDate) : null,
          status,
          aiRecommendationScore: aiScore,
          aiConversionProbability: aiConversionProb,
          createdBy: userId,
        },
      });

      // Kampanyaya bağlı optimizasyon vakası oluşturma
      const slaDeadline = this.calculateSlaDeadline(priority);
      const optCase = await tx.optimizationCase.create({
        data: {
          caseCode: code,
          campaignId: createdCampaign.id,
          segment: targetSegment,
          priority,
          status: CaseStatusEnum.YENI,
          aiScore,
          aiConversionProb,
          aiReasoning,
          slaDeadline,
        },
      });

      // Durum geçmişi kaydı
      await tx.campaignHistory.create({
        data: {
          caseId: optCase.id,
          fromStatus: null,
          toStatus: CaseStatusEnum.YENI,
          changedBy: userId,
          note: 'Kampanya oluşturuldu ve ilk vaka açıldı.',
        },
      });

      return createdCampaign;
    });

    // RabbitMQ Event yayınlama
    await this.rabbitmq.publishEvent('campaign.created', {
      campaign_id: campaign.id,
      code: campaign.code,
      name: campaign.name,
      type: campaign.type,
      target_segment: campaign.targetSegment,
      status: campaign.status,
      created_by: userId,
      created_at: campaign.createdAt,
    });

    return campaign;
  }

  async findAll(query: QueryCampaignDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.type) where.type = query.type;
    if (query.targetSegment) where.targetSegment = query.targetSegment;
    if (query.status) where.status = query.status;
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { code: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.campaign.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          optimizationCases: {
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
        },
      }),
      this.prisma.campaign.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
      include: {
        optimizationCases: {
          include: {
            assignments: true,
            histories: { orderBy: { createdAt: 'desc' } },
            abTests: true,
          },
        },
        subscriberFeedbacks: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!campaign) {
      throw new NotFoundException(`Kampanya bulunamadı (ID: ${id})`);
    }

    return campaign;
  }

  async update(id: string, dto: UpdateCampaignDto, userId: string) {
    await this.findOne(id);

    const updateData: any = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.type !== undefined) updateData.type = dto.type;
    if (dto.discountPercent !== undefined) updateData.discountPercent = dto.discountPercent;
    if (dto.targetSegment !== undefined) updateData.targetSegment = dto.targetSegment;
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.startDate !== undefined) updateData.startDate = dto.startDate ? new Date(dto.startDate) : null;
    if (dto.endDate !== undefined) updateData.endDate = dto.endDate ? new Date(dto.endDate) : null;

    const updated = await this.prisma.campaign.update({
      where: { id },
      data: updateData,
    });

    return updated;
  }

  async remove(id: string, userId: string) {
    const campaign = await this.findOne(id);

    // Fiziksel silmek yerine statüsü ARSHIVED yaparız
    const archived = await this.prisma.campaign.update({
      where: { id },
      data: { status: CampaignStatusEnum.ARCHIVED },
    });

    await this.rabbitmq.publishEvent('campaign.archived', {
      campaign_id: campaign.id,
      code: campaign.code,
      archived_by: userId,
      archived_at: new Date().toISOString(),
    });

    return archived;
  }
}
