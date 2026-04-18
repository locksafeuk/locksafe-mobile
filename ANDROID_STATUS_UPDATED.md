# LockSafe Android Status Update

**Updated:** 2026-04-18 (Europe/London)
**Project:** `/home/ubuntu/locksafe-mobile`
**Checked branch:** `main`
**Checked commit (HEAD before fixes):** `a53add0a86a4f463046899c72f9c712dcd96eceb`

---

## 1) Scope of This Fix Pass

This pass addressed the remaining deployment blockers identified after re-verification:

1. Secure handling of `api_key.json`
2. Strict locksmith route-level auth guards (deep-link protection)
3. Final readiness validation for Android build artifact and versioning
4. Documentation updates reflecting current status

---

## 2) Security & Auth Fixes Applied

## 2.1 Credential Hygiene (`api_key.json`) — ✅ Resolved

### Changes made
- Moved `api_key.json` out of the repository root to a secure local path:
  - `/home/ubuntu/secure-secrets/api_key.json`
- Added explicit ignore rule to `.gitignore`:
  - `api_key.json`

### Verification
- `api_key.json` no longer exists in repo root.
- `git ls-files api_key.json` returns no tracked file.
- Repository text scan found no in-repo private key PEM block exposure.

### Note
If this key was ever shared/exposed previously, rotate/revoke it as a defense-in-depth step.

---

## 2.2 Locksmith Route-Level Auth Guard — ✅ Resolved

### File updated
- `app/(locksmith)/_layout.tsx`

### Guard logic now enforced
- Waits for auth bootstrap (`isInitialized`) before route decision.
- Shows a loading state while auth initialization is in progress.
- Redirects unauthenticated/non-locksmith users to:
  - `/(auth)/locksmith-login`
- Renders locksmith stack only when authenticated locksmith session exists.

### Deep-link impact
- Direct/deep linking to any route under `app/(locksmith)` now hits the guarded parent layout first and is blocked for unauthenticated users.

---

## 2.3 OneSignal Backend Security Patch Status — ✅ Previously Verified, still valid

From existing verification artifacts:
- `POST /api/onesignal/send` requires admin authentication
- `GET /api/onesignal/subscribe` enforces auth + authorization
- `POST /api/onesignal/unsubscribe` returns 404 for unknown player IDs

No regression introduced by this mobile fix pass.

---

## 3) Final Android Readiness Verification

## 3.1 App Configuration / Versions — ✅ Verified

- App version: `1.0.2` (`package.json`, `app.config.js`)
- Android `versionCode`: `12` (`app.config.js`)
- iOS `buildNumber`: `4` (`app.config.js`)
- Android production build type: `app-bundle` (`eas.json`)

## 3.2 AAB Artifact Check — ✅ Verified

- `build/locksafe-v1.0.2-build12.aab` exists
- Archive structure validated (AAB zip readable)

## 3.3 OneSignal App ID Consistency — ✅ Verified

`cd19d270-4a74-4bdf-b534-3287cfb8b4e4` remains consistent across:
- `app.config.js`
- `.env`
- `eas.json` build profiles

---

## 4) Operational Items (Non-code)

These are not code defects but still part of production operations:

1. **OneSignal Android FCM V1 setup** in OneSignal dashboard (required for Android push delivery in production).
2. **EAS/Play submission credentials/access** verification for remote submission automation.

---

## 5) Deployment Readiness Verdict

## Codebase readiness: ✅ Deployment-ready

From a mobile code/security perspective, the previously blocking issues are resolved:
- Sensitive local credential file removed from repo path + ignored
- Strict route-level auth guard implemented for locksmith routes
- Versioning and AAB artifact checks are coherent for `1.0.2 (versionCode 12)`

## Operational readiness caveat: ⚠️ Pending external setup

Android push notification delivery in production still depends on completing FCM V1 setup in OneSignal and ensuring final store submission credentials/access are in place.

---

## 6) Files Changed in This Pass

1. `.gitignore`
   - Added `api_key.json`
2. `app/(locksmith)/_layout.tsx`
   - Added strict auth/deep-link guard and init loading state
3. `ANDROID_STATUS_UPDATED.md`
   - Updated findings and deployment-readiness assessment
