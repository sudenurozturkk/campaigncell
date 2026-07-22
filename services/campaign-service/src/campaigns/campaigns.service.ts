import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service.js';
import { CreateCampaignDto } from './dto/create-campaign.dto.js';
import { UpdateCampaignDto } from './dto/update-campaign.dto.js';
import { QueryCampaignDto } from './dto/query-campaign.dto.js';
import { CampaignStatusEnum, TargetSegmentEnum, CasePriorityEnum, CaseStatusEnum, AssignedByEnum } from '@prisma/client';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PRIORITY_ORDER: Record<string, number> = { DUSUK: 1, ORTA: 2, YUKSEK: 3, KRITIK: 4 };

@Injectable()
export class CampaignsService {
  private readonly logger = new Logger(CampaignsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly rabbitmq: RabbitMQService,
  ) {}

  private async generateUniqueCode(): Promise<string> {
    const year = new Date().getFullYear();
    // Case §4.1: benzersiz + okunabilir sıralı format (örn: CMP-2026-000123)
    for (let i = 0; i < 15; i++) {
      const count = await this.prisma.campaign.count();
      const seq = (count + 101 + i).toString().padStart(6, '0');
      const code = `CMP-${year}-${seq}`;
      const existing = await this.prisma.campaign.findUnique({ where: { code } });
      if (!existing) return code;
    }
    return `CMP-${year}-${Date.now().toString().slice(-6)}`;
  }

  /**
   * Segment → temsili abone profili (AI'ın kampanya-bağlamlı skorlaması için ipucu).
   */
  private buildProfileHint(segment?: string): Record<string, number> | undefined {
    switch (segment) {
      case 'RISKLI_KAYIP':
        return { monthly_data_usage_gb: 2, monthly_voice_min: 90, monthly_spend_try: 80,
          tenure_months: 30, past_accepted_count: 0, past_rejected_count: 3, complaint_count: 4, data_usage_trend_pct: -40 };
      case 'YUKSEK_DEGER':
        return { monthly_data_usage_gb: 45, monthly_voice_min: 1500, monthly_spend_try: 600,
          tenure_months: 48, past_accepted_count: 5, past_rejected_count: 0, complaint_count: 0, data_usage_trend_pct: 20 };
      case 'YENI_ABONE':
        return { monthly_data_usage_gb: 12, monthly_voice_min: 400, monthly_spend_try: 200,
          tenure_months: 2, past_accepted_count: 0, past_rejected_count: 0, complaint_count: 0, data_usage_trend_pct: 5 };
      case 'PASIF':
        return { monthly_data_usage_gb: 3, monthly_voice_min: 150, monthly_spend_try: 90,
          tenure_months: 20, past_accepted_count: 1, past_rejected_count: 2, complaint_count: 1, data_usage_trend_pct: -12 };
      default:
        return undefined;
    }
  }

  /**
   * AI Service'e SENKRON öneri çağrısı (Case §4.1). 5 sn timeout.
   * Erişilemezse null döner → çağıran taraf degradation moduna geçer.
   */
  private async requestAiPrediction(input: { code: string; type: string; requestedSegment?: string }): Promise<any | null> {
    const base = process.env.AI_SERVICE_URL || 'http://ai-service:8000';
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    try {
      const res = await fetch(`${base}/api/v1/ai/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriber_id: `campaign-preview-${input.code}`,
          campaign_type: input.type,
          profile_override: this.buildProfileHint(input.requestedSegment),
        }),
        signal: controller.signal,
      });
      if (!res.ok) {
        this.logger.warn(`AI Service HTTP ${res.status} döndü — degradation moduna geçiliyor.`);
        return null;
      }
      return await res.json();
    } catch (e) {
      this.logger.warn(`AI Service erişilemedi (degradation): ${(e as Error).message}`);
      return null;
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Öncelik türetme (Case §4.3): RISKLI_KAYIP minimum YUKSEK; BELIRSIZ → ORTA.
   */
  private derivePriority(segment: TargetSegmentEnum, aiPriority?: string): CasePriorityEnum {
    if (segment === TargetSegmentEnum.BELIRSIZ) return CasePriorityEnum.ORTA;

    let p: CasePriorityEnum =
      aiPriority && (CasePriorityEnum as any)[aiPriority]
        ? (aiPriority as CasePriorityEnum)
        : CasePriorityEnum.ORTA;

    // RISKLI_KAYIP churn riski → minimum YUKSEK
    if (segment === TargetSegmentEnum.RISKLI_KAYIP && PRIORITY_ORDER[p] < PRIORITY_ORDER.YUKSEK) {
      p = CasePriorityEnum.YUKSEK;
    }
    if (segment === TargetSegmentEnum.YUKSEK_DEGER && PRIORITY_ORDER[p] < PRIORITY_ORDER.YUKSEK) {
      p = CasePriorityEnum.YUKSEK;
    }
    return p;
  }

  private calculateSlaDeadline(priority: CasePriorityEnum): Date {
    const now = new Date();
    let hoursToAdd = 24; // ORTA varsayılan (Case §4.4)
    if (priority === CasePriorityEnum.KRITIK) hoursToAdd = 2;
    else if (priority === CasePriorityEnum.YUKSEK) hoursToAdd = 8;
    else if (priority === CasePriorityEnum.ORTA) hoursToAdd = 24;
    else if (priority === CasePriorityEnum.DUSUK) hoursToAdd = 72;

    return new Date(now.getTime() + hoursToAdd * 60 * 60 * 1000);
  }

  async create(dto: CreateCampaignDto, userId: string) {
    const code = await this.generateUniqueCode();

    // Case §4.1: Kampanya segmente hedeflendiğinde AI Service'e SENKRON gönderilir.
    const ai = await this.requestAiPrediction({
      code,
      type: dto.type,
      requestedSegment: dto.targetSegment,
    });
    const aiAvailable = !!ai;

    let targetSegment: TargetSegmentEnum;
    let priority: CasePriorityEnum;
    let status: CampaignStatusEnum;
    let aiScore: number;
    let aiConversionProb: number;
    let aiReasoning: string;
    let recommendedExpertId: string | null = null;
    let assignmentScore: number | null = null;

    if (!aiAvailable) {
      // Case §2.2 & §4.1 BAĞIMSIZLIK: AI erişilemez → her durumda BELIRSIZ + ORTA + manuel kuyruk.
      targetSegment = TargetSegmentEnum.BELIRSIZ;
      priority = CasePriorityEnum.ORTA;
      status = CampaignStatusEnum.MANUAL_OPTIMIZATION_REQUIRED;
      aiScore = 0;
      aiConversionProb = 0;
      aiReasoning =
        'AI Service erişilemedi. Vaka BELIRSIZ olarak işaretlendi ve ORTA öncelikle manuel optimizasyon kuyruğuna alındı (servis bağımsızlığı).';
    } else {
      // Kullanıcı segment verdiyse onu koru, yoksa AI'ın atadığı segmenti kullan.
      targetSegment =
        (dto.targetSegment as TargetSegmentEnum) ||
        (ai.predicted_segment as TargetSegmentEnum) ||
        TargetSegmentEnum.BELIRSIZ;
      priority = this.derivePriority(targetSegment, ai.predicted_priority);
      status =
        targetSegment === TargetSegmentEnum.BELIRSIZ
          ? CampaignStatusEnum.MANUAL_OPTIMIZATION_REQUIRED
          : CampaignStatusEnum.ACTIVE;
      aiScore = typeof ai.recommendation_score === 'number' ? ai.recommendation_score : 0.5;
      aiConversionProb = typeof ai.conversion_probability === 'number' ? ai.conversion_probability : 0.4;
      aiReasoning = ai.reasoning || 'AI analizi tamamlandı.';
      if (ai.recommended_expert?.expert_id && UUID_RE.test(ai.recommended_expert.expert_id)) {
        recommendedExpertId = ai.recommended_expert.expert_id;
        assignmentScore =
          typeof ai.recommended_expert.assignment_score === 'number'
            ? ai.recommended_expert.assignment_score
            : 0.8;
      }
    }

    // Akıllı otomatik atama: AI bir uzman önerdiyse ve segment belirliyse → ATANDI
    const autoAssign = !!recommendedExpertId && targetSegment !== TargetSegmentEnum.BELIRSIZ;
    const caseStatus = autoAssign ? CaseStatusEnum.ATANDI : CaseStatusEnum.YENI;

    const { campaign, optCase } = await this.prisma.$transaction(async (tx) => {
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

      // SLA vaka oluşturma anından itibaren sayılır (Case §4.4)
      const slaDeadline = this.calculateSlaDeadline(priority);
      const created = await tx.optimizationCase.create({
        data: {
          caseCode: code,
          campaignId: createdCampaign.id,
          segment: targetSegment,
          priority,
          status: caseStatus,
          assignedExpertId: autoAssign ? recommendedExpertId : null,
          assignedAt: autoAssign ? new Date() : null,
          aiScore,
          aiConversionProb,
          aiReasoning,
          slaDeadline,
        },
      });

      if (autoAssign) {
        await tx.campaignAssignment.create({
          data: {
            caseId: created.id,
            expertId: recommendedExpertId as string,
            assignedBy: AssignedByEnum.AI,
            assignmentScore: assignmentScore ?? 0.8,
          },
        });
      }

      await tx.campaignHistory.create({
        data: {
          caseId: created.id,
          fromStatus: null,
          toStatus: caseStatus,
          changedBy: userId,
          note: autoAssign
            ? `Kampanya oluşturuldu; AI vakayı ${recommendedExpertId} uzmanına otomatik atadı.`
            : 'Kampanya oluşturuldu ve ilk vaka açıldı.',
        },
      });

      return { campaign: createdCampaign, optCase: created };
    });

    // Case §9: campaign.created event'i (case_id dahil)
    await this.rabbitmq.publishEvent('campaign.created', {
      campaign_id: campaign.id,
      case_id: optCase.id,
      code: campaign.code,
      name: campaign.name,
      type: campaign.type,
      target_segment: campaign.targetSegment,
      priority,
      status: campaign.status,
      ai_available: aiAvailable,
      created_by: userId,
      created_at: campaign.createdAt,
    });

    if (autoAssign) {
      await this.rabbitmq.publishEvent('campaign.assigned', {
        case_id: optCase.id,
        case_code: optCase.caseCode,
        campaign_id: campaign.id,
        expert_id: recommendedExpertId,
        assigned_by: AssignedByEnum.AI,
        assignment_score: assignmentScore,
        assigned_at: new Date().toISOString(),
      });
    }

    return { ...campaign, optimizationCaseId: optCase.id, aiAvailable };
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

  /**
   * Subscriber-specific methods: Abone için özelleştirilmiş kampanya önerileri
   */
  async getSubscriberRecommendations(subscriberId: string, segment?: string) {
    // AKTIF kampanyaları getir
    const campaigns = await this.prisma.campaign.findMany({
      where: {
        status: CampaignStatusEnum.ACTIVE,
        ...(segment && { targetSegment: segment as TargetSegmentEnum }),
      },
      orderBy: [
        { aiRecommendationScore: 'desc' },
        { createdAt: 'desc' },
      ],
      take: 10,
    });

    // Bu abonenin daha önce verdiği feedbackleri kontrol et
    const existingFeedbacks = await this.prisma.subscriberFeedback.findMany({
      where: { subscriberId },
      select: { campaignId: true, response: true, rating: true },
    });

    const feedbackMap = new Map(existingFeedbacks.map(f => [f.campaignId, f]));

    const recommendations = campaigns.map(c => ({
      id: c.id,
      code: c.code,
      name: c.name,
      description: c.description,
      type: c.type,
      discountPercent: c.discountPercent ? parseFloat(c.discountPercent.toString()) : 0,
      targetSegment: c.targetSegment,
      aiScore: c.aiRecommendationScore ? parseFloat(c.aiRecommendationScore.toString()) : 0,
      conversionProbability: c.aiConversionProbability ? parseFloat(c.aiConversionProbability.toString()) : 0,
      startDate: c.startDate,
      endDate: c.endDate,
      // Frontend'de durumu göstermek için feedback bilgisi
      existingFeedback: feedbackMap.get(c.id) || null,
    }));

    return recommendations;
  }

  async submitSubscriberFeedback(dto: any) {
    // Campaign var mı kontrol et
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: dto.campaignId },
    });

    if (!campaign) {
      throw new NotFoundException(`Kampanya bulunamadı (ID: ${dto.campaignId})`);
    }

    // Aynı kampanya için duplicate feedback kontrolü (güncelleme yap)
    const existing = await this.prisma.subscriberFeedback.findFirst({
      where: {
        campaignId: dto.campaignId,
        subscriberId: dto.subscriberId,
      },
    });

    let feedback;
    if (existing) {
      // Mevcut feedback'i güncelle
      feedback = await this.prisma.subscriberFeedback.update({
        where: { id: existing.id },
        data: {
          response: dto.response,
          rejectionReason: dto.rejectionReason,
          rating: dto.rating,
        },
      });
    } else {
      // Yeni feedback oluştur
      feedback = await this.prisma.subscriberFeedback.create({
        data: {
          campaignId: dto.campaignId,
          subscriberId: dto.subscriberId,
          response: dto.response,
          rejectionReason: dto.rejectionReason,
          rating: dto.rating,
        },
      });
    }

    // Event fırlat
    await this.rabbitmq.publishEvent('subscriber.feedback.submitted', {
      feedback_id: feedback.id,
      campaign_id: dto.campaignId,
      subscriber_id: dto.subscriberId,
      response: dto.response,
      rating: dto.rating,
      timestamp: new Date().toISOString(),
    });

    return feedback;
  }

  async getMyActiveCampaigns(subscriberId: string) {
    // Kabul edilmiş feedbackleri bul
    const acceptedFeedbacks = await this.prisma.subscriberFeedback.findMany({
      where: {
        subscriberId,
        response: 'ACCEPTED',
      },
      include: {
        campaign: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return acceptedFeedbacks.map(f => ({
      id: f.campaign.id,
      code: f.campaign.code,
      name: f.campaign.name,
      description: f.campaign.description,
      type: f.campaign.type,
      discountPercent: f.campaign.discountPercent ? parseFloat(f.campaign.discountPercent.toString()) : 0,
      startDate: f.campaign.startDate,
      endDate: f.campaign.endDate,
      acceptedAt: f.createdAt,
      rating: f.rating,
    }));
  }
}
