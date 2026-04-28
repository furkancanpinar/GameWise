if (typeof firebaseService === 'undefined') {
    // Consider a more robust error handling mechanism here if firebaseService is critical
}

// Setup dropdown menu based on authentication state
const dropdown = document.getElementById('dropdownMenu');
const welcomeMessage = document.getElementById('welcomeMessage');

if (typeof firebaseService !== 'undefined' && firebaseService.initAuthStateListener) {
    firebaseService.initAuthStateListener((user) => {
        dropdown.innerHTML = '';
        if (user) {
            welcomeMessage.textContent = `Welcome, ${user.displayName || 'Gamer'}`;
            welcomeMessage.style.display = 'block';

            const profileLink = document.createElement("a");
            profileLink.href = "profile.html";
            profileLink.textContent = "Profile";

            const logoutLink = document.createElement("a");
            logoutLink.href = "#";
            logoutLink.textContent = "Logout";
            logoutLink.addEventListener("click", function(e) {
                e.preventDefault();
                firebase.auth().signOut().then(() => {
                    localStorage.clear();
                    window.location.href = "index.html";
                }).catch((error) => {
                    alert("Logout failed. Please try again.");
                });
            });

            dropdown.appendChild(profileLink);
            dropdown.appendChild(logoutLink);
        } else {
            welcomeMessage.style.display = 'none';
            
            const loginLink = document.createElement("a");
            loginLink.href = "login.html";
            loginLink.textContent = "Login";

            const signupLink = document.createElement("a");
            signupLink.href = "signup.html";
            signupLink.textContent = "Sign Up";

            dropdown.appendChild(loginLink);
            dropdown.appendChild(signupLink);
        }
    });
} else {
    dropdown.innerHTML = '';
    const loginLink = document.createElement("a");
    loginLink.href = "login.html";
    loginLink.textContent = "Login";

    const signupLink = document.createElement("a");
    signupLink.href = "signup.html";
    signupLink.textContent = "Sign Up";

    dropdown.appendChild(loginLink);
    dropdown.appendChild(signupLink);

    if (welcomeMessage) {
        welcomeMessage.style.display = 'none';
    }
}

const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

const conversationHistory = [{
    role: "system",
    content: "You are GameW-AI, an AI assistant designed to help with gaming addiction and mental health. Offer advice on time management, healthy gaming habits, and mental wellness. Be empathetic and supportive. Keep responses concise (2-3 paragraphs max)."
}];

window.onload = function() {
    if (chatMessages) {
        appendMessage('bot', "Hello! I'm your GameW-AI assistant. How can I help you with gaming strategies or wellness today?");
        conversationHistory.push({
            role: "assistant",
            content: "Hello! I'm your GameW-AI assistant. How can I help you with gaming strategies or wellness today?"
        });
    } else {
        // Handle missing chat messages element more gracefully if needed
    }
};

async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    appendMessage('user', message);
    conversationHistory.push({ role: "user", content: message });

    userInput.value = '';
    sendButton.disabled = true;

    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'typing-indicator';
    typingIndicator.textContent = 'GameW-AI is typing...';
    chatMessages.appendChild(typingIndicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    try {
        const response = await fetchAIResponse();
        chatMessages.removeChild(typingIndicator);
        appendMessage('bot', response);
        conversationHistory.push({ role: "assistant", content: response });
    } catch (error) {
        chatMessages.removeChild(typingIndicator);
        const errorMessage = "Sorry, I'm having trouble connecting or processing your request. Please try again later.";
        appendMessage('bot', errorMessage);
        conversationHistory.push({ role: "assistant", content: errorMessage });
    } finally {
        sendButton.disabled = false;
    }
}

async function fetchAIResponse() {
    const API_URL = 'http://localhost:3000/api/chat'; // Change to your deployed backend URL

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: conversationHistory,
            temperature: 0.7,
            max_tokens: 250
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || `API request failed with status ${response.status}`);
    }

    if (!data.choices || data.choices.length === 0) {
        throw new Error('No response choices available from AI.');
    }

    return data.choices[0].message.content.trim();
}

function appendMessage(sender, text) {
     if (!chatMessages) {
         // Handle missing chat messages element more gracefully if needed
         return;
     }

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;

    const metaDiv = document.createElement('div');
    metaDiv.className = 'message-meta';
    metaDiv.textContent = sender === 'user' ? 'You' : 'GameW-AI';

    const textDiv = document.createElement('p');
    textDiv.innerHTML = text.replace(/\n/g, "<br>");

    messageDiv.appendChild(metaDiv);
    messageDiv.appendChild(textDiv);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        sendMessage();
    }
});

userInput.addEventListener('input', () => {
    sendButton.disabled = userInput.value.trim() === '';
});

function suggestPrompt(promptText) {
    if (userInput) {
        userInput.value = promptText;
        userInput.focus();
        sendButton.disabled = false;
    } else {
        // Handle missing user input element more gracefully if needed
    }

    const clickedCard = event?.currentTarget;
    if (clickedCard) {
      clickedCard.style.transform = "scale(0.95)";
      setTimeout(() => {
        clickedCard.style.transform = "scale(1)";
      }, 200);
    }
}

window.suggestPrompt = suggestPrompt;
