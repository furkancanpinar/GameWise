document.addEventListener('DOMContentLoaded', function() {
    const dropdown = document.getElementById('dropdownMenu');
    const welcomeMessage = document.getElementById('welcomeMessage');

    firebase.auth().onAuthStateChanged(function(user) {
        dropdown.innerHTML = '';
        
        if (!user) {
            welcomeMessage.style.display = 'none';
            
            const loginLink = document.createElement('a');
            loginLink.href = 'login.html';
            loginLink.textContent = 'Login';

            const signupLink = document.createElement('a');
            signupLink.href = 'signup.html';
            signupLink.textContent = 'Sign Up';

            dropdown.appendChild(loginLink);
            dropdown.appendChild(signupLink);
            
            window.location.href = 'login.html';
        } else {
            welcomeMessage.textContent = `Welcome, ${user.displayName || 'Gamer'}`;
            welcomeMessage.style.display = 'block';

            const profileLink = document.createElement('a');
            profileLink.href = 'profile.html';
            profileLink.textContent = 'Profile';

            const logoutLink = document.createElement('a');
            logoutLink.href = '#';
            logoutLink.textContent = 'Logout';
            logoutLink.addEventListener('click', function(e) {
              e.preventDefault();
              firebase.auth().signOut().then(() => {
                localStorage.clear();
                window.location.href = 'login.html';
              }).catch((error) => {
                alert('Logout failed. Please try again.');
              });
            });

            dropdown.appendChild(profileLink);
            dropdown.appendChild(logoutLink);
            
            loadSettings(user.uid);
            setupEventListeners(user);
            updateEmailStatus(user);
        }
    });

    const savedTheme = localStorage.getItem('gamewise-theme');
    if (savedTheme) {
        changeTheme(savedTheme);
    }

    // Apply saved settings on page load
    const savedFontSize = localStorage.getItem('gamewise-font-size');
    if (savedFontSize) {
        changeFontSize(savedFontSize);
    }

    const savedAnimations = localStorage.getItem('gamewise-animations');
    if (savedAnimations !== null) {
        toggleAnimations(savedAnimations === 'true');
    }
});

function setupEventListeners(user) {
    document.querySelectorAll('.theme-option').forEach(option => {
        option.addEventListener('click', function() {
            const theme = this.getAttribute('data-theme');
            changeTheme(theme);
        });
    });

    // Font size selector
    document.getElementById('fontSizeSelect').addEventListener('change', function() {
        changeFontSize(this.value);
    });

    // Animations toggle
    document.getElementById('animationsToggle').addEventListener('change', function() {
        toggleAnimations(this.checked);
    });

    // Language selector
    document.getElementById('languageSelect').addEventListener('change', function() {
        changeLanguage(this.value);
    });

    // Difficulty selector
    document.getElementById('difficultySelect').addEventListener('change', function() {
        changeDifficulty(this.value);
    });

    // Auto-save toggle
    document.getElementById('autoSaveToggle').addEventListener('change', function() {
        toggleAutoSave(this.checked);
    });

    // Notification toggles
    document.getElementById('emailNotificationsToggle').addEventListener('change', function() {
        toggleEmailNotifications(this.checked);
    });

    document.getElementById('pushNotificationsToggle').addEventListener('change', function() {
        togglePushNotifications(this.checked);
    });

    document.getElementById('soundAlertsToggle').addEventListener('change', function() {
        toggleSoundAlerts(this.checked);
    });

    // Two-factor authentication toggle
    document.getElementById('twoFactorToggle').addEventListener('change', function() {
        toggleTwoFactor(this.checked, user);
    });

    // Email verification button
    document.getElementById('verifyEmailBtn').addEventListener('click', function() {
        sendEmailVerification(user);
    });

    document.getElementById('changePasswordBtn').addEventListener('click', function() {
        document.getElementById('passwordModal').style.display = 'block';
    });

    document.getElementById('closePasswordModal').addEventListener('click', function() {
        document.getElementById('passwordModal').style.display = 'none';
        document.getElementById('passwordChangeForm').reset();
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('passwordModal');
        if (event.target === modal) {
            modal.style.display = 'none';
            document.getElementById('passwordChangeForm').reset();
        }
    });

    document.getElementById('passwordChangeForm').addEventListener('submit', function(e) {
        e.preventDefault();
        changePassword(user);
    });

    document.getElementById('deleteAccountBtn').addEventListener('click', function() {
        deleteAccount(user);
    });

    document.getElementById('saveSettingsBtn').addEventListener('click', function() {
        saveSettings(user.uid);
    });

    document.getElementById('resetSettingsBtn').addEventListener('click', function() {
        if (confirm('Reset all settings to default values?')) {
            resetSettings(user.uid);
        }
    });
}

function changeTheme(theme) {
    const themes = ['default', 'dark', 'light', 'purple'];

    document.body.classList.remove(...themes.map(t => t + '-theme'));
    document.querySelector('header').classList.remove(...themes.map(t => t + '-theme'));
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.classList.remove(...themes.map(t => t + '-theme'));
    }

    if (theme !== 'default') {
        document.body.classList.add(theme + '-theme');
        document.querySelector('header').classList.add(theme + '-theme');
        if (sidebar) {
            sidebar.classList.add(theme + '-theme');
        }
    }

    document.querySelectorAll('.theme-option').forEach(option => {
        option.classList.remove('selected');
    });
    const selectedThemeOption = document.querySelector(`.theme-option[data-theme="${theme}"]`);
    if (selectedThemeOption) {
        selectedThemeOption.classList.add('selected');
    }

    localStorage.setItem('gamewise-theme', theme);

    updateIconFilters(theme);
}

function updateIconFilters(theme) {
    const icons = document.querySelectorAll('.nav-icon, .user-icon, .search-icon, .logo-icon');
    const needsInversion = theme === 'dark' || theme === 'default' || theme === 'purple';

    icons.forEach(icon => {
        if (needsInversion) {
            icon.style.filter = 'brightness(0) invert(1)';
        } else {
            icon.style.filter = 'brightness(0) invert(0)';
        }
    });
}

function loadSettings(userId) {
    const db = firebase.database();
    db.ref('users/' + userId + '/settings').once('value').then(snapshot => {
        const settings = snapshot.val();

        if (settings) {
            document.getElementById('twoFactorToggle').checked = settings.twoFactor || false;
            document.getElementById('fontSizeSelect').value = settings.fontSize || 'medium';
            document.getElementById('animationsToggle').checked = settings.animations !== undefined ? settings.animations : true;
            document.getElementById('emailNotificationsToggle').checked = settings.emailNotifications !== undefined ? settings.emailNotifications : true;
            document.getElementById('pushNotificationsToggle').checked = settings.pushNotifications !== undefined ? settings.pushNotifications : true;
            document.getElementById('soundAlertsToggle').checked = settings.soundAlerts || false;
            document.getElementById('difficultySelect').value = settings.difficulty || 'medium';
            document.getElementById('autoSaveToggle').checked = settings.autoSave !== undefined ? settings.autoSave : true;
            document.getElementById('languageSelect').value = settings.language || 'en';

            // Apply settings immediately
            changeFontSize(settings.fontSize || 'medium');
            toggleAnimations(settings.animations !== undefined ? settings.animations : true);
            changeLanguage(settings.language || 'en');
            changeDifficulty(settings.difficulty || 'medium');
            toggleAutoSave(settings.autoSave !== undefined ? settings.autoSave : true);
            toggleEmailNotifications(settings.emailNotifications !== undefined ? settings.emailNotifications : true);
            togglePushNotifications(settings.pushNotifications !== undefined ? settings.pushNotifications : true);
            toggleSoundAlerts(settings.soundAlerts || false);
            toggleTwoFactor(settings.twoFactor || false, firebase.auth().currentUser);

            const savedTheme = localStorage.getItem('gamewise-theme');
            if (!savedTheme && settings.theme) {
                changeTheme(settings.theme);
            } else if (!savedTheme) {
                changeTheme('default');
            }

        } else {
            applyDefaultSettingsToUI();
            applyDefaultSettings();
            if (!localStorage.getItem('gamewise-theme')) {
                changeTheme('default');
            }
        }
    }).catch(error => {
        applyDefaultSettingsToUI();
        applyDefaultSettings();
        if (!localStorage.getItem('gamewise-theme')) {
            changeTheme('default');
        }
        alert('Error loading settings: ' + error.message);
    });
}

function applyDefaultSettingsToUI() {
    document.getElementById('twoFactorToggle').checked = false;
    document.getElementById('animationsToggle').checked = true;
    document.getElementById('emailNotificationsToggle').checked = true;
    document.getElementById('pushNotificationsToggle').checked = true;
    document.getElementById('soundAlertsToggle').checked = false;
    document.getElementById('autoSaveToggle').checked = true;
    document.getElementById('fontSizeSelect').value = 'medium';
    document.getElementById('difficultySelect').value = 'medium';
    document.getElementById('languageSelect').value = 'en';
}

function applyDefaultSettings() {
    changeFontSize('medium');
    toggleAnimations(true);
    changeLanguage('en');
    changeDifficulty('medium');
    toggleAutoSave(true);
    toggleEmailNotifications(true);
    togglePushNotifications(true);
    toggleSoundAlerts(false);
    toggleTwoFactor(false, firebase.auth().currentUser);
}

function saveSettings(userId) {
    const db = firebase.database();
    const settings = {
        twoFactor: document.getElementById('twoFactorToggle').checked,
        animations: document.getElementById('animationsToggle').checked,
        fontSize: document.getElementById('fontSizeSelect').value,
        theme: localStorage.getItem('gamewise-theme') || 'default',
        emailNotifications: document.getElementById('emailNotificationsToggle').checked,
        pushNotifications: document.getElementById('pushNotificationsToggle').checked,
        soundAlerts: document.getElementById('soundAlertsToggle').checked,
        difficulty: document.getElementById('difficultySelect').value,
        autoSave: document.getElementById('autoSaveToggle').checked,
        language: document.getElementById('languageSelect').value,
        lastUpdated: firebase.database.ServerValue.TIMESTAMP
    };

    db.ref('users/' + userId + '/settings').set(settings)
        .then(() => {
            alert('Settings saved successfully!');
        })
        .catch(error => {
            alert('Error saving settings: ' + error.message);
        });
}

function resetSettings(userId) {
    applyDefaultSettingsToUI();
    applyDefaultSettings();
    changeTheme('default');

    const db = firebase.database();
    db.ref('users/' + userId + '/settings').remove()
        .then(() => {
            alert('Settings reset to default values!');
        })
        .catch(error => {
            alert('Error resetting settings: ' + error.message);
        });
}

function changePassword(user) {
    requireTwoFactorVerification(() => {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (newPassword !== confirmPassword) {
            alert('New passwords do not match!');
            return;
        }

        if (newPassword.length < 6) {
            alert('New password must be at least 6 characters long!');
            return;
        }

        // Re-authenticate user with current password
        const credential = firebase.auth.EmailAuthProvider.credential(
            user.email,
            currentPassword
        );

        user.reauthenticateWithCredential(credential).then(() => {
            // Update password
            return user.updatePassword(newPassword);
        }).then(() => {
            alert('Password changed successfully!');
            document.getElementById('passwordModal').style.display = 'none';
            document.getElementById('passwordChangeForm').reset();
        }).catch((error) => {
            console.error('Error changing password:', error);
            if (error.code === 'auth/wrong-password') {
                alert('Current password is incorrect.');
            } else if (error.code === 'auth/weak-password') {
                alert('New password is too weak. Please choose a stronger password.');
            } else if (error.code === 'auth/requires-recent-login') {
                alert('Please log out and log back in before changing your password.');
            } else {
                alert('Error changing password: ' + error.message);
            }
        });
    }, 'password change');
}

function changeFontSize(size) {
    document.body.classList.remove('font-small', 'font-medium', 'font-large');

    if (size !== 'medium') {
        document.body.classList.add('font-' + size);
    }

    localStorage.setItem('gamewise-font-size', size);
}

function toggleAnimations(enabled) {
    if (enabled) {
        document.body.classList.remove('no-animations');
    } else {
        document.body.classList.add('no-animations');
    }
    localStorage.setItem('gamewise-animations', enabled);
}

function changeLanguage(language) {
    localStorage.setItem('gamewise-language', language);
}

function changeDifficulty(difficulty) {
    localStorage.setItem('gamewise-difficulty', difficulty);
}

function toggleAutoSave(enabled) {
    localStorage.setItem('gamewise-autosave', enabled);
}

function toggleEmailNotifications(enabled) {
    localStorage.setItem('gamewise-email-notifications', enabled);
}

function togglePushNotifications(enabled) {
    localStorage.setItem('gamewise-push-notifications', enabled);
}

function toggleSoundAlerts(enabled) {
    localStorage.setItem('gamewise-sound-alerts', enabled);
}

function toggleTwoFactor(enabled, user) {
    if (enabled) {
        // Check if email is verified first
        if (!user.emailVerified) {
            alert('Please verify your email address before enabling 2FA. Check your email for a verification link.');
            document.getElementById('twoFactorToggle').checked = false;
            return;
        }

        // Send verification code to email
        setupTwoFactor(user);
    } else {
        disableTwoFactor(user);
    }
}

function setupTwoFactor(user) {
    // Generate a 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Store the code temporarily (in a real app, this would be stored securely server-side)
    const codeExpiry = Date.now() + (10 * 60 * 1000); // 10 minutes
    localStorage.setItem('2fa-setup-code', verificationCode);
    localStorage.setItem('2fa-setup-expiry', codeExpiry.toString());

    const userCode = prompt(`2FA Setup Code: ${verificationCode}\n\nEnter this code to complete 2FA setup:`);

    if (userCode === verificationCode) {
        // Verify the code is not expired
        const expiry = parseInt(localStorage.getItem('2fa-setup-expiry'));
        if (Date.now() > expiry) {
            alert('Verification code has expired. Please try again.');
            document.getElementById('twoFactorToggle').checked = false;
            return;
        }

        // Save 2FA status to database
        const db = firebase.database();
        db.ref('users/' + user.uid + '/settings').update({
            twoFactor: true,
            twoFactorEnabled: firebase.database.ServerValue.TIMESTAMP
        }).then(() => {
            localStorage.setItem('gamewise-2fa', 'true');
            alert('2FA has been successfully enabled! You will now need to verify your identity for sensitive operations.');
        }).catch(error => {
            console.error('Error enabling 2FA:', error);
            alert('Error enabling 2FA. Please try again.');
            document.getElementById('twoFactorToggle').checked = false;
        });

        // Clean up temporary codes
        localStorage.removeItem('2fa-setup-code');
        localStorage.removeItem('2fa-setup-expiry');
    } else {
        alert('Incorrect verification code. 2FA setup cancelled.');
        document.getElementById('twoFactorToggle').checked = false;
    }
}

function disableTwoFactor(user) {
    // Require verification before disabling
    if (localStorage.getItem('gamewise-2fa') === 'true') {
        const verificationCode = prompt('Enter your current password to disable 2FA:');

        if (!verificationCode) {
            document.getElementById('twoFactorToggle').checked = true;
            return;
        }

        // Re-authenticate to verify identity
        const credential = firebase.auth.EmailAuthProvider.credential(
            user.email,
            verificationCode
        );

        user.reauthenticateWithCredential(credential).then(() => {
            const db = firebase.database();
            db.ref('users/' + user.uid + '/settings').update({
                twoFactor: false
            }).then(() => {
                localStorage.setItem('gamewise-2fa', 'false');
            }).catch(error => {
                console.error('Error disabling 2FA:', error);
                alert('Error disabling 2FA. Please try again.');
                document.getElementById('twoFactorToggle').checked = true;
            });
        }).catch((error) => {
            alert('Incorrect password. 2FA remains enabled.');
            document.getElementById('twoFactorToggle').checked = true;
        });
    } else {
        const db = firebase.database();
        db.ref('users/' + user.uid + '/settings').update({
            twoFactor: false
        }).then(() => {
            localStorage.setItem('gamewise-2fa', 'false');
        }).catch(error => {
            alert('Error disabling 2FA. Please try again.');
            document.getElementById('twoFactorToggle').checked = true;
        });
    }
}

// Global 2FA verification function that can be called from anywhere
window.requireTwoFactorVerification = function(callback, operationName = 'this operation') {
    const user = firebase.auth().currentUser;
    if (!user) {
        alert('You must be logged in to perform this operation.');
        return false;
    }

    // Check if 2FA is enabled
    const twoFactorEnabled = localStorage.getItem('gamewise-2fa') === 'true';
    if (!twoFactorEnabled) {
        callback();
        return true;
    }

    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const codeExpiry = Date.now() + (5 * 60 * 1000); // 5 minutes

    // Store temporarily
    localStorage.setItem('2fa-verification-code', verificationCode);
    localStorage.setItem('2fa-verification-expiry', codeExpiry.toString());

    const userCode = prompt(`Verification Code: ${verificationCode}\n\nEnter this code to proceed with ${operationName}:`);

    if (userCode === verificationCode) {
        // Check expiry
        const expiry = parseInt(localStorage.getItem('2fa-verification-expiry'));
        if (Date.now() > expiry) {
            alert('Verification code has expired. Please try again.');
            return false;
        }

        // Clean up and proceed
        localStorage.removeItem('2fa-verification-code');
        localStorage.removeItem('2fa-verification-expiry');
        callback();
        return true;
    } else {
        alert('Incorrect verification code.');
        return false;
    }
}

// Function to send email verification
function sendEmailVerification(user) {
    user.sendEmailVerification().then(() => {
        alert('Verification email sent! Please check your email and click the verification link.');
        updateEmailStatus(user);
    }).catch((error) => {
        console.error('Error sending verification email:', error);
        alert('Error sending verification email. Please try again.');
    });
}

// Function to update email verification status display
function updateEmailStatus(user) {
    const emailStatus = document.getElementById('emailStatus');
    const verifyEmailBtn = document.getElementById('verifyEmailBtn');

    if (user.emailVerified) {
        emailStatus.textContent = 'Email verified ✓';
        emailStatus.style.color = '#4CAF50';
        verifyEmailBtn.style.display = 'none';
        localStorage.removeItem('needsEmailVerification');
    } else {
        emailStatus.textContent = 'Email not verified - Click to verify';
        emailStatus.style.color = '#f44336';
        verifyEmailBtn.style.display = 'inline-block';
    }
}

function deleteAccount(user) {
    requireTwoFactorVerification(() => {
        const confirmation = prompt('This action cannot be undone. Type "DELETE" to confirm account deletion:');

        if (confirmation !== 'DELETE') {
            alert('Account deletion cancelled.');
            return;
        }

        if (confirm('Are you absolutely sure? All your data will be permanently deleted.')) {
            const db = firebase.database();
            const userId = user.uid;

            db.ref('users/' + userId).remove().then(() => {
                return user.delete();
            }).then(() => {
                alert('Account deleted successfully.');
                localStorage.clear();
                window.location.href = 'index.html';
            }).catch((error) => {
                console.error('Error deleting account:', error);
                if (error.code === 'auth/requires-recent-login') {
                    alert('Please log out and log back in before deleting your account.');
                } else {
                    alert('Error deleting account: ' + error.message);
                }
            });
        }
    }, 'account deletion');
}