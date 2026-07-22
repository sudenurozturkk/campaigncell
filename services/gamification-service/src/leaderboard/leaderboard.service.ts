import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { PointsService } from '../points/points.service.js';

export enum LeaderboardPeriod {
  ALL_TIME = 'ALL_TIME',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
}

@Injectable()
export class LeaderboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pointsService: PointsService,
  ) {}

  async getLeaderboard(period: LeaderboardPeriod = LeaderboardPeriod.ALL_TIME) {
    const where: any = {};
    const now = new Date();

    if (period === LeaderboardPeriod.DAILY) {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      where.createdAt = { gte: startOfDay };
    } else if (period === LeaderboardPeriod.WEEKLY) {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      where.createdAt = { gte: startOfWeek };
    }

    // Case §6.4: liderlik tablosu ilk 10 kişi, puan sıralı.
    const grouped = await this.prisma.pointsTransaction.groupBy({
      by: ['expertId'],
      where,
      _sum: {
        points: true,
      },
      orderBy: {
        _sum: {
          points: 'desc',
        },
      },
      take: 10,
    });

    const leaderboard = await Promise.all(
      grouped.map(async (item, index) => {
        const expertId = item.expertId;
        const totalPoints = item._sum.points || 0;
        const levelInfo = await this.pointsService.determineLevel(totalPoints);
        const badgesCount = await this.prisma.userBadge.count({ where: { expertId } });

        return {
          rank: index + 1,
          expertId,
          totalPoints,
          level: levelInfo.currentLevel,
          earnedBadgesCount: badgesCount,
        };
      }),
    );

    return {
      period,
      generatedAt: now.toISOString(),
      leaderboard,
    };
  }
}
