# iOS Build 10 User Testing Guide

Date: 2026-04-26  
Target build: `v1.0.2 (Build 10)`

## What was fixed

1. **Remember Me** now restores both email and password on login.
2. **Settings links** open correctly:
   - Help Center
   - Partner Terms
   - Privacy Policy
3. **Keyboard handling improvements** on iOS forms and job screens.
4. **Jobs tab crash hardening** on iOS (navigation/refresh handling).
5. **Navigation header safety hardening** (`headerLargeTitle` disabled in locksmith navigation layers).

## Primary test flow (must run)

### 1) Authentication / Remember Me
- Open app → go to Sign In.
- Enable **Remember me**.
- Log in with valid credentials.
- Force close app.
- Reopen app.
- Verify:
  - Session remains valid OR login screen is prefilled with remembered credentials.
  - No crash on startup.

### 2) Jobs tab stability
- From locksmith tabs, tap **Jobs** repeatedly.
- Switch rapidly between Dashboard ↔ Jobs ↔ Earnings ↔ Settings.
- Pull/apply refresh actions where available.
- Verify:
  - No crash / no white screen.
  - Jobs list loads normally.
  - Opening a job detail works.

### 3) Job detail + quote forms keyboard behavior
- Open a job from Jobs tab.
- In application form, focus fee/ETA/message fields.
- Verify keyboard does not hide active inputs.
- For an assigned/diagnosing job, open **Create Quote**.
- Test defect/labour/parts inputs and submit flow.
- Verify scrolling and input focus remain usable on iOS.

### 4) Settings links
- Open **Settings** tab.
- Tap each support link:
  - Help Center
  - Partner Terms
  - Privacy Policy
- Verify each opens correct page without app crash.

### 5) Earnings tab sanity
- Open **Earnings** tab.
- Trigger manual refresh from header button.
- Verify list and totals render and no crash occurs.

## Regression checklist

- [ ] App launches successfully.
- [ ] Login works.
- [ ] Remember Me persists correctly.
- [ ] Dashboard loads.
- [ ] Jobs tab does not crash.
- [ ] Job detail screen opens.
- [ ] Quote form usable with keyboard.
- [ ] Settings links open correctly.
- [ ] Earnings tab loads and refreshes.
- [ ] Logout works and returns to login screen.

## If you hit any issue, please provide

1. **Exact steps** before the issue.
2. **Expected behavior** vs **actual behavior**.
3. **Device + iOS version**.
4. **Timestamp** of issue.
5. **Screenshot or screen recording** if possible.
6. **Crash log (.ips)** from device (if crash happens).

## How to capture iOS crash logs (.ips)

1. On Mac, open **Xcode**.
2. Go to **Window → Devices and Simulators**.
3. Select your iPhone/iPad.
4. Open **View Device Logs**.
5. Export the latest `LockSafe` crash log (`.ips`) and share it.

## Priority focus for this round

- Jobs tab crash reproduction (or confirmation of fix).
- Full locksmith workflow pass (login → jobs → detail → quote → settings).
- Any remaining iOS keyboard/navigation issues.
