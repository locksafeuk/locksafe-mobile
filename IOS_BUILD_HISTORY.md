# iOS Build History — LockSafe (`uk.locksafe.app`)

**Last Updated:** 2026-04-21 (Europe/London)
**Version Line:** `1.0.2`

---

## Build Progression Summary (Builds 3 → 6)

| Build | Status | What was fixed/changed | Result / Outcome |
|---|---|---|---|
| **3** | Rejected | Baseline submission before startup crash hardening | Rejected under Guideline 2.1(a), crash family observed (`EXC_CRASH/SIGABRT`) on iPad startup path |
| **4** | Submitted after Build 3 triage | Initial OneSignal launch-stability hardening (removed eager startup init path + added init race guard) | Improved architecture, but later rejection pattern persisted in subsequent review cycle |
| **5** | Rejected | Apple SDK compliance update for warning `90725` (iOS 26.2 SDK / Xcode 2620) while preserving prior crash mitigation | SDK compliance achieved, but Apple still reported crash during login/startup on iPad; rejection triggered Build 6 full fix |
| **6** | **Current active review build** | Complete OneSignal startup fix: removed permission prompt from init, deferred registration/permission via `InteractionManager.runAfterInteractions()`, expanded defensive error handling | Uploaded, selected in App Store Connect, resubmitted; current state: **Waiting for Review** |

---

## Detailed Build Notes

### Build 3 (`1.0.2 (3)`)
- Crash logs from App Review repeatedly pointed to:
  - `EXC_CRASH (SIGABRT)`
  - `com.facebook.react.ExceptionsManagerQueue`
  - Objective-C exception rethrow path terminating app
- Device context repeatedly iPad-class hardware on iPadOS 26.4.1.

### Build 4 (`1.0.2 (4)`)
- Introduced first wave startup stabilization for OneSignal orchestration.
- Focus: reduce launch-time race conditions and duplicate initialization paths.
- Uploaded and moved into App Review flow after Build 3 analysis.

### Build 5 (`1.0.2 (5)`)
- Built to satisfy Apple SDK policy warning 90725 before enforcement deadline.
- Confirmed new toolchain/SDK compliance.
- Rejected again for crash during login/startup.
- Build 5 rejection crash (`crashlog-2F0EDDB4...`) confirmed same crash family, leading to architectural remediation in Build 6.

### Build 6 (`1.0.2 (6)`)
- Complete OneSignal fix shipped:
  1. Permission request removed from `initialize()`
  2. Added explicit deferred permission API
  3. Deferred push registration and permission until post-interactions in root layout
  4. Added granular try/catch and OneSignal error instrumentation
- Build and submission metadata:
  - Commit: `1551f333b050817eb4cb649a9304be7a735f0c67`
  - EAS Build ID: `88c239f7-845b-4d4a-8071-634cd746b31c`
  - EAS Submission ID: `4358e5b9-8a54-4817-a678-f714c6a62aeb`
- Current App Store Connect status: **Waiting for Review**.

---

## Why Build 6 is the Completion Build

Builds 3–5 progressively identified and narrowed the crash family. Build 6 is the first build where permission timing and push registration timing are both moved out of startup-critical execution, with added fault tolerance and retained init concurrency protection. This closes the previously recurring startup-risk architecture.

---

## Related Reports

- [`IOS_BUILD5_REJECTION_DETAILS.md`](./IOS_BUILD5_REJECTION_DETAILS.md)
- [`IOS_BUILD5_CRASH_ANALYSIS.md`](./IOS_BUILD5_CRASH_ANALYSIS.md)
- [`IOS_BUILD6_COMPLETE_FIX.md`](./IOS_BUILD6_COMPLETE_FIX.md)
- [`WORK_LOG_2026-04-20.md`](./WORK_LOG_2026-04-20.md)
- [`CURRENT_STATUS_APRIL_20_FINAL.md`](./CURRENT_STATUS_APRIL_20_FINAL.md)
