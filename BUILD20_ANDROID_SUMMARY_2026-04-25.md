# Android Build 20 Summary (Keyboard Scrolling + Remember Me)

**Project:** LockSafe Mobile  
**Date/Time (Europe/London):** 2026-04-25 22:18:08 BST  
**Platform:** Android (EAS Production, AAB)

## Build metadata

- **Build ID:** `6a6b3527-baa2-4d81-80ca-5e437242d149`
- **Build number (`android.versionCode`):** `20`
- **App version:** `1.0.2`
- **Status:** ✅ `FINISHED`
- **EAS artifact URL:** `https://expo.dev/artifacts/eas/e9btuTUHRQP7YohwTzwAMP.aab`
- **Source commit used by EAS:** `a02b270476e142536be2e6b80da95c8bf642e9f5`

## Fixes included in Build 20

### Keyboard scrolling fixes
- Job application screen message field visibility when keyboard opens
- Quote builder input visibility while typing
- Auth screens keyboard-aware scrolling (login/register/forgot password)
- Focus-based auto-scroll via refs + `KeyboardAwareScrollView`
- Tuned `extraScrollHeight`/`extraHeight` for Android

### Additional fix validated before build
- Remember Me toggle persistence/use timing hardened in auth store so selected state is applied immediately before login request.

## Downloaded AAB (local VM path)

- **Saved file:** `/home/ubuntu/locksafe-mobile/build/locksafe-v1.0.2-build20.aab`
- **File size:** `52M`
- **SHA-256:** `d8e7a9e0dbbbce29719ac880dae4167e81425137e6eff5fb4bae121493a3ecf6`

## BrowserStack testing checklist (Build 20)

- [ ] Login ✓
- [ ] Dashboard ✓
- [ ] Jobs tab ✓
- [ ] Job application – **TEST KEYBOARD SCROLLING** ✓
- [ ] Message field – **VERIFY VISIBLE WHEN KEYBOARD OPEN** ✓
- [ ] Quote builder – **TEST KEYBOARD** ✓
- [ ] All other features ✓

## Notes

- Build was produced successfully via EAS production profile and downloaded locally to the VM.
- This report records completion details for QA and release tracking.
