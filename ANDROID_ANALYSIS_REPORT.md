# LockSafe Android Analysis Report

**Date:** 2026-04-18  
**Project:** `/home/ubuntu/locksafe-mobile`  
**Scope:** Android configuration, initialization flow, push setup, build status, and Play Console readiness

---

## Executive Summary

The Android app is in a generally deployable state from a code perspective, and the OneSignal launch-race fix pattern used for iOS appears to be correctly applied to shared native initialization logic used by Android as well.

However, deployment readiness is **not yet fully green** due to environment/operational gaps:

1. **OneSignal Android delivery is still blocked by FCM V1 setup** (documented in project status docs).
2. **Google Play automated submit credential file is referenced but missing** (`google-service-account.json`).
3. **Remote EAS Android build history could not be fetched** from this environment due Expo account authorization limits.

Additionally, I found sensitive credential artifacts in the repo that should be removed/rotated before broader release hygiene checks.

---

## 1) Project Configuration Analysis

### 1.1 app.json / app.config.js status

- `app.json` is **not present** in this repo.
- The project uses **dynamic Expo config** via `app.config.js`.

This is valid, but operational docs still mention `app.json` in multiple places and should be updated to avoid confusion.

### 1.2 Android package name, version name, version code

From `app.config.js`:

- **Version name:** `1.0.2`
- **Android versionCode:** `12`
- **Android package (production):** `uk.locksafe.app`
- **Android package (variant-dependent):**
  - dev: `uk.locksafe.app.dev`
  - preview: `uk.locksafe.app.preview`
  - prod: `uk.locksafe.app`

### 1.3 Android build configuration

From `eas.json` and Expo config:

- Build profiles:
  - `development` / `development-device` / `preview` use `buildType: "apk"`
  - `production` uses `buildType: "app-bundle"` (AAB)
- Android SDK levels (`expo-build-properties`):
  - `compileSdkVersion: 35`
  - `targetSdkVersion: 35`
  - Kotlin: `2.0.21`
- OneSignal App ID is consistently set across build profiles.

### 1.4 Existing Android builds in local build directory

Found in `/home/ubuntu/locksafe-mobile/build`:

- `locksafe.aab`
- `locksafe-v1.0.2.aab`
- `locksafe-v1.0.2-build12.aab`

No APK artifacts found in this folder at analysis time (only AABs and iOS IPAs).

---

## 2) Code Review for Critical Android Issues

### 2.1 OneSignal initialization race-condition check (vs iOS issue)

Reviewed:

- `services/pushNotifications.ts`
- `app/_layout.tsx`

Findings:

- `PushNotificationService.initialize()` has a **concurrency guard** using `initializingPromise` and `initialized` flags.
- Root layout now performs **lazy registration after authenticated user is available**, rather than eager startup initialization.
- Initialization and registration paths are wrapped with error handling to avoid crash loops.

**Conclusion:** Android uses the same shared initialization flow and appears protected against the prior startup race pattern that caused iOS crashes.

### 2.2 App initialization flow on Android

Flow is stable:

1. Auth store initializes from secure storage.
2. Push registration attempts only when authenticated locksmith exists.
3. Logout path unregisters prior user subscription when user becomes null.

No obvious Android launch-crash pattern found in this flow.

### 2.3 Android-specific crash-prone patterns / risks

No immediate hard-crash code pattern was identified, but these risks should be tracked:

1. **Permission surface is broad in manifest config**:
   - Includes `ACCESS_BACKGROUND_LOCATION`, `READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE`, and `POST_NOTIFICATIONS`.
   - On modern Android + Play policy, background location and legacy storage permissions can increase review friction if not justified.

2. **Background location permission request in runtime flow**:
   - `startLocationStreaming()` requests background permission opportunistically.
   - Not a crash risk itself, but can affect UX/review policy expectations.

3. **Map provider dependency on Google Maps key correctness**:
   - `JobMap` forces `PROVIDER_GOOGLE` on Android; missing/invalid key can break map rendering experience.

### 2.4 Android push notification setup review

- Native SDK dependency: `react-native-onesignal` present.
- Expo plugin: `onesignal-expo-plugin` configured.
- Backend subscribe/unsubscribe integration exists.
- Security posture of backend OneSignal endpoints is documented as fixed/verified (Apr 18, 2026).

**Blocking operational gap:** project docs still state Android push is pending due FCM V1 setup in OneSignal.

---

## 3) Build Status Check

### 3.1 Local artifacts

Android artifacts exist locally (AABs), including a file named with `build12`, matching current Android `versionCode: 12`.

### 3.2 EAS build history (remote)

Attempt to fetch Android build history via EAS CLI returned **authorization error** for current account context:

- Viewer not authorized for app entity `7a0be99b-8116-409b-8203-e08e7f023e4a`

So remote Android build history could not be verified from this environment.

### 3.3 EAS profile/build config

Android EAS profiles are correctly defined for APK (internal/dev/preview) and AAB (production).

---

## 4) Google Play Console Status

### 4.1 Submit configuration present

`eas.json` includes Android submit config:

- `serviceAccountKeyPath: "./google-service-account.json"`
- `track: "production"`
- `releaseStatus: "completed"`

### 4.2 Credentials / key files status

- `google-service-account.json` is **missing** from repo path expected by `eas.json`.
- Therefore automated `eas submit --platform android` is not currently runnable from this checkout without external credential provisioning.

### 4.3 Deployment information from docs

- `docs/DEPLOYMENT_STATUS.md` says Android submitted to Google Play, but also states Android push is pending FCM V1.
- This implies Play listing may exist, but notification readiness remains incomplete.

---

## 5) Findings Summary (Priority)

### High Priority (fix before Android production rollout)

1. **Complete FCM V1 in OneSignal for Android push delivery.**
2. **Provide secure Google Play service account credential path for EAS submit** (or use EAS managed credentials/workflow).
3. **Audit/remove sensitive credential files from repository and rotate compromised keys** (see notes below).

### Medium Priority

4. Align docs from `app.json` references to `app.config.js` to avoid setup mistakes.
5. Reassess necessity of background location and legacy storage permissions for Play policy minimization.

### Low Priority

6. Add explicit Android validation pass (physical device) for push open/foreground behaviors after FCM setup.

---

## 6) Notable Security/Operational Hygiene Notes

During repo inspection, credential-like material appears committed in project files (outside this Android subtask scope but important):

- App Store/API credential artifacts and test login material are present in tracked content.

Recommendation:

- Move all secrets to secure secret management.
- Remove sensitive files from git history where applicable.
- Rotate exposed keys/tokens/passwords immediately.

---

## 7) Recommended Pre-Deployment Android Checklist

1. Configure OneSignal Android with valid Firebase FCM V1 credentials.
2. Generate a fresh Android production AAB (`eas build --profile production --platform android`).
3. Validate on at least one physical Android 13+ device:
   - App launch and login
   - Push permission flow
   - Foreground/background notification behavior
   - Deep-link routing on push tap
4. Confirm Play submit credentials are accessible to CI/release environment.
5. Review and minimize Android permission list based on actual feature usage.
6. Run a release-security scrub for secrets in repo and build artifacts.

---

## 8) Current Version / Build Snapshot

- App version: `1.0.2`
- Android versionCode: `12`
- Android package (prod): `uk.locksafe.app`
- Local Android artifacts found: multiple `.aab` files (including `locksafe-v1.0.2-build12.aab`)
- Remote EAS Android history: not accessible from current authenticated account context

---

## Final Assessment

**Android code path is stable enough for continued QA and release prep**, and the OneSignal race-condition class of issue appears addressed in shared initialization logic.

**Primary blockers are operational/configuration-related** (FCM V1 + submit credentials + release hygiene), not immediate Android app crash defects from the reviewed code.
