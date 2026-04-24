# LockSafe Mobile App - Complete Deployment Guide

> Last Updated: April 24, 2026

This guide covers everything you need to deploy the LockSafe mobile app to both Google Play Store and iOS App Store.

---

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Manual Steps Required](#manual-steps-required)
3. [Environment Configuration](#environment-configuration)
4. [Building the App](#building-the-app)
5. [Google Play Store Deployment](#google-play-store-deployment)
6. [iOS App Store Deployment](#ios-app-store-deployment)
7. [Post-Deployment](#post-deployment)

---

## Pre-Deployment Checklist

Before you begin, ensure you have:

### Accounts Required
- [ ] **Expo Account** - Free at [expo.dev](https://expo.dev)
- [ ] **EAS Account** - Same as Expo account
- [ ] **Google Play Developer Account** - $25 one-time fee at [play.google.com/console](https://play.google.com/console)
- [ ] **Apple Developer Account** - $99/year at [developer.apple.com](https://developer.apple.com)
- [ ] **Stripe Account** - For payment processing
- [ ] **Firebase Project (FCM)** - For Android native push notifications
- [ ] **Apple Developer Push Capability** - For iOS APNs notifications

### Development Prerequisites
- [ ] Node.js 18+ installed
- [ ] EAS CLI installed (`npm install -g eas-cli`)
- [ ] Git installed
- [ ] Mac computer (required for iOS builds locally, or use EAS cloud builds)

---

## Manual Steps Required

### Step 1: Configure API Keys in `app.json`

Open `locksafe-mobile/app.json` and update the `extra` section:

```json
{
  "expo": {
    "extra": {
      "apiUrl": "https://locksafe.uk",
      "stripePublishableKey": "pk_live_YOUR_STRIPE_PUBLISHABLE_KEY",
      "oneSignalAppId": "YOUR_ONESIGNAL_APP_ID",
      "eas": {
        "projectId": "YOUR_EAS_PROJECT_ID"
      }
    }
  }
}
```

### Step 2: Configure Google Maps API Keys

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable these APIs:
   - Maps SDK for Android
   - Maps SDK for iOS
4. Create API keys (restrict by app)
5. Add to `app.json`:

```json
{
  "expo": {
    "ios": {
      "config": {
        "googleMapsApiKey": "YOUR_IOS_GOOGLE_MAPS_KEY"
      }
    },
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "YOUR_ANDROID_GOOGLE_MAPS_KEY"
        }
      }
    }
  }
}
```

### Step 3: Configure Native Push (Build 16+)

Build 16 removed OneSignal runtime integration and uses native push infrastructure.

1. **For Android (FCM):**
   - Ensure `google-services.json` is present at project root (or injected via `GOOGLE_SERVICES_JSON` EAS secret)
   - Confirm `app.config.js` resolves `android.googleServicesFile`
   - Verify Firebase Cloud Messaging is enabled in your Firebase project
2. **For iOS (APNs):**
   - Ensure Push Notifications capability is enabled for the app identifier
   - Ensure APNs credentials are configured in your EAS/Apple setup
3. Confirm the app includes `expo-notifications` plugin config in `app.config.js` and physical-device testing is used

### Step 4: Configure Stripe

1. Get your publishable key from [Stripe Dashboard](https://dashboard.stripe.com)
2. For iOS: Register merchant ID in Apple Developer Portal
3. Update `app.json` with your Stripe publishable key

### Step 5: Create EAS Project

```bash
cd locksafe-mobile

# Login to EAS
eas login

# Initialize project (this will set up the EAS project ID)
eas init

# This will update app.json with your project ID
```

### Step 6: Generate App Icons & Splash Screen

LockSafe includes asset generation tools to create properly branded icons:

**Option A: Use the HTML Generator (Recommended)**
```bash
# Open in browser
open scripts/generate-assets.html

# Click "Download All Assets" to get a ZIP
# Extract to assets/ folder
```

**Option B: Use Node.js Script**
```bash
# Install canvas dependency
npm install canvas

# Generate assets
node scripts/generate-assets.js
```

**Option C: Convert SVG Sources**
```bash
# Using Inkscape
inkscape assets/source/icon.svg -w 1024 -h 1024 -o assets/icon.png
```

**Generated Assets:**
| File | Size | Purpose |
|------|------|---------|
| `icon.png` | 1024x1024 | iOS & Android app icon |
| `adaptive-icon.png` | 1024x1024 | Android adaptive icon foreground |
| `android-icon-foreground.png` | 1024x1024 | Android foreground layer |
| `android-icon-background.png` | 1024x1024 | Android background (orange) |
| `android-icon-monochrome.png` | 1024x1024 | Android themed icons |
| `splash-icon.png` | 288x288 | Splash screen icon |
| `favicon.png` | 48x48 | Web favicon |

### Step 7: Create Store Screenshots

You'll need screenshots for both app stores. Here are the required sizes:

**Google Play Store:**
- Phone: 1080x1920 or 1440x2560 (16:9 ratio)
- 7" Tablet: 1200x1920 (optional)
- 10" Tablet: 1600x2560 (optional)
- Minimum 2, recommended 8 screenshots

**Apple App Store:**
- iPhone 6.7": 1290x2796
- iPhone 6.5": 1242x2688
- iPhone 5.5": 1242x2208
- iPad Pro 12.9": 2048x2732

**Creating Screenshots:**

1. **Using Expo Go:**
   ```bash
   # Start development server
   npx expo start

   # Open on device/simulator
   # Navigate to each screen
   # Take screenshots
   ```

2. **Using Simulator/Emulator:**
   - iOS: Cmd+S in Simulator
   - Android: Capture button in emulator

3. **Recommended Screenshots:**
   - Welcome/Login screen
   - Customer dashboard
   - Request locksmith flow
   - Live tracking screen
   - Quote acceptance
   - Digital signature
   - Locksmith dashboard
   - Available jobs list

4. **Screenshot Enhancement:**
   - Use [Shotsnapp](https://shotsnapp.com) or [AppMockUp](https://app-mockup.com)
   - Add device frames
   - Add marketing text/captions

---

## Environment Configuration

### Create `.env` file (for local development):

```bash
cp .env.example .env
```

Edit `.env`:
```
API_URL=https://locksafe.uk
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
EXPO_PUBLIC_ONESIGNAL_APP_ID=xxx-xxx-xxx
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaxxx
```

### Update `eas.json` for Production

Edit `eas.json` to configure your Apple credentials:

```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "your@apple.id",
        "ascAppId": "YOUR_APP_STORE_CONNECT_APP_ID",
        "appleTeamId": "YOUR_TEAM_ID"
      },
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "production"
      }
    }
  }
}
```

---

## Building the App

### Install Dependencies

```bash
cd locksafe-mobile
npm install
```

### Development Build (for testing)

```bash
# Build for iOS Simulator
eas build --profile development --platform ios

# Build for Android Emulator/Device
eas build --profile development --platform android
```

### Preview Build (internal testing)

```bash
# Build for internal distribution
eas build --profile preview --platform all
```

### Production Build

```bash
# Build for app stores
eas build --profile production --platform all
```

---

## Google Play Store Deployment

### Step 1: Create Google Play Console Account

1. Go to [Google Play Console](https://play.google.com/console)
2. Pay $25 registration fee (one-time)
3. Complete account verification

### Step 2: Create Your App

1. Click "Create app"
2. Fill in:
   - App name: **LockSafe**
   - Default language: English (UK)
   - App type: App
   - Category: Lifestyle or Tools
   - Free or paid: Free
3. Accept declarations

### Step 3: Set Up Store Listing

**Main Store Listing:**
- **App name:** LockSafe - Emergency Locksmith
- **Short description (80 chars):**
  > Find verified locksmiths near you. 24/7 emergency service with transparent pricing.
- **Full description (4000 chars):**
  > LockSafe connects you with verified, insured locksmiths in your area within minutes.
  >
  > KEY FEATURES:
  > • 24/7 Emergency Service - Get help anytime, day or night
  > • Verified Professionals - All locksmiths are ID-verified and insured
  > • Transparent Pricing - See the full quote before any work begins
  > • Real-Time Tracking - Track your locksmith's arrival live on the map
  > • Secure Payments - Pay securely through the app with Stripe
  > • Digital Signatures - Sign off on completed work digitally
  >
  > HOW IT WORKS:
  > 1. Submit your request - Describe your lock problem and location
  > 2. Choose a locksmith - Review profiles, ratings, and quotes
  > 3. Track arrival - Watch your locksmith arrive in real-time
  > 4. Approve the quote - No surprises, see the full cost upfront
  > 5. Sign & pay - Complete the job with digital signature
  >
  > FOR LOCKSMITHS:
  > • Receive job alerts in your coverage area
  > • Submit quotes and manage jobs on the go
  > • Track your earnings and payouts
  > • Build your reputation with customer reviews
  >
  > Download LockSafe now for reliable emergency locksmith services!

**Graphics:**
- App icon: 512x512 PNG
- Feature graphic: 1024x500 PNG
- Phone screenshots: Minimum 2, recommended 8
  - Required sizes: 16:9 or 9:16 aspect ratio
- 7-inch tablet screenshots (optional)
- 10-inch tablet screenshots (optional)

### Step 4: Content Rating

1. Go to "Content rating" in sidebar
2. Complete the questionnaire
3. Categories typically applicable:
   - Violence: None
   - Sexual content: None
   - Profanity: None
   - Location sharing: Yes (functional)
   - Financial transactions: Yes

### Step 5: App Privacy

Create a Privacy Policy URL and add it. Your policy should cover:
- Location data collection
- Payment information handling
- Personal data storage
- GDPR compliance

### Step 6: Create Service Account for Automated Submissions

1. Go to Google Cloud Console
2. Create Service Account
3. Grant "Service Account User" role
4. Create JSON key and download
5. In Play Console, go to Settings → API Access
6. Link to Google Cloud project
7. Grant access to the service account

Save the JSON key as `google-service-account.json` in your project.

### Step 7: Upload and Submit

```bash
# Build for production
eas build --profile production --platform android

# Submit to Google Play
eas submit --platform android
```

Or manually upload:
1. Download the `.aab` file from EAS
2. Go to Play Console → Production → Create new release
3. Upload the AAB
4. Add release notes
5. Save and submit for review

### Build 16 Production Release (v1.0.2-build16)

Use the validated Build 16 artifact for production rollout:

- **Version:** `1.0.2 (16)`
- **Build ID:** `bca43070-3f1c-47a4-9589-8336fd87853e`
- **AAB Path:** `/home/ubuntu/locksafe-mobile/build/locksafe-v1.0.2-build16.aab`

#### Google Play Console rollout steps (Build 16)
1. Open **Play Console → LockSafe app → Production → Create new release**.
2. Upload `locksafe-v1.0.2-build16.aab`.
3. Add release notes summary:
   - Fixed login session persistence ("Remember me" now survives app restarts)
   - Migrated Android push notifications to native FCM path (OneSignal runtime removed)
4. Complete policy checks and rollout review prompts.
5. Start staged rollout (recommended 10% → 25% → 50% → 100%).

#### Mandatory pre-rollout validation
- [ ] Login once with **Remember me** enabled, close app, reopen app → user remains signed in
- [ ] Trigger test push from backend or notification admin tool → receives on Build 16 device
- [ ] Verify no startup crash after sign-in/sign-out cycles
- [ ] Verify notifications route to correct job screen when opened

### Review Timeline
- **Initial review:** 1-3 days
- **Subsequent updates:** Usually within 24 hours

---

## iOS App Store Deployment

### Step 1: Apple Developer Account Setup

1. Enroll at [developer.apple.com](https://developer.apple.com)
2. Pay $99/year
3. Complete verification (may take 24-48 hours)

### Step 2: Create App in App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click "+" → "New App"
3. Fill in:
   - Platform: iOS
   - Name: **LockSafe**
   - Primary language: English (UK)
   - Bundle ID: `uk.locksafe.app`
   - SKU: `locksafe-ios-001`

### Step 3: Create Certificates & Profiles

EAS handles this automatically, but you can also do it manually:

1. **Create App ID:**
   - Go to Certificates, IDs & Profiles
   - Register new App ID
   - Enable capabilities: Push Notifications, Maps

2. **Create Distribution Certificate:**
   - For App Store distribution
   - Download and install in Keychain

3. **Create Provisioning Profile:**
   - App Store distribution profile
   - Link to your App ID and certificate

### Step 4: Configure Push Notifications

1. In Apple Developer Portal:
   - Go to Keys
   - Create new key with APNs capability
   - Download the .p8 file

2. In OneSignal:
   - Add iOS app
   - Upload the .p8 key
   - Enter Key ID and Team ID

### Step 5: App Store Listing

**App Information:**
- **Name:** LockSafe - Emergency Locksmith
- **Subtitle:** 24/7 Verified Locksmiths
- **Category:** Lifestyle (primary), Utilities (secondary)
- **Content Rights:** Does not contain third-party content

**Version Information:**
- **Promotional Text (170 chars):**
  > Find verified locksmiths instantly. Real-time tracking, transparent pricing, secure payments.

- **Description (4000 chars):**
  > (Same as Google Play description)

- **Keywords (100 chars):**
  > locksmith,emergency,lockout,keys,lock,24/7,door,unlock,security,home

- **Support URL:** https://locksafe.uk/support
- **Marketing URL:** https://locksafe.uk

**Screenshots:**
Required for each device size:
- iPhone 6.7" (1290 x 2796)
- iPhone 6.5" (1242 x 2688)
- iPhone 5.5" (1242 x 2208)
- iPad Pro 12.9" (2048 x 2732)

### Step 6: App Privacy Labels

Apple requires privacy nutrition labels. For LockSafe:

**Data Linked to You:**
- Contact Info (name, email, phone)
- Location (precise location for job requests)
- Financial Info (payment data via Stripe)
- Identifiers (device ID for push notifications)

**Data Used to Track You:**
- None

### Step 7: Export Compliance

Answer NO to encryption questions if you're only using HTTPS (which uses standard encryption).

### Step 8: Build and Submit

```bash
# Build for iOS
eas build --profile production --platform ios

# Submit to App Store
eas submit --platform ios
```

You'll be prompted for:
- Apple ID
- App-specific password (generate at appleid.apple.com)
- Team ID

### Step 9: App Review

After submission:
1. App goes to "Waiting for Review"
2. Review typically takes 24-48 hours
3. You may receive questions via App Store Connect
4. Common rejection reasons:
   - Missing privacy policy
   - Placeholder content
   - Crashes during review
   - Incomplete functionality

### Tips for Approval
- Provide a demo account in "App Review Information"
- Include notes explaining location/payment permissions
- Ensure all features work without errors
- Test on real devices before submitting

---

## Post-Deployment

### Monitor Performance

1. **Google Play Console:**
   - Check Android Vitals for crashes
   - Monitor reviews and ratings
   - Track install/uninstall rates

2. **App Store Connect:**
   - View Analytics for downloads
   - Monitor crash reports
   - Respond to reviews

3. **Push Delivery Monitoring (Native):**
   - Verify backend native token registration metrics (FCM/APNs)
   - Track push delivery success/failure rates from your notification backend logs

### Update Process

For subsequent updates:

```bash
# 1. Update version in app.json
# 2. Build new version
eas build --profile production --platform all

# 3. Submit update
eas submit --platform all
```

### Rollback Process

If issues occur:
1. In Play Console: Halt rollout or roll back
2. In App Store Connect: Remove from sale or submit hotfix

---

## Summary: Complete Checklist

### Before First Build
- [ ] Configure `app.json` with all API keys
- [ ] Set up Google Maps API keys
- [ ] Configure native push stack (FCM for Android, APNs for iOS)
- [ ] Add Stripe publishable key
- [ ] Initialize EAS project
- [ ] Replace placeholder app icons

### Google Play
- [ ] Create Google Play Developer account ($25)
- [ ] Create app in Play Console
- [ ] Complete store listing
- [ ] Complete content rating
- [ ] Add privacy policy
- [ ] Create service account for automated deploys
- [ ] Build and submit with EAS

### iOS App Store
- [ ] Enroll in Apple Developer Program ($99/year)
- [ ] Create app in App Store Connect
- [ ] Configure APNs for push notifications
- [ ] Complete App Store listing
- [ ] Add privacy labels
- [ ] Build and submit with EAS

---

## Troubleshooting

### Common Issues

**Build fails with missing dependencies:**
```bash
rm -rf node_modules
npm install
eas build --clear-cache --platform [ios|android]
```

**Push notifications not working:**
1. Verify `google-services.json` is present (Android) or `GOOGLE_SERVICES_JSON` secret is configured for EAS
2. Confirm physical device testing (push tokens are not generated reliably on simulators/emulators)
3. Check APNs credentials (iOS) / Firebase Cloud Messaging setup (Android)
4. Ensure user granted notification permission

**API calls failing:**
1. Verify `apiUrl` in `app.json`
2. Check CORS settings on backend
3. Verify SSL certificate on backend

**Stripe payments not working:**
1. Verify publishable key
2. For iOS: Check merchant ID setup
3. Test with Stripe test cards first

---

## Support

- **Expo Documentation:** https://docs.expo.dev
- **EAS Build:** https://docs.expo.dev/build/introduction/
- **EAS Submit:** https://docs.expo.dev/submit/introduction/
- **LockSafe Support:** support@locksafe.uk

---

*This guide is maintained by the LockSafe development team.*
