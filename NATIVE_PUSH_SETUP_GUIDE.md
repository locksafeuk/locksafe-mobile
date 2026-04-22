# LockSafe Native Push Notifications Manual Setup Guide

**Audience:** Beginner-friendly (no prior push experience required)  
**Project:** LockSafe Mobile (`uk.locksafe.app`)  
**Date:** 2026-04-22

### Before You Start (Prerequisites)
Please confirm you have:
- Firebase project access: **`locksafeuk-ea52e`**
- Apple Developer access (team: `4ZNRAB4A2S`)
- App Store Connect access for LockSafe app
- Google Play Console access for LockSafe app
- A real iPhone and Android device for testing
- EAS CLI and project checked out locally (`/home/ubuntu/locksafe-mobile`)

### Important URLs (bookmark these)
- Firebase Console: https://console.firebase.google.com/
- Apple Developer: https://developer.apple.com/account/
- Certificates, IDs & Profiles: https://developer.apple.com/account/resources/
- App Store Connect: https://appstoreconnect.apple.com/
- Google Play Console: https://play.google.com/console/
- Expo Notifications docs: https://docs.expo.dev/push-notifications/overview/
- Firebase Cloud Messaging docs: https://firebase.google.com/docs/cloud-messaging
- APNs provider docs: https://developer.apple.com/documentation/usernotifications/setting_up_a_remote_notification_server

### Part 1 - Firebase Console Setup (Android FCM)
#### Step 1. Open Firebase project
1. Go to https://console.firebase.google.com/
2. Click project **`locksafeuk-ea52e`**.

**Screenshot description:** You should see a dashboard with project name at top left and cards such as Analytics, Build, Run.

#### Step 2. Confirm Android app registration
1. In Firebase, click the gear icon (**Project settings**).
2. Open the **General** tab.
3. Under **Your apps**, confirm Android app exists with package name:
   - `uk.locksafe.app` (or the exact package used for production variant)
4. If missing, click **Add app -> Android**, enter package name, and save.

**Screenshot description:** In “Your apps”, Android apps appear with the Android logo and package ID.

#### Step 3. Verify Cloud Messaging enabled
1. In Project settings, open **Cloud Messaging** tab.
2. Check that Cloud Messaging API is available.
3. Note sender/project details for records (Project Number, Sender ID if shown).

#### Step 4. Create/verify service account key (for backend sending)
> Only required for backend or server-side sender.

1. Go to **Project settings -> Service accounts**.
2. Click **Generate new private key**.
3. Download JSON key file.
4. Store outside git repo (for example in a secure secrets manager).

**Never commit this file.**

Recommended secure storage options:
- 1Password/Bitwarden secret vault
- AWS Secrets Manager / GCP Secret Manager
- CI secret storage (GitHub Actions Secrets, etc.)

#### Step 5. Android notification channels plan
Define channels before coding:
- `jobs` (high priority): new jobs, job status changes
- `payments` (default): payout/payment updates
- `system` (low/default): announcements

Channel fields to define:
- Name (user-visible)
- Importance
- Sound/vibration
- Description

#### Step 6. (Optional but recommended) Prepare Firebase message templates
In Firebase Console -> Messaging:
- Create test templates for:
  - New Job Available
  - Job Assigned
  - Job Completed
  - Payment Received

Payload data convention for LockSafe:
```json
{
  "type": "NEW_JOB_ASSIGNED",
  "jobId": "<uuid>"
}
```

#### Step 7. Firebase testing tools available
- **Notifications composer** (quick tests)
- **Cloud Messaging API / HTTP v1** (programmatic tests)
- **Delivery metrics** and analytics in Firebase
- **Device token targeting** for deterministic QA

### Part 2 - Apple Developer Console Setup (iOS APNs)
#### Step 1. Access Apple Developer resources
1. Visit https://developer.apple.com/account/
2. Open **Certificates, Identifiers & Profiles**.
3. Confirm you are in team `4ZNRAB4A2S`.

#### Step 2. Confirm App ID push capability
1. Go to **Identifiers**.
2. Find app identifier for bundle ID: `uk.locksafe.app`.
3. Open it and ensure **Push Notifications** capability is enabled.
4. Save if changed.

**Screenshot description:** In capabilities list, “Push Notifications” should show enabled state (green check/active toggle).

#### Step 3. Choose APNs authentication method
You have two options:
1. **APNs Auth Key (.p8)** (recommended)
2. APNs certificates (legacy)

Use `.p8` unless there is a strict policy requiring certificate-based auth.

#### Step 4. Create APNs Auth Key (.p8) (recommended)
1. In Apple Developer account, open **Keys**.
2. Click **+** to create a key.
3. Enter key name (example: `LockSafe APNs Key`).
4. Enable **Apple Push Notifications service (APNs)**.
5. Register key and download `.p8` file (download once only).
6. Record:
   - Key ID
   - Team ID
   - Bundle ID(s)

Store `.p8` securely (not in repo).

#### Step 5. Provisioning profile/cert refresh (if needed)
If Push Notifications capability changed recently:
1. Regenerate provisioning profiles.
2. Ensure EAS uses updated profiles.
3. Rebuild app before retesting push.

#### Step 6. Configure iOS notification behavior in app build
In Expo config (`app.config.js`) ensure iOS permissions include notifications handling via `expo-notifications` plugin setup.

#### Step 7. iOS test sending options
Apple Developer console itself does not provide a full beginner message composer like Firebase for app-level APNs campaigns.
Common test methods:
1. **Backend test endpoint** (recommended for team workflows)
2. **APNs direct test** using provider token + HTTP/2 curl
3. **Xcode/device logs** to validate token registration and receipt

### Part 3 - App Store Connect Setup (if needed)
#### Step 1. App capability confirmation
1. Open https://appstoreconnect.apple.com/
2. Select LockSafe app.
3. Confirm app metadata matches bundle ID (`uk.locksafe.app`).

#### Step 2. TestFlight push validation
1. Upload Build 7 (or migration build) to TestFlight.
2. Add internal testers first.
3. Run push test suite:
   - app closed
   - app background
   - app foreground
   - notification tap deep-link route

#### Step 3. Production readiness checks
Before App Store submission:
- Push entitlement present
- No OneSignal SDK references in app binary
- APNs key valid and backend can send production pushes

### Part 4 - Google Play Console Setup (if needed)
#### Step 1. App and release track
1. Open https://play.google.com/console/
2. Select LockSafe app package.
3. Use **Closed testing** for migration build first.

#### Step 2. FCM-related checks
Google Play Console does not configure FCM directly, but verify:
- App package in Play matches Firebase Android app package.
- Uploaded AAB uses same package/signing lineage.
- Runtime permission `POST_NOTIFICATIONS` works on Android 13+.

#### Step 3. Closed testing push validation
Run tests with real testers/devices:
- Receive push when app killed
- Receive push when backgrounded
- Foreground behavior + in-app handling
- Tap action routes to expected screen

#### Step 4. Production configuration
Before production rollout:
- Delivery success rate acceptable in closed test
- No crashes from push initialization
- Alerting/monitoring dashboards ready

### End-to-End Testing Procedures (Required)
#### Test A: Send test notifications from Firebase Console
1. Open Firebase Console -> Messaging.
2. Create new notification.
3. Set title/body.
4. In advanced options, include custom data:
   - `type=NEW_JOB_AVAILABLE`
   - `jobId=<uuid>`
5. Choose Android test device token.
6. Send and verify on Android device.

Expected:
- Push appears in tray.
- Tap opens app and routes correctly.
- No crash on receipt or tap.

#### Test B: Send test notifications for iOS/APNs
Recommended path: use backend test endpoint with APNs sender.

Example request body:
```json
{
  "title": "LockSafe Test",
  "body": "APNs delivery validation",
  "data": {
    "type": "NEW_JOB_ASSIGNED",
    "jobId": "<uuid>"
  },
  "target": {
    "platform": "ios",
    "userId": "<locksmith-user-id>"
  }
}
```

Verify on iPhone:
- Received in background/killed states
- Tap deep-links to relevant screen
- Foreground receipt handled without app instability

#### Test C: Verify token lifecycle
1. Login as locksmith -> token should register.
2. Logout -> token should deactivate/unsubscribe.
3. Login again -> token should re-register.
4. Reinstall app -> new token is registered; old token marked inactive.

#### Test D: Pre-production regression checklist
- 20 cold launches with push enabled
- 20 cold launches with push denied
- Notification tap while app locked/backgrounded
- Deep link mapping for all supported notification types
- No startup crash observed

### Troubleshooting Guide
#### Problem: No push received on Android
Check:
- Device token exists and is active in backend
- Correct Firebase project (`locksafeuk-ea52e`)
- Notification channel exists and not muted by user
- App has `POST_NOTIFICATIONS` permission (Android 13+)

#### Problem: No push received on iOS
Check:
- Push Notifications capability enabled on App ID
- APNs key valid and not revoked
- Provisioning profile includes push capability
- Test on physical device (not simulator)

#### Problem: Notification arrives but tap does nothing
Check:
- Payload includes expected keys (`type`, `jobId`)
- App notification response listener is registered
- Deep-link route mapping includes notification type

#### Problem: App crash around push initialization
Check:
- Push registration deferred until after auth/UI stabilization
- No synchronous heavy work in app startup from push service
- Errors wrapped in try/catch with logs

### Security & Operations Notes
- Never commit service account JSON or APNs `.p8` files.
- Rotate keys if accidentally exposed.
- Restrict push send endpoints to admin/system service accounts.
- Keep audit logs for send attempts and failures.
- Add alerting on unusual send spikes and high failure rates.

### Definition of Done (manual setup)
Manual setup is complete only when:
- Firebase and Apple credential setup is validated
- Build receives notifications on both Android and iOS real devices
- Tap navigation works for job-related push types
- Closed/TestFlight testing passes with no startup regressions
- Team has documented credential owners and rotation policy