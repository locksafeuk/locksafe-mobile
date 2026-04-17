# OneSignal Setup (LockSafe Mobile)

## OneSignal App

- **OneSignal App ID:** `cd19d270-4a74-4bdf-b534-3287cfb8b4e4`
- **Bundle ID (iOS):** `uk.locksafe.app`
- **Mobile app path:** `/home/ubuntu/locksafe-mobile`

## iOS Configuration Details

### App-side configuration

1. `app.config.js`
   - Uses `onesignal-expo-plugin` in plugins list.
   - Reads OneSignal App ID from `EXPO_PUBLIC_ONESIGNAL_APP_ID` into `expo.extra.oneSignalAppId`.
2. `services/pushNotifications.ts`
   - Reads OneSignal App ID from `Constants.expoConfig?.extra?.oneSignalAppId`.
   - Initializes OneSignal on native platforms.
   - Requests notification permission on app startup.
   - Registers/updates locksmith subscription with backend (`/api/onesignal/subscribe`).
   - Unregisters on logout (`/api/onesignal/unsubscribe`).
3. `eas.json`
   - iOS build profiles now use App ID `cd19d270-4a74-4bdf-b534-3287cfb8b4e4` for `EXPO_PUBLIC_ONESIGNAL_APP_ID`.

### OneSignal iOS platform credentials (configured)

- **APNs Key ID:** `HLQ99JYRG2`
- **Apple Team ID:** `4ZNRAB4A2S`
- **Bundle ID:** `uk.locksafe.app`
- **APNs key file (local reference):** `/home/ubuntu/locksafe-apns-key.p8`

## Testing Instructions

## 1) Build and install iOS app

Use a native iOS build (Expo Go cannot validate OneSignal native push behavior):

```bash
cd /home/ubuntu/locksafe-mobile
npx eas build --platform ios --profile preview
```

Install on a physical iPhone via TestFlight or ad-hoc/internal distribution.

## 2) Login and verify subscription sync

1. Open app on iPhone and login as a locksmith.
2. Confirm backend receives:
   - `POST /api/onesignal/subscribe`
   - payload includes `playerId`, `userId`, `userType: "locksmith"`

## 3) Send test push from OneSignal

1. In OneSignal dashboard, send a test push to the subscribed iOS device.
2. Include data payload fields:

```json
{
  "type": "NEW_JOB_ASSIGNED",
  "jobId": "<job_uuid>"
}
```

3. Verify:
   - Notification is delivered
   - Tap opens the app and deep-links correctly

## 4) Logout verification

1. Logout from app.
2. Confirm `POST /api/onesignal/unsubscribe` is called.
3. Re-login and confirm re-subscription works.

## Notes

- iOS notification delivery is now configuration-ready.
- Final end-to-end confirmation requires a real iOS device session.
