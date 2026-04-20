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
