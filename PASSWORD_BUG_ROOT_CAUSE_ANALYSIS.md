# PASSWORD BUG ROOT CAUSE ANALYSIS

## Scope
Deep code analysis requested for `secureTextEntry` behavior on:
- `app/(auth)/locksmith-login.tsx`
- `app/(auth)/locksmith-register.tsx`
- `stores/authStore.ts` (Remember Me side effects)

---

## Step 1: Login Password Field (`app/(auth)/locksmith-login.tsx`)

### 1) showPassword state initialization
```ts
const [showPassword, setShowPassword] = useState(false);
```
- **Actual value:** `false`
- **Expected value:** `false`
- ✅ Correct (password should be hidden by default)

### 2) secureTextEntry expression
```tsx
<TextInput
  ...
  secureTextEntry={!showPassword}
  ...
/>
```
- **Actual expression:** `!showPassword`
- **Expected expression:** `!showPassword`
- ✅ Correct (not backwards)

### 3) Toggle logic
```tsx
<Pressable onPress={() => setShowPassword(!showPassword)}>
  {showPassword ? <EyeOff ... /> : <Eye ... />}
</Pressable>
```
- Tapping toggle flips `showPassword` true/false.
- Eye icon state also matches toggled value.
- ✅ Correct toggle behavior.

---

## Step 2: Register Password Fields (`app/(auth)/locksmith-register.tsx`)

### 1) showPassword state initialization
```ts
const [showPassword, setShowPassword] = useState(false);
```
- ✅ Correct default.

### 2) Password field secureTextEntry
```tsx
secureTextEntry={!showPassword}
```
- ✅ Correct.

### 3) Confirm password field secureTextEntry
```tsx
secureTextEntry={!showPassword}
```
- ✅ Correct.

### 4) Toggle behavior
```tsx
<Pressable onPress={() => setShowPassword(!showPassword)}>
```
- Single toggle controls both password + confirm password visibility.
- ✅ Logical and not reversed.

---

## Step 3: Remember Me Interference Check (`stores/authStore.ts`)

### What Remember Me does
- Loads saved credentials and pre-fills login fields:
  - Login screen:
    ```ts
    const { email: savedEmail, password: savedPassword } = await getRememberedCredentials();
    if (savedEmail) setEmail(savedEmail);
    if (savedPassword) setPassword(savedPassword);
    ```
- Persists password only when rememberMe is enabled:
  ```ts
  if (rememberMe) {
    setRememberedPassword(password)
  }
  ```

### Critical finding
- There is **no code path** that sets `showPassword = true` when loading remembered password.
- No state coupling exists between remembered credentials and password visibility.
- ✅ No direct Remember Me → `showPassword` bug.

---

## Step 4: Global Override Check

Search results show:
- No global `TextInput.defaultProps` override.
- No prop spread overriding `secureTextEntry` on these password fields.
- `secureTextEntry` appears only in login/register and is correctly set.

✅ No global override bug found.

---

## Step 5: Exact Login Password Field Code (as implemented)

```tsx
const [showPassword, setShowPassword] = useState(false);

<TextInput
  ref={passwordInputRef}
  value={password}
  onFocus={scrollFormForKeyboard}
  onChangeText={(text) => {
    setPassword(text);
    clearError();
  }}
  placeholder="Enter password"
  secureTextEntry={!showPassword}
  autoCapitalize="none"
  autoCorrect={false}
  autoComplete="password"
  textContentType="password"
  returnKeyType="done"
  enablesReturnKeyAutomatically
  editable={!isLoading}
  onSubmitEditing={handleLogin}
  style={[
    styles.passwordInput,
    Platform.OS === 'ios' ? styles.passwordInputIOS : null,
  ]}
  selectionColor="#000000"
  placeholderTextColor="#9CA3AF"
  spellCheck={false}
/>

<Pressable
  onPress={() => setShowPassword(!showPassword)}
  hitSlop={10}
  disabled={isLoading}
>
  {showPassword ? (
    <EyeOff size={20} color="#64748b" />
  ) : (
    <Eye size={20} color="#64748b" />
  )}
</Pressable>
```

---

## Root Cause Conclusion

## What is **NOT** broken
- `showPassword` is not initialized incorrectly.
- `secureTextEntry` is not reversed.
- Toggle logic is not reversed.
- Remember Me does not directly flip password visibility.
- No global overrides were found.

## Most likely actual issue
Given the code is logically correct, the observed "password visible instead of bullets" is most likely a **platform/input behavior issue**, not a logic inversion bug.

The strongest code-level trigger candidate is this combination on iOS login:
1. Programmatic prefill of password from Remember Me (`setPassword(savedPassword)`)
2. `TextInput` configured with `textContentType="password"` and `autoComplete="password"`
3. Controlled input value rendering in RN/iOS secure text field

This combination can cause iOS/RN secure-field rendering quirks in some versions/builds where prefilled secure content is displayed unexpectedly.

---

## What needs to be fixed

Since no boolean logic bug exists, fix should target iOS secure field behavior:

1. **Stop pre-filling password text directly into the visible input** (recommended)
   - Keep remembered email only, or
   - Store a flag and let OS Keychain autofill instead of app-managed plaintext prefill into field value.

2. If password prefill must remain, test mitigations:
   - use `autoComplete="current-password"` for login,
   - temporarily clear/reapply value after mount,
   - force remount input when visibility changes,
   - remove `textContentType` for problematic iOS versions.

3. Add targeted iOS regression test:
   - rememberMe ON + relaunch + login screen load + verify bullets rendered before user interaction.

---

## Final Answer to Hypothesis Checks
- Is `showPassword` starting as true? **No**.
- Is `secureTextEntry` backwards? **No**.
- Is Remember Me explicitly showing password? **No direct showPassword state change**, but its prefill flow is the likely trigger.
- Is there a state management inversion issue? **No inversion found**.

---

## Summary
There is **no direct logic error** in `showPassword` / `secureTextEntry` implementation. The likely root cause is an **iOS secure text rendering quirk triggered by prefilled remembered password in a controlled `TextInput`**, not a backward boolean condition in the code.
