import { IsEnum, IsString, IsUUID, IsInt, Min, Max, IsOptional } from 'class-validator';
import { FeedbackResponseEnum } from '@prisma/client';

export class SubscriberFeedbackDto {
  @IsUUID()
  campaignId: string;

  // Backend her zaman JWT'deki userId ile üzerine yazar (IDOR koruması) — client göndermek zorunda değil.
  @IsOptional()
  @IsUUID()
  subscriberId?: string;

  @IsEnum(FeedbackResponseEnum)
  response: FeedbackResponseEnum;

  @IsOptional()
  @IsString()
  rejectionReason?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;
}

export class GetSubscriberRecommendationsQueryDto {
  @IsOptional()
  @IsUUID()
  subscriberId?: string;

  @IsOptional()
  @IsString()
  segment?: string;
}
