# Email Notifications Setup

## Overview
GBRentals now sends automatic email notifications when users submit property booking applications. Notifications are sent to:
- Property owners (when someone books their property)
- All active admins (for oversight and monitoring)

## Setup Instructions

### 1. Email Configuration
Update your `.env` file in the `backend/` directory with your email settings:

```env
# Email Configuration (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 2. Gmail Setup (if using Gmail)
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Use this password in `EMAIL_PASS`

### 3. Alternative Email Providers
You can use other SMTP providers:

**Outlook/Hotmail:**
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
```

**Yahoo:**
```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USER=your-email@yahoo.com
EMAIL_PASS=your-app-password
```

**Custom SMTP:**
```env
EMAIL_HOST=your-smtp-server.com
EMAIL_PORT=587
EMAIL_USER=your-email@domain.com
EMAIL_PASS=your-password
```

### 4. Testing
1. Restart your backend server after updating `.env`
2. Check console logs for "✅ Email service ready" message
3. Submit a test booking to verify notifications are sent

## Notification Content
- **Owner Notification**: Includes applicant details, property info, and next steps
- **Admin Notification**: Includes booking overview for platform monitoring
- **Email Format**: Professional HTML emails with GBRentals branding

## Troubleshooting
- If emails aren't sending, check your SMTP credentials
- Verify firewall/antivirus isn't blocking port 587
- Check spam folder for test emails
- Console logs will show email send status

## Security Notes
- Emails are sent asynchronously (booking succeeds even if email fails)
- No sensitive data is included in emails
- CNIC documents are not emailed (only links to view them)