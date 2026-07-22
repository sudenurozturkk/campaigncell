import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { CampaignsService } from './campaigns.service.js';
import { CreateCampaignDto } from './dto/create-campaign.dto.js';
import { UpdateCampaignDto } from './dto/update-campaign.dto.js';
import { QueryCampaignDto } from './dto/query-campaign.dto.js';
import { SubscriberFeedbackDto, GetSubscriberRecommendationsQueryDto } from './dto/subscriber-feedback.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { UserPayload } from '../auth/current-user.decorator.js';
import { RoleEnum } from '../auth/roles.enum.js';

@Controller('api/v1/campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.CAMPAIGN_EXPERT, RoleEnum.SUPERVISOR, RoleEnum.ADMIN)
  create(@Body() dto: CreateCampaignDto, @CurrentUser() user: UserPayload) {
    return this.campaignsService.create(dto, user.userId);
  }

  @Get()
  findAll(@Query() query: QueryCampaignDto) {
    return this.campaignsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.campaignsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.CAMPAIGN_EXPERT, RoleEnum.SUPERVISOR, RoleEnum.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateCampaignDto, @CurrentUser() user: UserPayload) {
    return this.campaignsService.update(id, dto, user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.CAMPAIGN_EXPERT, RoleEnum.SUPERVISOR, RoleEnum.ADMIN)
  remove(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    return this.campaignsService.remove(id, user.userId);
  }

  /**
   * Subscriber Endpoints - Abone için özelleştirilmiş kampanya önerileri ve feedback
   */
  @Get('subscriber/recommendations')
  @UseGuards(JwtAuthGuard)
  getSubscriberRecommendations(
    @Query() query: GetSubscriberRecommendationsQueryDto,
    @CurrentUser() user: UserPayload
  ) {
    const subscriberId = query.subscriberId || user.userId;
    return this.campaignsService.getSubscriberRecommendations(subscriberId, query.segment);
  }

  @Post('subscriber/feedback')
  @UseGuards(JwtAuthGuard)
  submitSubscriberFeedback(@Body() dto: SubscriberFeedbackDto, @CurrentUser() user: UserPayload) {
    // Ensure subscriberId matches authenticated user
    return this.campaignsService.submitSubscriberFeedback({ ...dto, subscriberId: user.userId });
  }

  @Get('subscriber/my-campaigns')
  @UseGuards(JwtAuthGuard)
  getMyActiveCampaigns(@CurrentUser() user: UserPayload) {
    return this.campaignsService.getMyActiveCampaigns(user.userId);
  }
}
