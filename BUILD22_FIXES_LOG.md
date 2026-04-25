# Build 22 Fixes Log

Date: 2026-04-25
Project: `locksafe-mobile`

## 1) Crash issue (Build 21 investigation)

### Evidence analyzed
- Crash reports analyzed from uploaded files:
  - `crashlog-467E6101-78B6-4F21-95ED-A77C518DAC8E.ips`
  - `crashlog-316C6252-49C5-41A3-970D-B04040068425.ips`
  - `crashlog-A2BFD1CD-FA62-450F-8673-B5CF683A50C9.ips`
  - `crashlog-FBBF80B9-F13E-4DF2-A648-FFBE92D69E4A.ips`
  - `crashlog-2F0EDDB4-D1E6-47ED-89E4-FE4997D4DFC5.ips`
- Consolidated report written to: `/home/ubuntu/build21_crash_report.txt`

### Crash characteristics
- `EXC_CRASH` / `SIGABRT` via React Native ExceptionsManager rethrow.
- UIKit navigation/layout stacks present (`UINavigationController`, `UINavigationBar` layout / large title creation).
- One crash context references `Settings` symbolically in native frame state.

### Fix applied
File: `app/_layout.tsx`
- Added iOS safety path:
  - `KeyboardProvider` is now enabled on Android only.
  - iOS now renders navigation content without `KeyboardProvider` wrapper.
- Added stack option:
  - `headerLargeTitle: false`

### Why this fix
- Keeps Android keyboard behavior improvements.
- Reduces iOS UIKit/navigation interaction risk tied to observed native crash signatures.

---

## 2) Remember Me fix (credentials persistence behavior)

### Previous issue
- “Remember me” maintained session token behavior but did not persist login email for relogin after logout.

### Changes made

#### `stores/authStore.ts`
- Added credential key:
  - `REMEMBERED_EMAIL_KEY = 'remembered_email'`
- Added remembered email loader helper (`loadRememberedEmail`).
- On successful `loginLocksmith(...)`:
  - If `rememberMe = true`, save normalized email to secure storage.
  - If `rememberMe = false`, clear saved email key.
- Improved `setRememberMe(...)`:
  - Persists remember flag.
  - When toggled OFF, immediately clears saved email key.
- Added action:
  - `getRememberedEmail(): Promise<string | null>`

#### `app/(auth)/locksmith-login.tsx`
- On screen mount:
  - Loads remembered email via store action.
  - Prefills email field when value exists.

### New behavior summary
- Remember Me ON:
  - Login email is saved and auto-filled next time.
- Remember Me OFF:
  - Saved email is removed.
- Logout:
  - Session/token cleared as before, remembered email preserved only if Remember Me remains ON.

---

## 3) Settings links fix

File: `app/(locksmith)/(tabs)/settings.tsx`

### Changes
- Added `Linking` support and centralized helper:
  - `openSupportLink(url, label)`
  - Includes `Linking.canOpenURL(...)` pre-check and user-friendly alert fallback.
- Wired support menu items:
  - Help Center → `https://www.locksafe.uk/help`
  - Partner Terms → `https://www.locksafe.uk/terms`
  - Privacy Policy → `https://www.locksafe.uk/privacy`

### URL verification
- All three URLs return HTTP 200.

---

## 4) Version increment

File: `app.config.js`
- Android `versionCode` updated:
  - `21` → `22`

---

## 5) Notes
- EAS build intentionally **not executed yet** (per instruction: show fixes first).
