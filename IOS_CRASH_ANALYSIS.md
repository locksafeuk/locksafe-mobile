# iOS Crash Analysis Report (App Review Logs)

**Date:** 2026-04-20  
**App:** LockSafe - Locksmith Partner (`uk.locksafe.app`)  
**Logs analyzed:**
- `/home/ubuntu/Uploads/crashlog-467E6101-78B6-4F21-95ED-A77C518DAC8E.ips`
- `/home/ubuntu/Uploads/crashlog-316C6252-49C5-41A3-970D-B04040068425.ips`
- `/home/ubuntu/Uploads/crashlog-A2BFD1CD-FA62-450F-8673-B5CF683A50C9.ips`
- `/home/ubuntu/Uploads/crashlog-FBBF80B9-F13E-4DF2-A648-FFBE92D69E4A.ips`

---

## Executive Summary

All 4 crash logs are the **same underlying crash pattern**:

- `EXC_CRASH (SIGABRT)`
- Crash thread: `com.facebook.react.ExceptionsManagerQueue`
- `objc_exception_rethrow` -> app frame -> `abort()`
- Same app backtrace offsets repeated across all logs (`1838876`, `2042136`, `2049756`, `2050696`, `2051276`, `2286864`, `2288952`)
- Occurs during early UI boot / navigation bar setup on main thread

### Critical finding
These logs are from **build 3**, not build 4:

- Crash logs: `CFBundleVersion = 3`
- Current codebase: `app.config.js` has `ios.buildNumber = '4'`

So these crashes represent the **pre-fix binary**. They do **not** prove build 4 is crashing.

---

## Parsed Crash Details (Per Log)

### 1) `crashlog-467E6101-78B6-4F21-95ED-A77C518DAC8E.ips`
- App version/build: `1.0.2 (3)`
- Device / OS: `iPad15,3` / `iPhone OS 26.4.1 (23E254)`
- Exception: `EXC_CRASH (SIGABRT)`
- Termination: `Abort trap: 6`
- Crashed thread: `faultingThread = 1` (`com.facebook.react.ExceptionsManagerQueue`)
- Last exception backtrace (key app frames):
  - `LockSafe + 1838876`
  - `LockSafe + 2286864`
  - `LockSafe + 2288952`
  - `LockSafe + 2042136`
  - `LockSafe + 2050696`
  - `LockSafe + 2049756`
- Main thread context: UIKit layout engine / subview insertion while navigation hierarchy is being built.

### 2) `crashlog-316C6252-49C5-41A3-970D-B04040068425.ips`
- App version/build: `1.0.2 (3)`
- Device / OS: `iPad15,3` / `iPhone OS 26.4.1 (23E254)`
- Exception: `EXC_CRASH (SIGABRT)`
- Termination: `Abort trap: 6`
- Crashed thread: `faultingThread = 4` (`com.facebook.react.ExceptionsManagerQueue`)
- Last exception backtrace app frames: same offsets as above
- Main thread context:
  - `-[UINavigationController _canHostRefreshControlOwnedByScrollView:]`
  - `-[UINavigationController _navigationBarHiddenByDefault:]`
  - `-[UINavigationController loadView]`
  - then app frames `LockSafe + 1778740/1778500/1778364`

### 3) `crashlog-A2BFD1CD-FA62-450F-8673-B5CF683A50C9.ips`
- App version/build: `1.0.2 (3)`
- Device / OS: `iPad15,3` / `iPhone OS 26.4.1 (23E254)`
- Exception: `EXC_CRASH (SIGABRT)`
- Termination: `Abort trap: 6`
- Crashed thread: `faultingThread = 1` (`com.facebook.react.ExceptionsManagerQueue`)
- Last exception backtrace app frames: same offsets as above
- Main thread context:
  - `-[_UINavigationBarLargeTitleView initWithFrame:]`
  - `-[UINavigationBar _commonNavBarInit]`
  - `-[UINavigationController loadView]`
  - then same app frames near `+1778xxx`

### 4) `crashlog-FBBF80B9-F13E-4DF2-A648-FFBE92D69E4A.ips`
- App version/build: `1.0.2 (3)`
- Device / OS: `iPad15,3` / `iPhone OS 26.4.1 (23E254)`
- Exception: `EXC_CRASH (SIGABRT)`
- Termination: `Abort trap: 6`
- Crashed thread: `faultingThread = 11` (`com.facebook.react.ExceptionsManagerQueue`)
- Last exception backtrace app frames: same offsets as above
- Main thread context:
  - `-[_UINavigationBarLayout init]`
  - navigation bar visibility/positioning updates
  - then same app frames near `+1778xxx`

---

## Common Patterns Across All 4 Logs

1. **Identical crash signature**
   - Same exception type/signal and same exception-manager abort flow.

2. **Same app-internal frame offsets**
   - Strong evidence this is one root issue, not 4 different bugs.

3. **Startup/UI bootstrap timing**
   - Main-thread stacks consistently point to UIKit navigation bar creation/layout during initial screen assembly.

4. **React Native fatal exception handling path**
   - Crash occurs when an Objective-C exception is rethrown and then fatal-aborted by RN exception pipeline.

---

## Root Cause Analysis

### Primary root cause
The logs indicate an **uncaught Objective-C exception during early app startup/navigation assembly**, which is then escalated via React Native exception handling and aborts the app.

### Relationship to previous OneSignal crash
- These logs are from **build 3** (pre-fix build).
- Your OneSignal launch-race fix was implemented in commit `d661ee4` and build number bumped to 4.
- Therefore this dataset is **consistent with the old launch-stability issue window**.
- It is **not evidence of a new backend OneSignal security issue** (the `OneSignal API Security.txt` file concerns server endpoint auth/authorization and is unrelated to this client startup SIGABRT pattern).

### Why exact file/line cannot be fully resolved from these logs
The crash logs contain unsymbolicated app frames (`LockSafe + offset`) without dSYM symbolication in the provided reports. So exact TS/TSX source line cannot be extracted directly from these `.ips` files alone.

Closest crash locations from logs:
- Exception path: `LockSafe + 1838876`, `+2286864`, `+2288952`, `+2042136`, `+2050696`, `+2049756`, `+2051276`
- Main-thread startup path includes app frames around `+1778364`, `+1778500`, `+1778740` / `+1778764`

---

## Related Code Review Findings (`/home/ubuntu/locksafe-mobile`)

### Confirmed fix present in current codebase

1. **Build number bumped to 4**
   - File: `app.config.js`
   - `ios.buildNumber: '4'`

2. **Eager OneSignal initialization removed from app startup**
   - File: `app/_layout.tsx`
   - Old `void pushNotificationService.initialize();` removed.

3. **OneSignal initialization concurrency guard implemented**
   - File: `services/pushNotifications.ts`
   - `initializingPromise` guard prevents duplicate/racing initialization calls.

4. **Push sync wrapped with error handling**
   - File: `app/_layout.tsx`
   - `try/catch` around registration/unregistration flow.

These changes are aligned with the previous rejection fix and directly target launch-time race behavior.

---

## Recommended Fix Actions (Actionable)

### A) Submission/Build process actions (highest priority)
1. **Confirm App Store Connect submission is build 4 (or newer), not build 3.**
2. If build 3 is still in review metadata, **expire/remove it and submit build 4+ only**.
3. In TestFlight/App Store Connect, verify binary details before submission:
   - Version `1.0.2`
   - Build `4` (or newer)
   - Upload timestamp matches your latest CI run

### B) Additional code hardening (recommended even with current fix)

#### 1. Delay push registration until post-initial render idle
File: `app/_layout.tsx` (inside `syncPushRegistration` flow)
- Use `InteractionManager.runAfterInteractions` before calling `registerUser`.
- This avoids competing with initial navigation tree construction.

#### 2. Do not force permission prompt during startup
File: `services/pushNotifications.ts`
- Replace immediate `requestPermission(true)` in `initialize()` with:
  - Non-blocking check at startup
  - User-triggered prompt (or post-login settings flow)
- Rationale: avoids launch-time UI interruptions on App Review devices.

#### 3. Add explicit startup diagnostics around push init
Files:
- `services/pushNotifications.ts`
- `app/_layout.tsx`
- Log:
  - `initialize()` start/end
  - duplicate-init short-circuit events
  - registerUser timing relative to auth bootstrap
- Keep for one release cycle to prove stability, then remove/no-op in production.

### C) Symbolication quality improvements
1. Archive and retain dSYM for each submitted iOS build.
2. Symbolicate future `.ips` with matching dSYM before triage.
3. Include source maps/sentry-style release mapping for JS/Hermes stack visibility.

---

## Suggested Verification Plan

1. Install build 4+ on iPad target (same OS family as review logs).
2. Cold-launch test 20+ times from terminated state.
3. Test first launch with denied/allowed notification permissions.
4. Test authenticated auto-login launch path (remembered session).
5. Confirm no `SIGABRT` / ExceptionsManagerQueue abort in device logs.

---

## Final Conclusion

The 4 provided `.ips` files are **one repeated startup crash from build 3**.  
They do **not** indicate a new independent issue in build 4 based on available evidence.

Most likely scenario: App Review crash reports are tied to the older binary (build 3), while your OneSignal launch-race mitigation exists in build 4.

The immediate operational fix is to ensure only build 4+ is under review, plus apply the recommended startup hardening to reduce launch-time UI/notification contention.
