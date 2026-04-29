// Email template for verification codes
// This can be used with services like SendGrid, Mailgun, or EmailJS

const emailTemplates = {
    verification: {
        subject: "Welcome to GameWise - Verify Your Account",

        html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your GameWise Account</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            background-color: #f4f4f4;
            padding: 20px;
        }
        .container {
            background-color: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #ad84ff;
            margin-bottom: 10px;
        }
        .verification-code {
            background-color: #f8f9fa;
            border: 2px solid #ad84ff;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 30px 0;
            font-size: 32px;
            font-weight: bold;
            color: #ad84ff;
            letter-spacing: 5px;
            font-family: 'Courier New', monospace;
        }
        .instructions {
            margin: 20px 0;
            color: #666;
        }
        .warning {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            text-align: center;
            color: #888;
            font-size: 12px;
        }
        .button {
            display: inline-block;
            background-color: #ad84ff;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 5px;
            margin: 10px 0;
            font-weight: bold;
        }
        .support {
            margin-top: 20px;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🎮 GameWise</div>
            <h1>Welcome to GameWise!</h1>
        </div>

        <p>Hello <strong>{{to_name}}</strong>,</p>

        <p>Thank you for signing up for GameWise! To complete your account creation and start your gaming journey, please verify your email address.</p>

        <div class="verification-code">
            {{verification_code}}
        </div>

        <div class="instructions">
            <p><strong>How to verify:</strong></p>
            <ol>
                <li>Return to the signup page</li>
                <li>Enter the 6-digit code shown above</li>
                <li>Click "Verify Code" to complete your registration</li>
            </ol>
        </div>

        <div class="warning">
            <strong>⚠️ Important:</strong> This verification code will expire in 10 minutes for security reasons. If you didn't request this verification, please ignore this email.
        </div>

        <p>If you're having trouble with the verification process, feel free to contact our support team.</p>

        <p>We're excited to have you join the GameWise community!</p>

        <p>Best regards,<br>The GameWise Team</p>

        <div class="footer">
            <p>This email was sent to {{to_email}} because someone requested account creation on GameWise.</p>
            <p class="support">Need help? Contact us at <a href="mailto:support@gamewise.com">support@gamewise.com</a></p>
            <p>&copy; 2026 GameWise. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`,

        text: `
Welcome to GameWise!

Hello {{to_name}},

Thank you for signing up for GameWise! To complete your account creation, please use the verification code below:

VERIFICATION CODE: {{verification_code}}

How to verify:
1. Return to the signup page
2. Enter the 6-digit code shown above
3. Click "Verify Code" to complete your registration

⚠️ Important: This verification code will expire in 10 minutes for security reasons.

If you didn't request this verification, please ignore this email.

We're excited to have you join the GameWise community!

Best regards,
The GameWise Team

---
This email was sent to {{to_email}}
Need help? Contact us at support@gamewise.com
© 2026 GameWise. All rights reserved.
`
    }
};

// Function to get email template with replaced variables
function getEmailTemplate(templateName, variables) {
    let template = emailTemplates[templateName];

    if (!template) {
        throw new Error(`Email template '${templateName}' not found`);
    }

    // Replace variables in subject
    let subject = template.subject;
    let html = template.html;
    let text = template.text;

    Object.keys(variables).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        subject = subject.replace(regex, variables[key]);
        html = html.replace(regex, variables[key]);
        text = text.replace(regex, variables[key]);
    });

    return {
        subject,
        html,
        text
    };
}

module.exports = {
    getEmailTemplate,
    emailTemplates
};