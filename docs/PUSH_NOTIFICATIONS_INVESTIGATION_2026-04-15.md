# Push Notifications Investigation Report (2026-04-15)

## Scope
Investigated why LockSafe locksmith push notifications are not delivered even though email notifications work.

## Findings

### 1) Mobile app integration status: ✅ Correct

Reviewed:
- `services/pushNotifications.ts`
- `services/api/notifications.ts`
- `app/_layout.tsx`

Confirmed behavior:
- OneSignal SDK initializes on startup (`pushNotificationService.initialize()`).
- After locksmith login, app calls `registerUser(user.id, 'locksmith')`.
- App retrieves OneSignal player/subscription ID and calls:
  - `POST /api/onesignal/subscribe` with `playerId`, `userId`, `userType: 'locksmith'`
- On logout, app calls:
  - `POST /api/onesignal/unsubscribe`
- Deep-link routing is implemented for job/earnings/available screens.

Conclusion: mobile app is wired correctly for push registration and deep linking.

### 2) Backend OneSignal subscription endpoint status: ❌ Broken

Curl test results:

```bash
curl -i -X POST https://www.locksafe.uk/api/onesignal/subscribe \
  -H 'Content-Type: application/json' \
  -d '{"playerId":"test-player-id","userId":"test-user-id","userType":"locksmith"}'
```

Response:
- HTTP 500
- body: `{"error":"Failed to save subscription"}`

Also tested unsubscribe endpoint:
- `POST /api/onesignal/unsubscribe` returns HTTP 500 with `{"error":"Failed to remove subscription"}`

Conclusion: backend subscription persistence is failing, which explains why push notifications are not sent.

## Delivered workaround solution

Implemented standalone microservice:
- Path: `/home/ubuntu/locksafe-notification-service`
- Runtime: Node.js + TypeScript + Express

Capabilities:
- Handles webhook events from backend (`/webhooks/jobs`)
- Optional polling mode for backend jobs feed
- Sends OneSignal notifications for:
  - `job.created` → notify all available locksmiths
  - `job.accepted` → notify assigned locksmith only
  - `job.status_changed` → notify assigned locksmith only
- Includes deep-link data (`type`, `jobId`, `jobNumber`, etc.)
- Supports targeting by OneSignal external ID (recommended) or player ID mapping

## Recommended production plan

1. Keep mobile app push code as-is.
2. Deploy `locksafe-notification-service`.
3. Configure backend to call webhook events on job lifecycle changes.
4. Set OneSignal credentials in microservice env.
5. Fix `https://www.locksafe.uk/api/onesignal/subscribe` and `unsubscribe` endpoints to restore native backend subscription management.
