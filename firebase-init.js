
const firebaseConfig = {
  apiKey: "AIzaSyBisUUnNd29eTBhaX9WOhPTVDQktpFTWsc",
  authDomain: "gamewise1-3c18b.firebaseapp.com",
  databaseURL: "https://gamewise1-3c18b-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "gamewise1-3c18b",
  storageBucket: "gamewise1-3c18b.firebasestorage.app",
  messagingSenderId: "1089492043866",
  appId: "1:1089492043866:web:5f9447cb64655baae8b063"
};


const avatarLocalKey = 'gw-avatar-url';
const defaultAvatar = 'Editables/user.png';

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
  console.log("Firebase app initialized.");
} else {
  console.log("Firebase app already initialized.");
}

function updateHeaderAvatar(user) {
  const userIcon = document.getElementById('userIcon');
  const profileAvatar = document.getElementById('userAvatar');
  const avatarURL = user && user.photoURL ? user.photoURL : localStorage.getItem(avatarLocalKey) || defaultAvatar;

  if (user && user.photoURL) {
    localStorage.setItem(avatarLocalKey, user.photoURL);
  } else if (!user) {
    localStorage.removeItem(avatarLocalKey);
  }

  if (userIcon) {
    userIcon.src = avatarURL;
  }

  if (profileAvatar) {
    profileAvatar.src = avatarURL;
  }
}

function loadCachedAvatar() {
  const cachedAvatar = localStorage.getItem(avatarLocalKey);
  const userIcon = document.getElementById('userIcon');
  const profileAvatar = document.getElementById('userAvatar');

  if (cachedAvatar) {
    if (userIcon) {
      userIcon.src = cachedAvatar;
    }
    if (profileAvatar) {
      profileAvatar.src = cachedAvatar;
    }
  }
}

if (firebase.auth) {
  firebase.auth().onAuthStateChanged(function(user) {
    updateHeaderAvatar(user);
  });
}

window.addEventListener('DOMContentLoaded', function() {
  loadCachedAvatar();
});

function incrementGamezoneCounter() {
  if (firebase.database) {
      const db = firebase.database();
      const counterRef = db.ref('gamezoneVisits');

      counterRef.transaction((currentValue) => {
        return (currentValue || 0) + 1;
      }).then(() => {
        console.log('Gamezone page visit counter updated successfully.');
      }).catch((error) => {
        console.error('Error updating gamezone page visit counter:', error);
      });
  } else {
      console.warn('Firebase database not available for page visit tracking.');
  }
}

document.addEventListener("DOMContentLoaded", incrementGamezoneCounter);

