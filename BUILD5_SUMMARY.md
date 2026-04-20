# Build 5 Summary — iOS SDK Compliance

## 1) Executive Snapshot

- **Project:** `locksafe-mobile`
- **Platform:** iOS (App Store Connect)
- **Version:** `1.0.2`
- **Previous reviewed build:** `4`
- **Current reviewed build:** `5`
- **Compliance driver:** Apple warning `90725`
- **Apple enforcement date:** **Apr 28, 2026**
- **Final submission timestamp:** **Apr 20, 2026 at 3:10 PM (Europe/London)**
- **Current status:** **Waiting for Review**

---

## 2) Why Build 5 Was Required

Apple flagged SDK compliance warning `90725`, indicating the app must be built with iOS 26 SDK or later by Apr 28, 2026. Build 4 remained valid for crash-fix context but required SDK-level update to avoid submission risk near enforcement.

---

## 3) What Changed in Build 5

### SDK/Toolchain
- iOS SDK updated/confirmed to **26.2**
- Xcode toolchain confirmed as **2620**
- IPA metadata verified:
  - `DTSDKName: iphoneos26.2`
  - `DTXcode: 2620`
  - `DTPlatformVersion: 26.2`
  - `CFBundleVersion: 5`

### Release Flow
- Build 5 created and uploaded via EAS
- Build 5 processed by Apple and became selectable
- Build 4 replaced by Build 5 in App Store Connect submission flow
- App resubmitted for review with updated reviewer notes

### Stability Continuity
- Existing iOS startup crash fix (OneSignal initialization hardening) retained in the Build 5 release path

---

## 4) Submission & Compliance Status

- ✅ Build 5 upload: complete
- ✅ Build 5 processing: complete
- ✅ Build 5 selected in App Store Connect: complete
- ✅ App resubmitted for review: complete
- ✅ SDK compliance (`90725`) achieved before deadline: complete

Supporting reports:
- [`IOS_BUILD5_SDK_UPDATE.md`](./IOS_BUILD5_SDK_UPDATE.md)
- [`IOS_BUILD5_SUBMISSION_COMPLETE.md`](./IOS_BUILD5_SUBMISSION_COMPLETE.md)
- [`WORK_LOG_2026-04-20.md`](./WORK_LOG_2026-04-20.md)

---

## 5) Timeline (Discovery → Submission)

1. **SDK warning discovered:** Apple warning `90725` identified against current iOS submission path.
2. **Urgency confirmed:** Apr 28, 2026 enforcement deadline recognized (8-day window).
3. **Build 5 created:** New iOS build generated with iOS 26.2 SDK / Xcode 2620.
4. **Build 5 uploaded:** EAS submission pipeline completed successfully.
5. **Build 5 processed:** Apple processing completed, build became selectable.
6. **Build selection updated:** Build 4 replaced with Build 5 in App Store Connect.
7. **Final resubmission completed:** **Apr 20, 2026 at 3:10 PM (Europe/London)**.
8. **Post-submit state:** App now in **Waiting for Review** with SDK-compliant binary.

---

## 6) Current Next Actions

- Monitor App Store Connect review outcome for Build 5
- If approved, verify release behavior and monitor startup stability
- If rejected, map reviewer notes directly to Build 5 metadata and submission history
