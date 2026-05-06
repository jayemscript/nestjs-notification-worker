# Changelog

All notable changes to this project will be documented in this file.

Versioning follows [Semantic Versioning](https://semver.org): MAJOR.MINOR.PATCH

- MAJOR = breaking changes
- MINOR = new features, backwards compatible
- PATCH = bug fixes, small updates

---
## [0.2.0] - 2026-05-06

### Added
- Socket.IO gateway with JWT verification and userId fallback
- BullMQ queue module with producer and processor
- Redis integration for job queue
- Cron module — snooze resolver (every minute)
- Cron module — old notification cleanup (daily at midnight)
- Next.js notification-socket-provider with real-time listener
- resetSnooze method on NotificationService


## [0.1.0] - 2026-04-29

### Added
- Initial project scaffold with NestJS
- Notification module with MongoDB and Mongoose
- Notification schema with status and action enums
- REST endpoints: send, send bulk, get by recipient, unread count
- Action endpoints: mark as done, read, read all, ignore with snooze
- API key guard for securing all endpoints
- Configuration module with environment variable mapping
- Separate MONGO_URI and MONGO_DB_NAME for flexible database targeting
- Local docker-compose for MongoDB and Redis
- Production docker-compose with auth, healthchecks, and persistence
- .env.example with all supported variables
- .dockerignore
- docs/API_DOCUMENTATION.md
- docs/ENVIRONMENT_VARIABLES.md