# Environment Variables — Quick Notes

## `JWT_SECRET`

Must be the **exact same secret** your core NestJS app uses to sign tokens. That way your frontend's existing login token works when connecting to this service's Socket.IO gateway — no separate login needed.

---

## `CORS_ORIGINS`

Comma-separated list of allowed origins. Add all your frontend origins here.

```env
CORS_ORIGINS=http://localhost:3000,http://localhost:8081
```

| Client | Example Origin |
|---|---|
| Next.js local | `http://localhost:3000` |
| React Native / Expo local | `http://localhost:8081` |
| Expo Go on device | `exp://192.168.x.x:8081` |
| Production web | `https://yourapp.com` |

---

## `COOKIE_SAMESITE`

Use `lax` for web (Next.js).

For React Native, cookies are not used the same way — mobile authenticates via the `Authorization: Bearer` header instead. This variable only affects web clients.

| Value | When to use |
|---|---|
| `lax` | Standard web apps (Next.js) — recommended default |
| `strict` | High-security, same-site only |
| `none` | Cross-site requests — requires `HTTPS` and `Secure` flag |

---

## `COOKIE_EXPIRATION`

Value is in **milliseconds**.

| Value | Duration |
|---|---|
| `86400000` | 1 day |
| `604800000` | 7 days |
| `2592000000` | 30 days |

---

## `MONGO_URI`

Start local with Docker, switch to Atlas URI when deploying. Zero code change needed.

```env
# Local (Docker)
MONGO_URI=mongodb://localhost:27017/notifications

# MongoDB Atlas
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/notifications
```

---

## `REDIS_URL`

Same pattern as Mongo — local for dev, managed URL for production.

```env
# Local (Docker)
REDIS_URL=redis://localhost:6379

# Upstash (production — free tier available)
REDIS_URL=rediss://<user>:<pass>@<host>.upstash.io:6379
```

> Note the `rediss://` (with double `s`) for TLS connections on managed Redis providers like Upstash.

---

## `PORT`

Default is `4000`. This is the port for all outside connections — REST API (webhooks, actions, reads), Socket.IO gateway, and any external app integrations.

Make sure this port is open and not conflicting with your core NestJS app.

---

## Mobile App Notes

This service works with React Native as long as your mobile app's backend is also NestJS and shares the same `JWT_SECRET`. Mobile clients authenticate via `Authorization: Bearer <token>` in request headers and the Socket.IO handshake `auth` option — not cookies.