# Apple App Store Guideline 5.1.1(v) - Account Deletion Compliance

## Overview
This document describes how the Skedisy Customer app complies with Apple's Guideline 5.1.1(v) regarding account deletion requirements.

## Implementation Details

### Location of Account Deletion Feature
Users can delete their account through the following navigation path:
1. Open the app and log in to your account
2. Navigate to **Profile** tab (bottom navigation)
3. Tap on **Settings** menu item
4. Select **Delete Account** option
5. Review the detailed information and confirm deletion

### Account Deletion Flow

#### Step 1: Access Delete Account
- Located in: **Profile → Settings → Delete Account**
- Clearly labeled with "Delete Account" text
- Available icon: Delete icon (trash/delete symbol)

#### Step 2: Comprehensive Deletion Warning Dialog
When users tap "Delete Account", they see a detailed confirmation dialog that includes:

##### Warning Icon
- Large warning icon to indicate the severity of the action

##### Clear Title
- "Delete Account" heading

##### Explicit Warning Message
- "This action is permanent and cannot be undone!"
- Displayed prominently in red/warning color

##### Detailed Information Section
The dialog explicitly lists what will be permanently deleted:
- **Personal Information**: Name, email, phone number
- **Booking History**: All past and upcoming appointments
- **Wallet Balance**: Any remaining balance and transaction history
- **Favorites & Wishlist**: Saved salons and products
- **Order History**: All order records and receipts

##### Important Notice
- Additional emphasis box stating: "This action cannot be undone. All your data will be permanently deleted."

##### Action Buttons
- **Cancel** button: Allows users to abort the deletion process
- **Delete Permanently** button: Clearly labeled to indicate permanent deletion

#### Step 3: Deletion Process
- Loading indicator with "Deleting Account..." message
- API call to backend to permanently delete all user data
- Success confirmation: "Account deleted successfully"
- Automatic logout and redirect to login/home screen

#### Step 4: Post-Deletion
- All user data is permanently deleted from the system
- User is logged out automatically
- No data recovery is possible (permanent deletion, not deactivation)

## Compliance with Apple Guidelines

### ✅ Permanent Deletion (Not Deactivation)
The implementation performs **permanent account deletion**, not temporary deactivation. The API endpoint `user/delete` removes all user data from the database.

### ✅ In-App Account Deletion
Users can complete the entire account deletion process within the app without needing to:
- Visit an external website
- Call customer service
- Send an email
- Use any other external method

### ✅ Clear Information & Confirmation
The dialog provides:
- Clear explanation of what data will be deleted
- Explicit warning that the action is permanent
- Confirmation step to prevent accidental deletion
- Detailed list of affected data categories

### ✅ User Data Scope
The following user data is permanently deleted:
- Personal account information (name, email, phone, bio, age, gender)
- Authentication credentials
- Booking history and appointments
- Wallet balance and transaction records
- Favorites and wishlist items
- Order history and receipts
- Reviews and ratings
- FCM tokens and device information

## Technical Implementation

### Files Modified
1. **Dialog Component**: `lib/custom/dialog/delete_account_dialog.dart`
   - Enhanced with detailed information display
   - Multi-step confirmation process
   - Clear visual indicators

2. **Settings Screen**: `lib/ui/setting/view/setting_screen.dart`
   - Delete Account menu item
   - Available only for logged-in users

3. **API Integration**: `lib/ui/setting/controller/setting_controller.dart`
   - `onDeleteUserApiCall()` method
   - Calls backend endpoint: `user/delete`

4. **Localization**: `lib/utils/language/english_language.dart`
   - All text strings are localized
   - Support for multiple languages

### API Endpoint
- **URL**: `https://skedisy.com/user/delete`
- **Method**: POST
- **Headers**: API key authentication
- **Body**: `{ "userId": "user_id_string" }`
- **Response**: Status confirmation

## Screenshots for App Review Response
When responding to Apple's review team, include screenshots showing:

1. **Settings Screen** - Showing "Delete Account" option clearly visible
2. **Delete Account Dialog** - Complete view of the warning dialog with all details
3. **Loading State** - "Deleting Account..." indicator
4. **Completion** - User logged out and returned to initial screen

## Response Template for Apple App Review

```
Dear App Review Team,

Thank you for your feedback regarding Guideline 5.1.1(v) - Data Collection and Storage.

We have implemented comprehensive account deletion functionality in our app. Here's how users can delete their accounts:

**Navigation Path:**
Profile Tab → Settings → Delete Account

**Account Deletion Process:**
1. Users navigate to Profile → Settings
2. Select "Delete Account" option
3. A detailed confirmation dialog appears showing:
   - Clear warning that the action is permanent
   - Comprehensive list of what data will be deleted:
     * Personal information (name, email, phone)
     * Booking history and appointments
     * Wallet balance and transactions
     * Favorites and wishlist items
     * Order history and receipts
   - Notice that the action cannot be undone
4. Users confirm by tapping "Delete Permanently"
5. Account and all associated data are permanently deleted
6. User is automatically logged out

**Key Features:**
- ✅ Complete in-app deletion (no external website needed)
- ✅ Permanent deletion (not deactivation)
- ✅ Clear information about what will be deleted
- ✅ Confirmation step to prevent accidental deletion
- ✅ Immediate data removal from our systems

The account deletion feature is fully functional and accessible to all users. We have attached screenshots showing the deletion flow for your reference.

Best regards,
Skedisy Development Team
```

## Testing Checklist
- [x] Delete account option visible in Settings
- [x] Dialog shows detailed information
- [x] Warning messages are clear and prominent
- [x] Confirmation required before deletion
- [x] API call successfully deletes user data
- [x] User is logged out after deletion
- [x] All translations are present
- [x] No linter errors

## Maintenance Notes
- Keep deletion dialog text up-to-date with any new data types
- Ensure backend API properly deletes all user-related data
- Test account deletion flow with each major app update
- Monitor user feedback regarding deletion process clarity

---
**Last Updated**: January 2025
**Compliance Status**: ✅ Fully Compliant with Apple Guideline 5.1.1(v)

