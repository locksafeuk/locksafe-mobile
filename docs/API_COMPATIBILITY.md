# API Compatibility Report

This document tracks the compatibility between the LockSafe Mobile App and the LockSafe Web App APIs.

## Status: ✅ COMPATIBLE

Last Updated: April 5, 2026

## Authentication APIs

| Endpoint | Mobile Expects | Web Provides | Status |
|----------|---------------|--------------|--------|
| `POST /api/auth/login` | `{ success, token, user }` | Updated | ✅ |
| `POST /api/auth/register` | `{ success, token, customer }` | Updated | ✅ |
| `GET /api/auth/session` | `{ success, authenticated, user }` | Updated | ✅ |
| `POST /api/auth/logout` | `{ success }` | Yes | ✅ |
| `POST /api/auth/forgot-password` | `{ success, message }` | Yes | ✅ |
| `POST /api/auth/reset-password` | `{ success, message }` | Yes | ✅ |
| `POST /api/auth/verify-email` | `{ success }` | Yes | ✅ |

### Notes:
- Auth endpoints now return `token` in response body for mobile apps (detected via `x-mobile-app: true` header)
- Session endpoint now supports `Authorization: Bearer <token>` header for mobile apps

## Locksmith APIs

| Endpoint | Mobile Expects | Web Provides | Status |
|----------|---------------|--------------|--------|
| `POST /api/locksmiths/register` | `{ success, token, locksmith }` | Updated | ✅ |
| `GET /api/locksmiths/{id}` | `{ success, locksmith }` | Yes | ✅ |
| `GET /api/locksmiths/{id}/dashboard` | `{ locksmith, stats, recentJobs }` | Yes | ✅ |
| `GET /api/locksmiths/{id}/reviews` | `{ success, reviews, averageRating }` | Yes | ✅ |
| `POST /api/locksmith/profile` | `{ success, locksmith }` | Yes | ✅ |
| `POST /api/locksmith/availability` | `{ success, isAvailable, lastChanged, scheduleEnabled, ... }` | Updated | ✅ |
| `GET /api/locksmith/availability` | `{ success, isAvailable, scheduleEnabled, ... }` | Updated | ✅ |
| `POST /api/locksmith/availability/schedule` | `{ success }` | Yes | ✅ |
| `POST /api/locksmith/accept-terms` | `{ success }` | Yes | ✅ |
| `GET /api/locksmith/applications` | `{ success, applications }` | Yes | ✅ |

## Customer APIs

| Endpoint | Mobile Expects | Web Provides | Status |
|----------|---------------|--------------|--------|
| `POST /api/customer/profile` | `{ success, data }` | Yes | ✅ |
| `POST /api/customer/password` | `{ success }` | Yes | ✅ |
| `POST /api/customer/accept-terms` | `{ success }` | Yes | ✅ |

## Job APIs

| Endpoint | Mobile Expects | Web Provides | Status |
|----------|---------------|--------------|--------|
| `POST /api/jobs` | `{ success, id, jobNumber, status }` | Yes | ✅ |
| `GET /api/jobs/{id}` | `{ success, job }` | Yes | ✅ |
| `GET /api/jobs?customerId=xxx` | `{ success, jobs, total }` | Updated | ✅ |
| `GET /api/jobs?locksmithId=xxx` | `{ success, jobs, total }` | Yes | ✅ |
| `GET /api/jobs?availableForLocksmith=xxx` | `{ success, jobs }` with `distanceMiles` | Yes | ✅ |
| `PATCH /api/jobs/{id}/status` | `{ success, data }` | Yes | ✅ |
| `POST /api/jobs/{id}/applications` | `{ success, data }` | Yes | ✅ |
| `GET /api/jobs/{id}/applications` | `{ success, applications }` | Yes | ✅ |
| `POST /api/jobs/{id}/accept-application` | `{ success }` | Yes | ✅ |
| `POST /api/jobs/{id}/quote` | `{ success, quote }` | Yes | ✅ |
| `GET /api/jobs/{id}/quote` | `{ success, quote }` | Yes | ✅ |
| `PUT /api/jobs/{id}/quote` | `{ success }` | Yes | ✅ |
| `POST /api/jobs/{id}/photos` | `{ success, data }` | Yes | ✅ |
| `DELETE /api/jobs/{id}/photos/{photoId}` | `{ success }` | Yes | ✅ |
| `POST /api/jobs/{id}/signature` | `{ success, data }` | Yes | ✅ |
| `POST /api/jobs/{id}/review` | `{ success, data }` | Yes | ✅ |
| `POST /api/jobs/{id}/confirm-completion` | `{ success }` | Yes | ✅ |
| `POST /api/jobs/{id}/cancel-refund` | `{ success }` | Yes | ✅ |

## Payment APIs

| Endpoint | Mobile Expects | Web Provides | Status |
|----------|---------------|--------------|--------|
| `POST /api/payments/create-intent` | `{ clientSecret, paymentIntentId }` | Yes | ✅ |
| `POST /api/payments/setup-card` | `{ clientSecret, setupIntentId }` | Yes | ✅ |
| `GET /api/payments/saved-cards` | `{ success, cards }` | Yes | ✅ |
| `POST /api/payments/charge-saved-card` | `{ success, paymentId }` | Yes | ✅ |

## Notification APIs

| Endpoint | Mobile Expects | Web Provides | Status |
|----------|---------------|--------------|--------|
| `GET /api/notifications` | `{ success, notifications, unreadCount }` | Yes | ✅ |
| `POST /api/notifications/{id}/read` | `{ success }` | Yes | ✅ |
| `POST /api/notifications/read-all` | `{ success }` | Yes | ✅ |
| `POST /api/onesignal/subscribe` | `{ success, message }` | Yes | ✅ |
| `POST /api/onesignal/unsubscribe` | `{ success }` | Yes | ✅ |

## Mobile App Headers

The mobile app sends these headers with every request:
- `x-mobile-app: true` - Identifies request as from mobile app
- `x-platform: ios|android` - Platform identifier
- `x-app-version: 1.0.0` - App version
- `Authorization: Bearer <token>` - Auth token (for authenticated requests)

## Changes Made for Compatibility

### 1. Login API (`/api/auth/login`)
- Now returns `token` in response body when `x-mobile-app: true` header is present
- Added `success: false` to error responses

### 2. Register API (`/api/auth/register`)
- Now returns `token` in response body when `x-mobile-app: true` header is present
- Added `customer` object to response

### 3. Locksmith Register API (`/api/locksmiths/register`)
- Now returns `token` in response body when `x-mobile-app: true` header is present
- Added more fields to locksmith response

### 4. Session API (`/api/auth/session`)
- Now supports `Authorization: Bearer <token>` header for mobile authentication
- Added `success` field to responses

### 5. Jobs API (`/api/jobs`)
- Fixed inconsistent response format - always returns `{ success, jobs, total }` now

### 6. Availability API (`/api/locksmith/availability`)
- Added schedule fields to GET and POST responses
- Returns dates as ISO strings

## Testing

To test compatibility:

1. Set up the web app:
```bash
cd locksafe
npm run dev
```

2. Set up the mobile app:
```bash
cd locksafe-uk-mobile-app
npm install --legacy-peer-deps
# Update .env with API_URL=http://localhost:3000
npm start
```

3. Test each flow:
- Customer registration & login
- Locksmith registration & login
- Create job request
- Locksmith applies to job
- Customer accepts application
- Job status updates
- Quote submission & acceptance
- Signature submission
- Payment flow
