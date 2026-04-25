/**
 * Expo Dynamic Configuration
 *
 * This file reads environment variables from .env and configures
 * the app accordingly. Environment variables prefixed with EXPO_PUBLIC_
 * are available in the client bundle.
 *
 * For production builds, set env vars in eas.json or .env files.
 */

const fs = require('fs');
const path = require('path');

const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_PREVIEW = process.env.APP_VARIANT === 'preview';

const getAppName = () => {
  if (IS_DEV) return 'LockSafe (Dev)';
  if (IS_PREVIEW) return 'LockSafe (Preview)';
  return 'LockSafe';
};

const getBundleId = () => {
  if (IS_DEV) return 'uk.locksafe.app.dev';
  if (IS_PREVIEW) return 'uk.locksafe.app.preview';
  return 'uk.locksafe.app';
};

module.exports = () => {
  // Use www.locksafe.uk - the non-www domain returns 307 redirects that break POST requests
  const API_URL = process.env.API_URL || process.env.EXPO_PUBLIC_API_URL || 'https://www.locksafe.uk';
  const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY';
  const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_YOUR_STRIPE_KEY';

  // Native Android push requires Firebase app config (google-services.json) so FCM device tokens can be issued.
  const configuredGoogleServicesFile = process.env.GOOGLE_SERVICES_FILE || './google-services.json';
  const generatedGoogleServicesFile = './google-services.generated.json';

  let resolvedGoogleServicesFile = configuredGoogleServicesFile;
  let hasGoogleServicesFile = fs.existsSync(path.resolve(__dirname, resolvedGoogleServicesFile));

  // Support EAS secret injection via GOOGLE_SERVICES_JSON to avoid committing sensitive files.
  if (!hasGoogleServicesFile && process.env.GOOGLE_SERVICES_JSON) {
    try {
      const targetPath = path.resolve(__dirname, generatedGoogleServicesFile);
      fs.writeFileSync(targetPath, process.env.GOOGLE_SERVICES_JSON, 'utf8');
      resolvedGoogleServicesFile = generatedGoogleServicesFile;
      hasGoogleServicesFile = true;
      console.log(`[app.config] Generated ${generatedGoogleServicesFile} from GOOGLE_SERVICES_JSON secret.`);
    } catch (error) {
      console.warn('[app.config] Failed to generate google-services file from GOOGLE_SERVICES_JSON.', error);
    }
  }

  if (!hasGoogleServicesFile) {
    const missingMessage = `[app.config] ${configuredGoogleServicesFile} not found. Android native push requires Firebase google-services.json.`;
    const isAndroidBuildContext =
      process.env.EAS_BUILD_PLATFORM === 'android' || process.env.EXPO_OS === 'android';

    // Block Android non-dev builds from shipping without FCM configuration.
    if (!IS_DEV && isAndroidBuildContext) {
      throw new Error(`${missingMessage} Provide GOOGLE_SERVICES_FILE path or GOOGLE_SERVICES_JSON secret.`);
    }

    console.warn(`${missingMessage} Android native push will not work in this build.`);
  }

  return {
    expo: {
      name: getAppName(),
      slug: 'locksafe-mobile',
      version: '1.0.2',
      orientation: 'portrait',
      icon: './assets/icon.png',
      userInterfaceStyle: 'light',
      scheme: 'locksafe',
      splash: {
        image: './assets/splash-icon.png',
        resizeMode: 'contain',
        backgroundColor: '#f97316',
      },
      assetBundlePatterns: ['**/*'],
      ios: {
        supportsTablet: true,
        bundleIdentifier: getBundleId(),
        buildNumber: '10',
        infoPlist: {
          NSLocationWhenInUseUsageDescription:
            'LockSafe needs your location to find nearby locksmiths and track job progress.',
          NSLocationAlwaysAndWhenInUseUsageDescription:
            'LockSafe needs your location to provide real-time tracking for locksmiths.',
          NSCameraUsageDescription:
            'LockSafe needs camera access to take photos for job documentation.',
          NSPhotoLibraryUsageDescription:
            'LockSafe needs photo library access to select photos for job documentation.',
          ITSAppUsesNonExemptEncryption: false,
          UIBackgroundModes: ['remote-notification'],
        },
        config: {
          googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        },
      },
      newArchEnabled: false,
      android: {
        icon: './assets/icon.png',
        adaptiveIcon: {
          foregroundImage: './assets/android-icon-foreground.png',
          backgroundImage: './assets/android-icon-background.png',
          monochromeImage: './assets/android-icon-monochrome.png',
          backgroundColor: '#f97316',
        },
        package: getBundleId(),
        googleServicesFile: hasGoogleServicesFile ? resolvedGoogleServicesFile : undefined,
        versionCode: 21,
        softwareKeyboardLayoutMode: 'resize',
        permissions: [
          'ACCESS_COARSE_LOCATION',
          'ACCESS_FINE_LOCATION',
          'ACCESS_BACKGROUND_LOCATION',
          'CAMERA',
          'POST_NOTIFICATIONS',
          'READ_EXTERNAL_STORAGE',
          'WRITE_EXTERNAL_STORAGE',
        ],
        config: {
          googleMaps: {
            apiKey: GOOGLE_MAPS_API_KEY,
          },
        },
      },
      web: {
        favicon: './assets/favicon.png',
        bundler: 'metro',
      },
      plugins: [
        'expo-router',
        'expo-asset',
        'expo-secure-store',
        'expo-dev-client',
        './plugins/withDisablePlayIntegrityChecks',
        [
          'expo-notifications',
          {
            icon: './assets/android-icon-monochrome.png',
            color: '#f97316',
            defaultChannel: 'default',
            enableBackgroundRemoteNotifications: true,
          },
        ],
        [
          'expo-build-properties',
          {
            android: {
              kotlinVersion: '2.0.21',
              compileSdkVersion: 35,
              targetSdkVersion: 35,
            },
          },
        ],
        [
          'expo-location',
          {
            locationAlwaysAndWhenInUsePermission:
              'LockSafe needs your location for real-time tracking.',
          },
        ],
        [
          'expo-camera',
          {
            cameraPermission: 'LockSafe needs camera access for job photos.',
          },
        ],
        [
          'expo-image-picker',
          {
            photosPermission:
              'LockSafe needs access to your photos for job documentation.',
          },
        ],
        [
          '@stripe/stripe-react-native',
          {
            merchantIdentifier: 'merchant.uk.locksafe.app',
            enableGooglePay: true,
          },
        ],
      ],
      extra: {
        apiUrl: API_URL,
        stripePublishableKey: STRIPE_PUBLISHABLE_KEY,
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        eas: {
          projectId: '7a0be99b-8116-409b-8203-e08e7f023e4a',
        },
      },
    },
  };
};
