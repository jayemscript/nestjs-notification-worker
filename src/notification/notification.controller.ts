import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service.js';
import {
  CreateNotificationDto,
  SendToUsersDto,
  ActionDto,
  IgnoreDto,
  GetNotificationsDto,
} from './dto/notification.dto.js';
import { ApiKeyGuard } from '../common/guards/api-key.guard.js';

@UseGuards(ApiKeyGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notifService: NotificationService) {}

  // ─── Send ──────────────────────────────────────────────────────────────────

  @Post('send')
  send(@Body() dto: CreateNotificationDto) {
    return this.notifService.create(dto);
  }

  @Post('send/bulk')
  sendBulk(@Body() dto: SendToUsersDto) {
    return this.notifService.createForMany(dto);
  }

  // ─── Read ──────────────────────────────────────────────────────────────────

  @Get(':recipientId')
  getForRecipient(
    @Param('recipientId') recipientId: string,
    @Query('appId') appId?: string,
    @Query('limit') limit?: number,
    @Query('skip') skip?: number,
  ) {
    const dto: GetNotificationsDto = { recipientId, appId, limit, skip };
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
