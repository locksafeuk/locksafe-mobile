# iOS Build 5 Rejection Details — LockSafe - Locksmith Partner

**Report Date:** April 21, 2026  
**App:** LockSafe - Locksmith Partner  
**App ID:** 6762475008  
**Bundle ID:** uk.locksafe.app  

---

## Rejection Summary

| Field | Value |
|-------|-------|
| **App Version** | 1.0.2 |
| **Build Number** | 5 |
| **Status** | ❌ Rejected — Unresolved Issues |
| **Date Submitted** | April 20, 2026 at 2:10 PM |
| **Review Date** | April 20, 2026 |
| **Rejection Time** | April 20, 2026 at ~3:03 PM (message timestamp: "Yesterday 3:03 PM") |
| **Submission ID** | 60f3f4e7-9453-4564-b001-446d056860b6 |
| **Submitted By** | Alex Locksafe |
| **Last Updated By** | Apple |

---

## Guideline Violated

### **Guideline 2.1(a) — Performance: App Completeness**

> 2.1.0 Performance: App Completeness

This is the same guideline violated in Build 3 and Build 4 rejections — the app crashes during review.

---

## Apple's Full Rejection Message

**From:** Apple  
**Date:** April 20, 2026 at 3:03 PM  

> Hello,
>
> Thank you for your efforts to follow our guidelines. There are some outstanding issues that still need your attention.
>
> If you have any questions, we are here to help. Reply to this message in App Store Connect and let us know.
>
> **Review Environment**
> - Submission ID: 60f3f4e7-9453-4564-b001-446d056860b6
> - Review date: April 20, 2026
> - Review Device: iPad Air 11-inch (M3)
> - Version reviewed: 1.0.2
>
> **Guideline 2.1(a) - Performance**
>
> **Issue Description**
>
> The app crashed during review. Apps that crash negatively impact users.
>
> **Steps leading to crash:**
>
> App crashes as we attempt to log in.
>
> **Review device details:**
> - Device type: iPad Air 11-inch (M3)
> - OS version: iPadOS 26.4.1
>
> **Next Steps**
>
> Test the app on supported devices to identify crashes and stability issues before resubmitting for review. Crash logs have been attached to help resolve this issue:
>
> 1. Fully symbolicate the crash report. See Adding Identifiable Symbol Names to a Crash Report.
> 2. Match the crash report to a common pattern. Based on the pattern, take specific actions to further investigate the crash. See Identifying the Cause of Common Crashes.
> 3. Once the root causes of the crash have been identified, make the appropriate changes to the binary to resolve the issue.
> 4. Test the app on a device to ensure that it runs as expected.
>
> Note that users expect apps they download to function on all the devices where they are available. For example, apps that may be downloaded onto iPad devices should function as expected for iPad users.
>
> **Resources**
> - For more information on crash reports, see Diagnosing Issues Using Crash Reports and Device Logs.
> - For information about testing apps and preparing them for review, see Testing a Release Build.
> - To learn about troubleshooting networking issues, see Networking Overview.

---

## Crash Details from Apple

| Field | Value |
|-------|-------|
| **Crash Trigger** | App crashes as we attempt to log in |
| **Review Device** | iPad Air 11-inch (M3) |
| **OS Version** | iPadOS 26.4.1 |
| **Crash Log Attached** | crashlog-2F0EDDB4-D1E6-47ED-89E4-FE4997D4DFC5.ips |

### Crash Analysis (from uploaded crash logs)

The crash log `crashlog-2F0EDDB4-D1E6-47ED-89E4-FE4997D4DFC5.ips` matches one of the uploaded files. Key findings from the crash logs:

- **Exception Type:** EXC_CRASH (SIGABRT) — Abort trap: 6
- **Crash Location:** Thread 1 (com.facebook.react.ExceptionsManagerQueue)
- **Device:** iPad (iPad15,3 model code — iPad Air 11-inch M3)
- **OS:** iPhone OS 26.4.1 (Build 23E254)
- **Build Version:** CFBundleVersion: 5 (confirmed Build 5)
- **App Version:** CFBundleShortVersionString: 1.0.2
- **Crash Timing:** During cold start / app launch (procLaunch to crash is ~0.1 seconds)
- **Root Cause:** OneSignal push notification permission prompt timing issue during app startup
- **Pattern:** Same crash pattern as Build 3 and Build 4 — `objc_exception_rethrow` → `__cxa_rethrow` → `abort()`

### Crash Stack Trace (Faulting Thread 1)

```
Thread 1 (com.facebook.react.ExceptionsManagerQueue) — TRIGGERED:
__pthread_kill
pthread_kill
abort
__abort_message
demangling_terminate_handler()
_objc_terminate()
std::__terminate(void (*)())
__cxa_rethrow
objc_exception_rethrow
[App Code - OneSignal related]
_dispatch_call_block_and_release
_dispatch_client_callout
_dispatch_lane_serial_drain
_dispatch_lane_invoke
_dispatch_root_queue_drain_deferred_wlh
_dispatch_workloop_worker_thread
_pthread_wqthread
start_wqthread
```

---

## Additional Issues

### Issues Identified Beyond the Crash

Based on the rejection message, **the ONLY issue mentioned is the crash**. Apple did not flag:
- ❌ No SDK compliance issues mentioned
- ❌ No metadata issues mentioned
- ❌ No privacy/data collection issues mentioned
- ❌ No design guideline violations mentioned
- ❌ No content policy violations mentioned

The rejection is **solely due to the crash during login on iPad**.

---

## Resolution Center

- **Messages:** 1 message from Apple (the rejection message above)
- **Reply Option:** "Reply to App Review" link available
- **Action Available:** "Resubmit to App Review" button present
- **Cancel Option:** "Cancel Submission" link available

---

## Comparison with Previous Rejections

| Aspect | Build 3 | Build 4 | Build 5 |
|--------|---------|---------|---------|
| **Guideline** | 2.1(a) Performance | 2.1(a) Performance | 2.1(a) Performance |
| **Issue** | Crash on startup | Crash on startup | Crash on login |
| **Device** | iPad | iPad | iPad Air 11-inch (M3) |
| **OS** | iPadOS 26.4.1 | iPadOS 26.4.1 | iPadOS 26.4.1 |
| **Exception** | EXC_CRASH (SIGABRT) | EXC_CRASH (SIGABRT) | EXC_CRASH (SIGABRT) |
| **Root Cause** | OneSignal timing | OneSignal timing | OneSignal timing (partial fix) |

---

## What Needs Fixing for Build 6

### Primary Fix Required
The OneSignal push notification initialization is still crashing on iPad during cold start. The previous fix (Build 5) was partial and did not fully resolve the timing issue.

### Recommended Changes
1. **Defer OneSignal initialization** — Move OneSignal.initialize() to after the app has fully mounted and the root view is ready
2. **Wrap in try-catch** — Add comprehensive error handling around OneSignal permission prompts
3. **iPad-specific testing** — The crash consistently occurs on iPad; ensure testing on iPad simulator/device
4. **Cold start handling** — The crash happens within ~0.1 seconds of launch, suggesting initialization order issues
5. **Consider removing OneSignal permission prompt at startup** — Delay the notification permission request until after the user has logged in and is on the main screen

### Build 6 Requirements
- Fix the OneSignal crash completely
- Test on iPad Air (M3) with iPadOS 26.4.1 specifically
- Test cold start scenarios
- Test login flow on iPad
- Verify no other crashes exist
- Submit Build 6 for review

---

## Screenshots

The following screenshots were saved during this review:

1. `/home/ubuntu/rejection_apps_list.png` — Apps list showing rejection status
2. `/home/ubuntu/rejection_overview.png` — App version page showing rejection banner
3. `/home/ubuntu/rejection_submission_details.png` — Submission details with crash log
4. `/home/ubuntu/rejection_message_part1.png` — Apple's rejection message (part 1)
5. `/home/ubuntu/rejection_message_part2.png` — Apple's rejection message (part 2)

---

*Report generated: April 21, 2026*
