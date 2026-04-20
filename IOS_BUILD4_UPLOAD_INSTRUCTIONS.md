# iOS Build 4 Upload Instructions (LockSafe)

## 1) Verified Current Status

### Crash logs are from Build 3 (old binary)
All 4 crash logs provided by App Review are from **CFBundleVersion = 3**:
- `crashlog-316C6252-49C5-41A3-970D-B04040068425.ips` → Build 3
- `crashlog-467E6101-78B6-4F21-95ED-A77C518DAC8E.ips` → Build 3
- `crashlog-A2BFD1CD-FA62-450F-8673-B5CF683A50C9.ips` → Build 3
- `crashlog-FBBF80B9-F13E-4DF2-A648-FFBE92D69E4A.ips` → Build 3

### Build 4 exists and is ready locally
- **IPA path:** `/home/ubuntu/locksafe-mobile/build/locksafe-v1.0.2-build4-ios.ipa`
- **Version:** `1.0.2`
- **CFBundleVersion (build number):** `4`
- **Bundle ID:** `uk.locksafe.app`

### OneSignal launch-crash fix is present in Build 4 codebase
Verified in current project:
- `app.config.js` → `ios.buildNumber: '4'`
- `services/pushNotifications.ts`:
  - `initializingPromise` concurrency guard present
  - single-init flow in `initialize()`
  - safer permission/error handling around OneSignal init
- `app/_layout.tsx`:
  - no eager startup `initialize()` call
  - lazy `registerUser()` only after authenticated locksmith user exists

### App Store Connect live check (today)
Confirmed in App Store Connect (TestFlight > iOS Builds):
- Only **Build 3** is currently visible for version 1.0.2
- **Build 4 is not uploaded yet**

---

## 2) Why Apple keeps seeing crashes
Apple Review is testing the uploaded build available in App Store Connect (**Build 3**), which still contains the old startup behavior. The fixed binary (**Build 4**) has not been uploaded, so Apple cannot test it yet.

---

## 3) Build 4 Package Integrity

**Primary upload artifact**
- File: `/home/ubuntu/locksafe-mobile/build/locksafe-v1.0.2-build4-ios.ipa`
- Size: `28,012,924 bytes` (~27 MB)
- SHA-256:
  `20f6947cf418dbb9640ea3edb404937fdedf6f0c16be3dec1f4d0381989d1998`
- Zip integrity check: **No errors detected**

Optional metadata file in build folder:
- `/home/ubuntu/locksafe-mobile/build/AppStoreInfo.plist`

---

## 4) Upload Options for Build 4

## Option A — Upload from Mac via `xcrun altool`

### A1. Using App Store Connect API key (recommended)
```bash
xcrun altool --upload-app \
  --type ios \
  --file "/ABSOLUTE/PATH/locksafe-v1.0.2-build4-ios.ipa" \
  --apiKey "<APP_STORE_CONNECT_API_KEY_ID>" \
  --apiIssuer "<APP_STORE_CONNECT_ISSUER_ID>"
```

Credentials required:
- App Store Connect API Key ID
- App Store Connect API Issuer ID
- `.p8` private key installed in the default expected location for altool

### A2. Using Apple ID + app-specific password
```bash
xcrun altool --upload-app \
  --type ios \
  --file "/ABSOLUTE/PATH/locksafe-v1.0.2-build4-ios.ipa" \
  --username "locksafeuk@icloud.com" \
  --password "<APP_SPECIFIC_PASSWORD>"
```

Known account identifiers from project config (`eas.json`):
- Apple ID: `locksafeuk@icloud.com`
- App Store Connect App ID (`ascAppId`): `6762475008`
- Apple Team ID: `7472da00`

> Note: Do **not** use your normal Apple ID password. Use an app-specific password.

---

## Option B — Upload with Transporter app (Mac)
1. Install **Transporter** from Mac App Store.
2. Sign in with the Apple account that has access to this app (`locksafeuk@icloud.com` or an Admin/App Manager user).
3. Drag and drop:
   - `/home/ubuntu/locksafe-mobile/build/locksafe-v1.0.2-build4-ios.ipa`
4. Click **Deliver**.
5. Wait until Transporter reports successful upload.
6. In App Store Connect:
   - Go to **My Apps** → **LockSafe - Locksmith Partner** → **TestFlight**
   - Confirm Build **4** appears under version 1.0.2.

---

## Option C — Use EAS Submit (Expo infrastructure)
If App Store credentials are configured in Expo/EAS, submit from CLI:

```bash
cd /home/ubuntu/locksafe-mobile
eas submit -p ios --profile production --path ./build/locksafe-v1.0.2-build4-ios.ipa
```

If prompted, complete Apple authentication or provide API key credentials.

Expected metadata from `eas.json` submit profile:
- `appleId`: `locksafeuk@icloud.com`
- `ascAppId`: `6762475008`
- `appleTeamId`: `7472da00`

---

## Option D — Cloud-based alternative upload services
If no local Mac is available, these services can upload to App Store Connect using your Apple credentials/API key:

1. **Codemagic**
   - Supports uploading IPA to TestFlight/App Store Connect
   - Can use App Store Connect API key securely
   - Good for repeatable CI/CD workflows

2. **Bitrise**
   - Has dedicated “Deploy to App Store Connect” steps
   - Supports API key / Apple ID auth
   - Good if you want build + submit pipelines

3. **Appcircle**
   - Provides App Store Connect publishing flows
   - Supports metadata + binary submission orchestration

Use these only with trusted org accounts and scoped API keys.

---

## 5) Immediate Action Plan (Do this now)

1. **Upload Build 4 immediately** via Option A or B (fastest path).
2. Wait for App Store Connect processing (typically 5–30 min, sometimes longer).
3. Confirm in **TestFlight iOS Builds** that **Build 4** appears.
4. In App Store submission flow, select **Build 4** explicitly for version 1.0.2.
5. Reply in Resolution Center:
   - Previous crash logs were from Build 3.
   - Build 4 includes OneSignal startup race-condition fix.
   - Request review on Build 4.

---

## 6) How to verify Apple is testing the correct build

Before resubmitting:
- App Store Connect shows selected binary as **1.0.2 (4)**
- Build upload timestamp is recent and matches today’s upload
- No stale Build 3 selection in the version’s build picker

After resubmitting:
- In Resolution Center message, mention: “Please review Build 4 (1.0.2, CFBundleVersion 4).”

---

## 7) Suggested message to Apple Review

"Thank you for the crash report. We confirmed the provided logs correspond to our previous binary (Build 3). We have now uploaded a new binary, **version 1.0.2 (Build 4)**, which includes a fix for the OneSignal initialization startup race condition. Could you please continue review using Build 4?"

---

## 8) Final status summary
- ✅ Build 4 exists locally and is valid
- ✅ Build 4 contains the OneSignal crash fix
- ✅ Crash logs from Apple are Build 3 only
- ⚠️ Build 4 still needs to be uploaded to App Store Connect
- 🎯 Next unblocker: upload Build 4 and re-submit with explicit build selection
