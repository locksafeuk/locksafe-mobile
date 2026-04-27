# BUILD 14 iOS Password Masking Test Results

**Date:** 2026-04-27  
**Tester:** Abacus AI Agent (BrowserStack App Live)  
**Build ID:** `f2a8fb28-87f9-4899-9643-6ffbc3b979d6`  
**Artifact URL:** `https://expo.dev/artifacts/eas/vXXfQvVBzeWFyFkBJL6Lmo.ipa`  
**Local IPA saved:** `build/locksafe-v1.0.2-build14-ios.ipa`

## Build and Upload Status
- Git push: ✅ completed (`main` pushed to origin)
- EAS iOS production build (Build 14): ✅ completed
- IPA downloaded locally: ✅ completed
- BrowserStack upload: ✅ completed (Build 14 appeared in Uploaded Apps)

## Critical Scenario Results

### Scenario A: Fresh Login (No Remember Me)
**Expected:** typing `test1234` should show masked dots in password field.

**Result:** ✗ **Not verifiable due input instability in BrowserStack session**

What happened:
- Login screen loaded successfully.
- Multiple attempts to type in the password field did not reliably populate the field.
- On several attempts, input was not reflected in password field at all.

### Scenario B: Remember Me - Pre-filled Password
**Expected:** after remember-me login/logout/reopen, email prefilled and password prefilled+masked.

**Result:** ✗ **Blocked (could not complete login flow reliably)**

What happened:
- Could not complete a clean credential entry/login cycle in session.
- Attempted credential entry produced corrupted field behavior (email field concatenation/artifacts), preventing reliable remember-me state setup.
- Therefore pre-filled masked password state could not be validated.

### Scenario C: Toggle Show Password
**Expected:** pre-filled dots -> toggle to plain text -> toggle back to dots.

**Result:** ✗ **Blocked (depends on Scenario B state which could not be reached)**

## Summary Checklist (requested format)
- Did fresh login password show dots? **✗**
- Did pre-filled password show dots? **✗** ← MOST IMPORTANT (blocked)
- Did toggle work? **✗**

## Evidence Screenshots
Saved in: `build/test-evidence/build14/`

1. `01-uploaded-build14-on-browserstack.png` — Build 14 uploaded and visible
2. `02-login-screen-initial.png` — Login screen baseline
3. `03-missing-fields-alert-after-signin.png` — Sign in attempted without stable field population
4. `04-email-field-corrupted-after-input-attempt.png` — Input corruption observed
5. `05-keyboard-input-corruption-persists.png` — Additional input corruption evidence
6. `06-password-field-not-populating.png` — Password field remained non-populated after typing attempts
7. `07-reset-to-clean-login-screen.png` — Session reset to login baseline

## Notes / Next action to get definitive PASS/FAIL
To complete the masking verification conclusively, rerun on:
- another BrowserStack iOS device/session, or
- TestFlight/local physical iPhone build install,

and then execute Scenarios A/B/C end-to-end with stable text entry.
