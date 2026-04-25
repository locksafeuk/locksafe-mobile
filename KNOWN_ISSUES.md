# KNOWN_ISSUES.md (as of 2026-04-25)

This file lists known issues with current active builds and workflow confidence.

## P0 / Release-blocking issues

### 1) Android Build 19 keyboard overlap issue
- **Status:** Open
- **Observed behavior:** In some input screens, focused field can be hidden by software keyboard.
- **Impact:** User cannot reliably complete form steps.
- **Release effect:** Blocks production readiness claim.

### 2) iOS Build 9 Jobs tab crash
- **Status:** Open (reported, not verified fixed)
- **Observed behavior:** App crashes on Jobs tab path.
- **Impact:** Core locksmith workflow is unstable.
- **Release effect:** Blocks production readiness claim.

## P1 / Validation gap issues

### 3) iOS Build 9 full workflow not tested
- **Status:** Open
- **Observed behavior:** Only auth screens tested (login/forgot-password/error handling).
- **Impact:** Unknown failures may exist in post-login workflow.
- **Release effect:** No honest full-readiness claim possible.

### 4) Android Build 19 no complete end-to-end regression pass
- **Status:** Open
- **Observed behavior:** Key areas work, but complete flow test evidence is incomplete.
- **Impact:** Hidden regressions may still exist.
- **Release effect:** Should not be called production-ready.

## Process issue (must not repeat)

### 5) Readiness claim discipline
- **Issue:** Prior "ready" claims were made before complete E2E testing.
- **Fix policy:**
  1. No "ready" label without full checklist pass.
  2. Every claim must point to explicit evidence.
  3. Unknown areas must be labeled unknown, never assumed good.
