# Build 16 Critical Fixes (Android)

Date: 2026-04-24

## Scope
- Fix persistent login (Remember Me / always signed in)
- Fix native Android push registration reliability (no OneSignal runtime)
- Prepare Android build metadata for Build 16

## Root cause analysis

### 1) Users logged out after app close
Primary causes identified:
1. Session bootstrap depended too heavily on immediate server session validation, which can fail transiently.
2. `auth_token` was being cleared on any 401 path in the API client, and `user_data` was also being deleted, causing local remembered identity to disappear.
3. Login/register flows only persisted token if `response.token` existed in one exact shape; any alternative payload shape could skip token persistence.

### 2) Android push notifications not arriving
Primary causes identified:
1. Build/runtime could proceed without guaranteed Firebase config (`google-services.json`), preventing reliable FCM token issuance on Android.
2. Native token type values from device/backend expectations can vary (`fcm`, `fcmv1`), causing registration mismatch in some backend implementations.
3. Push registration failures were not explicitly surfaced in root layout flow for easier diagnosis.

## Code changes made

### Auth persistence
- `stores/authStore.ts`
  - Added robust token/user extraction helpers (`extractAuthToken`, `extractAuthUser`) to support multiple backend payload shapes.
  - `initialize()` now restores cached session immediately when local token or cached user exists, then validates server session in background.
  - Keeps remembered local session on transient session validation failures.
  - Ensures token persistence in both login and register flows when token exists in any supported field.

- `services/api/client.ts`
  - On 401 handling, now clears only `auth_token` (keeps `user_data`) to avoid destroying local remembered session context due to transient refresh/session endpoint behavior.

### Native Android push
- `services/nativePushNotifications.ts`
  - Normalized device token and token type parsing.
  - Added stronger diagnostics when token acquisition fails (including Android/Firebase hint).
  - Added tokenType fallback attempts during backend registration (`fcm` / `fcmv1` on Android).
  - Preserves successful tokenType after first successful registration.

- `app/_layout.tsx`
  - Added explicit warning log when push registration does not complete for authenticated user.

- `app.config.js`
  - Android `versionCode` set to **16**.
  - Added google services file resolution with support for secret-injected `GOOGLE_SERVICES_JSON` -> generated file.
  - Added Android build-context guard logic around missing Firebase config, while avoiding hard failures for non-Android config commands.

- `.gitignore`
  - Added:
    - `google-services.json`
    - `google-services.generated.json`

- `app/(locksmith)/(tabs)/settings.tsx`
  - Fixed logout route redirect to `/(auth)/locksmith-login`.

## Validation run

1. `APP_VARIANT=development npx expo-doctor` -> **17/17 checks passed**.
2. `npx expo config --type public --json` -> resolves with Android `versionCode: 16`.
3. `GOOGLE_SERVICES_JSON='<json>' npx expo config --type public --json` -> resolves `android.googleServicesFile: ./google-services.generated.json`.
4. Runtime static checks confirm no active OneSignal runtime/plugin references in app code/build config.

## Build status

Attempted production AAB build:
- Command: `npx eas build --platform android --profile production --non-interactive`
- Result: **Blocked by Expo account permissions** for current VM auth context (`Entity not authorized: AppEntity[...]`).

## Remaining required actions to finish release

1. Run EAS build from the correct Expo account that owns project `7a0be99b-8116-409b-8203-e08e7f023e4a`.
2. Ensure Firebase Android config is available via either:
   - `google-services.json` at repo root, or
   - EAS secret env var `GOOGLE_SERVICES_JSON` (recommended).
3. Install Build 16 on a physical Android device and verify:
   - user remains signed in after full app close/reopen,
   - push token registers successfully,
   - push delivery works end-to-end from backend notification trigger.
