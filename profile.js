document.addEventListener('DOMContentLoaded', function() {
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      updateProfileInfo(user);
      loadUserData(user.uid);
      setupEventListeners(user);
    } else {
      window.location.href = 'login.html';
    }
  });

  document.querySelector('.edit-avatar-btn').addEventListener('click', function() {
    alert('Avatar editing functionality will be added soon!');
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
