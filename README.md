# nestjs-notification-worker

A self-hosted notification microservice built with NestJS. Supports real-time in-app notifications, webhook delivery, and scheduled jobs — designed to plug into any NestJS application.

## Stack

- **NestJS** — core framework
- **MongoDB + Mongoose** — notification storage
- **Redis + BullMQ** — job queue and scheduling
- **Socket.IO** — real-time delivery
- **Docker** — local development

## Channels

- In-app (Socket.IO)
- Webhook (HTTP POST to any registered URL)

## Requirements

- Node.js 18+
- Docker (for local Redis + MongoDB)

## Environment Variables

```env
PORT=3006
MONGO_URI=mongodb://localhost:27017/notifications
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret
```

## Getting Started

```bash
# Clone the repo
git clone https://github.com/your-username/nestjs-notification-worker.git

# Install dependencies
npm install

# Start MongoDB and Redis
docker-compose up -d

# Run the service
npm run start:dev
```

## License

MIT
