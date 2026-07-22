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
    const conversionCount = transactions.filter((t) => t.reason === 'CONVERSION_TARGET_EXCEEDED').length;

    // 1. ILK_KAMPANYA (İlk optimizasyonu tamamlama)
    if (completedCount >= 1) {
      await this.awardBadge(expertId, 'ILK_KAMPANYA');
    }

    // 2. HIZ_USTASI (2 saatin altında 10 optimizasyon)
    if (fastBonusCount >= 10 || (completedCount >= 10 && fastBonusCount >= 5)) {
      await this.awardBadge(expertId, 'HIZ_USTASI');
    }

    // 3. DONUSUM_KRALI (10 kampanyada hedef aşımı)
    if (conversionCount >= 10 || (completedCount >= 10 && conversionCount >= 3)) {
      await this.awardBadge(expertId, 'DONUSUM_KRALI');
    }

    // 4. MARATONCU (Bir günde 20 optimizasyon)
    if (completedCount >= 20) {
      await this.awardBadge(expertId, 'MARATONCU');
    }

    // 5. CHURN_AVCISI (10 RISKLI_KAYIP vakayı kurtarma)
    if (completedCount >= 10) {
      await this.awardBadge(expertId, 'CHURN_AVCISI');
    }

    // 6. UZMAN (Tek segmentte 50 optimizasyon)
    if (completedCount >= 50) {
      await this.awardBadge(expertId, 'UZMAN');
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
