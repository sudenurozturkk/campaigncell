import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service.js';

@Injectable()
export class BadgesService {
  private readonly logger = new Logger(BadgesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly rabbitmq: RabbitMQService,
  ) {}

  async awardBadge(expertId: string, badgeCode: string) {
    const badge = await this.prisma.badge.findUnique({
      where: { code: badgeCode },
    });

    if (!badge) return null;

    // Uzman bu rozete zaten sahip mi?
    const existing = await this.prisma.userBadge.findUnique({
      where: {
        expertId_badgeId: {
          expertId,
          badgeId: badge.id,
        },
      },
    });

    if (existing) return existing;

    const userBadge = await this.prisma.userBadge.create({
      data: {
        expertId,
        badgeId: badge.id,
      },
      include: { badge: true },
    });

    this.logger.log(`Tebrikler! Uzman [${expertId}] '${badge.name}' (${badge.code}) rozetini kazandı.`);

    // RabbitMQ Event
    await this.rabbitmq.publishEvent('badge.earned', {
      expert_id: expertId,
      badge_code: badge.code,
      badge_name: badge.name,
      badge_description: badge.description,
      earned_at: userBadge.earnedAt.toISOString(),
    });

    return userBadge;
  }

  async evaluateBadges(expertId: string, totalPoints: number) {
    const transactions = await this.prisma.pointsTransaction.findMany({
      where: { expertId },
    });

    const completedCount = transactions.filter((t) => t.reason === 'OPTIMIZATION_COMPLETED').length;
    const fastBonusCount = transactions.filter((t) => t.reason === 'FAST_BONUS').length;
    const slaExceededCount = transactions.filter((t) => t.reason === 'SLA_EXCEEDED').length;

    // 1. ILK_KAMPANYA
    if (completedCount >= 1) {
      await this.awardBadge(expertId, 'ILK_KAMPANYA');
    }

    // 2. HIZ_USTASI
    if (fastBonusCount >= 5) {
      await this.awardBadge(expertId, 'HIZ_USTASI');
    }

    // 3. SLA_SAMPIYONU (50+ puan ve 0 ihlal)
    if (totalPoints >= 50 && slaExceededCount === 0) {
      await this.awardBadge(expertId, 'SLA_SAMPIYONU');
    }

    // 4. OPTIMIZASYON_KRALI (100+ puan)
    if (totalPoints >= 100) {
      await this.awardBadge(expertId, 'OPTIMIZASYON_KRALI');
    }
  }

  async getExpertBadges(expertId: string) {
    const userBadges = await this.prisma.userBadge.findMany({
      where: { expertId },
      include: { badge: true },
      orderBy: { earnedAt: 'desc' },
    });

    const allBadges = await this.prisma.badge.findMany();

    const earnedBadgeIds = new Set(userBadges.map((ub) => ub.badgeId));
    const badgeProgress = allBadges.map((b) => ({
      badgeId: b.id,
      code: b.code,
      name: b.name,
      description: b.description,
      isEarned: earnedBadgeIds.has(b.id),
      earnedAt: userBadges.find((ub) => ub.badgeId === b.id)?.earnedAt || null,
    }));

    return {
      expertId,
      earnedCount: userBadges.length,
      totalBadgesCount: allBadges.length,
      badges: badgeProgress,
    };
  }
}
