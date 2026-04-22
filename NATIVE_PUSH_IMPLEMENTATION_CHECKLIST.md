# Native Push Notifications Implementation Checklist (LockSafe)

**Goal:** Track migration from OneSignal to native push (FCM + APNs) in a release-safe way.

### How to Use This Checklist
- Mark each item as done only after real verification.
- Keep evidence links (screenshots, logs, PRs, build IDs) per section.
- Do not proceed to production until all required production checks are complete.

### Section A - Manual Console Setup (Firebase + Apple)
#### A1. Firebase (Android FCM)
- [ ] Confirm access to Firebase project: `locksafeuk-ea52e`
- [ ] Confirm Android app registration for package `uk.locksafe.app`
- [ ] Confirm Cloud Messaging is active
- [ ] Generate/validate service account key for backend sending
- [ ] Store service account JSON in secure secret manager (not in repo)
- [ ] Define notification channels (`jobs`, `payments`, `system`)
- [ ] Create at least 2 Firebase test message templates
- [ ] Record Firebase owner and key rotation policy

#### A2. Apple Developer (iOS APNs)
- [ ] Confirm Apple team access (`4ZNRAB4A2S`)
- [ ] Verify App ID `uk.locksafe.app` has Push Notifications enabled
- [ ] Create/validate APNs `.p8` key (or approved certificate alternative)
- [ ] Securely store `.p8` + Key ID + Team ID
- [ ] Refresh provisioning profiles if capability changed
- [ ] Confirm EAS build credentials align with updated profiles
- [ ] Assign APNs credential owner and rotation policy

#### A3. App Store Connect / Google Play pre-validation
- [ ] TestFlight internal test group created for migration build
- [ ] Play Console closed testing track configured for migration build
- [ ] Build notes include “OneSignal removed / native push added”

### Section B - Code Changes (Mobile App)
#### B1. Dependency and config changes
- [ ] Add `expo-notifications`
- [ ] Add `expo-device`
- [ ] (Optional) Add `expo-application`
- [ ] Remove `react-native-onesignal`
- [ ] Remove `onesignal-expo-plugin` from `app.config.js`
- [ ] Remove `EXPO_PUBLIC_ONESIGNAL_APP_ID` usage from config and docs

#### B2. Service layer migration
- [ ] Create `services/nativePushNotifications.ts`
- [ ] Implement permission request with graceful denial handling
- [ ] Implement token retrieval (platform-aware)
- [ ] Implement notification received listener
- [ ] Implement notification tap response listener
- [ ] Preserve deep-link mapping (`type`, `jobId`)
- [ ] Implement Android channel setup

#### B3. App integration changes
- [ ] Replace OneSignal service usage in `app/_layout.tsx`
- [ ] Keep deferred push registration pattern after auth/UI settling
- [ ] Handle logout token deactivation/unsubscribe
- [ ] Ensure web platform is safely no-op (if required)

#### B4. Remove/retire OneSignal code paths
- [ ] Deprecate or delete `services/pushNotifications.ts`
- [ ] Update `services/api/notifications.ts` to native endpoints
- [ ] Remove OneSignal setup docs or move to archive

### Section C - Backend Changes
#### C1. API contract changes
- [ ] Implement `POST /api/push/subscribe` (auth required)
- [ ] Implement `POST /api/push/unsubscribe` (auth required)
- [ ] Implement `POST /api/push/send` (admin/system auth)
- [ ] Keep explicit status semantics (401/403/404 where appropriate)

#### C2. Data model and token lifecycle
- [ ] Create `device_push_tokens` table/model
- [ ] Add deduplication on token upsert
- [ ] Add token invalidation handling from provider responses
- [ ] Track `last_seen_at`, `platform`, `app_version`

#### C3. Delivery providers
- [ ] Android sender via Firebase Admin SDK
- [ ] iOS sender via APNs provider
- [ ] Retry strategy with exponential backoff
- [ ] Dead-letter or error queue for failed sends

#### C4. Security and observability
- [ ] Audit logging for push sends
- [ ] Rate limiting on send endpoint
- [ ] Alerting for failure spikes and abnormal volume
- [ ] Restrict credentials by least privilege

### Section D - Testing Procedures (Required)
#### D1. Unit/integration checks
- [ ] Native push service initializes without startup regression
- [ ] Payload parser handles missing `type` safely
- [ ] Deep-link mapping returns correct route for each notification type

#### D2. Android device testing
- [ ] Token registration succeeds after login
- [ ] Firebase test push received in foreground
- [ ] Firebase test push received in background
- [ ] Firebase test push received when app is killed
- [ ] Notification tap opens correct screen
- [ ] Android 13+ permission flow validated

#### D3. iOS device testing
- [ ] Token registration succeeds after login
- [ ] APNs test push received in foreground
- [ ] APNs test push received in background
- [ ] APNs test push received when app is killed
- [ ] Notification tap opens correct screen
- [ ] Permission denied/allowed flows validated

#### D4. Lifecycle and edge-case testing
- [ ] Logout deactivates token
- [ ] Re-login re-registers token
- [ ] App reinstall rotates token correctly
- [ ] Network interruption handled with retry
- [ ] Duplicate notifications not observed for single event

### Section E - Production Deployment Checklist (Go-Live Gate)
#### E1. Required manual setup completed
- [ ] Firebase setup complete and verified
- [ ] Apple APNs setup complete and verified
- [ ] Credential ownership and rotation documented

#### E2. Code quality and release readiness
- [ ] PR reviewed and approved
- [ ] OneSignal references removed from production path
- [ ] Build passes on iOS and Android
- [ ] No critical warnings/errors in release logs

#### E3. Test environment validation
- [ ] TestFlight push tests passed
- [ ] Play closed testing push tests passed
- [ ] Crash-free cold-start validation passed (20+ launches each platform)

#### E4. Production rollout readiness
- [ ] Rollout strategy selected (staged percentage recommended)
- [ ] Rollback flag/provider toggle prepared
- [ ] Support/on-call team briefed
- [ ] Release notes prepared

#### E5. Monitoring and logging setup
- [ ] Dashboard for send success/failure rates
- [ ] Dashboard for delivery/open metrics
- [ ] Alert configured for failure-rate threshold breach
- [ ] Alert configured for startup crash regression

### Section F - Post-Launch Verification
- [ ] Validate first 1 hour metrics after release
- [ ] Validate first 24 hour metrics after release
- [ ] Compare against baseline OneSignal delivery/open rates
- [ ] Confirm no startup crash spike in app analytics
- [ ] Collect QA sign-off and production stabilization note

### Section G - Rollback Checklist (Only if needed)
- [ ] Trigger rollback criteria met and acknowledged
- [ ] Switch provider to fallback using runtime config/feature flag
- [ ] Communicate rollback to stakeholders
- [ ] Validate push recovery after rollback
- [ ] Open incident ticket + postmortem action items

### Evidence Log (fill during execution)
- PR links:
- Build IDs (iOS/Android):
- Firebase test screenshots:
- APNs test logs:
- Crash dashboard link:
- Monitoring dashboard link:
- Final go-live approval by: