import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NotificationProducer } from './producers/notification.producer';
import { NotificationProcessor } from './processors/notification.processor';
import { NotificationModule } from 'src/notification/notification.module';

export const NOTIFICATION_QUEUE = 'notification-queue';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          url: config.get<string>('redis.url'),
        },
      }),
    }),
    BullModule.registerQueue({
      name: NOTIFICATION_QUEUE,
    }),
    NotificationModule,
  ],
  providers: [NotificationProducer, NotificationProcessor],
  exports: [BullModule, NotificationProducer],
})
export class QueueModule {}
