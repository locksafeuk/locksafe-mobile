# Build 16 Quick Testing Guide (Testers)

**Target Build:** `v1.0.2-build16`  
**Focus Areas:** Remember me persistence + Push notifications

---

## 1) Remember Me Verification

### Test Steps

1. Open Build 16 and sign in as locksmith.
2. Ensure **Remember me** is ON.
3. Close app fully (remove from recent apps/task switcher).
4. Reopen app.
5. Confirm the app does **not** ask for login again.

### Expected Result

- App restores previous signed-in session.
- User lands in locksmith dashboard flow without relogin.

### Negative Check (optional)

- Sign out manually.
- Reopen app.
- App should now return to login screen.

---

## 2) Push Notification Verification

> Use physical devices only.

### Test Steps

1. Login and accept notification permissions.
2. Ask backend/admin to send a test push to your test user.
3. Validate push behavior in all states:
   - app open (foreground)
   - app background
   - app closed/terminated
4. Tap incoming notification.

### Expected Result

- Notification arrives in all applicable states.
- Tapping notification opens the app and routes to the correct job/update context.

---

## 3) What Should Work Now (Build 16)

- ✅ Remembered login session persists after restart.
- ✅ Native push registration uses FCM/APNs flow.
- ✅ Android push no longer depends on OneSignal runtime path.
- ✅ No known blocker for these two critical fixes.

---

## 4) Failure Signals to Report Immediately

If you see any of the following, report with screenshot + timestamp + device model + OS version:

- App asks for login again after restart (with Remember me enabled)
- No push received after confirmed backend trigger
- Push appears but opens wrong screen/context
- Crash during login, logout, or app startup
