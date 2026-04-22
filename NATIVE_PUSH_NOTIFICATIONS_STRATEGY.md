# LockSafe Native Push Notifications Strategy

**Project:** LockSafe Mobile (`/home/ubuntu/locksafe-mobile`)  
**Date:** 2026-04-22  
**Prepared for:** Replacing OneSignal with native push (FCM + APNs)

### Executive Summary
LockSafe should migrate from OneSignal to a native push architecture in the next app cycle (target: **Build 7**), using:
- **Android:** Firebase Cloud Messaging (FCM)
- **iOS:** Apple Push Notification service (APNs), with token handling in-app

This strategy removes the OneSignal runtime SDK (currently a startup risk area), keeps push delivery through platform-native channels, and gives full control over registration lifecycle, token mapping, and delivery logic.

### Why this solves the recurring OneSignal crashes
Based on the current codebase and crash analysis artifacts:
- OneSignal initialization and registration currently run from app startup/login lifecycle (`app/_layout.tsx`, `services/pushNotifications.ts`), a historically sensitive timing area.
- Multiple mitigations were already added (deferred registration, concurrency guard), but startup still carries third-party SDK complexity.
- Removing `react-native-onesignal` and `onesignal-expo-plugin` eliminates OneSignal-specific initialization timing, dynamic import behavior, and OneSignal event binding from launch path.

**Result:** fewer startup moving parts, reduced race-condition surface, more deterministic startup behavior.

### Current OneSignal configuration (as-is)
Current implementation elements in repo:
- OneSignal SDK wrapper: `services/pushNotifications.ts`
- App integration point: `app/_layout.tsx`
- Plugin: `onesignal-expo-plugin` in `app.config.js`
- Environment variable: `EXPO_PUBLIC_ONESIGNAL_APP_ID` (`.env`, `.env.example`)
- Backend endpoints currently used:
  - `POST /api/onesignal/subscribe`
  - `POST /api/onesignal/unsubscribe`
  - `POST /api/onesignal/send` (admin)
- Existing infra available to reuse:
  - Firebase project: `locksafeuk-ea52e`
  - APNs credentials already configured for same iOS bundle (`uk.locksafe.app`)

### What needs to be migrated
#### App-side migration
1. Remove OneSignal service usage and plugin config.
2. Add native push service with `expo-notifications` + `expo-device`.
3. Register and sync native device tokens to backend.
4. Replace OneSignal event listeners with Expo notification handlers.
5. Keep existing deep-link behavior mapping (notification type -> route).

#### Backend migration
1. Introduce native token subscription model (instead of OneSignal player IDs).
2. Add delivery providers:
   - Firebase Admin SDK for Android tokens.
   - APNs provider (or FCM HTTP v1 for iOS tokens, if consolidated strategy preferred).
3. Maintain role-based authorization patterns already improved in April 2026 security patch.
4. Add idempotent subscribe/unsubscribe and token rotation handling.

#### Ops/console migration
1. Confirm Firebase Cloud Messaging setup in `locksafeuk-ea52e`.
2. Confirm Apple Push capability + APNs key linkage.
3. Update store testing workflows (TestFlight + Play closed testing).

### High-level native architecture
```text
[LockSafe Mobile App]
  ├─ Android: expo-notifications obtains FCM token
  ├─ iOS: expo-notifications obtains APNs/Expo push token (native credentials configured)
  └─ Sends token + platform + appVersion + userId to backend

[LockSafe Backend]
  ├─ /api/push/subscribe (auth required)
  ├─ /api/push/unsubscribe (auth required)
  ├─ /api/push/send (admin/system service only)
  ├─ Token store (user_id, platform, token, active, last_seen)
  ├─ Android Sender: Firebase Admin SDK
  └─ iOS Sender: APNs provider

[Delivery]
  ├─ Android device receives FCM push
  └─ iOS device receives APNs push
```

### Benefits over OneSignal
- No third-party runtime push SDK in app startup path.
- Better observability/control over token lifecycle and error handling.
- Simpler compliance story (fewer external data processors in push path).
- Platform-native reliability and lower integration abstraction overhead.
- Easier debugging of push failures by channel (FCM vs APNs).

### Feasibility assessment
**Feasibility: High**
- Project already uses Expo; `expo-notifications` is a standard, supported route.
- Firebase + APNs foundations already exist and can be reused.
- Existing notification payload model (`type`, `jobId`) can stay with minor adaptation.

**Estimated effort:** 3-6 engineering days across mobile + backend + QA, excluding app-store review time.

### Migration timeline (Build 7 target)
#### Phase 0 - Preparation (0.5 day)
- Freeze OneSignal feature changes.
- Confirm credentials access (Firebase Admin, Apple Developer).
- Define final payload schema and endpoint contracts.

#### Phase 1 - Console & credential setup (0.5-1 day)
- Validate Firebase FCM settings and service account key.
- Validate Apple Push capability and APNs key/certificate.
- Document credential storage and rotation ownership.

#### Phase 2 - Backend support (1-2 days)
- Implement `/api/push/subscribe`, `/api/push/unsubscribe`, `/api/push/send`.
- Implement token deduplication, invalid token cleanup, and send logging.
- Add authz parity with current hardened OneSignal endpoints.

#### Phase 3 - Mobile implementation (1-2 days)
- Remove OneSignal dependencies/integration.
- Add native push service (`services/nativePushNotifications.ts`).
- Integrate registration on authenticated session lifecycle.
- Preserve deep-link routing behavior from existing notification types.

#### Phase 4 - QA and staged rollout (1-2 days)
- Device matrix testing (real iPhone + Android).
- Test foreground, background, killed-state delivery and open actions.
- Submit Build 7 to TestFlight/internal testing first.

#### Phase 5 - Production cutover (0.5 day)
- Disable OneSignal send path.
- Enable native send path only.
- Monitor delivery/open rates and crash metrics for 72 hours.

### Risk assessment
| Risk | Likelihood | Impact | Mitigation |
|---|---:|---:|---|
| Token registration failures after login | Medium | High | Add retry/backoff and token sync on app foreground |
| iOS entitlement misconfiguration | Medium | High | Verify Push capability + provisioning profiles before build |
| Android channel misconfiguration | Medium | Medium | Pre-create channels and test by importance level |
| Backend send failures for invalid tokens | High | Medium | Implement automatic invalid-token pruning on send response |
| Regression in deep-link navigation | Medium | Medium | Reuse existing payload keys and route mapping tests |
| Store review delays | Medium | Medium | Submit early TestFlight/closed testing builds |

### Rollback plan
If native push migration has critical production issue:
1. Keep OneSignal backend endpoints and config available for one release cycle.
2. Feature flag push provider in backend (`PUSH_PROVIDER=native|onesignal`).
3. Ship hotfix build enabling fallback provider if needed.
4. Maintain both token stores temporarily during transition (OneSignal player IDs + native tokens).
5. Rollback criteria:
   - >5% push delivery failure on either platform for 2+ hours
   - startup crash regression tied to push code
   - failed notification open/deep-link behavior impacting core job flow

### Code implementation strategy (Build 7)
#### Libraries
**Recommended primary path:** `expo-notifications`  
Add:
- `expo-notifications`
- `expo-device`
- `expo-application` (optional, for build/version metadata)

Alternative (not recommended for this Expo project): `react-native-push-notification`.

#### Files to modify
- `app.config.js`
  - Remove `onesignal-expo-plugin`
  - Add `expo-notifications` plugin config (icon/color/sounds if needed)
  - Remove `extra.oneSignalAppId`
- `.env` / `.env.example`
  - Remove OneSignal env key references
  - Add native push-related vars if needed (e.g., project IDs, topic names)
- `app/_layout.tsx`
  - Replace `pushNotificationService` usage with `nativePushNotificationService`
  - Keep deferred registration pattern (after auth + interactions)
- `services/api/notifications.ts`
  - Replace `subscribeToOneSignal`/`unsubscribeFromOneSignal` calls
  - Add native endpoints (`subscribeDevice`, `unsubscribeDevice`)
- `docs/DEPLOYMENT_GUIDE.md` and `docs/TESTING_GUIDE.md`
  - Replace OneSignal instructions with native push flows

#### Files to remove/deprecate
- `services/pushNotifications.ts` (OneSignal implementation)
- `docs/ONESIGNAL_SETUP.md` (archive or replace)

#### New files to create
- `services/nativePushNotifications.ts`
- Optional hooks:
  - `hooks/useNativePushRegistration.ts`
  - `hooks/useNativePushNavigation.ts`

#### Backend changes needed
- New endpoints (or versioned replacements):
  - `POST /api/push/subscribe`
  - `POST /api/push/unsubscribe`
  - `POST /api/push/send` (admin/system)
- New DB table (example): `device_push_tokens`
  - `id, user_id, user_type, platform, token, app_version, device_id, active, last_seen_at, created_at, updated_at`
- Send workers:
  - FCM sender for Android tokens
  - APNs sender for iOS tokens
- Security:
  - Keep strict auth/authz and explicit 401/403/404 semantics

### Migration path from OneSignal to native (safe cutover)
1. **Dual-write period (optional but recommended):** app sends native token and keeps OneSignal for one beta cycle.
2. Compare delivery metrics between providers.
3. Switch send provider to native by default.
4. Remove OneSignal SDK/plugin in final production build.
5. Retire `/api/onesignal/*` endpoints after 1-2 stable releases.

### Example code snippets (reference implementation)
#### 1) Expo notifications setup (shared)
```ts
// services/nativePushNotifications.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForNativePushAsync(): Promise<string | null> {
  if (!Device.isDevice) return null;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#f97316',
    });
  }

  const token = await Notifications.getDevicePushTokenAsync();
  return token.data;
}
```

#### 2) Android-specific handling (channels + actions)
```ts
if (Platform.OS === 'android') {
  await Notifications.setNotificationChannelAsync('jobs', {
    name: 'Job Alerts',
    importance: Notifications.AndroidImportance.MAX,
    sound: 'default',
  });

  await Notifications.setNotificationChannelAsync('payments', {
    name: 'Payment Updates',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: 'default',
  });
}
```

#### 3) iOS-specific handling (foreground + tap response)
```ts
const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
  const data = response.notification.request.content.data as {
    type?: string;
    jobId?: string;
  };

  // route using existing mapping logic
  // e.g., router.push(job route)
});

const receivedSub = Notifications.addNotificationReceivedListener((notification) => {
  // optional in-app toast or badge updates while foregrounded
});

// cleanup in useEffect return
responseSub.remove();
receivedSub.remove();
```

#### 4) Backend send example (Node.js pseudocode)
```ts
// POST /api/push/send (admin/system)
// Example shape preserving existing payload conventions
{
  "title": "New Job Assigned",
  "body": "You have a new assigned job",
  "data": { "type": "NEW_JOB_ASSIGNED", "jobId": "uuid" },
  "target": { "userId": "locksmith-uuid" }
}

// Android: Firebase Admin SDK sendToDevice(token, payload)
// iOS: APNs provider send(notification, deviceToken)
// On invalid token: mark token inactive in DB
```

### Success criteria
- No OneSignal SDK or plugin in app code/build config.
- Push notifications received on real Android + iOS devices.
- Deep links open correct job/dashboard routes.
- No startup crash regression related to push initialization in Build 7.
- Delivery, open, and error metrics available in backend logs/monitoring.

### Final recommendation
Proceed with a **controlled native push migration in Build 7** using `expo-notifications`, with backend native token support and a short rollback window. This is the most reliable path to eliminate OneSignal-specific startup risk while keeping full push functionality.