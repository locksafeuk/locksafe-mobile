# iOS Build History — LockSafe (`uk.locksafe.app`)

**Last Updated:** 2026-04-22 (Europe/London)  
**Version Line:** `1.0.2`

---

## Build Progression Summary (Builds 3 → 7)

| Build | Status | What was fixed/changed | Result / Outcome |
|---|---|---|---|
| **3** | Rejected | Baseline submission before crash hardening | Rejected under Guideline 2.1(a); startup crash family observed (`EXC_CRASH/SIGABRT`) |
| **4** | Submitted / Resubmitted | Initial startup hardening and race mitigation | Improved path, but crash-family concerns persisted in later cycle |
| **5** | Rejected | iOS 26.2 SDK compliance update (warning 90725) while keeping prior crash mitigation | SDK compliance achieved; rejection still reported startup/login crash |
| **6** | Submitted then superseded | Enhanced OneSignal timing hardening (deferred permission + deferred post-interaction registration) | Mitigation improved, but not accepted as final stable architecture |
| **7** | **Current final review build** | **OneSignal removed entirely; native push (APNs) migration via Expo Notifications** | **Submitted and Waiting for Review** |

---

## Detailed Build Notes

### Build 3 (`1.0.2 (3)`)
- App Review crash logs repeatedly indicated startup abort path (`EXC_CRASH (SIGABRT)`).
- Used as primary rejection baseline for subsequent remediation.

### Build 4 (`1.0.2 (4)`)
- Introduced first-wave startup stabilization and reduced eager push init behavior.
- Uploaded and used in post-triage resubmission flow.

### Build 5 (`1.0.2 (5)`)
- Created to satisfy Apple SDK warning `90725` before enforcement deadline.
- Verified iOS 26.2 SDK toolchain update.
- Rejected for persistent startup/login crash behavior.

### Build 6 (`1.0.2 (6)`)
- Added deeper OneSignal stabilization:
  1. Permission request removed from init path
  2. Explicit permission API
  3. Deferred post-interaction registration flow
  4. Additional defensive error handling
- Became transitional build before final architectural change.

### Build 7 (`1.0.2 (7)`) — Final Solution Build
- Complete migration from OneSignal to native push:
  - Removed OneSignal SDK/plugin/runtime integration
  - Added native APNs token flow using `expo-notifications` + `expo-device`
  - Updated backend registration to native token endpoints
- Build submitted successfully in App Store Connect.
- **Current state:** Waiting for Review.

---

## Why Build 7 Is the Final/Permanent Solution

Build 7 is the first iOS release that fully removes the third-party OneSignal startup dependency and transitions to platform-native push lifecycle control. This resolves the prior strategy limitation (mitigating around OneSignal timing) by eliminating the dependency path itself. The resulting architecture is simpler, deterministic at startup, and aligned with long-term stability.

---

## Related Documents

- [`WORK_LOG_2026-04-20.md`](./WORK_LOG_2026-04-20.md)
- [`CURRENT_STATUS_APRIL_20_FINAL.md`](./CURRENT_STATUS_APRIL_20_FINAL.md)
- [`SESSION_SUMMARY_2026-04-20.md`](./SESSION_SUMMARY_2026-04-20.md)
- [`NATIVE_PUSH_MIGRATION_COMPLETE.md`](./NATIVE_PUSH_MIGRATION_COMPLETE.md)
