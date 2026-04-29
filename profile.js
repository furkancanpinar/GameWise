document.addEventListener('DOMContentLoaded', function() {
  let currentUser = null;
  const dropdown = document.getElementById('dropdownMenu');
  const welcomeMessage = document.getElementById('welcomeMessage');

  firebase.auth().onAuthStateChanged(function(user) {
    currentUser = user;
    dropdown.innerHTML = '';
    
    if (user) {
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

      updateProfileInfo(user);
      loadUserData(user.uid);
      setupEventListeners(user);
    } else {
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
    }
  });

  document.querySelector('.edit-avatar-btn').addEventListener('click', function() {
    if (!currentUser) {
      alert('Please sign in before changing your avatar.');
      return;
    }

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    
    fileInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        uploadAvatar(file, currentUser);
      }
    });
    
    document.body.appendChild(fileInput);
    fileInput.click();
    document.body.removeChild(fileInput);
  });

  document.querySelector('.view-all-btn').addEventListener('click', function() {
    alert('Viewing all achievements functionality will be added soon!');
  });
});

function updateProfileInfo(user) {
  document.getElementById('userDisplayName').textContent = user.displayName || 'Player Name';
  document.getElementById('userEmail').textContent = user.email;
  document.getElementById('displayNameField').textContent = user.displayName || 'Not set';
  document.getElementById('emailField').textContent = user.email;

  if (user.photoURL) {
    document.getElementById('userAvatar').src = user.photoURL;
    const headerUserIcon = document.getElementById('userIcon');
    if (headerUserIcon) {
      headerUserIcon.src = user.photoURL;
    }
  }
}

function setupEventListeners(user) {
  document.getElementById('togglePassword').addEventListener('click', function() {
    const passwordField = document.getElementById('passwordField');
    if (passwordField.textContent === '••••••••') {
      passwordField.textContent = '********';
      this.textContent = 'Hide';
    } else {
      passwordField.textContent = '••••••••';
      this.textContent = 'Show';
    }
  });

  document.querySelectorAll('.edit-btn').forEach(button => {
    button.addEventListener('click', function() {
      const field = this.getAttribute('data-field');
      const fieldElement = document.getElementById(`${field}Field`);
      const inputElement = document.getElementById(`${field}Input`);
      const saveButton = document.querySelector(`.save-btn[data-field="${field}"]`);

      fieldElement.style.display = 'none';
      inputElement.style.display = 'block';
      this.style.display = 'none';
      saveButton.style.display = 'inline-block';

      if (field === 'password') {
        inputElement.value = '';
        inputElement.placeholder = 'Enter new password';
      } else {
        inputElement.value = fieldElement.textContent;
      }
    });
  });

  document.querySelectorAll('.save-btn').forEach(button => {
    button.addEventListener('click', function() {
      const field = this.getAttribute('data-field');
      const fieldElement = document.getElementById(`${field}Field`);
      const inputElement = document.getElementById(`${field}Input`);
      const editButton = document.querySelector(`.edit-btn[data-field="${field}"]`);

      const newValue = inputElement.value.trim();

      if (newValue && (field === 'password' || newValue !== fieldElement.textContent)) {
        updateUserData(user, field, newValue, fieldElement, inputElement, editButton, this);
      } else {
        cancelEdit(fieldElement, inputElement, editButton, this);
      }
    });
  });
}

function updateUserData(user, field, newValue, fieldElement, inputElement, editButton, saveButton) {
  if (field === 'password') {
    alert('Password change functionality will require 2FA verification in future updates');
    cancelEdit(fieldElement, inputElement, editButton, saveButton);
    return;
  }

  const updates = {};
  updates[field] = newValue;

  if (field === 'email') {
    user.updateEmail(newValue).then(() => {
      updateSuccess(fieldElement, inputElement, editButton, saveButton, newValue);
    }).catch(error => {
      handleUpdateError(error);
    });
    return;
  }

  if (field === 'displayName') {
    user.updateProfile({
      displayName: newValue
    }).then(() => {
      updateSuccess(fieldElement, inputElement, editButton, saveButton, newValue);
      document.getElementById('userDisplayName').textContent = newValue;
    }).catch(error => {
      handleUpdateError(error);
    });
    return;
  }

  const db = firebase.database();
  db.ref('users/' + user.uid).update(updates)
    .then(() => {
      updateSuccess(fieldElement, inputElement, editButton, saveButton, newValue);
    })
    .catch(error => {
      handleUpdateError(error);
    });
}

function updateSuccess(fieldElement, inputElement, editButton, saveButton, newValue) {
  fieldElement.textContent = newValue;
  cancelEdit(fieldElement, inputElement, editButton, saveButton);
  alert('Profile updated successfully!');
}

function handleUpdateError(error) {
  alert('Error updating profile: ' + error.message);
}

function cancelEdit(fieldElement, inputElement, editButton, saveButton) {
  fieldElement.style.display = 'block';
  inputElement.style.display = 'none';
  editButton.style.display = 'inline-block';
  saveButton.style.display = 'none';
}

function loadUserData(userId) {
  const db = firebase.database();
  const userRef = db.ref('users/' + userId);

  userRef.once('value').then(function(snapshot) {
    const userData = snapshot.val();

    if (userData) {
      if (userData.gamesPlayed) {
        document.getElementById('gamesPlayed').textContent = userData.gamesPlayed;
      }

      if (userData.hoursPlayed) {
        document.getElementById('hoursPlayed').textContent = userData.hoursPlayed;
      }

      if (userData.achievements) {
        document.getElementById('achievements').textContent = userData.achievements;
      }
    }
  }).catch(function(error) {
  });
}

function uploadAvatar(file, user) {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    alert('Please select a valid image file.');
    return;
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('Image file is too large. Please select an image smaller than 5MB.');
    return;
  }

  const storageRef = firebase.storage().ref();
  const avatarRef = storageRef.child(`avatars/${user.uid}/${file.name}`);

  // Show loading state
  const avatarImg = document.getElementById('userAvatar');
  const headerUserIcon = document.getElementById('userIcon');
  const originalSrc = avatarImg.src;
  avatarImg.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjYwIiB5PSI2NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOUI5QkE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5VcGxvYWRpbmcuLi48L3RleHQ+Cjwvc3ZnPgo=';

  avatarRef.put(file).then((snapshot) => {
    return snapshot.ref.getDownloadURL();
  }).then((downloadURL) => {
    return user.updateProfile({
      photoURL: downloadURL
    }).then(() => {
      return downloadURL;
    });
  }).then((downloadURL) => {
    avatarImg.src = downloadURL;
    if (headerUserIcon) {
      headerUserIcon.src = downloadURL;
    }
    try {
      localStorage.setItem('gw-avatar-url', downloadURL);
    } catch (e) {
      console.warn('Unable to save avatar URL to localStorage', e);
    }
    alert('Avatar updated successfully!');
  }).catch((error) => {
    console.error('Error uploading avatar:', error);
    avatarImg.src = originalSrc;
    if (headerUserIcon) {
      headerUserIcon.src = originalSrc;
    }
    alert('Error uploading avatar. Please try again.');
  });
}
