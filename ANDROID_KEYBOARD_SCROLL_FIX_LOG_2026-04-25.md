# Android Keyboard Scrolling Fix Log (Build 19 follow-up)

Date: 2026-04-25  
Project: `/home/ubuntu/locksafe-mobile`

## 1) Analysis of current implementation

### Source report reviewed
- `BUILD19_ANDROID_TEST_REPORT.md`
- Key blocker confirmed: keyboard can hide focused inputs during form entry (release-blocking UX issue).

### Screens audited for input fields
Using code search for `TextInput` and keyboard wrappers, these are all active form screens in this locksmith app:
1. `app/(locksmith)/job/[id]/index.tsx` (job details / application form)
2. `app/(locksmith)/job/[id]/quote.tsx` (quote builder)
3. `app/(auth)/locksmith-login.tsx`
4. `app/(auth)/locksmith-register.tsx`
5. `app/(auth)/forgot-password.tsx`

No additional `TextInput` form screens were found in the current codebase.

## 2) Keyboard handling fixes implemented

## Common improvements applied to all form screens
Each screen now uses the stronger `KeyboardAwareScrollView` pattern:
- `enableOnAndroid={true}`
- `enableAutomaticScroll={true}`
- `extraScrollHeight={20}`
- `keyboardShouldPersistTaps="handled"`
- `keyboardDismissMode="on-drag"`
- `extraHeight={Platform.OS === 'android' ? ... : ...}`
- `resetScrollToCoords={{ x: 0, y: 0 }}`

Additionally, for better focus behavior:
- Added `innerRef` scroll refs to each `KeyboardAwareScrollView`
- Added focused-input refs for critical fields
- Added `scrollToFocusedInput` calls on `onFocus` via `findNodeHandle(...)`

## Critical fix: Job application "Message" field
File: `app/(locksmith)/job/[id]/index.tsx`
- Added `messageInputRef`
- Added explicit `onFocus={() => scrollToInput(messageInputRef)}`
- Increased message textarea rows and set `textAlignVertical="top"`

This directly addresses the reported issue where the Message field can be hidden behind Android keyboard.

## Quote builder focus fixes
File: `app/(locksmith)/job/[id]/quote.tsx`
- Added scroll/focus management refs
- Added explicit focus scrolling for:
  - `defect` multiline field
  - `newPartPrice` field near lower viewport area

## Auth screens hardening
Files:
- `app/(auth)/locksmith-login.tsx`
- `app/(auth)/locksmith-register.tsx`
- `app/(auth)/forgot-password.tsx`

Changes:
- Unified robust keyboard-aware config
- Added explicit scroll-to-focused-input for lower fields:
  - login password
  - register confirm password
  - forgot-password email

## 3) Android resize setting verification

- Verified in `app.config.js`: `android.softwareKeyboardLayoutMode = 'resize'`
- This aligns with required Android keyboard resize behavior.

## 4) Local testing / validation attempts

## What was executed
1. `npx expo start --android --non-interactive`
   - Failed due missing Android SDK/ADB in this VM environment:
     - `Failed to resolve the Android SDK path`
     - `Error: spawn adb ENOENT`

2. `npx expo export --platform android --output-dir /tmp/locksafe-export-check`
   - ✅ Succeeded (Android bundle generated)
   - Confirms app bundles successfully with the keyboard code changes.

3. `npx tsc --noEmit`
   - Fails in this repository with a TypeScript compiler stack overflow (`RangeError: Maximum call stack size exceeded`), which appears unrelated to this keyboard patch and pre-existing in current project/toolchain context.

## Manual emulator test status
- Full emulator interaction test could not be completed in this VM because Android SDK/ADB/emulator are not installed.
- Next required step (once SDK/emulator available): run `npx expo start --android` and execute keyboard verification flow on all 5 form screens.

## 5) Files modified

1. `app/(locksmith)/job/[id]/index.tsx`
2. `app/(locksmith)/job/[id]/quote.tsx`
3. `app/(auth)/locksmith-login.tsx`
4. `app/(auth)/locksmith-register.tsx`
5. `app/(auth)/forgot-password.tsx`

No build number increments were performed in this task.
