# iOS Build 4 Upload Report (EAS Submit)

## Summary
- **Status:** ✅ Successfully submitted to App Store Connect
- **Submission Timestamp:** 2026-04-20 11:48 BST (Europe/London)
- **Upload Method:** Expo EAS Submit (`eas submit --platform ios --path ... --non-interactive`)
- **Expo Account Used:** `contact@locksafe.uk` (`@locksafeuk26`)
- **Submission ID:** `7dc987fa-34e2-4aad-82b4-d0ee3d3d59a2`
- **Submission URL:** https://expo.dev/accounts/locksafeuk26/projects/locksafe-mobile/submissions/7dc987fa-34e2-4aad-82b4-d0ee3d3d59a2

## Build Details
- **Project:** `@locksafeuk26/locksafe-mobile`
- **Project ID:** `7a0be99b-8116-409b-8203-e08e7f023e4a`
- **Archive Path:** `build/locksafe-v1.0.2-build4-ios.ipa`
- **App Version / Build:** `1.0.2 (4)`
- **Bundle ID:** `uk.locksafe.app`
- **Apple ID:** `locksafeuk@icloud.com`
- **ASC App ID:** `6762475008`
- **Apple Team ID:** `4ZNRAB4A2S`

## Authentication + Access Verification
1. Logged out from robot-scoped auth and confirmed unauthenticated state.
2. Logged in with project owner Expo account (`contact@locksafe.uk`) via browser auth flow.
3. Verified login:
   - `eas whoami` => `locksafeuk26` / `contact@locksafe.uk`
4. Verified project access:
   - `eas project:info` => `@locksafeuk26/locksafe-mobile`

## Command Used
```bash
EXPO_APPLE_APP_SPECIFIC_PASSWORD='fsvw-ntvh-nwjh-zabu' \
  eas submit --platform ios \
  --path build/locksafe-v1.0.2-build4-ios.ipa \
  --non-interactive
```

## EAS Output (Key Success Lines)
- `✔ Uploaded to EAS Submit`
- `✔ Scheduled iOS submission`
- `✔ Submitted your app to Apple App Store Connect!`
- `Your binary has been successfully uploaded to App Store Connect!`

## Upload Receipt / Logs
- Local CLI log saved at: `/tmp/eas_submit_build4.log`
- Contains:
  - upload progress
  - scheduling confirmation
  - submission link and ID
  - final success confirmation

## Next Steps (App Store Connect)
1. Open TestFlight for the app:  
   https://appstoreconnect.apple.com/apps/6762475008/testflight/ios
2. Wait for Apple processing (typically **15–30 minutes**, but sometimes longer).
3. Once processing completes, select **Build 4** (`1.0.2 (4)`) for the active version/review flow.
4. If submitting for review now:
   - ensure release notes/metadata are up to date
   - attach Build 4 to the version
   - confirm compliance prompts and submit
5. Notify Apple reviewers in App Review notes that this build includes the iOS launch stability fix.

## Reviewer Note Suggestion
> Build 1.0.2 (4) includes a startup stability fix for OneSignal initialization race conditions identified in earlier review crashes.

