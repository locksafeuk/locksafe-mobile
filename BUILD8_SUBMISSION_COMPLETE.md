# LockSafe iOS Build 8 Submission Complete

**Date:** 2026-04-23 (Europe/London)  
**Final Status:** ✅ Submitted to App Review (`Waiting for Review`)  
**App:** LockSafe - Locksmith Partner  
**Version:** `1.0.2 (8)`  
**Bundle ID:** `uk.locksafe.app`

---

## 1) What was fixed in Build 8

Build 8 addresses Apple Guideline 2.3.8 icon feedback:

- Replaced placeholder-style iconography used in earlier review cycles.
- New icon is a finalized professional lock + key design.
- Removed all placeholder/construction-style visuals (grid lines/crosshairs/guides).
- Updated iOS build number to `8` in `app.config.js`.

Primary assets updated:
- `assets/icon.png`
- `assets/android-icon-foreground.png`
- `assets/android-icon-background.png`
- `assets/android-icon-monochrome.png`
- `assets/favicon.png`
- `assets/splash-icon.png`
- `assets/icon-new.png` (master source)

---

## 2) Git commit for icon replacement

- **Commit:** `1bb0349cf5b34c42dae95a99dfd42bcf5c7d8e81`
- **Message:** `fix: replace placeholder icons with professional finalized design (Build 8)`
- **Branch:** `main`
- **Pushed:** ✅ `origin/main`

---

## 3) EAS build details (iOS production)

- **Build ID:** `6bb6eb56-6653-41e3-b69d-729fc21af921`
- **Platform:** iOS
- **Profile:** production
- **Status:** `FINISHED`
- **Created:** 2026-04-23T13:11:06.124Z
- **Completed:** 2026-04-23T13:19:24.603Z
- **App version:** `1.0.2`
- **Build number:** `8`
- **Artifact (IPA):** `https://expo.dev/artifacts/eas/eisJiV7j3ZJwXtCZr1YKyV.ipa`

Local verification:
- Downloaded IPA: `build/build8/locksafe-v1.0.2-build8-ios.ipa`
- `Info.plist` check:
  - `CFBundleShortVersionString = 1.0.2`
  - `CFBundleVersion = 8`
  - `CFBundleIdentifier = uk.locksafe.app`

---

## 4) EAS submit details

- **Submission ID:** `9370db68-b51f-4c78-a585-2f519b200ee6`
- **Submission status:** `Success` (Expo submission page)
- **Submitted build:** `1.0.2 (8)`
- **Submit completion:** approx 2026-04-23 14:24 BST

Submission link:
- `https://expo.dev/accounts/locksafeuk26/projects/locksafe-mobile/submissions/9370db68-b51f-4c78-a585-2f519b200ee6`

---

## 5) App Store Connect actions completed

Completed in App Store Connect UI:

1. Removed previously selected Build `7` from version `1.0.2`.
2. Added Build `8` from available processed builds.
3. Saved version metadata.
4. Confirmed reviewer notes include icon-fix explanation:

> Build 8 addresses the icon issue (Guideline 2.3.8). We have replaced the previous icons with finalized, professional designs featuring a modern lock and key symbol. All placeholder elements (grid lines, construction guides) have been removed. The icons are now production-ready and clearly represent the LockSafe locksmith service brand. The app functionality remains stable with native push notifications.

5. Submitted version for review.
6. Confirmed App Store Connect state changed to `Waiting for Review`.

---

## 6) Evidence screenshots

Saved evidence:

- `docs/screenshots/build8/testflight-build-uploads-build8.png`
- `docs/screenshots/build8/build8-selected-in-version-page.png`
- `docs/screenshots/build8/prepare-for-submission-build8.png`
- `docs/screenshots/build8/item-submitted-waiting-for-review-build8.png`

---

## 7) Final confirmation

✅ Build 8 is now selected for app version `1.0.2` and submitted.  
✅ Current status is `Waiting for Review`.  
✅ Icon issue remediation has been explicitly documented for reviewers.
