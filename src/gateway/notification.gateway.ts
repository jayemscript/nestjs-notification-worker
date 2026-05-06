import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class NotificationGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(NotificationGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  afterInit() {
    this.logger.log('Socket.IO gateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '') ||
        client.handshake.query?.token;

      if (!token) {
        this.logger.warn(`Client ${client.id} has no token — disconnecting`);
        client.disconnect();
        return;
      }

      let recipientId: string;

      try {
        // attempt JWT verification first
        const secret = this.configService.get<string>('jwt.secret');
        const payload = this.jwtService.verify(token as string, { secret });
        recipientId = payload.sub ?? payload.id ?? payload.userId;
      } catch {
        // fallback: treat token as raw userId for now
        // replace this fallback when socket token endpoint is ready
        this.logger.warn(
          `Client ${client.id} token is not a JWT — using as raw userId`,
        );
        recipientId = token as string;
      }

      if (!recipientId) {
        this.logger.warn(`Client ${client.id} no recipientId — disconnecting`);
        client.disconnect();
        return;
      }

      await client.join(recipientId);
      client.data.recipientId = recipientId;

      this.logger.log(
        `Client ${client.id} connected — joined room: ${recipientId}`,
      );
    } catch {
      this.logger.warn(`Client ${client.id} invalid token — disconnecting`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(
      `Client ${client.id} disconnected — room: ${client.data?.recipientId ?? 'unknown'}`,
    );
  }

  emitToUser(recipientId: string, notification: unknown) {
    this.server.to(recipientId).emit('notification', notification);
    this.logger.log(`Emitted notification to room: ${recipientId}`);
  }

  emitToAll(notification: unknown) {
    this.server.emit('notification', notification);
  }
}
