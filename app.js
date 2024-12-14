// DOM Elements
const authContainer = document.getElementById('auth-container');
const chatContainer = document.getElementById('chat-container');
const authButton = document.getElementById('auth-button');
const switchAuthMode = document.getElementById('switch-auth-mode');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const authError = document.getElementById('auth-error');
const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const logoutButton = document.getElementById('logout-button');

// Variables
let isSignUp = true;

// Switch between Sign Up and Login
switchAuthMode.addEventListener('click', () => {
  isSignUp = !isSignUp;
  authButton.textContent = isSignUp ? 'Sign Up' : 'Log In';
  switchAuthMode.textContent = isSignUp ? 'Switch to Login' : 'Switch to Sign Up';
  authError.textContent = '';
});

// Show/Hide Containers
function toggleAuthContainer(show) {
  authContainer.style.display = show ? 'block' : 'none';
  chatContainer.style.display = show ? 'none' : 'block';
}

// Handle Sign Up / Login
authButton.addEventListener('click', () => {
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  if (isSignUp) {
    // Sign Up: Store username and password in localStorage
    if (localStorage.getItem(username)) {
      authError.textContent = 'Username already exists. Please log in.';
    } else {
      localStorage.setItem(username, password);
      alert('Sign-up successful! You can now log in.');
      switchAuthMode.click();
    }
  } else {
    // Log In: Check if username and password match
    const storedPassword = localStorage.getItem(username);
    if (storedPassword === password) {
      sessionStorage.setItem('user', username); // Store the logged-in user
      toggleAuthContainer(false);
      loadMessages();
    } else {
      authError.textContent = 'Invalid username or password.';
    }
  }
});

// Handle Sending Messages
sendButton.addEventListener('click', () => {
  const message = messageInput.value.trim();
  if (message !== '') {
    const user = sessionStorage.getItem('user');
    const messages = JSON.parse(localStorage.getItem('messages') || '[]');
    messages.push({ user, message });
    localStorage.setItem('messages', JSON.stringify(messages));
    messageInput.value = ''; // Clear input field
    loadMessages();
  }
});

// Log Out
logoutButton.addEventListener('click', () => {
  sessionStorage.removeItem('user');
  toggleAuthContainer(true);
});

// Load Messages
function loadMessages() {
  const messages = JSON.parse(localStorage.getItem('messages') || '[]');
  messagesDiv.innerHTML = '';
  messages.forEach(msg => {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.textContent = `${msg.user}: ${msg.message}`;
    messagesDiv.appendChild(messageElement);
  });
}

// Check if user is logged in on page load
if (sessionStorage.getItem('user')) {
  toggleAuthContainer(false);
  loadMessages();
} else {
  toggleAuthContainer(true);
}
