# Email Service Configuration

## Environment Variables Required

Add the following environment variables to your `backend/.env` file:

```env
EMAIL_USER=your-gmail-address@gmail.com
EMAIL_PASS=your-app-specific-password
```

## Gmail Setup Instructions

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security > 2-Step Verification
   - App passwords > Generate password for "Mail"
   - Use the generated password as `EMAIL_PASS`

## Email Features

### Booking Confirmation Email
- **Trigger**: Automatically sent when a booking is successfully created
- **Recipient**: Customer's email address from booking form
- **Content**: Booking details, schedule, payment status, important instructions

### Payment Confirmation Email  
- **Trigger**: Automatically sent when payment status changes to 'completed'
- **Recipient**: Customer's email address
- **Content**: Payment confirmation, final booking details, next steps

## Email Templates

The email service includes professionally styled HTML templates with:
- Studio branding and colors
- Responsive design
- Complete booking information
- Important instructions and guidelines
- Payment status indicators

## Error Handling

- Email failures **do not** block booking creation or payment processing
- All email errors are logged to the console
- Booking operations continue normally even if emails fail

## Testing Email Service

You can test the email service using the existing `test-email.js` file:

```bash
cd backend
node test-email.js
```

## File Structure

```
backend/
├── services/
│   └── emailService.js          # Email service with templates
├── controllers/
│   └── userBookingsController.js # Integrated email sending
└── test-email.js                # Email testing utility
```