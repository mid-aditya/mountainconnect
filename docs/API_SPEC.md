# MountainConnect ID - API Specification

## Base URL

| Environment | Base URL |
|-------------|----------|
| Development | `https://api-dev.mountainconnect.id/v1` |
| Staging | `https://api-staging.mountainconnect.id/v1` |
| Production | `https://api.mountainconnect.id/v1` |

## Authentication

All protected endpoints require a `Bearer` token in the `Authorization` header:

```http
Authorization: Bearer <jwt_token>
```

Obtain a token via `/auth/login` (credentials) or OAuth providers.

## Response Format

All responses follow this envelope:

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Pagination

List endpoints return paginated data with metadata:

```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "total": 12450,
    "page": 1,
    "limit": 20,
    "totalPages": 623
  }
}
```

Query parameters: `?page=1&limit=20&sort=createdAt&order=desc`

## Common Error Responses

| Status | Code | Description |
|--------|------|-------------|
| 400 | `BAD_REQUEST` | Invalid request parameters |
| 401 | `UNAUTHORIZED` | Missing or invalid authentication |
| 403 | `FORBIDDEN` | Insufficient permissions |
| 404 | `NOT_FOUND` | Resource not found |
| 409 | `CONFLICT` | Resource already exists |
| 422 | `VALIDATION_ERROR` | Validation failed |
| 429 | `RATE_LIMITED` | Too many requests |
| 500 | `INTERNAL_ERROR` | Server error |

Error format:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "errors": {
      "email": ["Email is required", "Email must be valid"]
    }
  }
}
```

---

## Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login with credentials |
| POST | `/auth/logout` | Invalidate token |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/forgot-password` | Request password reset |
| POST | `/auth/reset-password` | Reset password with token |
| GET | `/auth/me` | Get current user |
| POST | `/auth/verify-email` | Verify email with OTP |
| POST | `/auth/resend-verification` | Resend verification email |
| POST | `/auth/oauth/:provider` | OAuth callback (google, github) |

### User Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | List all users (admin) |
| GET | `/users/:id` | Get user profile |
| PUT | `/users/:id` | Update user |
| DELETE | `/users/:id` | Delete user (admin) |
| POST | `/users/:id/verify` | Verify user (admin) |
| POST | `/users/:id/ban` | Ban user (admin) |
| GET | `/users/:id/trips` | Get user's trip history |
| GET | `/users/:id/verification-status` | Get verification status |
| PUT | `/users/:id/verification` | Update verification level |

### Mountains & Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/mountains` | List mountains |
| GET | `/mountains/:id` | Get mountain details |
| POST | `/mountains` | Create mountain (admin) |
| PUT | `/mountains/:id` | Update mountain (admin) |
| DELETE | `/mountains/:id` | Delete mountain (admin) |
| GET | `/mountains/:id/routes` | List routes for mountain |
| POST | `/mountains/:id/routes` | Add route (admin) |
| PUT | `/mountains/:id/routes/:routeId` | Update route |
| DELETE | `/mountains/:id/routes/:routeId` | Delete route |
| GET | `/mountains/nearby` | Find nearby mountains |

### Trips & Bookings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/trips` | List available trips |
| GET | `/trips/:id` | Get trip details |
| POST | `/trips` | Create trip (operator) |
| PUT | `/trips/:id` | Update trip (operator) |
| DELETE | `/trips/:id` | Cancel trip (operator) |
| POST | `/trips/:id/book` | Book a trip |
| GET | `/bookings` | List user bookings |
| GET | `/bookings/:id` | Get booking details |
| PUT | `/bookings/:id/cancel` | Cancel booking |
| POST | `/bookings/:id/confirm` | Confirm payment |

### Emergency / SOS

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/sos/trigger` | Trigger SOS alert |
| GET | `/sos/active` | List active SOS alerts |
| GET | `/sos/:id` | Get SOS details |
| POST | `/sos/:id/resolve` | Resolve SOS alert |
| GET | `/sos/overdue` | List overdue hikes |
| POST | `/sos/check-in` | Record check-in |
| POST | `/sos/check-out` | Record check-out |
| GET | `/emergency-contacts` | Get emergency contacts |
| POST | `/emergency-contacts` | Add emergency contact |

### Weather

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/weather/:mountainId` | Current weather for mountain |
| GET | `/weather/:mountainId/forecast` | 7-day forecast |
| GET | `/weather/alerts` | Active weather alerts |
| GET | `/weather/hazard/:mountainId` | Hazard assessment |

### Marketplace

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/marketplace/listings` | List marketplace items |
| GET | `/marketplace/listings/:id` | Get listing details |
| POST | `/marketplace/listings` | Create listing |
| PUT | `/marketplace/listings/:id` | Update listing |
| DELETE | `/marketplace/listings/:id` | Delete listing |
| POST | `/marketplace/listings/:id/verify` | Verify listing (admin) |
| POST | `/marketplace/listings/:id/reject` | Reject listing (admin) |
| POST | `/marketplace/orders` | Create order |
| GET | `/marketplace/orders/:id` | Get order details |
| POST | `/marketplace/escrow/release` | Release escrow |
| POST | `/marketplace/escrow/dispute` | Open dispute |
| GET | `/marketplace/disputes` | List disputes |

### Notifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notifications` | List user notifications |
| PUT | `/notifications/:id/read` | Mark as read |
| PUT | `/notifications/read-all` | Mark all as read |
| DELETE | `/notifications/:id` | Delete notification |
| GET | `/notifications/preferences` | Get preferences |
| PUT | `/notifications/preferences` | Update preferences |
| POST | `/notifications/push/register` | Register push token |
| DELETE | `/notifications/push/unregister` | Unregister push token |

### Community

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/forum/posts` | List forum posts |
| GET | `/forum/posts/:id` | Get post with comments |
| POST | `/forum/posts` | Create post |
| PUT | `/forum/posts/:id` | Update post |
| DELETE | `/forum/posts/:id` | Delete post |
| POST | `/forum/posts/:id/like` | Like post |
| POST | `/forum/posts/:id/comment` | Add comment |
| POST | `/forum/posts/:id/report` | Report post |
| GET | `/forum/posts/:id/comments` | Get comments |
| DELETE | `/forum/comments/:id` | Delete comment |
| GET | `/reviews/:mountainId` | Get reviews |
| POST | `/reviews` | Create review |

---

## WebSocket Events

Connect to `wss://ws.mountainconnect.id/v1` with Bearer auth.

| Event | Direction | Description |
|-------|-----------|-------------|
| `sos:triggered` | Server → Client | New SOS alert |
| `sos:resolved` | Server → Client | SOS resolved |
| `weather:alert` | Server → Client | Weather hazard alert |
| `booking:update` | Server → Client | Booking status change |
| `location:update` | Client → Server | GPS position update |
| `presence:checkin` | Client → Server | Check-in confirmation |
