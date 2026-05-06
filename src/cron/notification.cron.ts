import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationGateway } from 'src/gateway/notification.gateway';

@Injectable()
export class NotificationCron {
  private readonly logger = new Logger(NotificationCron.name);

  constructor(
    private readonly notificationService: NotificationService,
    private readonly gateway: NotificationGateway,
  ) {}

  // runs every minute
  @Cron(CronExpression.EVERY_MINUTE)
  async resolveSnoozed() {
    this.logger.log('Checking snoozed notifications...');

    const snoozed =
      await this.notificationService.resolveSnoozedNotifications();

    if (snoozed.length === 0) {
      this.logger.log('No snoozed notifications to resolve');
      return;
    }

    for (const notif of snoozed) {
      // reset action so it appears as new again
      await this.notificationService.resetSnooze(notif._id.toString());

      // re-emit to the user's socket room
      this.gateway.emitToUser(notif.recipientId, notif);

      this.logger.log(
        `Re-surfaced snoozed notification ${notif._id} for ${notif.recipientId}`,
      );
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupOldNotifications() {
    this.logger.log('Running notification cleanup...');

    const deleted = await this.notificationService.deleteOldNotifications(30);

    this.logger.log(`Cleanup complete — deleted ${deleted} old notifications`);
  }
}
