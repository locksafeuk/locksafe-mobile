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

## 6) Build outputs (final)

### iOS production build
- Build ID: `cf6e04b7-c48f-48f0-89d8-8b657c26325a`
- Status: `finished`
- App version: `1.0.2 (7)`
- Logs: https://expo.dev/accounts/locksafeuk26/projects/locksafe-mobile/builds/cf6e04b7-c48f-48f0-89d8-8b657c26325a
- IPA: https://expo.dev/artifacts/eas/rBCxse4RsnFwB936Y64Vnu.ipa

### Android production build
- Build ID: `8b76b3db-228d-42fe-b1f7-e193ae22b2f6`
- Status: `finished`
- App version: `1.0.2 (15)`
- Logs: https://expo.dev/accounts/locksafeuk26/projects/locksafe-mobile/builds/8b76b3db-228d-42fe-b1f7-e193ae22b2f6
- AAB: https://expo.dev/artifacts/eas/idRmY5brYXEptgA7wtoPZh.aab

## 7) Validation performed

- `expo-doctor` passed (17/17)
- Expo config resolves:
  - iOS build number `7`
  - Android version code `15`
- Active app code/config no longer references OneSignal.
- Git commit pushed: `efd52392924a21ecb8490db1205de9e28224dbcd`

## 8) Submission execution status

### iOS submit attempts
- Submissions scheduled via EAS:
  - `f5b1af5a-0a22-4a6a-83be-542b4acb30c4`
  - `fa97fd79-fda2-43fa-846c-69dffc3cc3a6`
  - `18f33a5b-40d3-47d9-a783-5bb1f5d8e919`
  - `9d67b185-a708-4631-a32f-eb55ace4c3be`
- EAS CLI returned generic final failure message during wait step; App Store Connect confirmation required in dashboard.

### Android submit attempt
- EAS submit failed locally due missing file: `./google-service-account.json`
- Required action: place Play service-account key at repo root (or update submit profile path), then rerun:
  - `eas submit --platform android --profile production --id 8b76b3db-228d-42fe-b1f7-e193ae22b2f6`

## 9) iOS reviewer notes template

> Build 7 replaces the third-party OneSignal SDK with native Apple Push Notification Service (APNs) and native Android FCM token handling. Push registration is now deferred until after UI interactions stabilize, eliminating prior startup race conditions and improving launch stability on all devices including iPad.
