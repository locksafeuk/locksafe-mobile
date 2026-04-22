# Native Push Migration Complete — Build 7 (iOS) / Build 15 (Android)

**Date:** 2026-04-22 (Europe/London)  
**Project:** `/home/ubuntu/locksafe-mobile`  
**Version:** `1.0.2`

## 1) Summary

LockSafe mobile has been migrated from OneSignal to native push notification delivery using Expo native modules:

- `expo-notifications`
- `expo-device`

The migration removes OneSignal from runtime startup and build config, and replaces it with native APNs/FCM token registration flow.

## 2) Removed OneSignal components

### Dependencies removed
- `react-native-onesignal`
- `onesignal-expo-plugin`

### Code removed/refactored
- **Deleted:** `services/pushNotifications.ts`
- **Replaced in app bootstrap:**
  - `app/_layout.tsx` now uses native push service only

### Config removed
- `EXPO_PUBLIC_ONESIGNAL_APP_ID` removed from:
  - `.env`
  - `.env.example`
  - `eas.json`
  - `app.config.js` extras
  - `scripts/prepare-build.sh` required vars

## 3) Added native push implementation

### New service
- **Added:** `services/nativePushNotifications.ts`

### Implemented behavior
- Native notification permission handling
- Native APNs/FCM token acquisition via `Notifications.getDevicePushTokenAsync()`
- Foreground notification handler
- Notification tap/open handler
- Last-notification-response handling for cold-start tap routing
- Deep link routing parity for job/earnings/alerts
- Deferred initialization safety via `InteractionManager.runAfterInteractions()` in root layout
- Structured logging and defensive error handling

## 4) Backend contract updates (mobile side)

`services/api/notifications.ts` now targets native token endpoints:

- `POST /api/push/register-device`
- `POST /api/push/unregister-device`

Payload includes:
- `userId`
- `userType`
- `deviceToken`
- `tokenType`
- `platform`
- optional `deviceName` and `isDevice`

## 5) App configuration updates

### `app.config.js`
- Added `expo-notifications` plugin config
  - Android icon/color/default channel
  - iOS background remote notifications enabled
- iOS `buildNumber`: **7**
- Android `versionCode`: **15**
- App `version`: **1.0.2** (unchanged)

## 6) Build status

### iOS production build
- Build ID: `36598884-9a4b-4d68-af72-054e865e8637`
- Target version: `1.0.2 (7)`
- Logs: https://expo.dev/accounts/locksafeuk26/projects/locksafe-mobile/builds/36598884-9a4b-4d68-af72-054e865e8637

### Android production build
- Build ID: `c57ae58e-5458-40a1-b805-dc3c04805b68`
- Target version: `1.0.2 (15)`
- Logs: https://expo.dev/accounts/locksafeuk26/projects/locksafe-mobile/builds/c57ae58e-5458-40a1-b805-dc3c04805b68

## 7) Validation performed

- `expo-doctor` passed (17/17)
- Expo config resolves:
  - iOS build number `7`
  - Android version code `15`
- Active app code/config no longer references OneSignal.

## 8) Submission notes template (iOS reviewer)

> Build 7 replaces the third-party OneSignal SDK with native Apple Push Notification Service (APNs) and native Android FCM token handling. Push registration is now deferred until after UI interactions stabilize, eliminating prior startup race conditions and improving launch stability on all devices including iPad.

## 9) Follow-up actions

1. Capture final IPA and AAB artifact URLs once builds finish.
2. Submit iOS via EAS Submit/App Store Connect.
3. Submit Android via EAS Submit/Google Play Console.
4. Perform final physical-device verification for foreground/background/open flows.
