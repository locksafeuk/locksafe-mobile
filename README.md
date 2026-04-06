# 📱 LockSafe Mobile App

The official mobile app for LockSafe UK - the UK's first anti-fraud emergency locksmith platform.

## Features

### For Customers
- 🔐 Request emergency locksmith service
- 📍 Real-time locksmith tracking
- 💳 Secure in-app payments
- ✍️ Digital signature capture
- 📱 Push notifications for updates

### For Locksmiths
- 📋 View available jobs in your area
- 🟢 Toggle availability status
- 💰 Track earnings and payouts
- 📷 Capture job photos
- 📝 Create and send quotes

## Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router
- **Styling**: NativeWind (Tailwind CSS)
- **State Management**: Zustand
- **API Client**: Axios
- **Maps**: React Native Maps
- **Payments**: Stripe React Native

## Quick Start

### Prerequisites

- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- EAS CLI: `npm install -g eas-cli`
- iOS: Xcode 15+ (Mac only)
- Android: Android Studio with SDK 34+

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start
```

### Running on Devices

```bash
# iOS Simulator (Mac only)
npm run ios

# Android Emulator
npm run android

# Web Browser
npm run web
```

## Project Structure

```
locksafe-mobile/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Authentication screens
│   ├── (customer)/        # Customer app screens
│   └── (locksmith)/       # Locksmith app screens
├── components/            # Reusable components
├── services/              # API services
├── stores/                # Zustand stores
├── hooks/                 # Custom hooks
├── types/                 # TypeScript types
└── docs/                  # Documentation
```

## Configuration

1. Copy `.env.example` to `.env`
2. Update values in `app.json`:
   - `apiUrl` - Backend API URL
   - `stripePublishableKey` - Stripe key
   - `oneSignalAppId` - OneSignal app ID
   - Google Maps API keys

## Building

```bash
# Development build
eas build --profile development --platform all

# Production build
eas build --profile production --platform all
```

## Deployment

See [docs/DEPLOYMENT_GUIDE.md](./docs/DEPLOYMENT_GUIDE.md) for complete deployment instructions.

## API Integration

This app connects to the LockSafe UK backend. Key endpoints:

- `POST /api/auth/login` - Customer login
- `POST /api/locksmiths/auth` - Locksmith login
- `POST /api/jobs` - Create job request
- `GET /api/jobs/{id}` - Get job details
- `POST /api/jobs/{id}/applications` - Submit application
- `PUT /api/jobs/{id}/status` - Update job status

See the main LockSafe project's API documentation for full details.

## License

Proprietary - LockSafe UK

---

Built with ❤️ for LockSafe UK
