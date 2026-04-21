# Current Status — April 21, 2026 (Build 6 Update)

## 1) Executive Summary

LockSafe mobile release operations were updated after Apple rejected Build 5 for a persistent iPad crash pattern.

- **iOS:** Build `1.0.2 (6)` (complete OneSignal fix) is now submitted and **Waiting for Review**.
- **Android:** App remains in **Google Play Closed Testing** and still requires tester/elapsed-time policy completion.
- **Critical release outcome:** Build 6 replaces Build 5 with a full startup-architecture fix (deferred permission + deferred push registration).

---

## 2) iOS Latest Status (App Store Connect)

### Current State
- **Version / Build:** `1.0.2 (6)`
- **Review status:** **Waiting for Review**
- **Bundle ID:** `uk.locksafe.app`
- **Build selected for iOS 1.0.2 submission:** Build 6

### Build 5 Rejection Context
- **Rejected build:** `1.0.2 (5)`
- **Guideline:** `2.1(a) Performance — App Completeness`
- **Rejection trigger:** app crash during login on iPad Air 11-inch (M3), iPadOS 26.4.1
- **Crash family:** `EXC_CRASH (SIGABRT)` via `com.facebook.react.ExceptionsManagerQueue`

### Build 6 Fix Scope (Complete)
- Removed OneSignal permission prompt from startup initialization path
- Added explicit separate permission request method (`requestPermission`)
- Deferred push registration + permission request using `InteractionManager.runAfterInteractions()`
- Kept initialization concurrency guard and added broader OneSignal error hardening

### Build 6 Build/Submission Metadata
- **Code commit:** `1551f333b050817eb4cb649a9304be7a735f0c67`
- **EAS Build ID:** `88c239f7-845b-4d4a-8071-634cd746b31c`
- **EAS Submission ID:** `4358e5b9-8a54-4817-a678-f714c6a62aeb`
- **IPA:** `https://expo.dev/artifacts/eas/hTtH4oMxc366FEKyJYNjBW.ipa`
- **Local IPA:** `build/build6/locksafe-v1.0.2-build6-ios.ipa`
- **Binary verification:** `CFBundleVersion=6`, `CFBundleShortVersionString=1.0.2`

---

## 3) Android Status (Google Play)

### Current State
- **Track:** Closed Testing (Alpha)
- **Version line in code:** `1.0.2 (versionCode 14 prepared)`
- **Package:** `uk.locksafe.app`
- **Submission readiness:** technically ready; policy gate still active

### Production Gate Requirements
- Minimum test period: **14 days** (started Apr 15)
- Minimum testers opted-in: **12**
- Current testers opted-in: **3**
- Earliest production eligibility date: **Apr 29, 2026**

---

## 4) Build 6 Timeline (Europe/London)

- **Apr 20, 2026 (~3:03 PM):** Build 5 rejected by Apple (Guideline 2.1(a))
- **Apr 21, 2026:** Build 5 crash log (`crashlog-2F0ED...`) analyzed and mapped to persistent crash family
- **Apr 21, 2026:** Complete Build 6 patch finalized and committed
- **Apr 21, 2026 (EAS):** Build started `16:03:06 UTC`, finished `16:10:55 UTC`
- **Apr 21, 2026:** Build 6 uploaded, processed, selected in ASC, and resubmitted
- **Current state:** Waiting for Review (Build 6)

---

## 5) Updated Next Steps

### iOS (Immediate)
1. Monitor App Store Connect for Build 6 reviewer updates.
2. If approved, confirm release behavior and monitor startup/login crash telemetry.
3. If rejected, symbolicate against matching dSYM and map exact offending frame.

### Android (Immediate)
1. Raise opted-in testers from 3 to 12+.
2. Keep closed testing active through minimum duration.
3. Apply for production access on/after Apr 29, 2026.

### Cross-Platform
1. Complete final physical-device push-notification and deep-link validation.
2. Keep store metadata/docs aligned with Build 6 as latest iOS review build.

---

## 6) Reference Documents

- [`WORK_LOG_2026-04-20.md`](./WORK_LOG_2026-04-20.md)
- [`QUICK_STATUS.txt`](./QUICK_STATUS.txt)
- [`IOS_BUILD6_COMPLETE_FIX.md`](./IOS_BUILD6_COMPLETE_FIX.md)
- [`IOS_BUILD5_REJECTION_DETAILS.md`](./IOS_BUILD5_REJECTION_DETAILS.md)
- [`IOS_BUILD5_CRASH_ANALYSIS.md`](./IOS_BUILD5_CRASH_ANALYSIS.md)
- [`ANDROID_DEPLOYMENT_REPORT.md`](./ANDROID_DEPLOYMENT_REPORT.md)
