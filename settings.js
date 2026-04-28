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
        }
    });

    const savedTheme = localStorage.getItem('gamewise-theme');
    if (savedTheme) {
        changeTheme(savedTheme);
    }
});

function setupEventListeners(user) {
    document.querySelectorAll('.theme-option').forEach(option => {
        option.addEventListener('click', function() {
            const theme = this.getAttribute('data-theme');
            changeTheme(theme);
        });
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
        if (confirm('Are you sure you want to delete your account? This cannot be undone.')) {
            alert('Account deletion functionality will be implemented with confirmation flow');
        }
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

            const savedTheme = localStorage.getItem('gamewise-theme');
            if (!savedTheme && settings.theme) {
                changeTheme(settings.theme);
            } else if (!savedTheme) {
                changeTheme('default');
            }

        } else {
            applyDefaultSettingsToUI();
            if (!localStorage.getItem('gamewise-theme')) {
                changeTheme('default');
            }
        }
    }).catch(error => {
        applyDefaultSettingsToUI();
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
}
