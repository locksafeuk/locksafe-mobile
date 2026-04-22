# LockSafe Android v1.0.2 (Build 12) — Pre-Deployment Test Report

**Date:** 18 April 2026  
**Package:** uk.locksafe.app  
**Build:** locksafe-v1.0.2-build12.aab  
**SHA256:** e87530f9220548ed0dc69cccf761fbf17c5c03dc877e084379b9571dd2c2e362

---

## ⛔ DEPLOYMENT RECOMMENDATION: DO NOT DEPLOY

2 critical issues and 1 high-severity issue must be resolved before this build can be deployed to Google Play.

| Severity | Count |
|----------|-------|
| 🔴 Critical | 2 |
| 🟠 High | 1 |
| 🟡 Medium | 5 |
| 🔵 Low/Info | 2 |

---

## Test Case Results

| TC# | Test Case | Result | Bugs |
|-----|-----------|--------|------|
| TC1 | Build Integrity & Configuration | ❌ FAIL | BUG-01 (Critical), BUG-06, BUG-07 |
| TC2 | App Launch & Init Stability | ✅ PASS | None |
| TC3 | Authentication Flow | ✅ PASS | BUG-03, BUG-08 |
| TC4 | Registration Flow | ❌ FAIL | BUG-04, BUG-05 |
| TC5 | OneSignal API Security Fixes | ✅ PASS | BUG-09 |
| TC6 | Dashboard & Navigation Auth Guard | ❌ FAIL | BUG-02 (Critical) |
| TC7 | API Client Robustness | ❌ FAIL | BUG-10 |
| TC8 | Sensitive Data Exposure Audit | ❌ FAIL | BUG-11 (High) |

---

## Bugs & Issues

### 🔴 BUG-01: OneSignal App ID Mismatch Between Source and Production AAB [CRITICAL]

**Location:** `base/assets/app.config` inside AAB vs `.env`, `eas.json`, `app.config.js`

The production AAB embeds OneSignal App ID `os_v2_app_zum5e4ckorf57njugkd47ofu4rcdyx2ce7feswm64qwyyqgmhhub3w4gqfehs4i4x53jeo5bjvd5gtelc7kmnciym6d47dottzvjddy` but every source file and build profile references `cd19d270-4a74-4bdf-b534-3287cfb8b4e4`. The runtime resolution chain reads `Constants.expoConfig?.extra?.oneSignalAppId` first, which resolves to the AAB-embedded value.

**Impact:** Push notifications may target the wrong OneSignal project or fail entirely. Deployment blocker.

---

### 🔴 BUG-02: No Authentication Guard on Locksmith Routes [CRITICAL]

**Location:** `app/(locksmith)/_layout.tsx`

The locksmith dashboard, jobs, earnings, and settings screens have zero authentication checks. Navigating directly to `/(locksmith)/(tabs)` renders the full dashboard without login. Verified — all four tabs are fully accessible without any auth token.

**Impact:** Deep links or push notification navigation could land unauthenticated users on protected screens. On web, this is a direct security issue.

**Fix:** Add auth guard in `(locksmith)/_layout.tsx` that redirects to login when `user` is null.

---

### 🟠 BUG-11: Apple App Store Connect API Private Key Exposed on Disk [HIGH]

**Location:** `/home/ubuntu/locksafe-mobile/api_key.json`

Contains Apple App Store Connect API private key (Key ID: CN472U9F7K). Not tracked in git but NOT in `.gitignore`. A single `git add .` would commit this key.

**Fix:** Add `api_key.json` to `.gitignore` immediately.

---

### 🟡 BUG-03: "Forgot Password?" Link is Non-Functional [MEDIUM]

**Location:** `app/(auth)/locksmith-login.tsx`

The "Forgot password?" element is a `Pressable` with no `onPress` handler.

---

### 🟡 BUG-04: Backend Missing Server-Side Validation for Registration [MEDIUM]

**Location:** `POST /api/locksmiths/register`

Backend does not validate password length or email format. A 3-character password passes; "notanemail" is accepted as email.

---

### 🟡 BUG-05: Registration Validation Uses Alert.alert() Only [MEDIUM]

**Location:** `app/(auth)/locksmith-register.tsx`

Registration errors use `Alert.alert()` exclusively with no inline error display, unlike login which has an error banner.

---

### 🟡 BUG-09: OneSignal Subscribe POST Endpoint Not Authenticated [MEDIUM]

**Location:** `POST /api/onesignal/subscribe`

The POST subscribe endpoint accepts unauthenticated requests. Anyone who knows a valid locksmith userId could register a playerId.

---

### 🟡 BUG-10: Token Refresh Endpoint Does Not Exist [MEDIUM]

**Location:** `POST /api/auth/refresh`

The mobile API client calls `/api/auth/refresh` but this endpoint returns a 404 HTML page. Token refresh is non-functional — expired tokens force re-login.

---

### 🔵 BUG-06: iOS buildNumber Stale in AAB Embedded Config [LOW]

AAB shows iOS buildNumber "3" but source has "4". Suggests AAB may predate latest code changes.

---

### 🔵 BUG-07: Duplicate Permissions in AAB Config [LOW]

`ACCESS_COARSE_LOCATION`, `ACCESS_FINE_LOCATION`, and `CAMERA` each declared twice due to plugin config merging.

---

### 🔵 BUG-08: Remember Me Toggle Not Visible on Web [INFO]

Switch component doesn't render on web. Native Android would render correctly.

---

## Positive Findings

- ✅ **OneSignal Race Condition Fix Verified** — Lazy init pattern correctly defers OneSignal until after auth. Matches iOS fix.
- ✅ **AAB File Integrity** — Passes ZIP checks, contains all expected native libs and JS bundle.
- ✅ **Security Fixes Verified** — All 3 OneSignal API vulnerabilities confirmed fixed on production.
- ✅ **API Error Handling** — Invalid creds, empty body, injection attempts all handled properly.
- ✅ **Non-www Redirect Protection** — API client correctly uses `www.locksafe.uk`.

---

## Deployment Blockers (Must Fix)

1. **Resolve OneSignal App ID mismatch (BUG-01)** — Determine canonical ID, align all sources, rebuild if needed.
2. **Add auth guard to locksmith routes (BUG-02)** — 5-line fix in `(locksmith)/_layout.tsx`.
3. **Add `api_key.json` to .gitignore (BUG-11)** — Prevent accidental key exposure.

---

## Testing Limitations

Android-native testing was not possible — no emulator or device available. Testing was performed via Expo web export and direct API testing against production backend. AAB was inspected at binary level. Push notification runtime and native UI rendering should be verified on a physical device before deployment.
