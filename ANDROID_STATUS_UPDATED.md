# LockSafe Android Status Update

**Generated:** 2026-04-18 (Europe/London)
**Project:** `/home/ubuntu/locksafe-mobile`
**Checked branch:** `main`
**Checked commit (HEAD):** `153a397b1f2d15f56e46b7347d4799de4eb690e3`

---

## 1) Git Pull Verification

### Pull Result
- Command run: `git pull --ff-only`
- Result: **Already up to date**
- HEAD before/after pull: unchanged (`153a397b1f2d15f56e46b7347d4799de4eb690e3`)

### Files Updated by Pull
- **None** (no changes fetched from remote in this run)

### Latest Commit
- **Commit:** `153a397b1f2d15f56e46b7347d4799de4eb690e3`
- **Author:** LockSafe Dev `<dev@locksafe.uk>`
- **Date:** 2026-04-18 15:21:03 +0000
- **Subject:** `Add Android analysis report for LockSafe deployment readiness`

---

## 2) Re-verification of Critical Issues

## 2.1 OneSignal Configuration Consistency

### Current State: ✅ Consistent (fixed)
Verified same OneSignal App ID in all required config sources:

- `app.config.js` (`EXPO_PUBLIC_ONESIGNAL_APP_ID` fallback):
  - `cd19d270-4a74-4bdf-b534-3287cfb8b4e4`
- `.env`:
  - `EXPO_PUBLIC_ONESIGNAL_APP_ID=cd19d270-4a74-4bdf-b534-3287cfb8b4e4`
- `eas.json`:
  - `development`, `development-device`, `preview`, `ios-simulator`, `production` profiles all use the same App ID.

**Verdict:** No current OneSignal App ID mismatch detected.

---

## 2.2 Authentication Guards in `app/(locksmith)` Routes

### Current State: ⚠️ Not fully enforced at route-layout level

Findings:
- `app/(locksmith)/_layout.tsx` defines stack screens but does **not** perform auth gating/redirect.
- `app/(locksmith)/(tabs)/_layout.tsx` defines tabs only; no auth guard.
- Locksmith screens consume `useAuthStore()` data, but explicit route protection (e.g., redirect unauthenticated users) is not consistently present in route layout.

Operational implication:
- App entry (`app/index.tsx`) redirects authenticated users to locksmith tabs.
- However, deep-link/direct route access protection is not clearly enforced in the locksmith layout itself.

**Verdict:** Prior “missing auth guards” concern is **still partially valid** from a route-protection perspective.

---

## 2.3 `api_key.json` Security

### Current State: ❌ Sensitive key file still present in project directory

Findings:
- File exists at project root: `api_key.json`
- Contains Apple API key material (`key_id`, `issuer_id`, private key string).
- Git status indicates it is currently **untracked** (not committed in current index), but it remains present on disk.
- `.gitignore` does **not** currently include `api_key.json` explicitly.

Risk:
- Local and operational credential exposure risk remains if the file is accidentally committed/shared.

**Verdict:** This issue is **not fully remediated**.

Recommended immediate actions:
1. Move `api_key.json` out of repository directory.
2. Add `api_key.json` to `.gitignore`.
3. Rotate/revoke key if there is any chance of prior exposure.
4. Use secure secret storage (CI secret vault / EAS secrets / environment-managed credentials).

---

## 2.4 OneSignal Backend Security Patch Status (Supplemental)

### Current State: ✅ Verified PASS
From uploaded/security verification reports:
- `POST /api/onesignal/send` now requires admin auth.
- `GET /api/onesignal/subscribe` requires auth + authorization checks.
- `POST /api/onesignal/unsubscribe` returns 404 for non-existent player IDs.

**Verdict:** Backend security patch verification appears complete and passing.

---

## 3) Android Build Status

## 3.1 Remote EAS Build Availability

### Current State: ⚠️ Could not verify due permissions
Attempt to run:
- `eas build:list --platform android --limit 5 --non-interactive --json`

Result:
- Authorization error: `Entity not authorized: AppEntity[...]`

**Verdict:** Remote “new builds available” status could not be confirmed from current agent credentials.

---

## 3.2 Local Build Artifacts (`/build`)

### Current State: ✅ Android AAB artifacts found
Latest Android artifacts:
- `build/locksafe-v1.0.2.aab` (mtime 2026-04-18 13:07:03 UTC)
- `build/locksafe-v1.0.2-build12.aab` (mtime 2026-04-18 13:07:02 UTC)
- `build/locksafe.aab` (mtime 2026-04-14 13:20:04 UTC)

APK artifacts:
- No `.apk` found in `/build` at verification time.

---

## 3.3 Version / Build Codes

### Current State
- App version (`package.json`): `1.0.2`
- Android `versionCode` (`app.config.js`): `12`
- iOS `buildNumber` (`app.config.js`): `4`
- `eas.json` production Android build type: `app-bundle` (AAB)

**Verdict:** Android versioning appears coherent for v1.0.2 / versionCode 12.

---

## 4) Overall Current Codebase State

### Observations
- Pull introduced no new remote changes in this run.
- Working tree contains multiple local/untracked artifacts (reports, build files, helper scripts, etc.).
- `eas.json` has local uncommitted edits in iOS submit fields (`ascAppId`, `appleTeamId`).

### Important deployment doc signal
- `docs/DEPLOYMENT_STATUS.md` still marks Android push notifications as pending FCM V1 setup in OneSignal.

---

## 5) Deployment Readiness Assessment (Android)

### Ready now?
**Not fully ready for production deployment yet.**

### What is fixed
- ✅ OneSignal App ID mismatch appears resolved across `app.config.js`, `.env`, and `eas.json`.
- ✅ OneSignal backend endpoint security fixes are documented and verified PASS.
- ✅ Android AAB artifacts exist locally with expected version scheme.

### Remaining blockers / risks
1. ❌ `api_key.json` with sensitive key content still present in repo directory (untracked but exposed locally).
2. ⚠️ Route-level locksmith auth guarding is not clearly enforced in `app/(locksmith)` layouts.
3. ⚠️ Remote EAS Android build status cannot be confirmed with current account permissions.
4. ⚠️ Deployment doc still indicates Android push delivery dependency: OneSignal FCM V1 pending.

---

## 6) Recommended Next Actions (Priority Order)

1. **Credential hygiene (critical):** remove/relocate `api_key.json`, ignore it, rotate key if needed.
2. **Locksmith route protection:** enforce auth check in `app/(locksmith)/_layout.tsx` and redirect unauthenticated users.
3. **EAS access fix:** authenticate with account having project access and re-run `eas build:list` for Android.
4. **Push readiness:** complete/confirm FCM V1 setup in OneSignal and update deployment status doc.
5. **Final pre-release pass:** smoke test login, protected route behavior, push registration, and release build upload path.

---

## 7) Final Verdict

- The repository does include important fixes (especially OneSignal configuration and backend OneSignal security hardening),
- but **Android deployment should still be treated as blocked** until sensitive credential handling and route-protection concerns are fully resolved (and remote build visibility is confirmed).
