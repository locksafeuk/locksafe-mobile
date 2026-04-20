# iOS Build 5 SDK Update (Urgent)

## COMPLETION STATUS

✅ **COMPLETE — Build 5 submitted and in review**

- **Final Submission Timestamp:** **Apr 20, 2026 at 3:10 PM (Europe/London)**
- **Current App Store Connect State:** **Waiting for Review**
- **SDK Compliance:** **Achieved** (`90725` addressed with iOS 26.2 SDK / Xcode 2620)
- **Submission Completion Report:** [`IOS_BUILD5_SUBMISSION_COMPLETE.md`](./IOS_BUILD5_SUBMISSION_COMPLETE.md)

---

**Project:** `locksafe-mobile`  
**Date:** 2026-04-20  
**Deadline:** 2026-04-28 (8 days remaining at kickoff)  
**Reason:** Apple warning `90725` – app must be built with iOS 26 SDK or later.

---

## 1) Current Configuration Audit (Before Changes)

### `eas.json` (production profile)
- `build.production.ios.credentialsSource`: `remote`
- No explicit iOS build image set
- No explicit iOS build configuration set

### `app.config.js`
- `expo.version`: `1.0.2`
- `ios.buildNumber`: `4`
- `android.versionCode`: `12`

### `package.json`
- `expo`: `~52.0.0`
- No immediate dependency mismatch detected for current project lockfile

---

## 2) Changes Applied for Build 5

### `eas.json`
Updated production iOS build profile:

- Added `ios.image: "latest"` (forces latest EAS macOS/Xcode image, required to move off older SDK image)
- Added `ios.buildConfiguration: "Release"`

Resulting production iOS config:

```json
"ios": {
  "credentialsSource": "remote",
  "image": "latest",
  "buildConfiguration": "Release"
}
```

### `app.config.js`
- Updated `ios.buildNumber` from `4` → `5`
- Kept app semantic version at `1.0.2` (required)
- Updated Android build number for consistent forward incrementing:
  - `android.versionCode`: `12` → `13`

---

## 3) Expo SDK / Dependency Verification

Command run:

```bash
npx expo install --check
```

Result:
- `Dependencies are up to date`
- No forced Expo SDK bump required by dependency check at this stage

---

## 4) OneSignal Crash/Race Fix Verification (Still Present)

### Verified in `services/pushNotifications.ts`
- Concurrency guard exists:
  - `private initializingPromise: Promise<void> | null = null;`
- `initialize()` exits early if already initialized
- Concurrent calls await in-flight initialization promise
- Permission request wrapped safely:
  - `requestPermission(true).catch(() => undefined)`

### Verified in `app/_layout.tsx`
- No eager startup `initialize()` call
- Lazy registration only when authenticated locksmith exists:
  - `await pushNotificationService.registerUser(currentUserId, 'locksmith')`
- Sync wrapped in `try/catch` to avoid launch crash

---

## 5) App Store Connect State Verification

Checked directly in App Store Connect:
- App: **LockSafe - Locksmith Partner**
- Current iOS version: **1.0.2**
- Current submitted item status: **Waiting for Review**
- Previous submission entry: **Removed**

---

## 6) Build/Submit Execution Status (Resolved)

### EAS build execution
Command used:

```bash
eas build --platform ios --profile production --non-interactive --json
```

Result:
- Build completed successfully under authorized Expo project account.
- **Build ID:** `048aaf58-f68d-4a43-979b-fdc6d6ace213`
- **Status:** `FINISHED`
- **Artifact:** `https://expo.dev/artifacts/eas/ywDhsExyR6ncUaVs4DMKa.ipa`

### SDK verification from IPA metadata
Validated directly from `Info.plist` in the generated IPA:
- `CFBundleShortVersionString`: `1.0.2`
- `CFBundleVersion`: `5`
- `DTSDKName`: `iphoneos26.2`
- `DTXcode`: `2620`
- `DTPlatformVersion`: `26.2`

Compliance confirmation:
- ✅ Build 5 compiled with iOS 26.2 SDK (meets Apple 90725 requirement)

### EAS submit + App Store Connect submission
- **Submission ID:** `3ae62f43-5e4a-42cd-a507-9e9ff0a9f86b`
- **Expo status:** `Success / Submitted`
- Build 5 finished Apple processing and became selectable in App Store Connect
- Build 4 replaced with Build 5 in the active submission
- App resubmitted for review with updated reviewer notes
- **Date Submitted:** **Apr 20, 2026 at 3:10 PM (Europe/London)**

---

## 7) Timeline Notes (Final)

- Apple enforcement date: **2026-04-28**
- SDK compliance completed on **2026-04-20** (8 days before enforcement)
- Review queue status after resubmission: **Waiting for Review**

---

## 8) Files Modified

- `/home/ubuntu/locksafe-mobile/eas.json`
- `/home/ubuntu/locksafe-mobile/app.config.js`
- `/home/ubuntu/locksafe-mobile/IOS_BUILD5_SDK_UPDATE.md`
- `/home/ubuntu/locksafe-mobile/IOS_BUILD5_SUBMISSION_COMPLETE.md`

---

## 9) Final Outcome

- ✅ Apple warning `90725` addressed
- ✅ Build 5 selected and submitted for App Review
- ✅ iOS SDK compliance achieved before deadline
- ✅ Crash-fix lineage preserved in reviewed binary

