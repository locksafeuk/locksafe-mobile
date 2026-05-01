# Backend Account Deletion API (Required for iOS Guideline 5.1.1(v))

## Current Status

The mobile app (Build 20) now includes a full in-app deletion flow in Settings.

During codebase analysis, no dedicated account deletion endpoint was found in current mobile API integrations/docs.

Implemented client behavior:
1. Primary attempt: `DELETE /api/locksmith/account`
2. Fallback attempt (if primary returns 404/405): `DELETE /api/user/delete`

## Required Backend Endpoint

### Recommended

`DELETE /api/locksmith/account`

### Authentication

- Requires logged-in locksmith session
- Supports `Authorization: Bearer {token}`

### Expected Success Response

```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

## Backend Deletion Requirements

When endpoint is called, backend should permanently remove or irreversibly anonymize:

- Locksmith account record
- Auth/session tokens
- Profile data
- Notification bindings (OneSignal / push tokens)
- Job-linked personal data according to policy
- Any other personally identifiable user data tied to the account

## Error Responses

Suggested:

- `401` Unauthorized (missing/invalid token)
- `403` Forbidden (authenticated but wrong role)
- `404` Account not found
- `409` Conflict (if deletion blocked by legal/financial constraints)
- `500` Internal server error

Example error payload:

```json
{
  "success": false,
  "error": "Unable to delete account at this time"
}
```

## App-Side Behavior (Already Implemented)

After successful response, app performs:

1. Local auth/session cleanup (logout)
2. User is returned to login screen (`/(auth)/locksmith-login`)
3. Deletion success confirmation shown

## Apple Review Notes

This endpoint must be active in production before App Store resubmission so the full deletion flow is functional end-to-end.
