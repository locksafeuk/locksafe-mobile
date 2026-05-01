# Build 20 Submission Report

## Project
- **App:** LockSafe Mobile (iOS)
- **Version:** 1.0.2
- **Build Number:** 20
- **Repository:** `/home/ubuntu/locksafe-mobile`
- **Date:** 2026-05-01

## What Was Added in Build 20
- Settings screen now includes a **Delete Account** button in a dedicated **Danger Zone** section.
- Implemented **two-step confirmation** to avoid accidental deletion:
  1. Warning alert
  2. Confirmation modal requiring typed `DELETE`
- Added account deletion API integration in auth service:
  - Primary: `DELETE /api/locksmith/account`
  - Fallback: `DELETE /api/user/delete` on 404/405
- Added post-deletion cleanup:
  - Local logout/session cleanup
  - Redirect to login screen
- iOS build number incremented to **20** (`app.config.js`).

## Build & Submission Execution Status

### Step 1: Commit Changes
- Build 20 account deletion implementation commit already present:
  - `439cec9` — *Add Build 20 account deletion flow in settings*
- Build 20 Apple documentation commit pushed:
  - `8896949` — *Add Build 20 Apple review guide, notes, and submission report*

### Step 2: Build iOS Build 20
- Initial build attempts failed due local native iOS project inconsistencies (OneSignal extension duplication in generated iOS project).
- Resolution applied: removed local generated `ios/` folder and rebuilt using Expo managed prebuild path.
- Successful EAS build:
  - **Build ID:** `619972eb-66b7-4c4f-b8fd-34beb1eed419`
  - **Status:** `FINISHED`
  - **Build URL:** `https://expo.dev/artifacts/eas/d41U7iDUbJT7HNeUbUdg1v.ipa`

### Step 3: Download IPA
- Download completed.
- Saved to:
  - `build/locksafe-v1.0.2-build20-ios.ipa`

### Step 4: Submit to App Store Connect
- `eas submit` schedules submissions, but CLI returns a generic completion error in this environment.
- Independent App Store Connect API verification confirms Build 20 is uploaded and valid:
  - **App:** `uk.locksafe.app`
  - **Build:** `20`
  - **Processing State:** `VALID`
  - **Uploaded Date:** `2026-05-01T09:01:23-07:00`

## How to Test Account Deletion
1. Sign in with test account:
   - Email: `amiosif@icloud.com`
   - Password: `demo1234`
2. Open **Settings** tab.
3. Scroll to **Danger Zone**.
4. Tap **Delete Account**.
5. Confirm first warning by tapping **Continue**.
6. Type **DELETE** in the modal.
7. Tap **Delete Account**.
8. Confirm user is logged out and redirected to login.

## Artifacts Created
- `APPLE_SCREEN_RECORDING_GUIDE.md`
- `APPLE_BUILD20_SUBMISSION_NOTES.md`
- `BUILD20_SUBMISSION_REPORT.md`
- IPA: `build/locksafe-v1.0.2-build20-ios.ipa`

## Next Steps
1. In App Store Connect, attach Build 20 to the active app version for review (if not auto-attached).
2. Paste content from `APPLE_BUILD20_SUBMISSION_NOTES.md` into **App Review Notes**.
3. Upload screen recording evidence following `APPLE_SCREEN_RECORDING_GUIDE.md`.
4. Submit the version for review.
