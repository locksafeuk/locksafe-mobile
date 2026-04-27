# Build 17 Comprehensive Password Input Fix (Forensic Audit)

Date: 2026-04-27  
Project: `locksafe-mobile`  
Target: iOS password masking dots not visible in secure `TextInput`

## Scope Executed

This build applies a full forensic audit for password-input-related rendering risk and introduces an ultra-minimal diagnostic implementation for login.

Completed from requested checklist:
- ✅ Deep code audit across auth/UI config for font and `TextInput` behavior
- ✅ Checked global/theme/default override risk
- ✅ Added new minimal `SecurePasswordInput` component
- ✅ Replaced login password input with minimal component
- ✅ Added diagnostic console logs for focus + text length changes
- ✅ Checked Expo config for UI/font-impacting settings
- ✅ Checked login parent hierarchy for inherited opacity/font issues
- ✅ Incremented iOS build number to 17
- ✅ Documented comprehensive findings and fallback strategies

---

## 1) Deep Audit Findings

### 1.1 Password/TextInput font references in app code
Search result: only two explicit `fontFamily` usages in auth screens:
- `app/(auth)/locksmith-login.tsx`
- `app/(auth)/locksmith-register.tsx`

### 1.2 Global style/theme risk review
- `tailwind.config.js` has **no custom `fontFamily` extension**.
- `global.css` only includes Tailwind directives (`@tailwind base/components/utilities`).
- No project-wide font loader (`expo-font`, `useFonts`) affecting auth inputs.

### 1.3 Global `TextInput` override review
- No `TextInput.defaultProps`, `setDefaultProps`, or global TextInput patching found in source.

### 1.4 Parent view hierarchy check (login)
- Password container does not have risky inherited opacity (`opacity` explicitly `1` on wrapper).
- No parent-level font styling applied to the password input node.
- No theme wrapper injecting custom text rendering props.

### 1.5 app.config.js check
- No app-level font plugin or UI style override that would force secure field glyph changes.
- `userInterfaceStyle: 'light'` is stable and not related to secure-dot masking behavior.

---

## 2) Forensic Runtime Clues from Uploaded Device Logs

Observed recurring iOS keyboard/input-system errors in uploaded `.log` files:
- `RemoteTextInput ... valid sessionID` errors
- `TextInputUI ... Result accumulator timeout`
- `RTIInputSystem... session dealloc` errors

These do not directly prove dot-glyph rendering root cause, but support isolating the password control from surrounding complexity.

---

## 3) Build 17 Code Changes Implemented

### 3.1 New minimal password component
Created:
- `components/SecurePasswordInput.tsx`

Behavior:
- Hard-coded `secureTextEntry={true}`
- Minimal platform styling only
- Explicit black text + white background
- No `fontFamily`, no icon wrappers, no extra secure-toggle logic
- Diagnostic logs:
  - `[PASSWORD] Focused`
  - `[PASSWORD] secureTextEntry: true`
  - `[PASSWORD] Text length: N`
  - `[PASSWORD] Has text: true/false`

### 3.2 Login screen switched to minimal component
Updated:
- `app/(auth)/locksmith-login.tsx`

Changes:
- Replaced prior complex/conditional password field with:
  - `<SecurePasswordInput value={password} onChangeText={...} />`
- Removed password-eye toggle path from login password field
- Retained existing screen-level debug logs and remember-me flow

### 3.3 iOS build increment
Updated:
- `app.config.js`
  - `ios.buildNumber: '16' -> '17'`

---

## 4) Why This Fix Is Stronger

This version strips the secure input down to the smallest viable native shape:
- No custom font
- No nested icon overlays in the same input row
- No dynamic secure/unsecure switching for this field
- No style inheritance from previous custom style object

If dots still fail in Build 17, issue is very likely outside JS styling (e.g., device/input subsystem anomaly, OS-specific secure field rendering behavior, or native/runtime issue).

---

## 5) Alternative Fallbacks Prepared

If Build 17 still reproduces:
1. **Native text-masking fallback** (custom bullet rendering UI with hidden input) for login only.
2. Optionally test a third-party password field abstraction library.
3. Add temporary A/B route to compare:
   - raw RN `TextInput secureTextEntry`
   - custom masked display

---

## 6) Validation Plan for User Device (Mac/iOS)

After installing Build 17:
1. Open Login screen.
2. Tap password field and type 5+ characters.
3. Confirm dot glyphs are visible.
4. Capture app logs for `[PASSWORD]` diagnostic entries.
5. Confirm login succeeds with entered password.

If dots are still invisible, capture a short screen recording + device logs from same session and we proceed to custom-masked fallback in Build 18.
