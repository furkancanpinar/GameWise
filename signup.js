/**
 * 1. CONFIGURATION & INITIALIZATION
 */

// Initialize EmailJS immediately with your Public Key
(function() {
    emailjs.init('g5BLTUe0sqV20jyvn');
})();

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBisUUnNd29eTBhaX9WOhPTVDQktpFTWsc",
    authDomain: "gamewise1-3c18b.firebaseapp.com",
    projectId: "gamewise1-3c18b",
    storageBucket: "gamewise1-3c18b.appspot.com",
    messagingSenderId: "1089492043866",
    appId: "1:1089492043866:web:5f9447cb64655baae8b063"
};

// Initialize Firebase (Assuming version 8.x SDK is loaded in HTML)
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Memory-based state (Safer than localStorage for sensitive signup data)
let signupState = null;

/**
 * 2. UTILITY FUNCTIONS
 */

// Generate a 6-digit verification code
function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send verification email using EmailJS
function sendVerificationEmail(email, code) {
    console.log("Sending OTP...");
    return emailjs.send('service_c1g00tp', 'template_h33h85b', {
        to_email: email,
        to_name: 'GameWise User',
        verification_code: code,
        reply_to: 'noreply@gamewise.com'
    });
}

/**
 * 3. MODAL & UI HANDLING
 */

// Show verification modal
function showVerificationModal(email) {
    const modal = document.getElementById('emailVerificationModal');
    const emailDisplay = document.getElementById('verificationEmail');
    const codeInput = document.getElementById('verificationCode');
    const codeDisplay = document.getElementById('codeDisplay');

    if (emailDisplay) emailDisplay.textContent = email;
    if (modal) modal.style.display = 'block';

    // Focus and visual feedback
    setTimeout(() => {
        if (codeInput) {
            codeInput.focus();
            if (codeDisplay) codeDisplay.classList.add('focused');
        }
    }, 100);

    setupCodeInput();
}

// Close verification modal
function closeVerificationModal() {
    const modal = document.getElementById('emailVerificationModal');
    const codeInput = document.getElementById('verificationCode');
    const codeDigits = document.querySelectorAll('.code-digit');

    if (modal) modal.style.display = 'none';
    if (codeInput) codeInput.value = '';
    
    codeDigits.forEach(digit => {
        digit.textContent = '';
        digit.classList.remove('active');
    });
    
    signupState = null; // Clear the temporary state
}

/**
 * 4. CODE INPUT LOGIC (Visual Digits & Input Handling)
 */

function setupCodeInput() {
    const codeInput = document.getElementById('verificationCode');
    const codeDigits = document.querySelectorAll('.code-digit');
    const codeDisplay = document.getElementById('codeDisplay');

    if (!codeInput) return;

    // Focus/blur handlers
    codeInput.addEventListener('focus', () => codeDisplay?.classList.add('focused'));
    codeInput.addEventListener('blur', () => codeDisplay?.classList.remove('focused'));

    // Area click handlers
    codeDisplay?.addEventListener('click', () => codeInput.focus());
    codeDigits.forEach((digit, index) => {
        digit.addEventListener('click', () => {
            codeInput.focus();
            codeInput.setSelectionRange(index, index);
        });
    });

    // Input processing
    codeInput.addEventListener('input', function (e) {
        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
        e.target.value = value;

        codeDigits.forEach((digit, index) => {
            digit.textContent = value[index] || '';
            digit.classList.toggle('active', index < value.length);
        });

        if (value.length === 6) {
            // Short delay for visual polish before auto-submit
            setTimeout(() => verifyCode(value), 500);
        }
    });

    // Backspace handling
    codeInput.addEventListener('keydown', function (e) {
        if (e.key === 'Backspace') {
            const value = e.target.value;
            if (value.length > 0) {
                // The input event will handle the UI update, 
                // but this ensures precise control if needed.
            }
        }
    });

    // Paste handling
    codeInput.addEventListener('paste', function (e) {
        e.preventDefault();
        const pastedText = (e.clipboardData || window.clipboardData).getData('text');
        const digitsOnly = pastedText.replace(/\D/g, '').slice(0, 6);
        codeInput.value = digitsOnly;
        codeInput.dispatchEvent(new Event('input'));
    });
}

/**
 * 5. VERIFICATION & ACCOUNT CREATION
 */

function verifyCode(enteredCode) {
    if (!signupState) {
        alert('Verification session expired. Please try signing up again.');
        closeVerificationModal();
        return;
    }

    if (Date.now() > signupState.expiry) {
        alert('Verification code has expired. Please request a new one.');
        closeVerificationModal();
        return;
    }

    if (enteredCode === signupState.code) {
        completeSignup(signupState);
    } else {
        alert('Incorrect verification code. Please try again.');
        const codeInput = document.getElementById('verificationCode');
        if (codeInput) codeInput.value = '';
        document.querySelectorAll('.code-digit').forEach(digit => {
            digit.textContent = '';
            digit.classList.remove('active');
        });
    }
}

function completeSignup(data) {
    auth.createUserWithEmailAndPassword(data.email, data.password)
        .then((userCredential) => {
            return userCredential.user.updateProfile({
                displayName: data.username
            });
        })
        .then(() => {
            closeVerificationModal();
            alert('Account created successfully! Welcome to GameWise!');
            window.location.href = 'index.html';
        })
        .catch((error) => {
            console.error('Signup Error:', error);
            alert('Error creating account: ' + error.message);
            closeVerificationModal();
        });
}

function resendVerificationCode() {
    if (!signupState) {
        alert('Session expired. Please start over.');
        return;
    }

    const newCode = generateVerificationCode();
    signupState.code = newCode;
    signupState.expiry = Date.now() + (10 * 60 * 1000);

    sendVerificationEmail(signupState.email, newCode)
        .then(() => {
            alert('New code sent! Please check your email.');
            const codeInput = document.getElementById('verificationCode');
            if (codeInput) codeInput.value = '';
            document.querySelectorAll('.code-digit').forEach(digit => {
                digit.textContent = '';
                digit.classList.remove('active');
            });
        })
        .catch((error) => {
            console.error('Resend Error:', error);
            alert('Failed to resend code.');
        });
}

/**
 * 6. GLOBAL EVENT LISTENERS
 */

// Form Submission
const signupForm = document.querySelector('.signup-form');
if (signupForm) {
    signupForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const username = document.getElementById('username').value;
        const agreeTerms = document.getElementById('agree-terms');

        if (password !== confirmPassword) {
            alert("Passwords don't match!");
            return;
        }

        if (agreeTerms && !agreeTerms.checked) {
            alert("You must agree to the terms of service");
            return;
        }

        const code = generateVerificationCode();
        
        // Store data for the verification step
        signupState = {
            code: code,
            expiry: Date.now() + (10 * 60 * 1000),
            email: email,
            password: password,
            username: username
        };

        sendVerificationEmail(email, code)
            .then(() => {
                showVerificationModal(email);
            })
            .catch((error) => {
                console.error('EmailJS Error:', error);
                alert('Failed to send verification email. Please check your EmailJS configuration.');
            });
    });
}

// Modal Buttons
document.getElementById('closeVerificationModal')?.addEventListener('click', closeVerificationModal);
document.getElementById('resendCodeBtn')?.addEventListener('click', resendVerificationCode);
document.getElementById('verifyCodeBtn')?.addEventListener('click', function () {
    const code = document.getElementById('verificationCode').value;
    if (code.length === 6) {
        verifyCode(code);
    } else {
        alert('Please enter the complete 6-digit code.');
    }
});

// Click outside modal to close
window.addEventListener('click', function (event) {
    const modal = document.getElementById('emailVerificationModal');
    if (event.target === modal) {
        closeVerificationModal();
    }
});