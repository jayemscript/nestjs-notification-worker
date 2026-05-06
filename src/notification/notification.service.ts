import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Notification,
  NotificationDocument,
  NotificationAction,
  NotificationStatus,
} from './schemas/notification.schema';
import {
  CreateNotificationDto,
  SendToUsersDto,
  GetNotificationsDto,
} from './dto';
import { NotificationGateway } from 'src/gateway/notification.gateway';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
    private readonly gateway: NotificationGateway,
  ) {}

  // ─── Core Create ───────────────────────────────────────────────────────────

  async create(dto: CreateNotificationDto): Promise<NotificationDocument> {
    const notif = new this.notificationModel({
      appId: dto.appId,
      recipientId: dto.recipientId,
      title: dto.title,
      description: dto.description,
      url: dto.url ?? null,
      notifStatus: dto.notifStatus ?? NotificationStatus.NORMAL,
      meta: dto.meta ?? {},
    });

    const saved = await notif.save();
    this.gateway.emitToUser(dto.recipientId, saved);
    this.logger.log(
      `Notification created: ${saved._id} for ${dto.recipientId}`,
    );
    return saved;
  }

  async createForMany(dto: SendToUsersDto): Promise<NotificationDocument[]> {
    const docs = dto.recipientIds.map((recipientId) => ({
      appId: dto.appId,
      recipientId,
      title: dto.title,
      description: dto.description,
      url: dto.url ?? null,
      notifStatus: dto.notifStatus ?? NotificationStatus.NORMAL,
      meta: dto.meta ?? {},
    }));

    const saved = await this.notificationModel.insertMany(docs);
    for (const notif of saved) {
      const doc = notif as NotificationDocument;
      this.gateway.emitToUser(doc.recipientId, doc);
    }
    this.logger.log(
      `Bulk notifications created: ${saved.length} for appId ${dto.appId}`,
    );
    return saved as NotificationDocument[];
  }

  // ─── Read ──────────────────────────────────────────────────────────────────

  async getForRecipient(dto: GetNotificationsDto) {
    const query: Record<string, unknown> = { recipientId: dto.recipientId };

    if (dto.appId) query.appId = dto.appId;

    // filter by notifStatus: Normal | Alert | Priority
    if (dto.notifStatus) query.notifStatus = dto.notifStatus;

    // filter by notifAction:
    // 'none'   = only unactioned notifications (null)
    // any enum = only notifications with that specific action
    if (dto.notifAction) {
      query.notifAction = dto.notifAction === 'none' ? null : dto.notifAction;
    }

    return this.notificationModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(dto.skip ?? 0)
      .limit(dto.limit ?? 20)
      .lean()
      .exec();
  }

  async getUnreadCount(recipientId: string, appId?: string): Promise<number> {
    const query: Record<string, unknown> = {
      recipientId,
      notifAction: null,
    };
    if (appId) query.appId = appId;

    return this.notificationModel.countDocuments(query).exec();
  }

  // ─── Actions ───────────────────────────────────────────────────────────────

  async markAsDone(notifId: string) {
    return this.updateAction(notifId, NotificationAction.DONE);
  }

  async markAsRead(notifId: string) {
    const notif = await this.findOneOrFail(notifId);
    notif.notifAction = NotificationAction.READ;
    notif.readAt = new Date();
    return notif.save();
  }

  async markAsIgnore(notifId: string, ignoreMinutes: number) {
    const allowed = [5, 10, 30, 60];
    if (!allowed.includes(ignoreMinutes)) {
      throw new BadRequestException(
        `ignoreMinutes must be one of: ${allowed.join(', ')}`,
      );
    }

    const notif = await this.findOneOrFail(notifId);
    notif.notifAction = NotificationAction.IGNORE;
    notif.snoozedUntil = new Date(Date.now() + ignoreMinutes * 60 * 1000);
    return notif.save();
  }

  async resetSnooze(notifId: string) {
    const notif = await this.findOneOrFail(notifId);
    notif.notifAction = null;
    notif.snoozedUntil = null;
    return notif.save();
  }

  async markAllAsRead(recipientId: string, appId?: string) {
    const query: Record<string, unknown> = {
      recipientId,
      notifAction: null,
    };
    if (appId) query.appId = appId;

    return this.notificationModel.updateMany(query, {
      $set: {
        notifAction: NotificationAction.READ,
        readAt: new Date(),
      },
    });
  }

  // ─── Cron Helpers ──────────────────────────────────────────────────────────

  async resolveSnoozedNotifications(): Promise<NotificationDocument[]> {
    const now = new Date();
    return this.notificationModel
      .find({
        notifAction: NotificationAction.IGNORE,
        snoozedUntil: { $lte: now },
        notifStatus: {
          $in: [NotificationStatus.PRIORITY, NotificationStatus.ALERT],
        },
      })
      .exec();
  }

  async deleteOldNotifications(beforeDays: number): Promise<number> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - beforeDays);

    const result = await this.notificationModel.deleteMany({
      createdAt: { $lt: cutoff },
      notifAction: { $in: [NotificationAction.DONE, NotificationAction.READ] },
    });

    return result.deletedCount;
  }

  // ─── Internals ─────────────────────────────────────────────────────────────

  private async updateAction(notifId: string, action: NotificationAction) {
    const notif = await this.findOneOrFail(notifId);
    notif.notifAction = action;
    return notif.save();
  }

  private async findOneOrFail(id: string): Promise<NotificationDocument> {
    const notif = await this.notificationModel.findById(id).exec();
    if (!notif) throw new NotFoundException(`Notification ${id} not found`);
    return notif;
  }
}
