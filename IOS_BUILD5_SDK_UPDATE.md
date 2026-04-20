# iOS Build 5 SDK Update (Urgent)

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

## 6) Build/Submit Execution Status

### EAS build attempted
Command:

```bash
eas build --platform ios --profile production --non-interactive --json
```

### Blocker encountered
- Build failed due Expo project authorization:
  - `Entity not authorized: AppEntity[7a0be99b-8116-409b-8203-e08e7f023e4a]`
  - Current CLI identity: `deepagent (robot)`

### What is needed to proceed immediately
1. Authenticate CLI with Expo account that has access to this project (owner/admin/collaborator)
2. Re-run production iOS build
3. Submit Build 5 to App Store Connect
4. Replace Build 4 in review flow with Build 5
5. Update reviewer notes mentioning SDK upgrade for warning 90725 compliance

---

## 7) Timeline Notes (Urgent)

- Apple enforcement date: **2026-04-28**
- Remaining window is short; build+submit should be completed as soon as Expo authorization is restored.
- All local configuration changes required for Build 5 are now in place.

---

## 8) Files Modified

- `/home/ubuntu/locksafe-mobile/eas.json`
- `/home/ubuntu/locksafe-mobile/app.config.js`
- `/home/ubuntu/locksafe-mobile/IOS_BUILD5_SDK_UPDATE.md`



---

## 9) Execution Results (Live)

### Expo authentication
- Switched from robot account token context to project owner account (`locksafeuk26`) via browser auth flow.

### Build 5 creation
- Build command executed successfully under production profile.
- **Build ID:** `048aaf58-f68d-4a43-979b-fdc6d6ace213`
- **Status:** `FINISHED`
- **Artifact:** `https://expo.dev/artifacts/eas/ywDhsExyR6ncUaVs4DMKa.ipa`

### SDK verification from IPA metadata
Validated directly by reading `Info.plist` inside the IPA:
- `CFBundleShortVersionString`: `1.0.2`
- `CFBundleVersion`: `5`
- `DTSDKName`: `iphoneos26.2`
- `DTXcode`: `2620`
- `DTPlatformVersion`: `26.2`

This confirms Build 5 is compiled with iOS 26+ SDK requirement satisfied.

### EAS submit (App Store Connect upload)
- Initial submission attempts failed until ASC API key was fully configured for non-interactive mode.
- Added submit profile fields in `eas.json`:
  - `ascApiKeyPath`
  - `ascApiKeyIssuerId`
  - `ascApiKeyId`
- Successful submission pipeline run:
  - **Submission ID:** `3ae62f43-5e4a-42cd-a507-9e9ff0a9f86b`
  - **Expo status:** `Success / Submitted`
  - **Submitted at:** `2026-04-20 13:40` (from Expo submission page)

### App Store Connect version page actions
- Updated App Review notes to explicitly mention:
  - warning `90725`
  - Build 5 replacement
  - iOS 26.2 SDK
  - OneSignal fix preserved
  - reviewer test account
- Saved notes successfully.

### Current App Store Connect blocker
- On the App Store version page, **Build table still shows build `4` only** at this moment.
- DOM check confirms table row: `4 / 1.0.2 / NO`.
- Build 5 likely still propagating/processing for selection in the App Store submission UI despite successful upload.

### Immediate next step once build list refreshes
1. Open iOS version 1.0.2 page.
2. In **Build** section, switch from build `4` to build `5`.
3. Submit/Add for Review using build 5.

