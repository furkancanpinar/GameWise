// Firebase configuration and initialization
const firebaseConfig = {
    apiKey: "AIzaSyBisUUnNd29eTBhaX9WOhPTVDQktpFTWsc",
    authDomain: "gamewise1-3c18b.firebaseapp.com",
    projectId: "gamewise1-3c18b",
    storageBucket: "gamewise1-3c18b.appspot.com",
    messagingSenderId: "1089492043866",
    appId: "1:1089492043866:web:5f9447cb64655baae8b063"
};

const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Generate a 6-digit verification code
function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send verification email with professional template
function sendVerificationEmail(email, code) {
    return new Promise((resolve, reject) => {
        // For demo purposes, we'll simulate sending an email
        // In production, you would use a service like SendGrid, Mailgun, or EmailJS

        console.log(`Sending verification email to ${email} with code: ${code}`);

        // Simulate email sending with a delay
        setTimeout(() => {
            // For demo: show the professional email content in console
            console.log(`📧 Email sent to ${email}`);
            console.log(`📧 Subject: Welcome to GameWise - Verify Your Account`);
            console.log(`📧 Professional HTML email with code: ${code}`);
            console.log(`📧 This code will expire in 10 minutes.`);

            // In production, replace this with actual email service integration
            // Example with EmailJS:
            /*
            // First, include EmailJS script in HTML: <script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"></script>

            emailjs.init('your_public_key');

            emailjs.send('your_service_id', 'your_template_id', {
                to_email: email,
                to_name: 'GameWise User',
                verification_code: code,
                reply_to: 'noreply@gamewise.com'
            }).then(resolve).catch(reject);
            */

            // Example with SendGrid (server-side):
            /*
            const sgMail = require('@sendgrid/mail');
            sgMail.setApiKey(process.env.SENDGRID_API_KEY);

            const msg = {
                to: email,
                from: 'noreply@gamewise.com',
                subject: 'Welcome to GameWise - Verify Your Account',
                html: getEmailTemplate('verification', {
                    to_name: 'GameWise User',
                    to_email: email,
                    verification_code: code
                }).html
            };

            sgMail.send(msg).then(resolve).catch(reject);
            */

            resolve();
        }, 1000);
    });
}

// Show verification modal
function showVerificationModal(email) {
    document.getElementById('verificationEmail').textContent = email;
    document.getElementById('emailVerificationModal').style.display = 'block';

    // Focus on the hidden input and set up digit display
    const codeInput = document.getElementById('verificationCode');
    const codeDisplay = document.getElementById('codeDisplay');

    setTimeout(() => {
        codeInput.focus();
        codeDisplay.classList.add('focused');
    }, 100);

    setupCodeInput();
}

// Set up code input handling
function setupCodeInput() {
    const codeInput = document.getElementById('verificationCode');
    const codeDigits = document.querySelectorAll('.code-digit');
    const codeDisplay = document.getElementById('codeDisplay');

    // Focus/blur handlers for visual feedback
    codeInput.addEventListener('focus', function() {
        codeDisplay.classList.add('focused');
    });

    codeInput.addEventListener('blur', function() {
        codeDisplay.classList.remove('focused');
    });

    // Make the entire code display area clickable to focus the input
    codeDisplay.addEventListener('click', function() {
        codeInput.focus();
    });

    // Make individual digits clickable
    codeDigits.forEach((digit, index) => {
        digit.addEventListener('click', function() {
            codeInput.focus();
            // Position cursor at the clicked position
            codeInput.setSelectionRange(index, index);
        });
    });

    codeInput.addEventListener('input', function(e) {
        const value = e.target.value.replace(/\D/g, ''); // Only allow digits
        e.target.value = value;
        console.log('Input value:', value);

        // Update visual digits
        codeDigits.forEach((digit, index) => {
            digit.textContent = value[index] || '';
            digit.classList.toggle('active', index < value.length);
        });

        // Auto-submit when 6 digits are entered
        if (value.length === 6) {
            setTimeout(() => verifyCode(value), 500);
        }
    });

    codeInput.addEventListener('keydown', function(e) {
        if (e.key === 'Backspace') {
            const value = e.target.value;
            if (value.length > 0) {
                e.target.value = value.slice(0, -1);
                codeDigits[value.length - 1].textContent = '';
                codeDigits[value.length - 1].classList.remove('active');
            }
        }
    });

    // Handle paste events
    codeInput.addEventListener('paste', function(e) {
        e.preventDefault();
        const pastedText = (e.clipboardData || window.clipboardData).getData('text');
        const digitsOnly = pastedText.replace(/\D/g, '').slice(0, 6);
        codeInput.value = digitsOnly;

        // Trigger input event to update display
        codeInput.dispatchEvent(new Event('input'));
    });
}

// Verify the entered code
function verifyCode(enteredCode) {
    const verificationData = JSON.parse(localStorage.getItem('pendingVerification'));

    if (!verificationData) {
        alert('Verification session expired. Please try signing up again.');
        closeVerificationModal();
        return;
    }

    // Check if code has expired
    if (Date.now() > verificationData.expiry) {
        alert('Verification code has expired. Please request a new one.');
        localStorage.removeItem('pendingVerification');
        closeVerificationModal();
        return;
    }

    // Check if code matches
    if (enteredCode === verificationData.code) {
        // Code is correct, create the account
        completeSignup(verificationData);
    } else {
        alert('Incorrect verification code. Please try again.');
        // Clear the input
        document.getElementById('verificationCode').value = '';
        document.querySelectorAll('.code-digit').forEach(digit => {
            digit.textContent = '';
            digit.classList.remove('active');
        });
    }
}

// Complete the signup process
function completeSignup(verificationData) {
    auth.createUserWithEmailAndPassword(verificationData.email, verificationData.password)
        .then((userCredential) => {
            const user = userCredential.user;

            // Update profile
            return user.updateProfile({
                displayName: verificationData.username
            });
        })
        .then(() => {
            // Clear verification data
            localStorage.removeItem('pendingVerification');

            // Close modal and redirect
            closeVerificationModal();
            alert('Account created successfully! Welcome to GameWise!');
            window.location.href = 'index.html';
        })
        .catch((error) => {
            console.error('Error completing signup:', error);
            alert('Error creating account. Please try again.');
            localStorage.removeItem('pendingVerification');
            closeVerificationModal();
        });
}

// Close verification modal
function closeVerificationModal() {
    document.getElementById('emailVerificationModal').style.display = 'none';
    document.getElementById('verificationCode').value = '';
    document.querySelectorAll('.code-digit').forEach(digit => {
        digit.textContent = '';
        digit.classList.remove('active');
    });
}

// Resend verification code
function resendVerificationCode() {
    const verificationData = JSON.parse(localStorage.getItem('pendingVerification'));

    if (!verificationData) {
        alert('Verification session expired. Please try signing up again.');
        closeVerificationModal();
        return;
    }

    // Generate new code
    const newCode = generateVerificationCode();
    const newExpiry = Date.now() + (10 * 60 * 1000);

    verificationData.code = newCode;
    verificationData.expiry = newExpiry;
    localStorage.setItem('pendingVerification', JSON.stringify(verificationData));

    // Send new email
    sendVerificationEmail(verificationData.email, newCode)
        .then(() => {
            alert('New verification code sent! Please check your email.');
            // Reset input
            document.getElementById('verificationCode').value = '';
            document.querySelectorAll('.code-digit').forEach(digit => {
                digit.textContent = '';
                digit.classList.remove('active');
            });
        })
        .catch((error) => {
            console.error('Failed to resend verification email:', error);
            alert('Failed to send new verification code. Please try again.');
        });
}

document.querySelector('.signup-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const username = document.getElementById('username').value;

    if (password !== confirmPassword) {
        alert("Passwords don't match!");
        return;
    }

    if (!document.getElementById('agree-terms').checked) {
        alert("You must agree to the terms of service");
        return;
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const codeExpiry = Date.now() + (10 * 60 * 1000); // 10 minutes

    // Store verification data temporarily
    const verificationData = {
        code: verificationCode,
        expiry: codeExpiry,
        email: email,
        password: password,
        username: username
    };
    localStorage.setItem('pendingVerification', JSON.stringify(verificationData));

    // Send verification email
    sendVerificationEmail(email, verificationCode)
        .then(() => {
            // Show verification modal
            showVerificationModal(email);
        })
        .catch((error) => {
            console.error('Failed to send verification email:', error);
            alert('Failed to send verification email. Please try again.');
            localStorage.removeItem('pendingVerification');
        });
});

// Modal event listeners
document.getElementById('closeVerificationModal').addEventListener('click', closeVerificationModal);
document.getElementById('verifyCodeBtn').addEventListener('click', function() {
    const code = document.getElementById('verificationCode').value;
    if (code.length === 6) {
        verifyCode(code);
    } else {
        alert('Please enter the complete 6-digit code.');
    }
});
document.getElementById('resendCodeBtn').addEventListener('click', resendVerificationCode);

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modal = document.getElementById('emailVerificationModal');
    if (event.target === modal) {
        closeVerificationModal();
    }
});
