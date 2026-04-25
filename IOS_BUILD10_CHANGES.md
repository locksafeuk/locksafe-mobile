# iOS Build 10 Changes (v1.0.2 / buildNumber 10)

Date: 2026-04-26

## Summary
This build applies Android Build 22 stability and UX fixes to iOS, plus iOS-specific crash hardening for tab/navigation behavior.

## Cross-Platform Fix Verification

### ✅ Remember Me (email + password)
- Verified in `stores/authStore.ts`:
  - `REMEMBERED_EMAIL_KEY` + `REMEMBERED_PASSWORD_KEY` are both persisted.
  - Password storage uses `expo-secure-store` on native (including iOS).
  - Credentials are cleared when Remember Me is disabled.
- Verified in `app/(auth)/locksmith-login.tsx`:
  - `getRememberedCredentials()` now preloads both saved email and password.

### ✅ Settings Links
- Verified in `app/(locksmith)/(tabs)/settings.tsx`:
  - Help Center: `https://www.locksafe.uk/help`
  - Partner Terms: `https://www.locksafe.uk/terms`
  - Privacy Policy: `https://www.locksafe.uk/privacy`
  - Uses safe `Linking.canOpenURL` + `Linking.openURL` pattern with alerts.

### ✅ Keyboard/Form Handling
- `KeyboardAvoidingView` behavior updated for iOS form screens:
  - iOS now uses `behavior="padding"`
  - `keyboardVerticalOffset` tuned for iOS (`88`)
- Updated screens:
  - `app/(auth)/locksmith-login.tsx`
  - `app/(auth)/locksmith-register.tsx`
  - `app/(auth)/forgot-password.tsx`
  - `app/(locksmith)/job/[id]/index.tsx`
  - `app/(locksmith)/job/[id]/quote.tsx`

## iOS Crash Hardening / Navigation Stabilization

### ✅ Jobs tab crash mitigation
- Updated `app/(locksmith)/(tabs)/available.tsx`:
  - On iOS, removed `RefreshControl` attachment on `FlatList` to avoid UIKit refresh-host/navigation interactions seen in historical crash traces.
  - Added explicit iOS header refresh button to preserve manual refresh UX.

### ✅ Additional tab safety
- Updated `app/(locksmith)/(tabs)/earnings.tsx` similarly:
  - iOS now uses header refresh button.
  - `RefreshControl` remains enabled for non-iOS platforms.

### ✅ Navigation header safety
- Ensured `headerLargeTitle: false` on locksmith stack/tabs:
  - `app/(locksmith)/_layout.tsx`
  - `app/(locksmith)/(tabs)/_layout.tsx`
- Root-level `app/_layout.tsx` already had `headerLargeTitle: false` and Android-only `KeyboardProvider` wrapping.

## Build Number
- `app.config.js` iOS build number is `10`.
- No further increment needed for this subtask.

## Expected Outcome
- Jobs tab no longer crashes on iOS when tapped.
- Better keyboard behavior on iOS forms and job flows.
- Shared Android Build 22 fixes confirmed active on iOS.
