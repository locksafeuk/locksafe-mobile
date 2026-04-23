# ✅ Google Play Store Submission Checklist

## LockSafe - Locksmith Partner | v1.0.2 (Build 12)

> **Use this checklist to verify every requirement before and during submission to the Google Play Console.**
> Mark each item as you complete it. All items must be checked before publishing.

---

## 1. Pre-Submission Requirements

### Google Play Developer Account
- [ ] Google Play Developer account is active and verified
- [ ] One-time $25 registration fee has been paid
- [ ] Developer profile is complete (name, email, website, phone)
- [ ] Developer contact email set to: `support@locksafe.uk`
- [ ] Developer website URL set to: `https://www.locksafe.uk`

### Signing & Security
- [ ] App signing key is enrolled in Google Play App Signing
- [ ] Upload key is generated and securely stored
- [ ] Keystore file is backed up in a secure location (NOT in the repo)
- [ ] Key alias, passwords, and validity period documented privately

---

## 2. App Bundle (AAB)

### Production Build
- [ ] AAB file: `locksafe-v1.0.2-build12.aab` (51.7 MB)
- [ ] File is under 200 MB size limit
- [ ] Build is a release build (not debug)
- [ ] Package name: `uk.locksafe.app`
- [ ] Version code: `12`
- [ ] Version name: `1.0.2`
- [ ] ProGuard / R8 minification enabled
- [ ] No debug flags or test endpoints in production build
- [ ] API keys are production keys (not development/staging)

### Technical Validation
- [ ] AAB passes `bundletool validate` without errors
- [ ] Target SDK meets Google Play minimum requirements (API 34+)
- [ ] 64-bit native libraries included (if applicable)
- [ ] Permissions are minimal and justified
- [ ] No unnecessary permissions declared

---

## 3. Store Listing — Text Content

### App Title
- [ ] Title: **"LockSafe - Locksmith Partner"** (27 characters)
- [ ] Under 30-character limit ✓
- [ ] No keyword stuffing or misleading terms

### Short Description
- [ ] Text: *"Get locksmith jobs, manage workflow & earn more — all in one app."* (66 characters)
- [ ] Under 80-character limit ✓
- [ ] Compelling and keyword-rich

### Full Description
- [ ] Full description uploaded (3,402 characters)
- [ ] Under 4,000-character limit ✓
- [ ] Properly formatted with Unicode characters
- [ ] No prohibited content or misleading claims
- [ ] Contact information included

### Promotional Text (optional)
- [ ] Promotional text prepared (159 characters)
- [ ] Under 170-character limit ✓
- [ ] Can be updated without a new app release

---

## 4. Store Listing — Visual Assets

### App Icon
- [ ] File: `app-icon.png`
- [ ] Dimensions: 512 × 512 px ✓
- [ ] Format: 32-bit PNG (with alpha)
- [ ] File size: 147 KB (under 1 MB limit) ✓
- [ ] No badges, rankings, or award imagery

### Feature Graphic
- [ ] File: `feature-graphic.png`
- [ ] Dimensions: 1024 × 500 px **required** — current file is 1584 × 672 px
- [ ] ⚠️ **ACTION REQUIRED**: Resize to exactly 1024 × 500 px before upload
- [ ] Format: JPEG or 24-bit PNG (no alpha)
- [ ] File size under 1 MB ✓
- [ ] Key content centred (edges may be cropped on some devices)

### Promo Graphic (optional — deprecated)
- [ ] File: `promo-graphic.png` (1264 × 848 px)
- [ ] Note: Google Play no longer requires this; keep on hand for marketing

### Screenshots (Phone)
- [ ] Minimum of 2 screenshots uploaded (we have 6) ✓
- [ ] Maximum of 8 screenshots (we have 6) ✓
- [ ] All screenshots are 768 × 1376 px
- [ ] Aspect ratio within 16:9 limit ✓
- [ ] Each file under 8 MB ✓
- [ ] Screenshots are numbered in display order:
  - [ ] `01-dashboard.png` — Main dashboard view
  - [ ] `02-job-details.png` — Job details screen
  - [ ] `03-earnings.png` — Earnings tracker
  - [ ] `04-profile.png` — Partner profile
  - [ ] `05-job-management.png` — Job management workflow
  - [ ] `06-notifications-map.png` — Notifications & map view

---

## 5. Content Rating (IARC)

- [ ] Content rating questionnaire completed in Play Console
- [ ] Questionnaire answers:
  - [ ] Violence: None
  - [ ] Sexual content: None
  - [ ] Language: None
  - [ ] Controlled substances: None
  - [ ] User-generated content visible to others: **No**
  - [ ] User location sharing: **Yes** (for job matching, with consent)
  - [ ] Digital purchases: **No** (Stripe is for payout, not IAP)
- [ ] Expected rating: **Everyone / PEGI 3 / USK 0**
- [ ] Rating certificate saved for records

---

## 6. Privacy & Data Safety

### Privacy Policy
- [ ] Privacy policy URL hosted and publicly accessible
- [ ] URL entered in Play Console: `https://www.locksafe.uk/privacy`
- [ ] Policy covers all data collected by the app
- [ ] GDPR compliance addressed (UK/EU users)
- [ ] Data retention and deletion policies stated

### Data Safety Section
- [ ] Data safety form completed in Play Console
- [ ] Data collected declarations:
  - [ ] **Location** — Approximate & precise (for job matching)
  - [ ] **Personal info** — Name, email, phone (for account)
  - [ ] **Financial info** — Payment via Stripe Connect
  - [ ] **App activity** — Job history, app interactions
  - [ ] **Device info** — Push notification tokens
- [ ] Data sharing declarations:
  - [ ] Shared with Stripe for payment processing
  - [ ] Shared with Firebase for analytics/notifications
- [ ] Data deletion: Users can request account deletion via `support@locksafe.uk`
- [ ] Encryption in transit: **Yes**

---

## 7. App Configuration

### Pricing & Distribution
- [ ] App set to **Free**
- [ ] Contains ads: **No**
- [ ] In-app purchases: **No**
- [ ] Country distribution: **United Kingdom** only (initially)
- [ ] Device compatibility reviewed and confirmed

### App Category
- [ ] Primary category: **Business**
- [ ] Secondary category: **Tools** (if available)
- [ ] App tags/keywords reviewed

### Target Audience & Content
- [ ] Target age group: **18 and over**
- [ ] App is NOT designed primarily for children
- [ ] Families Policy compliance: N/A (not a children's app)

### Contact Details (Store Listing)
- [ ] Support email: `support@locksafe.uk`
- [ ] Website: `https://www.locksafe.uk`
- [ ] Phone number: (optional — add if available)

---

## 8. Release Configuration

### Release Track
- [ ] **Internal testing** track used first (recommended)
- [ ] Internal testers have been added and invited
- [ ] Internal test build verified on physical devices
- [ ] Promoted to **Closed testing** (optional but recommended)
- [ ] Closed test feedback reviewed and addressed
- [ ] Promoted to **Open testing** OR **Production**

### Production Release
- [ ] AAB uploaded to Production track
- [ ] Release name set: `v1.0.2 (Build 12)`
- [ ] Release notes written (What's New):
  ```
  Welcome to LockSafe — the UK's dedicated locksmith partner app!
  
  • Real-time job leads in your area
  • Smart dashboard for managing your workflow
  • Secure payments via Stripe Connect
  • Built-in earnings tracker
  • GPS verification and digital signatures
  • Map view for job planning
  ```
- [ ] Staged rollout percentage set (recommended: start at 20%)
- [ ] Rollout monitoring plan in place

---

## 9. Compliance & Legal

- [ ] App complies with Google Play Developer Program Policies
- [ ] App complies with Google Play Developer Distribution Agreement
- [ ] No use of restricted permissions without justification
- [ ] `ACCESS_FINE_LOCATION` permission justified (job matching)
- [ ] `ACCESS_BACKGROUND_LOCATION` — only if used, with full declaration
- [ ] Camera permission justified (if used — digital signatures / photos)
- [ ] Push notification consent implemented (Android 13+)
- [ ] Export compliance (encryption) reviewed

---

## 10. Post-Submission

- [ ] Submission confirmation received from Google Play Console
- [ ] Review timeline noted (typically 1–7 days for new apps)
- [ ] Monitor developer email for review feedback
- [ ] Prepare responses for potential policy queries
- [ ] App Vitals dashboard bookmarked for monitoring
- [ ] Crash reporting (Firebase Crashlytics) verified active
- [ ] Analytics (Firebase Analytics) verified active
- [ ] Plan first update based on user feedback

---

## ⚠️ Critical Action Items Before Submission

| # | Action | Priority | Status |
|---|--------|----------|--------|
| 1 | **Resize feature graphic** to 1024 × 500 px | 🔴 HIGH | ⬜ Pending |
| 2 | Host privacy policy at public URL | 🔴 HIGH | ⬜ Pending |
| 3 | Complete IARC content rating questionnaire | 🔴 HIGH | ⬜ Pending |
| 4 | Complete Data Safety form | 🔴 HIGH | ⬜ Pending |
| 5 | Verify AAB with `bundletool validate` | 🟡 MEDIUM | ⬜ Pending |
| 6 | Set up staged rollout strategy | 🟡 MEDIUM | ⬜ Pending |
| 7 | Add internal testers before production release | 🟢 LOW | ⬜ Pending |

---

*Last updated: 18 April 2026*
*Document: SUBMISSION_CHECKLIST.md*
