# 📘 Google Play Upload Guide

## LockSafe - Locksmith Partner | Complete Step-by-Step Instructions

> This guide walks through every step of uploading and publishing the LockSafe app on the Google Play Store. Follow each section in order.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Create the App in Play Console](#2-create-the-app-in-play-console)
3. [Set Up Your Store Listing](#3-set-up-your-store-listing)
4. [Upload the App Bundle](#4-upload-the-app-bundle)
5. [Complete Content Rating](#5-complete-content-rating)
6. [Configure Pricing & Distribution](#6-configure-pricing--distribution)
7. [Complete Data Safety](#7-complete-data-safety)
8. [Set Up the App Content Section](#8-set-up-the-app-content-section)
9. [Testing Tracks (Recommended)](#9-testing-tracks-recommended)
10. [Production Release](#10-production-release)
11. [Post-Submission Monitoring](#11-post-submission-monitoring)

---

## 1. Prerequisites

Before you begin, ensure you have:

| Requirement | Details |
|-------------|---------|
| Google Play Developer Account | Active, verified, $25 fee paid |
| Google Play Console access | [play.google.com/console](https://play.google.com/console) |
| Production AAB | `locksafe-v1.0.2-build12.aab` (51.7 MB) |
| App signing | Enrolled in Play App Signing |
| All store listing materials | In `/google-play-materials/` folder |
| Privacy policy | Hosted at a public URL |
| Test device(s) | At least one Android device for verification |

---

## 2. Create the App in Play Console

### Step 2.1 — Open Play Console
1. Navigate to [play.google.com/console](https://play.google.com/console)
2. Sign in with your developer account

### Step 2.2 — Create App
1. Click **"Create app"** button (top right)
2. Fill in the app details form:

| Field | Value |
|-------|-------|
| App name | `LockSafe - Locksmith Partner` |
| Default language | `English (United Kingdom) — en-GB` |
| App or game | **App** |
| Free or paid | **Free** |

3. Check the **Declarations** boxes:
   - ✅ Developer Program Policies
   - ✅ US export laws
   - ✅ Play App Signing terms (if shown)
4. Click **"Create app"**

> 📝 You will be taken to the app Dashboard. The left sidebar shows all sections that need completion — items with a grey checkmark need attention.

---

## 3. Set Up Your Store Listing

### Step 3.1 — Navigate to Store Listing
1. In the left sidebar: **Grow** → **Store presence** → **Main store listing**
2. You'll see the store listing editor

### Step 3.2 — App Details (Text)

#### App Name
- Enter: `LockSafe - Locksmith Partner`
- Source file: `store-listing/text/APP_TITLE.txt`

#### Short Description
- Enter the text from `store-listing/text/SHORT_DESCRIPTION.txt`:
  ```
  Get locksmith jobs, manage workflow & earn more — all in one app.
  ```

#### Full Description
- Copy and paste the entire content from `store-listing/text/FULL_DESCRIPTION.txt`
- Verify Unicode characters (emojis, dividers) render correctly in the preview
- Check: character count should show ~3,402 / 4,000

### Step 3.3 — Graphics

#### App Icon (required)
1. Scroll to **App icon** section
2. Click **Upload** and select `store-listing/graphics/app-icon.png`
3. Requirements: 512 × 512 px, PNG, up to 1 MB ✓

#### Feature Graphic (required)
1. Scroll to **Feature graphic** section
2. **⚠️ IMPORTANT**: The current file (`feature-graphic.png`) is 1584 × 672 px
3. **You must resize it to exactly 1024 × 500 px** before uploading
4. To resize:
   ```bash
   convert feature-graphic.png -resize 1024x500! feature-graphic-1024x500.png
   ```
5. Upload the resized file
6. Requirements: 1024 × 500 px, JPEG or 24-bit PNG, up to 1 MB

#### Screenshots (required — minimum 2)
1. Scroll to **Phone screenshots** section
2. Upload in this exact order (drag to reorder if needed):

| Order | File | Screen Shown |
|-------|------|-------------|
| 1 | `01-dashboard.png` | Main dashboard |
| 2 | `02-job-details.png` | Job details |
| 3 | `03-earnings.png` | Earnings tracker |
| 4 | `04-profile.png` | Partner profile |
| 5 | `05-job-management.png` | Job management |
| 6 | `06-notifications-map.png` | Notifications & map |

- All files: 768 × 1376 px, PNG format ✓
- Tip: The first two screenshots are most visible in search results — Dashboard and Job Details are strong lead images

### Step 3.4 — Save
1. Click **"Save"** at the bottom of the page
2. Verify no validation errors appear

---

## 4. Upload the App Bundle

### Step 4.1 — Navigate to Production Track
1. In the left sidebar: **Release** → **Production**
2. If this is the first upload, you may need to set up Play App Signing first

### Step 4.2 — App Signing Setup (First Time Only)
1. If prompted, select **"Use Google-generated key"** (recommended)
   - OR select **"Export and upload a key from Java keystore"** if you have an existing signing key
2. Follow the on-screen instructions to complete enrollment
3. Your upload key will be used to sign AABs locally; Google will re-sign for distribution

### Step 4.3 — Create a New Release
1. Click **"Create new release"**
2. Under **App bundles**, click **"Upload"**
3. Select `release/locksafe-v1.0.2-build12.aab` (51.7 MB)
4. Wait for upload and processing to complete
5. Verify the following are shown correctly:
   - Version code: `12`
   - Version name: `1.0.2`
   - Package name: `uk.locksafe.app`
   - Minimum SDK, Target SDK
   - Supported devices count

### Step 4.4 — Release Name & Notes
1. **Release name**: `v1.0.2 (Build 12)` (internal only, not shown to users)
2. **Release notes** (shown as "What's new" on Play Store):

   ```
   Welcome to LockSafe — the UK's dedicated locksmith partner app!

   • Real-time job leads in your area
   • Smart dashboard for managing your workflow
   • Secure payments via Stripe Connect
   • Built-in earnings tracker
   • GPS verification and digital signatures
   • Map view for job planning
   ```

3. Ensure language is set to **English (United Kingdom)**

### Step 4.5 — Review and Save
1. Click **"Review release"**
2. Check for any errors or warnings
3. Common warnings and what to do:
   - *"This release will be available to 0 users"* — Normal if no testers added yet
   - *"Unoptimised APK"* — Should not appear (we're using AAB)
   - *"Permission warnings"* — Review, ensure all are justified
4. Click **"Save"** (do NOT click "Start rollout" yet — complete remaining sections first)

---

## 5. Complete Content Rating

### Step 5.1 — Navigate
1. In the left sidebar: **Policy** → **App content** → **Content ratings**
2. Click **"Start questionnaire"**

### Step 5.2 — IARC Questionnaire
1. **Category**: Select **"Utility, Productivity, Communication, or other"**
2. **Email**: Enter `support@locksafe.uk`
3. Answer the questions:

| Question | Answer | Rationale |
|----------|--------|-----------|
| Violence | No | Business app, no violent content |
| Sexual content | No | Professional tool only |
| Language | No | No profanity in app content |
| Controlled substances | No | Not applicable |
| Interactive elements — Users can interact/share? | No | Locksmiths don't see each other's content |
| Interactive elements — Shares user location? | Yes | Job matching requires location |
| Interactive elements — Digital purchases? | No | Stripe payouts are B2B, not IAP |

4. Click **"Submit"**
5. Review the assigned ratings (expected: **Everyone / PEGI 3**)
6. Click **"Apply ratings"**

---

## 6. Configure Pricing & Distribution

### Step 6.1 — Navigate
1. In the left sidebar: **Monetise** → **App pricing**
2. Confirm the app is set to **Free**

> ⚠️ Once published as Free, you cannot change an app to Paid.

### Step 6.2 — Countries & Regions
1. Go to **Release** → **Production** → **Countries/regions**
2. Click **"Add countries/regions"**
3. For initial launch, select only: **United Kingdom**
4. Save

### Step 6.3 — Device Targeting (Optional)
1. Go to **Release** → **Setup** → **Advanced settings** → **Device catalog**
2. Review supported devices
3. Exclude any unsupported form factors if needed (e.g., Android TV, Wear OS)

---

## 7. Complete Data Safety

### Step 7.1 — Navigate
1. In the left sidebar: **Policy** → **App content** → **Data safety**
2. Click **"Start"**

### Step 7.2 — Data Collection Overview
Answer the initial questions:
- **Does your app collect or share any of the required user data types?** → **Yes**
- **Is all data encrypted in transit?** → **Yes**
- **Do you provide a way for users to request data deletion?** → **Yes**

### Step 7.3 — Data Types Declaration

| Data Type | Collected | Shared | Purpose | Optional? |
|-----------|-----------|--------|---------|-----------|
| Approximate location | ✅ | ❌ | App functionality (job matching) | No |
| Precise location | ✅ | ❌ | App functionality (GPS verification) | No |
| Name | ✅ | ✅ (Stripe) | Account management | No |
| Email address | ✅ | ✅ (Stripe) | Account management, comms | No |
| Phone number | ✅ | ❌ | Account management | No |
| Payment info | ✅ | ✅ (Stripe) | Payment processing | No |
| App interactions | ✅ | ❌ | Analytics | No |
| Crash logs | ✅ | ❌ | Analytics (Firebase) | No |
| Device IDs | ✅ | ❌ | Push notifications (FCM) | No |

### Step 7.4 — Review and Submit
1. Review the summary preview
2. Ensure it accurately reflects your app's data practices
3. Click **"Submit"**

---

## 8. Set Up the App Content Section

### Step 8.1 — Privacy Policy
1. Go to **Policy** → **App content** → **Privacy policy**
2. Enter the privacy policy URL: `https://www.locksafe.uk/privacy`
3. Save

### Step 8.2 — App Access
1. Go to **App content** → **App access**
2. Select: **"All or some functionality is restricted"**
3. Add instructions for reviewers:
   ```
   This app requires a verified locksmith partner account. 
   For review purposes, please use:
   Email: reviewer@locksafe.uk
   Password: [provide test credentials]
   
   The app requires location access to display nearby jobs.
   Please allow location permissions when prompted.
   ```
4. Save

> ⚠️ **CRITICAL**: You MUST provide test credentials if the app requires login. Failure to do so is a common reason for rejection.

### Step 8.3 — Ads Declaration
1. Go to **App content** → **Ads**
2. Select: **"No, my app does not contain ads"**
3. Save

### Step 8.4 — Target Audience
1. Go to **App content** → **Target audience and content**
2. Select target age group: **18 and over**
3. Confirm the app is NOT designed for children
4. Save

### Step 8.5 — News Apps (if prompted)
1. Select: **"My app is not a news app"**
2. Save

### Step 8.6 — COVID-19 (if prompted)
1. Select: **"My app does not include COVID-related content"**
2. Save

### Step 8.7 — Government Apps (if prompted)
1. Select: **"This is not a government app"**
2. Save

---

## 9. Testing Tracks (Recommended)

> **Strongly recommended**: Use internal and/or closed testing before production release.

### Step 9.1 — Internal Testing
1. Go to **Release** → **Testing** → **Internal testing**
2. Click **"Create new release"**
3. Upload the same AAB: `locksafe-v1.0.2-build12.aab`
4. Add release notes
5. Click **"Review release"** → **"Start rollout to Internal testing"**
6. Go to **Testers** tab → Create an email list of internal testers
7. Share the opt-in link with testers

### Step 9.2 — Testing Checklist
Have testers verify:
- [ ] App installs successfully from Play Store
- [ ] Login/registration flow works
- [ ] Location permissions prompt correctly
- [ ] Push notifications arrive
- [ ] Job listing displays correctly
- [ ] Stripe payment flow works (test mode)
- [ ] All navigation paths function
- [ ] App performance is acceptable
- [ ] No crashes on common devices

### Step 9.3 — Promote to Production
1. Once testing is satisfactory, go to **Internal testing**
2. Click **"Promote release"** → **"Production"**
3. Or create a fresh production release (see next section)

---

## 10. Production Release

### Step 10.1 — Pre-Launch Checklist
Before publishing, verify ALL Dashboard items show green checkmarks:
- ✅ Store listing complete
- ✅ Content rating complete
- ✅ Pricing & distribution set
- ✅ Data safety complete
- ✅ App content sections complete
- ✅ AAB uploaded and processed

### Step 10.2 — Create Production Release
1. Go to **Release** → **Production**
2. Click **"Create new release"** (or **"Edit release"** if draft exists)
3. Verify the AAB is present and correct
4. Review release notes

### Step 10.3 — Staged Rollout (Recommended)
1. Under rollout settings, select **"Staged rollout"**
2. Set initial percentage: **20%**
3. Recommended rollout plan:

| Day | Percentage | Action |
|-----|-----------|--------|
| Day 1–3 | 20% | Monitor crashes, ANRs, reviews |
| Day 4–5 | 50% | Check vitals, expand if stable |
| Day 6–7 | 100% | Full rollout if no issues |

### Step 10.4 — Publish
1. Click **"Review release"**
2. Review all warnings carefully
3. Click **"Start rollout to Production"**
4. Confirm in the dialog

> 📝 **Timeline**: New app reviews typically take **1–7 business days**. You'll receive an email when the review is complete.

---

## 11. Post-Submission Monitoring

### Immediate (First 24 Hours)
- [ ] Check developer email for review status updates
- [ ] Monitor Play Console for any policy violations
- [ ] Verify app appears in search (after approval)

### First Week
- [ ] Monitor **Android Vitals** dashboard:
  - Crash rate (target: < 1.09%)
  - ANR rate (target: < 0.47%)
  - Excessive wake-ups
  - Stuck background wake locks
- [ ] Review incoming user ratings and reviews
- [ ] Respond to user reviews (especially low ratings)
- [ ] Monitor Firebase Crashlytics for crash reports

### Ongoing
- [ ] Track install/uninstall metrics
- [ ] Monitor acquisition channels
- [ ] Plan first update based on feedback
- [ ] Set up Google Play Console alerts for:
  - New reviews (1–3 stars)
  - Crash spikes
  - Policy updates

---

## Common Rejection Reasons & How to Avoid Them

| Rejection Reason | Prevention |
|-----------------|------------|
| Missing privacy policy | Host at public URL before submission |
| No test credentials provided | Create reviewer account, add to App Access |
| Broken functionality | Thorough testing on multiple devices |
| Misleading description | Ensure description matches actual features |
| Inappropriate content rating | Answer IARC questionnaire accurately |
| Missing data safety declaration | Complete all data types honestly |
| Location permission without justification | Explain in-app why location is needed |
| Crashes on launch | Test on low-end devices and various API levels |

---

## Useful Links

| Resource | URL |
|----------|-----|
| Google Play Console | [play.google.com/console](https://play.google.com/console) |
| Play Console Help | [support.google.com/googleplay/android-developer](https://support.google.com/googleplay/android-developer) |
| Developer Policy Center | [play.google.com/about/developer-content-policy](https://play.google.com/about/developer-content-policy/) |
| Data Safety Guide | [support.google.com/googleplay/android-developer/answer/10787469](https://support.google.com/googleplay/android-developer/answer/10787469) |
| Content Rating Guide | [support.google.com/googleplay/android-developer/answer/188189](https://support.google.com/googleplay/android-developer/answer/188189) |
| Store Listing Specs | [support.google.com/googleplay/android-developer/answer/9866151](https://support.google.com/googleplay/android-developer/answer/9866151) |

---

*Last updated: 18 April 2026*
*Document: GOOGLE_PLAY_UPLOAD_GUIDE.md*
