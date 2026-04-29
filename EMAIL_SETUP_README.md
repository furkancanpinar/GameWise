# GameWise Email Verification Setup

This document explains how to set up professional email verification for the GameWise signup process.

## Current Implementation

The signup process now includes:
- ✅ 6-digit verification code generation
- ✅ Professional email template (`email-templates.js`)
- ✅ Modal popup for code entry
- ✅ Code expiration (10 minutes)
- ✅ Resend functionality
- ✅ Visual code input display

## For Production Use

Replace the demo email sending in `signup.js` with a real email service:

### Option 1: EmailJS (Client-side, easiest)

1. **Sign up for EmailJS**: https://www.emailjs.com/
2. **Create an email service** (Gmail, Outlook, etc.)
3. **Create an email template** using the HTML from `email-templates.js`
4. **Get your credentials**: Service ID, Template ID, Public Key

```javascript
// In signup.js, replace the sendVerificationEmail function:

emailjs.init('your_public_key');

emailjs.send('your_service_id', 'your_template_id', {
    to_email: email,
    to_name: 'GameWise User',
    verification_code: code,
    reply_to: 'noreply@gamewise.com'
}).then(() => {
    console.log('Email sent successfully');
}).catch((error) => {
    console.error('Email sending failed:', error);
});
```

### Option 2: SendGrid (Server-side, more robust)

1. **Sign up for SendGrid**: https://sendgrid.com/
2. **Create an API key**
3. **Set up domain authentication** for better deliverability

```javascript
// Server-side implementation (requires backend)
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const emailContent = getEmailTemplate('verification', {
    to_name: 'GameWise User',
    to_email: email,
    verification_code: code
});

const msg = {
    to: email,
    from: 'noreply@gamewise.com', // Must be verified in SendGrid
    subject: emailContent.subject,
    html: emailContent.html,
    text: emailContent.text
};

sgMail.send(msg);
```

### Option 3: Firebase Cloud Functions

Create a Firebase Cloud Function for sending emails:

```javascript
// functions/index.js
const functions = require('firebase-functions');
const nodemailer = require('nodemailer');

exports.sendVerificationEmail = functions.https.onCall((data, context) => {
    const { email, code } = data;

    // Configure nodemailer with your email service
    const transporter = nodemailer.createTransporter({
        // Your email configuration
    });

    const emailContent = getEmailTemplate('verification', {
        to_name: 'GameWise User',
        to_email: email,
        verification_code: code
    });

    return transporter.sendMail({
        from: 'noreply@gamewise.com',
        to: email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text
    });
});
```

## Email Template Customization

The email template in `email-templates.js` includes:
- Professional HTML design
- GameWise branding
- Clear instructions
- Security warnings
- Responsive design
- Plain text fallback

Customize the template variables:
- `{{to_name}}` - User's name
- `{{to_email}}` - User's email
- `{{verification_code}}` - The 6-digit code

## Security Considerations

- **Code Expiration**: Codes expire after 10 minutes
- **Single Use**: Codes are cleared after successful verification
- **Rate Limiting**: Consider implementing rate limiting for resend requests
- **IP Tracking**: Log IP addresses for security monitoring
- **Spam Prevention**: Include unsubscribe links if required

## Testing

For testing the email system:
1. Use a service like Mailtrap or Ethereal Email for development
2. Test with various email providers (Gmail, Outlook, Yahoo, etc.)
3. Verify mobile email client compatibility
4. Test spam folder placement

## Deployment Checklist

- [ ] Email service configured and tested
- [ ] Domain authentication set up
- [ ] SPF/DKIM records configured
- [ ] Email templates customized with branding
- [ ] Error handling implemented
- [ ] Rate limiting configured
- [ ] Monitoring and logging set up