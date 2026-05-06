import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { NOTIFICATION_QUEUE } from '../queue.module';
import { CreateNotificationDto } from 'src/notification/dto';

export const SEND_NOTIFICATION_JOB = 'send-notification';
export const SEND_BULK_NOTIFICATION_JOB = 'send-bulk-notification';

@Injectable()
export class NotificationProducer {
  private readonly logger = new Logger(NotificationProducer.name);

  constructor(
    @InjectQueue(NOTIFICATION_QUEUE)
    private readonly notificationQueue: Queue,
  ) {}

  async sendNotification(payload: CreateNotificationDto) {
    await this.notificationQueue.add(SEND_NOTIFICATION_JOB, payload, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 3000,
      },
    });
    this.logger.log(
      `Job queued: ${SEND_NOTIFICATION_JOB} for ${payload.recipientId}`,
    );
  }

  async sendBulkNotification(payload: CreateNotificationDto[]) {
    const jobs = payload.map((item) => ({
      name: SEND_BULK_NOTIFICATION_JOB,
      data: item,
      opts: {
        attempts: 3,
        backoff: {
          type: 'exponential' as const,
          delay: 3000,
        },
      },
    }));

    await this.notificationQueue.addBulk(jobs);
    this.logger.log(`Bulk jobs queued: ${jobs.length} notifications`);
  }
}
