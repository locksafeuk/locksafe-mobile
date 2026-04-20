# iOS Build 4 Upload Report (EAS Submit)

## Summary
- **Date/Time:** 2026-04-20 10:34:15 UTC
- **Target:** App Store Connect upload via Expo EAS Submit (cloud Mac infrastructure)
- **Build Artifact:** `build/locksafe-v1.0.2-build4-ios.ipa`
- **App Version / Build:** `1.0.2 (4)`
- **Bundle ID:** `uk.locksafe.app`
- **ASC App ID:** `6762475008`

## Pre-flight Checks
- `eas whoami` output:
  - Logged in as: `deepagent (robot)`
  - Auth method: `EXPO_TOKEN`
  - Account listed: `abacus.ai (Role: Admin)`
- IPA verification:
  - Exists: ✅
  - Size: `27M`
  - Type: `iOS App Zip archive data`
  - SHA256: `20f6947cf418dbb9640ea3edb404937fdedf6f0c16be3dec1f4d0381989d1998`
  - Integrity check (`unzip -tq`): ✅ no errors
- Team ID alignment:
  - Updated `eas.json` submit profile iOS `appleTeamId` to `4ZNRAB4A2S`

## Command Executed
```bash
EXPO_APPLE_APP_SPECIFIC_PASSWORD='fsvw-ntvh-nwjh-zabu' \
  eas submit --platform ios \
  --path build/locksafe-v1.0.2-build4-ios.ipa \
  --profile production \
  --non-interactive
```

## Result
- **Status:** ❌ Upload not started (authorization blocked before submission)
- **EAS Error:**
  - `You don't have the required permissions to perform this operation.`
  - `Entity not authorized: AppEntity[7a0be99b-8116-409b-8203-e08e7f023e4a] (viewer = RobotViewerContext, action = READ, ruleIndex = -1)`
  - `Request ID: 955912e5-b635-428b-88ea-e10eb3edf642`

## Interpretation
The currently authenticated Expo account/token (`deepagent` robot token) does not have access rights to the LockSafe EAS project/app entity, so EAS submit cannot proceed to Apple credential or upload steps.

## Recommended Next Steps
1. Authenticate EAS with the Expo account that owns (or has Admin/Developer access to) the LockSafe project:
   - Run `eas logout`
   - Run `eas login` with the correct project-linked Expo account
2. Re-run the same submit command after successful login.
3. If using CI/token auth, use an Expo token scoped to the correct project owner account.
4. After successful submission, capture:
   - EAS submission ID
   - App Store Connect processing status
   - Build selection in App Store Connect for the active version

## Notes
- Apple credentials were prepared (`appleId`, app-specific password, team ID, ascAppId), but were not reached due to Expo project authorization failure.
- No submission ID was generated because submission did not start.
