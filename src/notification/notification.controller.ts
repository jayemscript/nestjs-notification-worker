import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import {
  CreateNotificationDto,
  SendToUsersDto,
  ActionDto,
  IgnoreDto,
  GetNotificationsDto,
} from './dto';
import { ApiKeyGuard } from '../common/guards/api-key.guard';
import {
  NotificationAction,
  NotificationStatus,
} from './schemas/notification.schema';
import { NotificationProducer } from 'src/queue/producers/notification.producer';

@UseGuards(ApiKeyGuard)
@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly notifService: NotificationService,
    private readonly notifProducer: NotificationProducer,
  ) {}

  // ─── Send ──────────────────────────────────────────────────────────────────

  @Post('send')
  async send(@Body() dto: CreateNotificationDto) {
    await this.notifProducer.sendNotification(dto);
    return { message: 'Notification queued' };
  }

  @Post('send/bulk')
  async sendBulk(@Body() dto: SendToUsersDto) {
    const jobs = dto.recipientIds.map((recipientId) => ({
      ...dto,
      recipientId,
    })) as CreateNotificationDto[];
    await this.notifProducer.sendBulkNotification(jobs);
    return { message: `${jobs.length} notifications queued` };
  }

  // ─── Read ──────────────────────────────────────────────────────────────────

  @Get(':recipientId')
  getForRecipient(
    @Param('recipientId') recipientId: string,
    @Query('appId') appId?: string,
    @Query('notifStatus') notifStatus?: NotificationStatus,
    @Query('notifAction') notifAction?: NotificationAction | 'none',
    @Query('limit') limit?: number,
    @Query('skip') skip?: number,
  ) {
    const dto: GetNotificationsDto = {
      recipientId,
      appId,
      notifStatus,
      notifAction,
      limit,
      skip,
    };
    return this.notifService.getForRecipient(dto);
  }

  @Get(':recipientId/unread-count')
  getUnreadCount(
    @Param('recipientId') recipientId: string,
    @Query('appId') appId?: string,
  ) {
    return this.notifService.getUnreadCount(recipientId, appId);
  }

  // ─── Actions ───────────────────────────────────────────────────────────────

  @Post('action/done')
  markDone(@Body() { notifId }: ActionDto) {
    return this.notifService.markAsDone(notifId);
  }

  @Post('action/read')
  markRead(@Body() { notifId }: ActionDto) {
    return this.notifService.markAsRead(notifId);
  }

  @Post('action/read-all')
  markAllRead(
    @Body('recipientId') recipientId: string,
    @Body('appId') appId?: string,
  ) {
    return this.notifService.markAllAsRead(recipientId, appId);
  }

  @Post('action/ignore')
  markIgnore(@Body() { notifId, ignoreMinutes }: IgnoreDto) {
    return this.notifService.markAsIgnore(notifId, ignoreMinutes);
  }
}
