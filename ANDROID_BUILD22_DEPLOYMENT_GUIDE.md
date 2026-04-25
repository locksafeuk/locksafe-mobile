# ANDROID_BUILD22_DEPLOYMENT_GUIDE.md

Date: April 26, 2026  
Project: `/home/ubuntu/locksafe-mobile`

## 1) Build 22 Details

- **Version:** 1.0.2 (Build 22)
- **Build ID:** `ea61afbe-25f4-41ab-9d0e-c8c7bdec5243`
- **Artifact file:** `build/locksafe-v1.0.2-build22.aab`
- **Current status:** ✅ User tested and approved; ready for deployment consideration

## 2) What Has Been Tested

User-tested on device with acceptable behavior for Android release consideration:

- Login flow and core navigation
- Remember Me behavior (email + password persistence)
- Settings support links:
  - Help Center
  - Partner Terms
  - Privacy Policy
- Keyboard/form behavior improvements in key flows

## 3) What Is Working in Build 22

- **Remember Me** securely stores both email and password
- **Settings links** open correctly
- **Keyboard scrolling and input handling** improved
- **Form handling** improved for auth and job-related screens
- **iOS crash hardening code** included in shared codebase (Android unaffected)

## 4) Google Play Deployment Steps

1. **Open Google Play Console**
   - Go to your app: LockSafe Mobile
2. **Go to Production (or staged track first)**
   - Recommended: staged rollout before full production
3. **Create new release**
   - Upload `locksafe-v1.0.2-build22.aab`
4. **Complete release notes**
   - Use template below
5. **Run pre-launch checks**
   - Verify policy, content rating, data safety, and app access sections
6. **Submit rollout**
   - Start with staged rollout (e.g., 10% → 25% → 50% → 100%)
7. **Monitor after release**
   - Watch crash-free users, ANR rate, login success, and support tickets

## 5) Pre-Release Validation Checklist

- [x] Build artifact generated successfully
- [x] User tested on real device
- [x] No critical Android blockers currently reported
- [ ] Optional: one final smoke test on clean install before pressing rollout

## 6) Release Notes Template (Google Play)

**Title:** LockSafe v1.0.2 (Build 22)

**What’s new:**
- Improved Remember Me: now securely saves both email and password
- Fixed support links in Settings (Help Center, Partner Terms, Privacy Policy)
- Improved keyboard scrolling/input behavior across forms
- Form UX and reliability improvements
- Internal stability hardening updates

## 7) Important Scope Note

- **Android:** Build 22 is currently suitable for deployment consideration.
- **iOS:** Build 9 still needs fixes (Jobs tab crash and full workflow testing) and should not be treated as deployment-ready yet.
