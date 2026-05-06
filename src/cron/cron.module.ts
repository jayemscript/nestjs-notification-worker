import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationCron } from './notification.cron';
import { NotificationModule } from 'src/notification/notification.module';
import { GatewayModule } from 'src/gateway/gateway.module';

@Module({
  imports: [ScheduleModule.forRoot(), NotificationModule, GatewayModule],
  providers: [NotificationCron],
})
export class CronModule {}
