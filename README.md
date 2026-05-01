# 🔒 LockSafe Mobile App

**UK's Trusted Locksmith Platform** — A React Native / Expo mobile application for connecting customers with verified locksmiths.

[![Built with Expo](https://img.shields.io/badge/Built%20with-Expo-4630EB.svg?style=flat-square)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.76-61dafb.svg?style=flat-square)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6.svg?style=flat-square)](https://www.typescriptlang.org)

---

## 📌 Current Deployment Status (Updated: 29 Apr 2026)

### ✅ Current Build Readiness
- **iOS Build 20 (v1.0.2):** 🟡 Submitted to Apple, waiting for review
- **Android Build 12 (v1.0.2):** 🟡 Closed alpha active, 8/12 testers onboarded

### Latest iOS Build Information
- **Version / Build:** 1.0.2 (Build 20)
- **Bundle ID:** `uk.locksafe.app`
- **Status:** Waiting for Apple Review
- **Submitted:** April 29, 2026 at 4:18 PM
- **Key release change:** Account deletion flow added to meet Guideline 5.1.1(v)

### Latest Android Build Information
- **Version / Build:** 1.0.2 (versionCode 12)
- **Package:** `uk.locksafe.app`
- **Track:** Closed Alpha Testing
- **Current tester count:** 8 of 12 required
- **Next action:** Add 4 more testers and request production access

### What Build 20 includes (iOS)
- Settings → **Delete Account** (danger zone)
- Two-step irreversible confirmation flow
- Typed keyword validation (`DELETE`) before final action
- Backend deletion API integration with fallback endpoint support
- Forced logout + redirect after successful account deletion

### Current status documents
- Comprehensive memory: [`COMPLETE_PROJECT_MEMORY_APRIL_29_2026.md`](./COMPLETE_PROJECT_MEMORY_APRIL_29_2026.md)
- One-page quick status: [`CURRENT_STATUS_QUICK.txt`](./CURRENT_STATUS_QUICK.txt)
- Build 20 verification: [`BUILD20_VERIFICATION.md`](./BUILD20_VERIFICATION.md)
- App Store submission complete: [`BUILD20_APPSTORE_SUBMISSION_COMPLETE.md`](./BUILD20_APPSTORE_SUBMISSION_COMPLETE.md)
- Build 20 submission report: [`BUILD20_SUBMISSION_REPORT.md`](./BUILD20_SUBMISSION_REPORT.md)

---

## 📱 Features

### Customer Features
- **Request a Locksmith** — 3-step wizard (problem type → property type → location)
- **Real-Time Tracking** — Live map view of locksmith en route with ETA
- **Transparent Pricing** — View itemised quotes with parts, labour, and VAT
- **Digital Signature** — Sign off on completed work with GPS verification
- **Push Notifications** — Receive updates on job status changes
- **Job History** — View all past and current jobs

### Locksmith Features
- **Dashboard** — Availability toggle, earnings overview, active jobs
- **Available Jobs** — Browse nearby job requests within coverage area
- **Job Management** — Full workflow from application to completion
- **Quote Builder** — Create detailed quotes with parts, labour, and auto-calculated totals
- **Photo Documentation** — Capture before/during/after photos with GPS tagging
- **Earnings Tracking** — Track commission breakdown (85% assessment fee, 75% work total)
- **Location Streaming** — Real-time location updates for customer tracking

### Technical Features
- **Expo Router** — File-based routing with deep linking support
- **NativeWind** — Tailwind CSS for React Native
- **Zustand** — Lightweight state management
- **React Query** — Server state management with caching
- **Stripe** — Payment processing (Apple Pay + Google Pay)
- **Google Maps** — Native map views with markers and route lines
- **SecureStore** — Encrypted token storage
- **SSE Tracking** — Real-time server-sent events for job tracking

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm/yarn
- **Expo CLI**: `npm install -g @expo/eas-cli`
- **Expo Go** app (for development on physical device)
- For native builds: Xcode (iOS) or Android Studio (Android)

### 1. Clone & Install

```bash
git clone <repo-url>
cd locksafe-mobile
npm install
```

### 2. Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your actual API keys
nano .env
```

#### Required Environment Variables

| Variable | Description | Where to Get It |
|----------|-------------|-----------------|
| `API_URL` | Backend API URL | Your server deployment |
| `EXPO_PUBLIC_API_URL` | Same as above (client-accessible) | Same |
| `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | [Stripe Dashboard](https://dashboard.stripe.com/apikeys) |
| `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps API key | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) |

#### Google Maps API Setup

Enable these APIs in Google Cloud Console:
1. **Maps SDK for Android**
2. **Maps SDK for iOS**
3. **Geocoding API**
4. **Places API** (optional, for address autocomplete)

### 3. Start Development

```bash
# Start the Expo development server
npx expo start

# Or start with cache cleared
npx expo start -c
```

Scan the QR code with Expo Go (Android) or Camera app (iOS).

---

## 🏗️ Project Structure

```
locksafe-mobile/
├── app/                          # Expo Router screens (file-based routing)
│   ├── _layout.tsx               # Root layout (providers, Stripe, auth init)
│   ├── index.tsx                 # Welcome/landing screen
│   ├── (auth)/                   # Authentication screens
│   │   ├── customer-login.tsx
│   │   ├── customer-register.tsx
│   │   ├── locksmith-login.tsx
│   │   └── locksmith-register.tsx
│   ├── (customer)/               # Customer screens
│   │   ├── (tabs)/               # Tab navigation
│   │   │   ├── index.tsx         # Home
│   │   │   ├── jobs.tsx          # Job history
│   │   │   ├── notifications.tsx # Alerts
│   │   │   └── settings.tsx      # Account settings
│   │   ├── request.tsx           # New job request wizard
│   │   └── job/[id]/             # Job detail screens
│   │       ├── index.tsx         # Job overview
│   │       ├── track.tsx         # Live tracking map
│   │       └── sign.tsx          # Signature & completion
│   └── (locksmith)/              # Locksmith screens
│       ├── (tabs)/               # Tab navigation
│       │   ├── index.tsx         # Dashboard
│       │   ├── available.tsx     # Available jobs
│       │   ├── earnings.tsx      # Earnings overview
│       │   └── settings.tsx      # Account settings
│       └── job/[id]/             # Job management
│           ├── index.tsx         # Job detail & status updates
│           ├── quote.tsx         # Quote builder
│           └── photos.tsx        # Photo documentation
├── components/                   # Reusable UI components
│   ├── JobMap.tsx                # Map component with markers
│   ├── MapPlaceholder.tsx        # Fallback map placeholder
│   └── SignaturePad.tsx          # Signature capture canvas
├── services/                     # API & service layer
│   ├── api/
│   │   ├── client.ts             # Axios instance with auth interceptors
│   │   ├── auth.ts               # Authentication APIs
│   │   ├── jobs.ts               # Job CRUD & workflow APIs
│   │   ├── payments.ts           # Stripe payment APIs
│   │   └── notifications.ts     # Push notification APIs
│   ├── location.ts               # GPS location service
│   ├── locationStreaming.ts      # Real-time location streaming
│   ├── tracking.ts               # SSE tracking service + hook
│   └── nativePushNotifications.ts # Native push notification service (APNs/FCM)
├── stores/                       # Zustand state stores
│   ├── authStore.ts              # Authentication state
│   └── jobStore.ts               # Job state management
├── hooks/                        # Custom React hooks
│   └── useLocationTracking.ts    # Location tracking hook
├── types/                        # TypeScript type definitions
│   └── index.ts                  # All shared types
├── docs/                         # Documentation
│   ├── API_COMPATIBILITY.md      # API endpoint mapping
│   └── DEPLOYMENT_GUIDE.md       # Detailed deployment steps
├── app.config.js                 # Dynamic Expo config (reads env vars)
├── app.json                      # Static Expo config (fallback)
├── eas.json                      # EAS Build & Submit configuration
├── .env.example                  # Environment variable template
└── package.json                  # Dependencies & scripts
```

---

## 🔑 Adding Real API Keys

### Step 1: Stripe

1. Go to [Stripe Dashboard → API Keys](https://dashboard.stripe.com/apikeys)
2. Copy the **Publishable key** (starts with `pk_test_` or `pk_live_`)
3. Set `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` in `.env`
4. For production, use `pk_live_` key in `eas.json` → `production` → `env`

### Step 2: Google Maps

1. Go to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. Create an API key or use an existing one
3. Enable: Maps SDK for Android, Maps SDK for iOS, Geocoding API
4. **Restrict the key** to your app's bundle ID (`uk.locksafe.app`)
5. Set `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` in `.env`

### Step 3: Native Push (Expo Notifications)

1. Ensure APNs is enabled for iOS app identifier in Apple Developer
2. Ensure Android Firebase project is linked and credentials are configured in EAS
3. Keep `expo-notifications` + `expo-device` installed
4. Test permission flow and token registration on physical devices

### Step 4: EAS Production Build

Update `eas.json` → `production` → `env` with your live keys:

```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY": "pk_live_YOUR_KEY",
        "EXPO_PUBLIC_GOOGLE_MAPS_API_KEY": "AIza-your-real-key"
      }
    }
  }
}
```

---

## 📦 Building & Deploying

### Development Build

```bash
# Android APK (for testing)
npx eas build --profile development --platform android

# iOS Simulator build
npx eas build --profile development --platform ios
```

### Preview Build (Internal Testing)

```bash
# Android APK for testers
npx eas build --profile preview --platform android

# iOS build for TestFlight
npx eas build --profile preview --platform ios
```

### Production Build

```bash
# Build for both platforms
npx eas build --profile production --platform all

# Or individually
npx eas build --profile production --platform android
npx eas build --profile production --platform ios
```

### Submit to App Stores

```bash
# Submit to Google Play
npx eas submit --platform android

# Submit to Apple App Store
npx eas submit --platform ios
```

### Pre-Submission Checklist

Before submitting to stores, ensure:

- [ ] All API keys are set to **production** values
- [ ] `eas.json` submit section has correct Apple ID and team ID
- [ ] Google service account JSON is in place for Android
- [ ] App icons and splash screens are finalized
- [ ] Privacy policy and terms URLs are set
- [ ] All placeholder text (YOUR_*) has been replaced
- [ ] Test on both iOS and Android physical devices
- [ ] Review app store listing screenshots

---

## 🔄 API Integration

The app communicates with the LockSafe backend at `https://locksafe.uk`. See [docs/API_COMPATIBILITY.md](docs/API_COMPATIBILITY.md) for the full endpoint mapping.

### Authentication Flow
1. User logs in via `/api/auth/login`
2. Server returns a JWT token
3. Token is stored in `expo-secure-store`
4. All subsequent requests include `Authorization: Bearer <token>`
5. Token is auto-refreshed on session check

### Key Endpoints
| Endpoint | Purpose |
|----------|---------|
| `POST /api/auth/login` | Unified login (customer + locksmith) |
| `POST /api/auth/register` | Customer registration |
| `POST /api/locksmiths/register` | Locksmith registration |
| `POST /api/jobs` | Create job request |
| `PATCH /api/jobs/:id/status` | Update job status |
| `POST /api/jobs/:id/quote` | Submit quote |
| `POST /api/jobs/:id/signature` | Submit digital signature |
| `POST /api/payments/create-intent` | Create Stripe payment |

---

## 🧪 Testing

### Manual Testing Flow

1. **Customer Flow**: Register → Request Locksmith → Select type → Enter address → View applications → Accept locksmith → Track → Sign & Complete
2. **Locksmith Flow**: Register → Toggle availability → Browse jobs → Submit application → Get accepted → Navigate → Arrive → Diagnose → Create Quote → Work → Complete

### Running on Device

```bash
# Start dev server
npx expo start

# Press 'a' for Android or 'i' for iOS
# Or scan QR code with Expo Go
```

---

## 📝 Remaining Manual Steps

These items require account setup or external configuration:

1. **Apple Developer Account** — Required for iOS builds and App Store submission
2. **Google Play Developer Account** — Required for Android builds and Play Store submission  
3. **EAS Project Setup** — Run `npx eas init` and `npx eas login`
4. **Stripe Account** — Create account at stripe.com, get API keys
5. **Firebase Project** — Ensure FCM/APNs credentials are linked for native push delivery
6. **Google Maps** — Enable APIs and restrict key to app bundle ID
7. **App Store Assets** — Screenshots, descriptions, privacy policy URLs
8. **Google Service Account** — Create and download JSON for Play Store submission

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| [Expo SDK 52](https://expo.dev) | React Native framework |
| [Expo Router 4](https://docs.expo.dev/router/introduction/) | File-based navigation |
| [NativeWind 4](https://www.nativewind.dev) | Tailwind CSS for React Native |
| [Zustand 5](https://zustand-demo.pmnd.rs) | State management |
| [React Query 5](https://tanstack.com/query) | Server state caching |
| [Stripe React Native](https://stripe.com/docs/mobile) | Payment processing |
| [react-native-maps](https://github.com/react-native-maps/react-native-maps) | Google Maps / Apple Maps |
| [react-native-signature-canvas](https://github.com/nicktylah/react-native-signature-canvas) | Digital signatures |
| [Axios](https://axios-http.com) | HTTP client |
| [Expo Location](https://docs.expo.dev/versions/latest/sdk/location/) | GPS & location services |
| [Expo SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/) | Encrypted storage |
| [Lucide Icons](https://lucide.dev) | Icon library |

---

## 📄 License

Proprietary — LockSafe Ltd. All rights reserved.
