# Build 16 Release Notes (v1.0.2-build16)

**Release Date:** 24 April 2026  
**Build ID:** `bca43070-3f1c-47a4-9589-8336fd87853e`  
**Android Version Code:** `16`  
**AAB Artifact:** `/home/ubuntu/locksafe-mobile/build/locksafe-v1.0.2-build16.aab`

---

## Summary of Critical Fixes

Build 16 contains two high-priority production fixes:

1. **Auth persistence fixed**  
   The "Remember me" experience now persists correctly across app restarts.

2. **Push notifications fixed**  
   Android push moved to native FCM token flow and OneSignal runtime dependency was removed.

---

## Technical Changes Included

### 1) Authentication persistence / Remember me

- Improved auth payload parsing in `stores/authStore.ts`:
  - Added robust token extraction (`token`, `accessToken`, `authToken`, nested `data.token`)
  - Added robust user extraction (`user`, `locksmith`, nested `data.user`, `data.locksmith`)
- Updated startup initialization logic:
  - App restores cached remembered session immediately when available
  - Session revalidation now runs in background
  - Local remembered user state is preserved on transient validation failures
- Updated API 401 behavior in `services/api/client.ts`:
  - 401 handling now clears auth token without always deleting cached user profile
  - Prevents unnecessary forced sign-out behavior during temporary auth edge cases

### 2) Native push notifications (FCM/APNs)

- Implemented native push registration flow in `services/nativePushNotifications.ts`:
  - Uses `expo-notifications` + `expo-device`
  - Requests native device push token and syncs token to backend
  - Supports foreground and opened-notification handlers
- Updated root startup flow in `app/_layout.tsx`:
  - Deferred/lazy native push initialization for authenticated users
  - Added guarded registration and diagnostics if registration does not complete
- Hardened Android push configuration in `app.config.js`:
  - Requires valid Firebase `google-services.json` for non-dev Android builds
  - Supports EAS secret-based injection via `GOOGLE_SERVICES_JSON`
  - Ensures production Android builds cannot silently ship without FCM config

---

## How to Test Build 16

### A) Remember me test

1. Install Build 16 on a physical device.
2. Login with valid locksmith credentials and keep **Remember me** enabled.
3. Force-close the app completely.
4. Reopen the app.
5. Confirm user is still signed in and lands in locksmith flow.
6. Optional: repeat with temporary network disruption after login to verify session remains locally remembered.

**Expected result:** user remains signed in after restart when remember-me is enabled.

### B) Push notification test

1. Use a physical Android/iOS test device with Build 16 installed.
2. Login as locksmith and allow notification permission.
3. Trigger a backend notification event for that user (or send test push from notification admin tooling).
4. Confirm notification is received while app is:
   - foreground
   - background
   - terminated
5. Tap notification and verify deep-link/navigation opens relevant job context.

**Expected result:** push is delivered reliably and opens expected in-app destination.

---

## Known Issues / Constraints

- Push token generation requires **physical devices** (simulators/emulators are not reliable for final verification).
- Notification delivery still depends on backend event trigger correctness and environment credentials.
- No blocker identified in Build 16 for the two fixed critical issues.

---

## Deployment Checklist (Build 16)

- [ ] Confirm release artifact exists: `build/locksafe-v1.0.2-build16.aab`
- [ ] Confirm `versionCode = 16` in app config
- [ ] Verify `google-services.json` is present (or EAS secret injection configured)
- [ ] Run smoke test: login, restart app, verify remembered session
- [ ] Run smoke test: trigger and receive push on physical device
- [ ] Upload AAB to Google Play Console production release
- [ ] Add release notes summarizing both fixes
- [ ] Start staged rollout and monitor crash/push delivery metrics
