// Firebase Login Logic
const firebaseConfig = {
    apiKey: "AIzaSyBisUUnNd29eTBhaX9WOhPTVDQktpFTWsc",
    authDomain: "gamewise1-3c18b.firebaseapp.com",
    projectId: "gamewise1-3c18b",
    storageBucket: "gamewise1-3c18b.appspot.com",
    messagingSenderId: "1089492043866",
    appId: "1:1089492043866:web:5f9447cb64655baae8b063"
  };
  
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  
  document.querySelector('.login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('username').value.trim(); // Using username field for email
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('remember').checked;
  
    try {
      // Set persistence based on "Remember me" selection
      await auth.setPersistence(rememberMe ? 
        firebase.auth.Auth.Persistence.LOCAL : 
        firebase.auth.Auth.Persistence.SESSION);
  
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      const user = userCredential.user;
  
      // Store user data
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userEmail', user.email);
      if (user.displayName) localStorage.setItem('username', user.displayName);
      
      // Show success and redirect
      document.querySelector('.login-container').insertAdjacentHTML('beforeend',
        `<div class="login-success">Login successful! Redirecting...</div>`);
      
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);
  
    } catch (error) {
      // Enhanced error handling
      let errorMessage;
      switch(error.code) {
        case 'auth/invalid-email':
          errorMessage = "Please enter a valid email address";
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errorMessage = "Incorrect email or password";
          break;
        case 'auth/too-many-requests':
          errorMessage = "Account temporarily locked. Try again later";
          break;
        default:
          errorMessage = "Login failed. Please try again";
      }
  
      // Show error message
      const errorElement = document.createElement('div');
      errorElement.className = 'login-error';
      errorElement.textContent = errorMessage;
      document.querySelector('.login-form').prepend(errorElement);
      
      // Remove error after 5 seconds
      setTimeout(() => errorElement.remove(), 5000);
    }
  });