import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NotificationDocument = Notification & Document;

export enum NotificationStatus {
  PRIORITY = 'Priority',
  ALERT = 'Alert',
  NORMAL = 'Normal',
}

export enum NotificationAction {
  DONE = 'Done',
  READ = 'Read',
  IGNORE = 'Ignore',
}

@Schema({ timestamps: true })
export class Notification {
  @Prop({ required: true })
  appId: string;

  @Prop({ required: true })
  recipientId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: String, default: null })
  url: string | null;

  @Prop({
    type: String,
    enum: NotificationStatus,
    default: NotificationStatus.NORMAL,
  })
  notifStatus: NotificationStatus;

  @Prop({
    type: String,
    enum: NotificationAction,
    default: null,
  })
  notifAction: NotificationAction | null;

  @Prop({ type: Object, default: {} })
  meta: Record<string, unknown>;

  @Prop({ type: Date, default: null })
  snoozedUntil: Date | null;

  @Prop({ type: Date, default: null })
  readAt: Date | null;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

NotificationSchema.index({ recipientId: 1, createdAt: -1 });
NotificationSchema.index({ appId: 1 });
NotificationSchema.index({ notifAction: 1 });
