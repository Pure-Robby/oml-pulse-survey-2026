# Survey Access Guide

## Overview

The Pulse Culture Survey supports two different access methods, both directing users to the survey interface but with different authentication flows:

1. **Staff Code Authentication** - Requires authentication with staff code and date of birth
2. **Unique Link Access** - Secure access via personalized link with GUID

## How to Access the Survey

### From the Dashboard

1. Click the **"Open Survey"** button in the header
2. A modal will appear with two options:
   - **Staff Code Authentication** - Opens the survey with authentication required
   - **Unique Link Access** - Opens the survey with a GUID parameter

### Direct URLs

- **Survey with Authentication Required**: `survey/index.html?access=auth`
- **Survey with GUID**: `survey/index.html?guid=YOUR_GUID_HERE`
- **Login Page**: `landing.html`

## Authentication Flow

### Staff Code Authentication

1. User clicks "Access with Login" in the modal
2. Redirected to `survey/index.html?access=auth`
3. Survey landing page shows authentication required message
4. Button text changes to "Log in" and redirects to `landing.html`
5. User enters:
   - Staff Code (any 3+ character code for demo)
   - Date of Birth
6. Upon successful login, redirected directly to first question page (`survey/index.html?page=1`)
7. Survey shows authenticated user experience starting from first question

### Unique Link Access (GUID-based)

1. User clicks "Access with GUID" in the modal
2. System generates a unique GUID and opens survey with `?guid=GUID` parameter
3. Survey validates the GUID and grants access
4. Shows normal landing page content with "Start Survey" button
5. No login credentials required
6. Secure, personalized access method

## New Access Flow Features

### Dynamic Landing Page Content

The survey landing page now adapts based on access method:

#### Authentication Required Access (`?access=auth`)
- **Message**: "Using a generic link will require you to validate your employee details before you can complete the survey"
- **Button**: "Log in" with login icon
- **Action**: Redirects to login page

#### Personalized Link Access (`?guid=GUID`)
- **Message**: Standard "Ready to begin?" message
- **Button**: "Start Survey" with play icon
- **Action**: Starts survey directly

### Direct Question Access

When users complete authentication via the login page, they are redirected directly to the first question page, skipping the landing page for a smoother experience.

## GUID-based Access Features

### GUID Validation

The survey includes GUID-based authentication:

- Extracts GUID from URL parameters
- Validates GUID format and authenticity
- If valid GUID: Grants access to survey
- If invalid or missing GUID: Redirects to login page

### Security Features

- GUIDs are unique and time-limited
- One-time use links for enhanced security
- No personal credentials required
- Secure, personalized access method

## Technical Implementation

### Files Modified

1. **`app.js`** - Updated access functions to redirect to survey index with parameters
2. **`survey/index.html`** - Added IDs for dynamic content updates
3. **`survey/script.js`** - Added access type detection and content modification logic
4. **`landing.html`** - Modified to redirect to first question page after login

### Key Functions

- `accessGenericLink()` - Opens survey with `?access=auth` parameter
- `accessGuidLink()` - Opens survey with `?guid=GUID` parameter
- `checkAccessTypeAndUpdateContent()` - Updates landing page content based on access type
- `checkAuthentication()` - Validates user authentication and access permissions

### URL Parameters

- `access=auth` - Indicates authentication required access
- `guid=GUID_VALUE` - Unique identifier for GUID-based access
- `page=1` - Direct access to specific question page (used after login)

### Session Storage

- `surveyAuthenticated` - Set to 'true' after successful login
- `staffCode` - Stores the user's staff code

## Demo Credentials

For demonstration purposes, any valid input is accepted:

- **Staff Code**: Any 3+ character string
- **Date of Birth**: Any valid date (not in the future)
- **GUID**: Any GUID format string (e.g., `demo-abc123def`)

## Security Notes

- This is a demo implementation
- In production, proper authentication would be required
- Session storage is used for demo purposes
- Real implementation would use secure authentication tokens
- GUIDs should be validated against a database in production
- GUIDs should have expiration dates and usage limits

## Browser Compatibility

- Modern browsers with ES6+ support
- SessionStorage support required
- CSS Grid and Flexbox support recommended 