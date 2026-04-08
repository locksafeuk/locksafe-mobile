# LockSafe Mobile App — Testing Guide

> **Last updated:** 8 April 2026  
> **App version:** 1.0.0  
> **Expo SDK:** 52  
> **Backend API:** https://locksafe.uk

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

The app connects to: **https://locksafe.uk**  
Backend health check: `curl https://locksafe.uk/api/health`

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

### Customer Flow
1. **Register** as a new customer
2. **Request a locksmith** — select problem type, property type, enter location
3. **View job details** — check map, status, and locksmith applications
4. **Accept a locksmith** — pay assessment fee
5. **Track locksmith** — real-time map tracking
6. **Review quote** — accept or decline the work quote
7. **Sign & complete** — digital signature on job completion
8. **Rate the locksmith**

### Locksmith Flow
1. **Register** as a locksmith (or use test credentials)
2. **View dashboard** — toggle availability, see stats
3. **Browse available jobs** — see nearby requests
4. **Apply for a job** — set assessment fee and ETA
5. **Navigate to job** — update status through the workflow
6. **Take photos** — before, during, after documentation
7. **Submit quote** — parts, labour, VAT calculation
8. **Complete job** — await customer signature

---

## 10. Environment Configuration

All API keys are configured in both `.env` and `eas.json`:

| Service | Status | Key Prefix |
|---|---|---|
| Backend API | ✅ Connected | `https://locksafe.uk` |
| Stripe | ✅ Live key configured | `pk_live_51T5TBs...` |
| OneSignal | ✅ Configured | `os_v2_app_zum5e4c...` |
| Google Maps | ✅ Configured | `AIzaSyBm5KY...` |

### Verifying API Connectivity

```bash
# Check backend health
curl -s https://locksafe.uk/api/health | python3 -m json.tool

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
curl https://locksafe.uk/api/health
```
