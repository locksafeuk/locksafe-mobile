# OneSignal vs Native Push Comparison (LockSafe)

**Context:** LockSafe has experienced repeated iOS startup instability around OneSignal integration despite multiple mitigation attempts. This document compares current OneSignal approach with a direct native push approach.

### Quick Recommendation
Move to **native push** (FCM + APNs) for Build 7, with a short rollback window.

### Current OneSignal Configuration Snapshot
From current repo/docs:
- OneSignal App ID configured: `cd19d270-4a74-4bdf-b534-3287cfb8b4e4`
- Firebase project available: `locksafeuk-ea52e`
- APNs key/team already configured for iOS (`uk.locksafe.app`)
- OneSignal runtime integration in:
  - `services/pushNotifications.ts`
  - `app/_layout.tsx`
  - `app.config.js` plugin: `onesignal-expo-plugin`
- Backend endpoints:
  - `/api/onesignal/send`
  - `/api/onesignal/subscribe`
  - `/api/onesignal/unsubscribe`
- Security hardening for these endpoints completed April 2026 (auth/authz and status semantics improved)

### What can be reused in native migration
- Existing Firebase project (`locksafeuk-ea52e`)
- Existing Apple Developer team and app identifier (`uk.locksafe.app`)
- Existing APNs credentials process (or current key material where policy allows)
- Existing payload conventions (`type`, `jobId`) and deep-link routes
- Existing endpoint security posture patterns (strict auth/authz)

### What must change
- Remove OneSignal SDK/plugin from app
- Replace OneSignal player ID model with native device token model
- Replace `/api/onesignal/*` workflow with `/api/push/*` workflow
- Implement direct send providers: Firebase Admin (Android), APNs (iOS)
- Update deployment/testing docs and runbooks

### Side-by-Side Comparison
| Area | OneSignal (Current) | Native (Proposed) |
|---|---|---|
| Delivery path | App -> OneSignal SDK -> OneSignal infra -> APNs/FCM | App -> native token -> LockSafe backend -> APNs/FCM |
| Startup footprint | Third-party SDK init + listeners in startup/login lifecycle | Minimal app-side native registration via Expo notifications |
| Crash risk surface | Higher (extra SDK timing and runtime layer) | Lower (fewer moving parts) |
| Control over token lifecycle | Abstracted behind OneSignal player IDs | Full control of token creation/update/deactivation |
| Debuggability | Mixed (dashboard + SDK abstraction) | High (direct logs per provider and endpoint) |
| Vendor dependence | High | Low-medium (platform providers only) |
| Security scope | OneSignal endpoints + external processor integration | Direct in-house endpoint control |
| Feature richness (segments/campaigns) | Strong built-in marketing tools | Needs custom implementation if required |
| Engineering complexity (initial) | Lower initial setup | Higher initial migration effort |
| Engineering complexity (long-term) | Can grow due to abstraction mismatch | Stable and predictable for product-specific flows |
| Cost model | Potential SaaS cost with scale/features | Mostly infra/engineering cost |
| Reliability for this app context | Repeated startup issues observed | Expected improvement due to simplified runtime |

### Pros/Cons Analysis
#### OneSignal - Pros
- Quick setup and prebuilt dashboard targeting
- Built-in segmentation/campaign tooling
- Less backend send logic at initial stage

#### OneSignal - Cons (for current LockSafe context)
- Additional runtime SDK complexity in app lifecycle
- Historically linked to startup instability concerns in this project
- Less direct control over token and delivery diagnostics
- Extra dependency in a critical user journey (app launch/login)

#### Native Push - Pros
- Eliminates OneSignal SDK from startup path
- Better platform alignment and long-term maintainability
- Full ownership of logging, retry, token hygiene, and auth model
- Easier to reason about backend observability and SLA

#### Native Push - Cons
- Requires backend implementation and operational ownership
- Requires careful APNs/FCM setup and testing discipline
- Fewer out-of-the-box marketing/campaign features

### Complexity Comparison
- **Initial implementation complexity:** Native > OneSignal
- **Ongoing operational clarity:** Native > OneSignal
- **App launch/runtime stability potential:** Native > OneSignal (for this specific project history)

### Reliability Comparison
Given repeated iOS startup incidents in historical OneSignal builds and the need for deterministic launch behavior:
- **Short-term reliability after migration:** likely improved with native push.
- **Long-term reliability:** improved if token hygiene, retry logic, and monitoring are implemented correctly.

### Cost Comparison (high-level)
#### OneSignal
- Potential recurring SaaS cost depending on scale/features
- Lower initial engineering investment

#### Native
- Potentially lower direct SaaS cost
- Higher engineering + DevOps ownership cost
- Better control and potentially better total cost predictability at scale

### Migration path from OneSignal to native
1. Freeze OneSignal feature changes.
2. Implement native token registration in app + backend (`/api/push/*`).
3. Run beta build with full native testing on iOS/Android.
4. Cut over send provider to native.
5. Keep OneSignal fallback available for 1 release cycle.
6. Remove OneSignal SDK/plugin and deprecate old endpoints.

### Decision Matrix
| Criteria | Weight | OneSignal Score | Native Score |
|---|---:|---:|---:|
| Startup stability | 30 | 2/5 | 4/5 |
| Operational control | 20 | 2/5 | 5/5 |
| Time-to-implement | 15 | 4/5 | 3/5 |
| Debuggability | 15 | 3/5 | 5/5 |
| Long-term maintainability | 20 | 3/5 | 5/5 |

**Weighted recommendation:** Native approach wins for LockSafe’s current priorities.

### Final Recommendation
Proceed with native push migration in Build 7 using:
- `expo-notifications` for app-level handling,
- Firebase Admin SDK for Android sends,
- APNs provider for iOS sends,
- strict auth/authz on push endpoints,
- staged rollout and rollback guardrails.

This approach directly addresses the root architectural concern: eliminating OneSignal SDK startup dependency while preserving push functionality and deep-link behavior.