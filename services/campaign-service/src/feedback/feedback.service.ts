import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service.js';
import { CreateFeedbackDto } from './dto/create-feedback.dto.js';
import { CreateAbTestDto } from './dto/create-ab-test.dto.js';
import { FeedbackResponseEnum } from '@prisma/client';

@Injectable()
export class FeedbackService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rabbitmq: RabbitMQService,
  ) {}

  async createFeedback(dto: CreateFeedbackDto, subscriberId: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: dto.campaignId },
    });

    if (!campaign) {
      throw new NotFoundException(`Kampanya bulunamadı (ID: ${dto.campaignId})`);
    }

    const feedback = await this.prisma.subscriberFeedback.create({
      data: {
        campaignId: dto.campaignId,
        subscriberId,
        response: dto.response,
        rejectionReason: dto.rejectionReason,
        rating: dto.rating,
      },
    });

    // RabbitMQ events
    const eventType = dto.response === FeedbackResponseEnum.ACCEPTED ? 'subscriber.offer.accepted' : 'subscriber.offer.rejected';
    await this.rabbitmq.publishEvent(eventType, {
      feedback_id: feedback.id,
      campaign_id: dto.campaignId,
      campaign_code: campaign.code,
      subscriber_id: subscriberId,
      response: dto.response,
      rejection_reason: dto.rejectionReason,
      timestamp: feedback.createdAt.toISOString(),
    });

    if (dto.rating !== undefined) {
      await this.rabbitmq.publishEvent('subscriber.feedback.submitted', {
        feedback_id: feedback.id,
        campaign_id: dto.campaignId,
        subscriber_id: subscriberId,
        rating: dto.rating,
        timestamp: feedback.createdAt.toISOString(),
      });
    }

    return feedback;
  }

  async createAbTest(dto: CreateAbTestDto, userId: string) {
    const optCase = await this.prisma.optimizationCase.findUnique({
      where: { id: dto.caseId },
    });

    if (!optCase) {
      throw new NotFoundException(`Optimizasyon vakası bulunamadı (ID: ${dto.caseId})`);
    }

    const abTest = await this.prisma.abTestExperiment.create({
      data: {
        caseId: dto.caseId,
        variantADesc: dto.variantADesc,
        variantBDesc: dto.variantBDesc,
        variantAConversion: dto.variantAConversion,
        variantBConversion: dto.variantBConversion,
        winner: dto.winner,
      },
    });

    return abTest;
  }
}
