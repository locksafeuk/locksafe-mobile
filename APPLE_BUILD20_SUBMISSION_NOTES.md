Build 20 - Account Deletion Feature Added

We have implemented the requested account deletion feature as per
Guideline 5.1.1(v).

ACCOUNT DELETION FLOW:
1. User signs in to the app
2. Navigates to Settings tab (bottom navigation)
3. Scrolls to bottom to find "Delete Account" button
4. Taps "Delete Account"
5. First confirmation alert: "This action cannot be undone. All your
   data will be permanently deleted."
6. User taps "Continue"
7. Second confirmation modal appears requiring user to type "DELETE"
   to confirm
8. After typing "DELETE", the "Delete Account" button becomes active
9. User taps "Delete Account"
10. API call deletes account and all associated data
11. User is logged out and returned to login screen

The feature includes:
- Clear visual warnings (red/danger styling)
- Two-step confirmation to prevent accidental deletion
- Complete data removal from backend
- Immediate effect (no customer service required)

TEST CREDENTIALS:
Email: amiosif@icloud.com
Password: demo1234

You can test the complete account deletion flow with this demo account.
The account will be permanently deleted and can be recreated for
future testing.

All previous issues (crashes, password visibility) have been resolved
in Build 19. Build 20 adds only the account deletion feature.
