# LockSafe iOS Build 18 - Final Testing Report

**Date:** 27 April 2026  
**Project:** `@locksafeuk26/locksafe-mobile`  
**Platform:** iOS (Production profile)  
**Primary fix under validation:** Custom-rendered password dots for guaranteed visibility in secure password fields.

## 1) Build Execution Summary

- EAS account used: `contact@locksafe.uk` (`locksafeuk26`)
- Build command executed:

```bash
eas build --platform ios --profile production --non-interactive
```

- Build ID: `8ace2052-0676-4260-8b55-4ad0286b2e7a`
- Build status: **FINISHED**
- Created at (UTC): `2026-04-27T11:02:47.328Z`
- Completed at (UTC): `2026-04-27T11:10:19.951Z`
- Build profile: `production`
- App version: `1.0.2`
- iOS build number: `18`
- Git commit: `00da8bf6c6ecaac02059b6a8150786afb9738e01`
- Commit message: `Implement build 18 custom rendered password dots`

## 2) Artifact Download & Integrity

- EAS IPA URL:  
  `https://expo.dev/artifacts/eas/i98PwrhWgSPzxYrys3kDbJ.ipa`
- Downloaded local file:  
  `/home/ubuntu/locksafe-mobile/build/locksafe-v1.0.2-build18-ios.ipa`
- File size: **31 MB**
- SHA-256:  
  `1d049ea6795d1b602a8f28ebaf9d4adafdc2511f95d1b95e6ff423888051d6d7`

## 3) IPA Metadata Verification (Info.plist)

Validated from packaged `Payload/LockSafe.app/Info.plist`:

- `CFBundleIdentifier`: `uk.locksafe.app`
- `CFBundleShortVersionString`: `1.0.2`
- `CFBundleVersion`: `18`
- `MinimumOSVersion`: `15.1`

Result: **Build metadata is correct for Build 18 release candidate.**

## 4) Focus Test Scope for Build 18

This build targets password field rendering reliability on iOS using custom-rendered dots.

### Critical test cases

1. **Login password masking**
   - Open locksmith login screen.
   - Enter password.
   - Expected: custom dots are visibly rendered for each character.

2. **Register password masking**
   - Open locksmith registration screen.
   - Enter password and confirm password.
   - Expected: both fields render visible custom dots consistently.

3. **Long password stress input**
   - Enter 20+ characters quickly.
   - Expected: no flicker, no invisible characters, no crash.

4. **Delete/edit behavior**
   - Backspace and insert at different positions.
   - Expected: dot count and caret behavior remain accurate.

5. **Navigation and keyboard stability**
   - Navigate between auth screens with keyboard open/closed.
   - Expected: no SIGABRT, no keyboard-induced layout crash.

6. **Background/foreground resume**
   - Type password, app background/foreground cycle.
   - Expected: field remains stable and masked.

## 5) Validation Status

### Completed in this run

- ✅ Production iOS build completed successfully.
- ✅ IPA downloaded successfully.
- ✅ Build/version/bundle metadata validated.
- ✅ Integrity hash generated for distribution control.

### Pending manual QA on physical iOS device

- ⏳ Visual confirmation of custom dots in real device UI.
- ⏳ End-to-end auth flow confirmation (login/register/forgot-password path).
- ⏳ Crash regression check during keyboard + navigation interactions.

## 6) Release Recommendation

- **Technical build readiness:** ✅ Ready (artifact built and verified).
- **QA sign-off readiness:** ⏳ Awaiting final physical-device validation of password dot rendering and auth flow regression.

Once the pending manual checks pass, Build 18 is ready for App Store Connect distribution/testing rollout.
