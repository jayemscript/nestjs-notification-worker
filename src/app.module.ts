import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import configuration from './config/configuration';
import { NotificationModule } from './notification/notification.module';
import { GatewayModule } from './gateway/gateway.module';
import { QueueModule } from './queue/queue.module';
import { CronModule } from './cron/cron.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('mongo.uri'),
        dbName: config.get<string>('mongo.dbName'),
      }),
    }),
    GatewayModule,
    NotificationModule,
    QueueModule,
    CronModule,
  ],
})
export class AppModule {}
