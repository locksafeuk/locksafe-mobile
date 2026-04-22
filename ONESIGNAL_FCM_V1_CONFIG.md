# OneSignal FCM V1 Configuration - LockSafe App

**Date Retrieved:** April 18, 2026  
**Status:** ✅ ACTIVE & CONFIGURED

---

## App Details

| Field | Value |
|-------|-------|
| **App Name** | Locksafeuk |
| **Package Name** | uk.locksafe.app |
| **OneSignal App ID (Legacy)** | cd19d270-4a74-4bdf-b534-3287cfb8b4e4 |
| **OneSignal App ID (V2)** | os_v2_app_zum5e4ckorf57njugkd47ofu4rcdyx2ce7feswm64qwyyqgmhhub3w4gqfehs4i4x53jeo5bjvd5gtelc7kmnciym6d47dottzvjddy |
| **Account** | contact@locksafe.uk (Lucian Dorca) |
| **Organization** | Lucian's Org |
| **Dashboard URL** | https://dashboard.onesignal.com/apps/cd19d270-4a74-4bdf-b534-3287cfb8b4e4/settings |

---

## Google Android (FCM) Configuration

### FCM V1 Status: ✅ ACTIVE

The FCM V1 configuration has been successfully set up in OneSignal using a Firebase service account JSON key file.

| Setting | Value |
|---------|-------|
| **Platform Status** | Active (green indicator) |
| **Service Account JSON** | `locksafeuk-ea52e.json` (uploaded) |
| **Firebase Project ID** | `locksafeuk-ea52e` |
| **Authentication Method** | FCM V1 (Service Account JSON) |
| **Configuration Step** | 2 of 3 Steps completed |

### Configuration Steps Progress

1. ✅ **Configure App Settings** — Completed (Service Account JSON uploaded, Firebase Project ID set)
2. ✅ **Select SDK** — Completed
3. ⏳ **Install and Test** — Pending (requires a real Android device to send a test push)

### Notes

- The FCM V1 API is being used (not the deprecated legacy FCM API)
- The service account JSON file (`locksafeuk-ea52e.json`) was generated from the Firebase Console for the `locksafeuk-ea52e` project
- The Firebase Project ID `locksafeuk-ea52e` was auto-populated from the service account JSON
- Step 3 "Install and Test" will be completed once the mobile app is installed on a real device and a test push notification is sent

---

## All Active Platforms

| Platform | Status |
|----------|--------|
| **Apple iOS (APNs)** | ✅ Active — Authentication: .p8 Auth Key, Bundle ID: uk.locksafe.app |
| **Google Android (FCM)** | ✅ Active — FCM V1 with Service Account JSON |
| **Web** | ✅ Active — Configured for www.locksafe.uk |

### Inactive Platforms

- Huawei Android (HMS) — Not activated
- Windows (UWP) — Not activated
- Amazon Fire — Not activated
- macOS — Not activated

---

## REST API Keys

| Key Name | Key | Created |
|----------|-----|---------|
| locksafe | d34qq3xt6u3f4w7jlxl4jxtoq | 4/10/2026 |
| locksafeuk | 3aeg6qfexupkn4igi6hfqqrau | 4/16/2026 |

**Recommended key for microservice:** `3aeg6qfexupkn4igi6hfqqrau` (locksafeuk)

---

## Screenshots

- **Platforms Overview:** See `/home/ubuntu/onesignal_platforms_overview.png`
- **FCM Configuration Page:** See `/home/ubuntu/onesignal_fcm_config.png`

---

## Configuration Verification Summary

The FCM V1 migration/configuration for the LockSafe Android app in OneSignal is **complete and active**. The key points are:

1. **FCM V1 is enabled** — Using the modern service account JSON authentication method (not the deprecated server key method)
2. **Firebase Project**: `locksafeuk-ea52e` — Correctly linked
3. **Service Account JSON**: `locksafeuk-ea52e.json` — Successfully uploaded
4. **Platform is Active** — Showing green "Active" status in the OneSignal dashboard
5. **All three main platforms are active**: iOS (APNs), Android (FCM), and Web Push

### Remaining Action

The only remaining step is **Step 3: Install and Test**, which requires:
- Building and installing the LockSafe mobile app on a real Android device
- Sending a test push notification to verify end-to-end delivery
- This step is operational/testing only — the configuration itself is complete
