# LockSafe Mobile – Notifications Backend Integration Guide

## Overview
This guide defines what the backend must do for reliable OneSignal push notifications in the locksmith mobile app.

The app now:
- Initializes OneSignal at startup (native platforms)
- Logs the locksmith into OneSignal after app login
- Sends OneSignal player/subscription ID to backend via `POST /api/onesignal/subscribe`
- Unsubscribes on logout via `POST /api/onesignal/unsubscribe`
- Deep-links notification taps into relevant in-app screens

## Current Status (April 2026)

- ✅ OneSignal iOS is now configured in the mobile app and EAS build profiles.
- ✅ APNs credentials are set up in OneSignal for bundle ID `uk.locksafe.app`.
- ✅ iOS notifications are ready to work (native build + real device required for end-to-end validation).

---

## 1) Required Backend Endpoints

### `POST /api/onesignal/subscribe`
Register or update the locksmith’s OneSignal subscription.

**Request body**
```json
{
  "playerId": "onesignal_subscription_id",
  "userId": "locksmith_uuid",
  "userType": "locksmith"
}
```

**Expected behavior**
- Upsert mapping between `userId` and `playerId`
- Mark subscription active
- Deduplicate if same player is sent multiple times
- Return `{ "success": true }`

### `POST /api/onesignal/unsubscribe`
Disable a specific OneSignal subscription for a locksmith.

**Request body**
```json
{
  "playerId": "onesignal_subscription_id",
  "userId": "locksmith_uuid",
  "userType": "locksmith"
}
```

**Expected behavior**
- Mark mapping inactive (preferred) or delete mapping
- Return `{ "success": true }`

---

## 2) Suggested DB Model

Recommended table: `push_subscriptions`

- `id` (uuid)
- `user_id` (uuid)
- `user_type` (`locksmith`)
- `provider` (`onesignal`)
- `player_id` (string, indexed)
- `platform` (`ios` | `android` | `unknown`, optional)
- `is_active` (boolean)
- `last_seen_at` (timestamp)
- `created_at`, `updated_at`

Recommended indexes/constraints:
- Unique composite: (`player_id`, `provider`)
- Index on (`user_id`, `user_type`, `is_active`)

---

## 3) Notification Event Triggers

Backend should send push notifications for the following events at minimum:

1. **New job assigned** → `NEW_JOB_ASSIGNED`
2. **Job status changed**:
   - Accepted → `JOB_ACCEPTED`
   - En route → `JOB_EN_ROUTE`
   - Arrived → `JOB_ARRIVED`
   - Completed → `JOB_COMPLETED`
   - Generic fallback → `JOB_STATUS_CHANGED`
3. **New chat/message** → `NEW_MESSAGE`
4. **Payment received** → `PAYMENT_RECEIVED`
5. **Payout sent** → `PAYOUT_SENT`
6. **New jobs in area** (optional broadcast/segment) → `NEW_JOB_AVAILABLE`
7. **Other critical operational alerts** → `GENERAL_ALERT`

---

## 4) OneSignal Payload Contract

Always include `type` and `jobId` (when event is job-specific) in `data`.

### Example payload to OneSignal REST API
```json
{
  "app_id": "<ONESIGNAL_APP_ID>",
  "include_subscription_ids": ["player_id_1", "player_id_2"],
  "headings": { "en": "New Job Assigned" },
  "contents": { "en": "You have been assigned Job #LS-10284" },
  "data": {
    "type": "NEW_JOB_ASSIGNED",
    "jobId": "job_uuid_123",
    "jobNumber": "LS-10284"
  }
}
```

### Required payload fields
- `data.type` (string)
- `data.jobId` for job-related events
- Optional: `data.messageId`, `data.status`, `data.amount`, `data.referenceId`

If `type` is unknown, app falls back to `GENERAL_ALERT` and opens locksmith dashboard.

---

## 5) Deep Linking Behavior in Mobile App

- `NEW_JOB_AVAILABLE` → `/(locksmith)/(tabs)/available`
- `PAYMENT_RECEIVED`, `PAYOUT_SENT` → `/(locksmith)/(tabs)/earnings`
- Job/message/status notifications with `jobId` → `/(locksmith)/job/{jobId}`
- Unknown/general alerts → `/(locksmith)/(tabs)`

To ensure correct navigation, include `jobId` whenever event is tied to a job.

---

## 6) Delivery & Reliability Recommendations

1. **Send only to active player IDs**
2. **Retry transient OneSignal API failures** (exponential backoff)
3. **Mark invalid player IDs inactive** when OneSignal returns invalid subscription errors
4. **Idempotency key per event** to avoid duplicate notifications
5. **Store send logs** (`event`, `user_id`, `player_id`, `status`, `onesignal_notification_id`)
6. **Queue notification jobs** (BullMQ/SQS/etc.) instead of sending inline in request cycle

---

## 7) Security & Validation

- Validate authenticated caller for subscribe/unsubscribe
- Verify `userId` belongs to authenticated locksmith
- Reject unsupported `userType`
- Rate-limit subscribe/unsubscribe endpoints

---

## 8) Testing Checklist (Backend + Mobile)

1. Login as locksmith on test device
2. Confirm `POST /api/onesignal/subscribe` called with valid `playerId`
3. Trigger each event type from backend/dev tools
4. Confirm push appears on iOS and Android
5. Tap push and verify deep link lands on expected screen
6. Logout and confirm `unsubscribe` is called
7. Re-login and confirm re-subscription works

---

## 9) Notes

- iOS requires valid APNs setup in OneSignal.
- Android requires valid FCM credentials in OneSignal.
- For production rollout, keep a staging OneSignal app for QA before sending to live users.
