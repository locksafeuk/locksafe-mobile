# iOS Build 5 Crash Analysis (Urgent)

**Date:** 2026-04-21  
**Project:** `locksafe-mobile`  
**New crash log analyzed:** `/home/ubuntu/Uploads/crashlog-2F0EDDB4-D1E6-47ED-89E4-FE4997D4DFC5.ips`  
**Comparison logs (Build 3):**
- `/home/ubuntu/Uploads/crashlog-467E6101-78B6-4F21-95ED-A77C518DAC8E.ips`
- `/home/ubuntu/Uploads/crashlog-316C6252-49C5-41A3-970D-B04040068425.ips`
- `/home/ubuntu/Uploads/crashlog-A2BFD1CD-FA62-450F-8673-B5CF683A50C9.ips`
- `/home/ubuntu/Uploads/crashlog-FBBF80B9-F13E-4DF2-A648-FFBE92D69E4A.ips`

---

### 1) Parsed details from the **new** crash log (Build 5)

- **App:** LockSafe (`uk.locksafe.app`)
- **Version/build:** `1.0.2 (5)`
  - `build_version: "5"`
  - `CFBundleVersion: "5"`
- **Device:** `iPad15,3`
- **OS:** `iPhone OS 26.4.1 (23E254)`
- **Exception:** `EXC_CRASH (SIGABRT)`
- **Termination:** `Abort trap: 6` (`namespace: SIGNAL`, `code: 6`)
- **Crashed thread index:** `faultingThread: 7`
- **Crashed queue:** `com.facebook.react.ExceptionsManagerQueue`

#### Relevant stack evidence

- Crash thread path includes:
  - `__pthread_kill`
  - `pthread_kill`
  - `abort`
  - `__cxa_rethrow`
  - `objc_exception_rethrow`
  - `LockSafe + 0x1e5a74`
  - `LockSafe + 0x1e5490`

- `lastExceptionBacktrace` app-specific frames:
  - `LockSafe + 0x1b2744`
  - `LockSafe + 0x21efec`
  - `LockSafe + 0x21f7f0`
  - `LockSafe + 0x1e36e8`
  - `LockSafe + 0x1e582c`
  - `LockSafe + 0x1e5490`

- **OneSignal frameworks are loaded** in binary (`OneSignalCore`, `OneSignalFramework`, etc.), but **no direct OneSignal frame appears in the crashing stack**.

---

### 2) Comparison vs previous 4 Build 3 crashes

## What is the same

- Same top-level crash class: `EXC_CRASH (SIGABRT)`
- Same fatal queue: `com.facebook.react.ExceptionsManagerQueue`
- Same rethrow/abort flow:
  - Objective-C exception -> RN exception pipeline -> fatal abort
- Same structure in app backtrace blocks (6 app frames in `lastExceptionBacktrace`, 2 app frames near rethrow path)

## What is different

- **Build is now definitely 5** (not 3), so this is a new binary reproducing the pattern.
- App offsets changed (as expected in a new binary), but the shape of the crash path is very similar.
- Build 3 logs often showed explicit UIKit navigation-bar symbols on main thread; Build 5 log is less symbolicated around that context.

## Conclusion of comparison

This is **not a brand-new crash family**. It is the **same crash pattern resurfacing** on Build 5 in a new binary.

---

### 3) Stack-trace interpretation (app-specific focus)

Because app frames are unsymbolicated (`LockSafe + offset`), exact TS/TSX source line cannot be deterministically extracted from this `.ips` alone.

What we can state with confidence:
- Crash is still routed through React Native fatal exception handling (`ExceptionsManagerQueue`).
- An uncaught native/ObjC exception is being rethrown and then aborted.
- Closest app locations in Build 5 are the offsets listed above (especially around `0x1e5490`/`0x1e5a74`).

> To get exact file/function/line, we need matching Build 5 dSYM + symbolication (`atos` / Xcode Organizer / Crashlytics symbol maps).

---

### 4) OneSignal fix verification (current implementation)

Reviewed files:
- `services/pushNotifications.ts`
- `app/_layout.tsx`

## What is correct

- Concurrency guard is present (`initializingPromise`) to avoid duplicate OneSignal init.
- Eager global startup initialization was removed.
- Registration is lazy and tied to authenticated locksmith user.
- Push sync block is wrapped in `try/catch`.

## Remaining risk in current code

Even with lazy init, `registerUser()` still calls `initialize()` which currently does:
- `OneSignal.initialize(...)`
- `Notifications.requestPermission(true)` immediately

This can still run very early during startup when an auto-restored session exists (authenticated on cold launch). That timing can still collide with UI/bootstrap and produce launch instability.

---

### 5) Build version + SDK compliance check

- New crash log confirms: **Build 5** (`CFBundleVersion=5`).
- Crash log includes `DTAppStoreToolsBuild: 17E187` but does **not** include explicit `DTSDKName` field.
- Prior build documentation (`IOS_BUILD5_SDK_UPDATE.md`) shows Build 5 was compiled with:
  - `DTSDKName: iphoneos26.2`
  - `DTXcode: 2620`

So from available evidence:
- ✅ Crash is from Build 5.
- ✅ SDK compliance work was likely included.
- ❌ Crash itself is still unresolved.

---

### 6) Root-cause assessment

**Most likely root cause:** launch-time uncaught exception path is still present, now in Build 5.

This appears to be:
- Same RN fatal exception family as Build 3 logs,
- Not clearly a backend OneSignal API security issue,
- Not proven to be a OneSignal SDK-internal crash from stack symbols,
- But push-init timing is still a plausible trigger/amplifier.

---

### 7) Recommended fixes (specific code changes)

## A) Remove permission prompt from initialization path

**File:** `services/pushNotifications.ts`

### Change
Do **not** request permission inside `initialize()`.

Current:
```ts
await this.oneSignal.Notifications.requestPermission(true).catch(() => undefined);
```

Recommended:
```ts
// Do not prompt during init/startup.
// Permission prompt should be user-triggered (settings CTA) or delayed post-render.
```

Add a dedicated method:
```ts
async requestPermissionFromUserAction(): Promise<boolean> {
  if (Platform.OS === 'web' || !this.oneSignal) return false;
  try {
    return await this.oneSignal.Notifications.requestPermission(true);
  } catch {
    return false;
  }
}
```

## B) Defer push registration until UI settles

**File:** `app/_layout.tsx`

### Change
Wrap registration in `InteractionManager.runAfterInteractions` (or equivalent idle deferral) so it executes only after initial navigation/render is stable.

Recommended pattern:
```ts
import { InteractionManager } from 'react-native';

await new Promise<void>((resolve) => {
  InteractionManager.runAfterInteractions(() => resolve());
});

await pushNotificationService.registerUser(currentUserId, 'locksmith');
```

## C) Add one-release diagnostic guards

Add temporary logs around:
- auth initialization complete
- push register start/end
- oneSignal init start/end
- permission prompt requested (if ever)

This helps prove no startup race remains in Build 6.

## D) Symbolicate before final root-cause claims

Obtain Build 5 dSYM and symbolicate this exact incident ID. Without this, “exact file/line” remains unknown.

---

### 8) Why previous fix likely didn’t fully solve it

Previous fix removed *duplicate* init race and eager startup call, which was necessary.  
But current flow still allows **early init + permission prompt on auto-login launch**, so startup timing risk remains.

So Build 5 improved things but did not fully eliminate launch-time exception risk.

---

### 9) Do we need Build 6?

**Yes — recommended.**

Given Build 5 was rejected again with the same crash family, we should:
1. Apply changes A+B above,
2. Rebuild/submission as **Build 6**,
3. Validate with repeated cold launches on iPad + iOS 26.4.1,
4. Re-submit with reviewer note stating push permission prompt is now deferred and startup path hardened.

---

### Final verdict

- This crash is from **Build 5**.
- It is **the same overall crash pattern family** seen before (not an unrelated new class).
- It is **not clearly a direct OneSignal frame crash**, but push-init timing still likely contributes.
- The OneSignal fix was partially correct, but additional startup hardening is needed.
- **Action:** ship Build 6 with deferred push permission + post-render registration + symbolication-backed validation.
