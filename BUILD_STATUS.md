# BUILD_STATUS.md

LockSafe Mobile — real build status as of 2026-04-25.

This document is intentionally conservative: if something was not fully tested, it is marked as unknown or not ready.

---

## 1) iOS Build History (real status)

| Build | Evidence in repo | Historical claim | Real status now |
|---|---|---|---|
| 3 | Crash logs + `IOS_BUILD_HISTORY.md` | Initial submission | ❌ Rejected/crash-prone (historical) |
| 4 | `build/locksafe-v1.0.2-build4-ios.ipa` + docs | Stabilization build | ⚠️ Transitional only |
| 5 | `build/build5/locksafe-v1.0.2-build5-ios.ipa` + rejection docs | SDK compliance + fixes | ❌ Rejected |
| 6 | `build/build6/locksafe-v1.0.2-build6-ios.ipa` + docs | Further crash hardening | ⚠️ Transitional only |
| 7 | `IOS_BUILD_HISTORY.md`, `CURRENT_STATUS_APRIL_20_FINAL.md` | Native push final review build | ⚠️ Historical review-state build, superseded by later build work |
| 8 | `build/build8/locksafe-v1.0.2-build8-ios.ipa` + build 8 docs | Claimed submission-ready at the time | ❌ Not final resolution; required additional work |
| 9 | `FINAL_REPORT_BUILD9_17.md`, app config history | Claimed ready in prior report | ❌ Not ready; jobs tab crash reported; only auth screens tested |
| 10 | `build-artifacts/locksafe-ios-build10.ipa` | Built artifact exists | ❓ Build exists but no complete validation report in repo |

---

## 2) Android Build History (real status)

| Build | Evidence in repo | Historical claim | Real status now |
|---|---|---|---|
| 12 | `build/locksafe-v1.0.2-build12.aab` + `ANDROID_TEST_REPORT.md` | Baseline test build | ❌ Not deployable (critical issues listed in report) |
| 15 | `build/locksafe-v1.0.2-build15.aab` + Apr 20 docs | In review (historical cycle) | ⚠️ Historical status only; superseded by later builds |
| 16 | `build/locksafe-v1.0.2-build16.aab` + build16 docs | Critical fixes release | ⚠️ Intermediate build |
| 17 | `build-artifacts/locksafe-android-build17.aab` + `FINAL_REPORT_BUILD9_17.md` | Claimed ready | ❌ Not ready; JS bridge/touch regressions required further fixes |
| 18 | `build-artifacts/locksafe-android-build18.aab` | Artifact exists | ❓ No final validation document found |
| 19 | `build/locksafe-v1.0.2-build19.aab` + `build/BUILD19_SUMMARY.md` | Claimed touch/keyboard fixed | ❌ Not ready; keyboard scrolling still incomplete |
| 20 | `build/locksafe-v1.0.2-build20.aab` | Artifact exists | ❓ Untested/undocumented in repo |

---

## 3) Claimed vs Reality (explicit corrections)

1. iOS Build 8 was previously presented as ready → **not true in final outcome**.
2. iOS Build 9 was previously presented as ready → **not true (jobs tab crash, incomplete testing)**.
3. Android Build 17 was previously presented as ready → **not true (regressions required later builds)**.
4. Android Build 19 was presented as fixed for keyboard → **not fully true (keyboard overlap issue still present)**.

---

## 4) Known Issues (current blockers)

### Android (Build 19)
- Keyboard/input visibility issue remains in at least one flow (field hidden by keyboard).

### iOS (Build 9)
- Jobs tab crash reported.
- Full workflow not yet validated after auth screens.

### Cross-platform process issue
- Readiness was claimed without complete end-to-end test evidence.

---

## 5) Test Reports and Validation Artifacts Index

### Present in repository
- `ANDROID_TEST_REPORT.md`
- `ANDROID_TEST_REPORT.html`
- `ANDROID_TEST_REPORT.pdf`
- `ANDROID_ANALYSIS_REPORT.md`
- `ANDROID_ANALYSIS_REPORT.pdf`
- `ANDROID_DEPLOYMENT_REPORT.md`
- `ANDROID_DEPLOYMENT_REPORT.pdf`
- `FINAL_REPORT_BUILD9_17.md`
- `FINAL_REPORT_BUILD9_17.pdf`
- `build/BUILD19_SUMMARY.md`
- `build/BUILD19_SUMMARY.pdf`
- `E2E_Test_Report.md` *(created for transparent coverage accounting)*
- `BUILD19_ANDROID_TEST_REPORT.md` *(created for current Build 19 status)*

### Screenshots available (examples)
- `docs/screenshots/build6/*`
- `docs/screenshots/build8/*`
- `store-assets/screenshots/*`
- `store-assets/ios-screenshots/*`
- `store-assets/ipad-screenshots/*`
- `google-play-materials/screenshots/*`

---

## 6) Current decision

- **Deployment ready:** NO
- **Correct next step:** fix known blockers + run complete E2E on both platforms before any new readiness claim.
