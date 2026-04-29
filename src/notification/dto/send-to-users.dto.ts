import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsObject,
  IsArray,
} from 'class-validator';
import {
  NotificationStatus,
} from '../schemas/notification.schema.js';

export class SendToUsersDto {
  @IsArray()
  @IsString({ each: true })
  recipientIds!: string[];

  @IsString()
  @IsNotEmpty()
  appId!: string;

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
