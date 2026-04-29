import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsEnum,
} from 'class-validator';
import {
  NotificationStatus,
  NotificationAction,
} from '../schemas/notification.schema';
import { Transform } from 'class-transformer';

export class GetNotificationsDto {
  @IsString()
  @IsNotEmpty()
  recipientId!: string;

  @IsString()
  @IsOptional()
  appId?: string;

  // filter by status: Normal | Alert | Priority
  @IsEnum(NotificationStatus)
  @IsOptional()
  notifStatus?: NotificationStatus;

  // filter by action: Read | Done | Ignore
  // pass 'none' to get only unactioned notifications (notifAction is null)
  @IsEnum(NotificationAction)
  @IsOptional()
  notifAction?: NotificationAction | 'none';

  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @IsOptional()
  limit?: number;

  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @IsOptional()
  skip?: number;
}
