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

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            return user.updateProfile({
                displayName: username
            });
        })
        .then(() => {
            alert("Account created successfully!");
            window.location.href = 'index.html';
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;

            let displayMessage = errorMessage;
            if (errorCode === 'auth/email-already-in-use') {
                displayMessage = "This email is already registered.";
            } else if (errorCode === 'auth/weak-password') {
                displayMessage = "Password should be at least 6 characters.";
            } else if (errorCode === 'auth/invalid-email') {
                displayMessage = "Please enter a valid email address.";
            }

            alert(displayMessage);
        });
});
