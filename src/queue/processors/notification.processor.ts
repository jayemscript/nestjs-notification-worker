import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { NOTIFICATION_QUEUE } from '../queue.constants';
import {
  SEND_NOTIFICATION_JOB,
  SEND_BULK_NOTIFICATION_JOB,
} from '../producers/notification.producer';
import { NotificationService } from 'src/notification/notification.service';
import { CreateNotificationDto } from 'src/notification/dto';

@Processor(NOTIFICATION_QUEUE)
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(private readonly notificationService: NotificationService) {
    super();
  }

  async process(job: Job): Promise<void> {
    this.logger.log(`Processing job: ${job.name} | id: ${job.id}`);

    switch (job.name) {
      case SEND_NOTIFICATION_JOB:
        await this.handleSend(job.data as CreateNotificationDto);
        break;

      case SEND_BULK_NOTIFICATION_JOB:
        await this.handleSendBulk(job.data as CreateNotificationDto);
        break;

      default:
        this.logger.warn(`Unknown job: ${job.name}`);
    }
  }

  private async handleSend(data: CreateNotificationDto) {
    const notif = await this.notificationService.create(data);
    this.logger.log(`Notification processed: ${notif._id}`);
  }

  private async handleSendBulk(data: CreateNotificationDto) {
    const notif = await this.notificationService.create(data);
    this.logger.log(`Bulk notification processed: ${notif._id}`);
  }
}
