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
- Existing Build 20 code commit detected locally on `main`:
  - `439cec9` — *Add Build 20 account deletion flow in settings*
- Push status: pending final push after docs commit.

### Step 2: Build iOS Build 20
- Command attempted:
  - `eas build --platform ios --profile production --non-interactive`
- Result: **Blocked by Expo authorization** in current VM session.
- Error summary: current authenticated Expo identity does not have access to the target app entity.

### Step 3: Download IPA
- Target path prepared:
  - `build/locksafe-v1.0.2-build20-ios.ipa`
- Status: **Pending** (requires successful Build Step 2).

### Step 4: Submit to App Store Connect
- Command planned:
  - `eas submit --platform ios --latest`
- Status: **Pending** (requires successful Build Step 2 and valid Expo account access).

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

## Next Steps
1. Authenticate with the correct Expo account for this project (or provide valid `EXPO_TOKEN` for `contact@locksafe.uk`).
2. Run iOS production build for Build 20.
3. Download IPA to `build/locksafe-v1.0.2-build20-ios.ipa`.
4. Submit the latest build to App Store Connect.
5. Paste `APPLE_BUILD20_SUBMISSION_NOTES.md` into App Review Notes and attach the screen recording per guide.
