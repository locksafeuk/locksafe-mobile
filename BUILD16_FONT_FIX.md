# Build 16 iOS Password Font Fix

## Summary
This update implements the iOS secure password rendering fix for Build 16 by forcing system font usage in password `TextInput` fields on iOS authentication screens.

## What Changed

### 1) Password font fix in login screen
**File:** `app/(auth)/locksmith-login.tsx`

- Updated iOS password input style (`iosMinimalPasswordInput`) to explicitly use:
  - `fontFamily: 'System'`
- Existing password behavior (`secureTextEntry`) and visibility toggle were preserved.

### 2) Password font fix in registration screen
**File:** `app/(auth)/locksmith-register.tsx`

- Updated iOS password style (`passwordInputIOS`) to explicitly use:
  - `fontFamily: 'System'`
- This style is applied to both:
  - Password field
  - Confirm password field

### 3) Build number increment
**File:** `app.config.js`

- Updated iOS build number:
  - From: `'15'`
  - To: `'16'`

## Why This Fix Was Needed
Research and crash/behavior analysis indicated that iOS `secureTextEntry` can fail to render password bullets correctly when a custom font is used (or inherited) and that font lacks proper secure bullet glyph support.

By forcing iOS password fields to the system font, the OS can render secure bullets reliably.

## Font Usage Findings
Checked for custom font usage indicators:

- `fontFamily` usage in `app/`
- `@fontsource` imports
- `useFonts` usage
- font-related settings in `app.config.js`

No explicit custom font loading/import was found in those checks, but this fix hardens password fields against inherited/custom font issues by enforcing system font where it matters (`secureTextEntry` fields on iOS).

## Expected Result
On iOS:

- Password and confirm password inputs should display secure bullet dots correctly.
- Password text should no longer appear invisible or fail to render while typing.
- Android behavior remains unchanged.
