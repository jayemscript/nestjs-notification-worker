import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsObject,
  IsArray,
  IsUUID,
  IsInt,
  Min,
} from 'class-validator';
import {
  NotificationStatus,
  NotificationAction,
} from '../schemas/notification.schema';

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  appId!: string;

  @IsString()
  @IsNotEmpty()
  recipientId!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  @IsOptional()
  url?: string;

  @IsEnum(NotificationStatus)
  @IsOptional()
  notifStatus?: NotificationStatus;

  @IsObject()
  @IsOptional()
  meta?: Record<string, unknown>;
}
