# Build 8 Rejection - Analysis & Response Summary

**Date:** 24 April 2026  
**Status:** Rejection received - Response prepared  
**Action Required:** Submit response to Apple via App Store Connect

---

## 🔍 What Apple Asked

### Issue 1: PassKit/Apple Pay Framework
- Apple sees PassKit framework in the app
- They can't find where Apple Pay is implemented
- Need clarification or explanation

### Issue 2: Business Model Questions
Apple needs detailed answers about:
1. Who uses paid content/features?
2. Where can users purchase?
3. What previously purchased content is accessible?
4. What's unlocked without In-App Purchase?

---

## ✅ What We Found

### PassKit/Apple Pay Analysis

**Finding:** PassKit is included but **NOT used**

**Root Cause:**
- App includes `@stripe/stripe-react-native` SDK (version 0.38.6)
- Stripe SDK bundles Apple Pay by default
- merchantIdentifier `merchant.uk.locksafe.app` configured in:
  - `app.config.js` (Stripe plugin config)
  - `app/_layout.tsx` (StripeProvider)
- This adds `com.apple.developer.in-app-payments` entitlement

**Actual Usage:**
- ❌ No Apple Pay payment sheets
- ❌ No Apple Pay buttons
- ❌ No PKPayment APIs
- ✅ Only server-side payment intent creation
- ✅ Stripe for traditional card processing

**Code Search Results:**
```bash
# No Apple Pay implementation found in app code
grep -r "presentApplePay\|initPaymentSheet\|PKPayment" app/ services/
# Result: No matches in application code
# Only found in node_modules/@stripe/stripe-react-native/
```

---

### Business Model Analysis

**App Type:** B2B Service Provider Platform (locksmith partner app)

**Comparable To:**
- Uber Driver (driver app, not rider app)
- DoorDash Dasher (courier app, not customer app)
- TaskRabbit Tasker (service provider app)

**Key Findings:**

1. **Users:** Professional locksmiths (trade partners)
   - Licensed UK locksmiths
   - Registered businesses
   - Verified via backend

2. **No Purchases in App:**
   - Zero in-app purchases
   - Zero subscriptions
   - Zero paid features
   - Zero content unlocking
   - All features FREE for locksmiths

3. **Payment Flow:**
   ```
   Customer (Website) → Pays assessment fee → Job created
                                                    ↓
   Locksmith (App) → Sees job → Accepts → Performs service
                                                    ↓
   Stripe Connect → Bank payout → Locksmith receives 75-85%
   ```

4. **Revenue Model:**
   - Commission-based marketplace
   - Customer pays on **web platform** (www.locksafe.uk)
   - Platform takes 15-25% commission
   - Locksmith receives 75-85% via Stripe Connect
   - No money flows through mobile app

5. **Feature Access:**
   - All features free and unlocked
   - No Premium vs Basic tiers
   - No paywalls
   - No "previously purchased content"
   - Just service job opportunities

**Code Evidence:**
- ✅ No StoreKit imports
- ✅ No `react-native-iap` library
- ✅ No subscription management
- ✅ No paywall screens
- ✅ Earnings screen is read-only display
- ✅ Payment service only creates backend intents

---

## 📄 Documents Created

### 1. Comprehensive Response (APPLE_BUILD8_REJECTION_RESPONSE.md)
**Length:** ~4,000 words  
**Purpose:** Full detailed analysis and explanation  
**Includes:**
- Technical PassKit explanation
- Detailed business model breakdown
- Code references and evidence
- Comparison to approved apps
- Supporting documentation offers

**Use Case:** Reference document, can send to Apple if they request more details

---

### 2. Reviewer Notes (APP_STORE_REVIEWER_NOTES.txt)
**Length:** ~1,500 words  
**Purpose:** Ready to paste into App Store Connect  
**Format:** Plain text, concise, structured  
**Includes:**
- Direct answers to all 4 questions
- PassKit explanation
- Business model summary
- Code evidence
- Compliance statements

**Use Case:** Copy/paste into "App Review Information → Notes" field

---

## 🎯 Recommended Actions

### Immediate (Within 24 Hours)

**Option A: Respond with Clarification (Recommended)**
1. Open App Store Connect → My Apps → LockSafe
2. Go to current version 1.0.2
3. Click "Respond to App Review"
4. Copy content from `APP_STORE_REVIEWER_NOTES.txt`
5. Paste into the response field
6. Click "Send" to submit clarification

**Advantages:**
- Fastest resolution path
- No code changes needed
- Likely to be accepted with good explanation
- Build 8 can be approved as-is

---

**Option B: Fix PassKit + Resubmit Build 9**

If you want to remove the PassKit entitlement entirely:

1. **Edit `app.config.js`:**
   ```javascript
   // Remove or modify this section:
   [
     '@stripe/stripe-react-native',
     {
       // merchantIdentifier: 'merchant.uk.locksafe.app',  // REMOVE THIS LINE
       enableGooglePay: true,
     },
   ]
   ```

2. **Edit `app/_layout.tsx`:**
   ```typescript
   <StripeProvider
     publishableKey={STRIPE_KEY}
     // merchantIdentifier="merchant.uk.locksafe.app"  // REMOVE THIS LINE
   >
   ```

3. **Update build number:**
   ```javascript
   // app.config.js
   buildNumber: '9',  // Change from 8 to 9
   ```

4. **Build & Submit:**
   ```bash
   npx eas build --profile production --platform ios
   npx eas submit --platform ios
   ```

5. **Submit with notes from APP_STORE_REVIEWER_NOTES.txt**

**Advantages:**
- Removes any PassKit ambiguity
- Cleaner entitlements file
- Eliminates Issue 1 entirely

**Disadvantages:**
- Delays approval by 1-2 days (build + upload time)
- Removes future Apple Pay option (would need to add back)

---

### Our Recommendation: **Option A First**

**Why:**
1. The PassKit inclusion is legitimate (SDK dependency)
2. Our explanation is thorough and accurate
3. Business model is clearly compliant (no IAP needed)
4. Many apps have similar SDK dependencies with unused features
5. Faster path to approval

**If rejected again:**
→ Then proceed with Option B (Build 9 with PassKit removed)

---

## 📋 Next Steps Checklist

### Response Submission (Option A)

- [ ] Log in to App Store Connect
- [ ] Navigate to LockSafe app → Version 1.0.2
- [ ] Click "Respond to App Review"
- [ ] Open `APP_STORE_REVIEWER_NOTES.txt` on your computer
- [ ] Copy entire contents
- [ ] Paste into App Review response field
- [ ] Review for any custom additions needed
- [ ] Click "Send" to submit response
- [ ] Monitor email for Apple's reply (typically 24-48 hours)

### Build 9 Preparation (Option B - if needed)

- [ ] Edit `app.config.js` (remove merchantIdentifier)
- [ ] Edit `app/_layout.tsx` (remove merchantIdentifier)
- [ ] Update buildNumber to "9"
- [ ] Commit changes to git
- [ ] Run `npx eas build --profile production --platform ios`
- [ ] Wait for build to complete (~10-15 minutes)
- [ ] Run `npx eas submit --platform ios`
- [ ] Update App Store Connect with Build 9
- [ ] Paste notes from `APP_STORE_REVIEWER_NOTES.txt`
- [ ] Submit for review

---

## 🔑 Key Points for Apple

**PassKit:**
- Included via Stripe SDK dependency (industry standard)
- NOT implemented or accessible to users
- Can be removed if required

**Business Model:**
- B2B service provider tool (like Uber Driver)
- NO in-app purchases
- NO subscriptions
- NO paid content
- All customer payments on separate web platform
- Commission-based marketplace model
- Fully compliant with Guidelines 3.1.3(d)

**Stripe Usage:**
- Backend payment processing only
- Server-side payment intent creation
- NOT for in-app transactions
- NOT for Apple Pay

---

## 📞 If Apple Requests More Information

You can offer to provide:

1. **Video walkthrough** - Screen recording of all app features
2. **Test credentials** - Locksmith demo account
3. **Backend API docs** - Payment flow documentation
4. **Website screenshots** - Customer payment flow on web
5. **Stripe Connect docs** - Locksmith payout process
6. **Call/meeting** - Direct discussion with review team

All of these can be prepared quickly if needed.

---

## 🎓 Understanding Apple's Concerns

**Why they ask about PassKit:**
- Many apps try to bypass In-App Purchase using Apple Pay
- Apple wants to ensure proper IAP usage for digital goods
- They need to verify it's legitimately unused

**Why they ask about business model:**
- Guideline 3.1 requires IAP for digital goods/services
- They need to confirm this is PHYSICAL services (exempt)
- They want to ensure no subscription bypass
- They're checking for compliance with 3.1.3 exceptions

**Our Position:**
- Physical locksmith services (exempt from IAP requirement)
- Commission marketplace (like Uber/DoorDash)
- No digital goods or content
- All payments outside the app
- Fully compliant with 3.1.3(d) exception

---

## ✅ Confidence Level

**PassKit Issue:** 95% confident in approval
- Common SDK dependency scenario
- Clear explanation
- Easy fix if needed (Build 9)

**Business Model Issue:** 99% confident in approval
- Textbook example of 3.1.3(d) exception
- Well-documented comparable apps
- Clear B2B service model
- No IAP needed or wanted

**Overall:** This should be resolved with the clarification response. The business model is clearly compliant, and PassKit is a standard SDK dependency issue.

---

## 📧 Contact & Support

**Developer Email:** locksafeuk26@gmail.com  
**Response Time:** 24-48 hours typical for Apple Review  
**Documents Location:** `/home/ubuntu/locksafe-mobile/`

**Files to Use:**
- `APP_STORE_REVIEWER_NOTES.txt` ← Primary response document
- `APPLE_BUILD8_REJECTION_RESPONSE.md` ← Full reference
- `BUILD8_REJECTION_SUMMARY.md` ← This file

---

**Good luck with the submission! The response is comprehensive and should result in approval.** 🚀
