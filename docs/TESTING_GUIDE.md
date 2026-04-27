# LockSafe Mobile App — Testing Guide

> **Last updated:** 27 April 2026  
> **App version:** 1.0.2 (Build 17)  
> **Expo SDK:** 52  
> **Backend API:** https://www.locksafe.uk  
> **Build 17 EAS ID:** `c9e472dd-ce72-4a62-9e5c-49eb3fc0fefa`  
> **Build 17 IPA (EAS):** https://expo.dev/artifacts/eas/qVYiSarPNDAXg8g5PTfkoj.ipa  
> **Build 17 IPA (local VM):** `/home/ubuntu/locksafe-mobile/build/locksafe-v1.0.2-build17-ios.ipa`

---

## ⚠️ Important: Why You Can't Use Expo Go

This app uses **native modules** that are not included in the standard Expo Go app:

| Module | Purpose |
|---|---|
| `react-native-maps` | Google Maps for job tracking |
| `react-native-signature-canvas` | Digital signature capture |
| `@stripe/stripe-react-native` | Payment processing |
| `expo-location` (background) | Real-time locksmith tracking |
| `expo-camera` | Job photo documentation |

**You must create a custom build** (development or preview) to test the app on a physical device or emulator.

---

## Build 17 — Comprehensive iOS Testing Plan (Priority)

### Scope for this build
Build 17 specifically targets iOS stability and password entry reliability. Test this build as a **release candidate** with focus on:

- Secure password dots rendering and login reliability
- Keyboard behavior across auth and job forms
- iOS navigation stability (no `SIGABRT` regressions)
- Refresh interactions on iOS tabs (using header refresh buttons)
- Native module reliability (maps, camera, location, Stripe, notifications)

### Build metadata
- **Build Number:** 17
- **Version:** 1.0.2
- **EAS Build ID:** `c9e472dd-ce72-4a62-9e5c-49eb3fc0fefa`
- **Status:** Finished
- **Started:** 27 Apr 2026, 09:32 UTC
- **Finished:** 27 Apr 2026, 09:39 UTC
- **IPA URL:** https://expo.dev/artifacts/eas/qVYiSarPNDAXg8g5PTfkoj.ipa
- **Local IPA copy:** `/home/ubuntu/locksafe-mobile/build/locksafe-v1.0.2-build17-ios.ipa`

### Pre-test setup checklist
- Install Build 17 on at least 2 iOS devices (recommended: one small-screen + one large-screen iPhone)
- Test on iOS 17+ and (if available) iOS 18+
- Use both good network (Wi-Fi) and constrained network (4G/poor signal)
- Prepare test locksmith credentials and one invalid credential set
- Enable screen recording during all critical tests (login, quote, photos, status updates)

### Critical test cases (must pass)
1. **Login password masking:** password field shows secure dots while typing.
2. **Login success path:** valid credentials login and route to locksmith tabs.
3. **Login failure path:** invalid credentials show error without UI freeze/crash.
4. **Remember me persistence:** restart app and verify remembered credentials behavior.
5. **Forgot password navigation:** route opens correctly from login.
6. **Dashboard stability:** toggle availability repeatedly (10x) without crash.
7. **Available Jobs refresh on iOS:** header refresh button works repeatedly (10x).
8. **Earnings refresh on iOS:** header refresh button works repeatedly (10x).
9. **Job details form + keyboard:** message input and scrolling remain stable.
10. **Quote form + keyboard:** all numeric/text fields editable, no clipped inputs.
11. **Job photos:** camera + gallery pick + upload + delete all succeed.
12. **Map rendering:** job map loads with correct marker and no blank tiles.
13. **Location permissions:** permission flow is handled gracefully.
14. **Push registration:** notification token registration path completes.
15. **Cold start + warm start loops:** 20 open/close cycles without crash.

### Extended regression matrix
- Authentication: login/logout/session restore
- Jobs: fetch available jobs, apply, update status transitions
- Quote: create quote with parts/labor values and submission validation
- Payments: ensure payment intent flows still initialize
- Notifications: fetch notifications list and mark-as-read flow
- Support links: Help Center / Terms / Privacy links open correctly

### Evidence to collect for sign-off
- Screen recording for all 15 critical tests
- Crash-free confirmation from device logs / Xcode organizer / TestFlight diagnostics
- API error screenshots (if any) including timestamp and endpoint
- Final tester checklist with Pass/Fail and reproduction steps for failures

### Exit criteria for release
- 100% pass on critical test cases
- No P0/P1 crashes
- No keyboard regression on iOS auth/job/quote forms
- No secure password rendering regressions
- No blocker in job flow (apply → quote → photo → status updates)

---

## 1. Prerequisites

Before testing, ensure you have:

- **Node.js** ≥ 18 installed
- **EAS CLI** installed globally: `npm install -g eas-cli`
- An **Expo account** — sign up at [expo.dev](https://expo.dev)
- Logged into EAS: `eas login`
- For iOS builds: An **Apple Developer account** ($99/year)
- For Android: A physical device or Android emulator

---

## 2. Install Dependencies

```bash
cd /home/ubuntu/locksafe-mobile
npm install
```

---

## 3. Build Profiles Explained

The app has four build profiles configured in `eas.json`:

| Profile | Purpose | Output | API Keys | Distribution |
|---|---|---|---|---|
| `development` | Local dev with hot reload | APK (Android) / Simulator (iOS) | Placeholder | Internal |
| `development-device` | On-device dev with hot reload | APK | **Real keys** | Internal |
| `preview` | QA/stakeholder testing | APK (Android) / Ad Hoc (iOS) | **Real keys** | Internal |
| `production` | App Store / Play Store release | AAB (Android) / IPA (iOS) | **Real keys** | Store |

### Preview vs Production Builds

| Feature | Preview Build | Production Build |
|---|---|---|
| **App Name** | LockSafe (Preview) | LockSafe |
| **Bundle ID** | `uk.locksafe.app.preview` | `uk.locksafe.app` |
| **Distribution** | Internal (direct install) | App Store / Play Store |
| **Signing** | Ad hoc (iOS) / Debug (Android) | Production certificates |
| **Performance** | Near-production | Fully optimised |
| **OTA Updates** | Supported | Supported |
| **Recommended for** | QA, stakeholder demos | Public release |

---

## 4. Creating a Preview Build

### Android (Recommended for Quick Testing)

```bash
# Create a preview APK for Android
eas build --profile preview --platform android
```

This will:
1. Upload the project to EAS Build servers
2. Build an APK file (~5-10 minutes)
3. Provide a **download link** and **QR code** when complete

### iOS

```bash
# Create a preview build for iOS (requires Apple Developer account)
eas build --profile preview --platform ios
```

> **Note:** For iOS, you'll need to register test devices. EAS will guide you through this process.

### Both Platforms

```bash
eas build --profile preview --platform all
```

---

## 5. Installing the Preview Build

### Android

1. After the build completes, you'll receive a **download URL**
2. Open the URL on your Android device (or scan the QR code)
3. Download the `.apk` file
4. Open the downloaded file and tap **Install**
   - You may need to enable "Install from unknown sources" in Settings
5. The app will appear as **"LockSafe (Preview)"** on your home screen

### iOS

1. After the build completes, you'll receive a link
2. Open the link on your iOS device
3. Tap **Install** when prompted
4. Go to **Settings → General → VPN & Device Management**
5. Trust the developer certificate
6. The app will appear as **"LockSafe (Preview)"** on your home screen

> **Tip:** You can also view all builds at [expo.dev](https://expo.dev) → Your Project → Builds

---

## 6. Development Build (For Developers)

If you want **hot reload** and the full development experience on a physical device:

```bash
# Build a development client for a physical Android device
eas build --profile development-device --platform android

# After installing the dev build on your device, start the dev server:
npx expo start --dev-client
```

Then:
1. Install the development build APK on your device
2. Open the app — it will show a dev client UI
3. Enter the dev server URL (shown in terminal) or scan the QR code
4. The app will load with **hot reload** enabled

---

## 7. Running on Emulator/Simulator

### Android Emulator

```bash
# Build for development (emulator)
eas build --profile development --platform android

# Or run locally if you have Android Studio set up:
npx expo run:android
```

### iOS Simulator (macOS only)

```bash
# Build for iOS Simulator
eas build --profile development --platform ios

# Or run locally if you have Xcode:
npx expo run:ios
```

---

## 8. Verification Checklist

After installing the preview build, verify the following:

### ✅ App Launch & Navigation
- [ ] App opens without crashing
- [ ] Splash screen displays correctly (orange theme)
- [ ] Login/Register screens are accessible
- [ ] Tab navigation works for both customer and locksmith flows

### ✅ API Connectivity
- [ ] Login with test credentials works
- [ ] Registration creates new accounts
- [ ] Job list loads correctly
- [ ] Notifications load

The app connects to: **https://www.locksafe.uk**  
Backend health check: `curl https://www.locksafe.uk/api/health`

### ✅ Google Maps
- [ ] Maps render on job detail screens
- [ ] Job locations display with markers
- [ ] Locksmith tracking map works (when assigned)

### ✅ Payments (Stripe)
- [ ] Payment sheet appears when booking a locksmith
- [ ] Card input fields render correctly
- [ ] Test payments process successfully

### ✅ Camera & Photos
- [ ] Camera opens for job photo documentation (locksmith flow)
- [ ] Photo gallery picker works
- [ ] Photos upload successfully

### ✅ Location Services
- [ ] Location permission prompt appears
- [ ] Current location detection works
- [ ] Location streaming works for locksmith tracking

### ✅ Digital Signature
- [ ] Signature pad renders on job completion screen
- [ ] Drawing/signing works smoothly
- [ ] Signature can be cleared and re-drawn

### ✅ Push Notifications
- [ ] OneSignal subscription works (may need production build for full testing)
- [ ] In-app notifications load from API

---

## 9. Testing Flows

### Locksmith Core Flow (Build 17)
1. **Sign in** as locksmith (validate secure password dots + remember-me behavior)
2. **Open dashboard** and toggle availability repeatedly
3. **Browse available jobs** and use iOS header refresh button
4. **Open a job detail** and test keyboard/input stability in all editable fields
5. **Apply for a job** (assessment fee + ETA + optional message)
6. **Capture photos** via camera and gallery, then delete one uploaded photo
7. **Create and submit quote** (labor + parts + VAT calculations)
8. **Update job statuses** through workflow transitions
9. **Check earnings tab** and trigger header refresh on iOS
10. **Open settings links** (Help Center / Terms / Privacy)

### Stability & Recovery Flow
1. Kill and relaunch app 20 times (cold/warm cycles)
2. Switch between Wi-Fi and mobile data during session
3. Trigger API failure scenario (invalid token / expired session)
4. Confirm app recovers gracefully (no crash loops, clear messaging)
5. Confirm session restore and re-login behavior remain stable

---

## 10. Environment Configuration

All API keys are configured in both `.env` and `eas.json`:

| Service | Status | Key Prefix |
|---|---|---|
| Backend API | ✅ Connected | `https://www.locksafe.uk` |
| Stripe | ✅ Live key configured | `pk_live_51T5TBs...` |
| OneSignal | ✅ Configured | `os_v2_app_zum5e4c...` |
| Google Maps | ✅ Configured | `AIzaSyBm5KY...` |

### Verifying API Connectivity

```bash
# Check backend health
curl -s https://www.locksafe.uk/api/health | python3 -m json.tool

# Expected response:
# {
#     "status": "healthy",
#     "checks": {
#         "database": {"status": "ok"},
#         "stripe": {"status": "ok"},
#         ...
#     }
# }
```

---

## 11. Troubleshooting

### Build Fails
- Run `eas whoami` to check you're logged in
- Run `eas build:configure` if project isn't linked
- Check `eas.json` for valid configuration
- Clear caches: `npx expo start --clear`

### App Crashes on Launch
- Check that all native modules are included in the build
- Verify API keys are set in the correct build profile
- Check Expo build logs at [expo.dev](https://expo.dev)

### Maps Not Showing
- Verify `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` is set
- Ensure Maps SDK for Android & iOS is enabled in Google Cloud Console
- For Android: the API key must be in `eas.json` (build-time config)

### Payments Not Working
- Verify `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set
- For test payments, use Stripe test cards: `4242 4242 4242 4242`
- Check that the backend Stripe webhook is configured

### Location Not Working
- Ensure location permissions are granted on the device
- For iOS: check both "When In Use" and "Always" permissions
- For Android: check "Precise location" is enabled

---

## 12. Next Steps After Testing

1. **Fix any bugs** found during testing
2. **Gather feedback** from stakeholders using the preview build
3. **Performance test** on lower-end devices
4. **Create production builds** when ready:
   ```bash
   eas build --profile production --platform all
   ```
5. **Submit to stores:**
   ```bash
   eas submit --platform ios
   eas submit --platform android
   ```
6. **Set up OTA updates** for post-launch patches:
   ```bash
   eas update --branch production
   ```

---

## Quick Reference Commands

```bash
# Install dependencies
npm install

# Start development server (for dev builds)
npx expo start --dev-client

# Build preview APK (Android)
eas build --profile preview --platform android

# Build preview (iOS)
eas build --profile preview --platform ios

# Build production (both platforms)
eas build --profile production --platform all

# Check EAS login
eas whoami

# View all builds
eas build:list

# Check backend health
curl https://www.locksafe.uk/api/health
```
