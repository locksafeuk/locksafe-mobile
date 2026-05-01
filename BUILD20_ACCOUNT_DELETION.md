# Build 20 - Account Deletion Implementation

## Summary

Build 20 adds a complete in-app account deletion flow for locksmith accounts to satisfy Apple Guideline **5.1.1(v)** (apps that support account creation must also support account deletion).

## What Was Added

### 1) Settings UI: Danger Zone + Delete Account

**File:** `app/(locksmith)/(tabs)/settings.tsx`

Added a new **Danger Zone** section in Settings with a red **Delete Account** button and warning copy:

- "This will permanently delete your account and all associated data."

### 2) Two-Step Confirmation Flow

Implemented required multi-step confirmation:

1. **First confirmation alert**
   - Title: `Delete Account?`
   - Message: `This action cannot be undone. All your data will be permanently deleted.`
   - Buttons: `Cancel` / `Continue`

2. **Final confirmation modal**
   - Title: `Are you absolutely sure?`
   - Message: `Type 'DELETE' to confirm account deletion.`
   - Input required: `DELETE`
   - Buttons: `Cancel` / `Delete Account`

### 3) Deletion API Integration

App now calls backend account deletion endpoint:

- Primary: `DELETE /api/locksmith/account`
- Fallback: `DELETE /api/user/delete` (only if primary returns 404/405)

On success:

- Local auth/session is cleared via existing `logout()` flow
- User is redirected to `/(auth)/locksmith-login`
- Success alert shown

On failure:

- User sees clear error message from API response (or fallback message)

### 4) Loading + Safety Behavior

- Delete action enters loading state (`Deleting...`)
- Input/button guarded to prevent accidental execution without `DELETE`
- Modal cannot be dismissed while deletion request is in flight

### 5) iOS Build Number Update

**File:** `app.config.js`

- Updated `ios.buildNumber` from `19` → `20`

## API / Backend Requirement

If backend endpoint is not yet active, see:

- `BACKEND_ACCOUNT_DELETION_API.md`

This document defines endpoint contract and server-side deletion requirements.

## User Flow (for Apple screen recording)

1. Login as locksmith
2. Open **Settings** tab
3. Scroll to **Danger Zone**
4. Tap **Delete Account**
5. Confirm first warning (`Continue`)
6. In second dialog, type `DELETE`
7. Tap **Delete Account**
8. Observe logout + redirect to login screen

## Apple Submission Note

For App Review evidence, record exactly the above flow from Settings to successful deletion confirmation and logout.
