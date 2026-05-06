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
- Webhook (HTTP POST to any registered URL) — coming soon

## Requirements

- Node.js 18+
- pnpm
- Docker (for local Redis)
- MongoDB Atlas or local MongoDB instance

## Environment Variables

See `.env.example` for the full list. Minimum required:

```env
PORT=4000
MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=notifications
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret
API_KEYS=your_api_key
```

## Getting Started

```bash
# Clone the repo
git clone https://github.com/jayemscript/nestjs-notification-worker.git

# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env

# Start Redis
docker-compose up -d

# Run the service
pnpm run start:dev
```

## Docs

- [API Documentation](./docs/API_DOCUMENTATION.md)
- [Environment Variables](./docs/environment-variables.md)
- [Changelog](./CHANGELOG.md)

## License

MIT