# API Documentation

Base URL: `http://localhost:4000/api`

All requests require the header:
```
X-API-KEY: your_api_key
```

---

## Notifications

### Send a notification

```
POST /notifications/send
```

Body:
```json
{
  "appId": "my-app",
  "recipientId": "user-123",
  "title": "Your report is ready",
  "description": "Q3 report has been generated",
  "url": "/reports/q3",
  "notifStatus": "Normal",
  "meta": {
    "reportId": "rpt_123"
  }
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| appId | string | yes | identifier of the sending app |
| recipientId | string | yes | identifier of the target user |
| title | string | yes | |
| description | string | yes | |
| url | string | no | deep link or path |
| notifStatus | string | no | `Normal` `Alert` `Priority` — defaults to `Normal` |
| meta | object | no | any additional data |

---

### Send to multiple users

```
POST /notifications/send/bulk
```

Body:
```json
{
  "appId": "my-app",
  "recipientIds": ["user-123", "user-456"],
  "title": "System maintenance",
  "description": "Scheduled downtime at 2am",
  "notifStatus": "Alert"
}
```

Same fields as single send, except `recipientId` is replaced by `recipientIds` (array of strings).

---

### Get notifications for a user

```
GET /notifications/:recipientId?appId=my-app&limit=20&skip=0
```

| Query param | Type | Required | Notes |
|---|---|---|---|
| appId | string | no | filter by app |
| limit | number | no | defaults to 20 |
| skip | number | no | defaults to 0, use for pagination |

---

### Get unread count

```
GET /notifications/:recipientId/unread-count?appId=my-app
```

Response:
```json
5
```

---

## Actions

### Mark as done

```
POST /notifications/action/done
```

Body:
```json
{
  "notifId": "664f1a2b3c4d5e6f7a8b9c0d"
}
```

---

### Mark as read

```
POST /notifications/action/read
```

Body:
```json
{
  "notifId": "664f1a2b3c4d5e6f7a8b9c0d"
}
```

---

### Mark all as read

```
POST /notifications/action/read-all
```

Body:
```json
{
  "recipientId": "user-123",
  "appId": "my-app"
}
```

`appId` is optional. If omitted, marks all notifications as read across all apps for that recipient.

---

### Snooze (ignore)

```
POST /notifications/action/ignore
```

Body:
```json
{
  "notifId": "664f1a2b3c4d5e6f7a8b9c0d",
  "ignoreMinutes": 30
}
```

`ignoreMinutes` must be one of: `5` `10` `30` `60`

Only re-surfaces automatically if `notifStatus` is `Priority` or `Alert` (requires cron job module).

---

## Notification Status Values

| Value | Description |
|---|---|
| `Normal` | Standard notification, no re-surfacing |
| `Alert` | Elevated — re-surfaces after snooze expires |
| `Priority` | Critical — re-surfaces after snooze expires |

## Notification Action Values

| Value | Description |
|---|---|
| `Read` | User has seen the notification |
| `Done` | User has acted on the notification |
| `Ignore` | User snoozed the notification |

---

## Error Responses

| Status | Meaning |
|---|---|
| 400 | Bad request — validation failed or invalid value |
| 401 | Missing or invalid API key |
| 404 | Notification not found |
| 500 | Internal server error |