const socket = io();

const authContainer = document.getElementById('auth-container');
const roomContainer = document.getElementById('room-container');
const chatContainer = document.getElementById('chat-container');
const usernameInput = document.getElementById('username');
const loginButton = document.getElementById('login-button');
const roomNumberInput = document.getElementById('room-number');
const joinRoomButton = document.getElementById('join-room-button');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const logoutButton = document.getElementById('logout-button');
const messagesDiv = document.getElementById('messages');
const fileInput = document.getElementById('file-input'); // General file input for all files

let currentUser = null;
let currentRoom = null;

// Function to get the current timestamp
function getTimestamp() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

// Handle login
loginButton.addEventListener('click', () => {
  const username = usernameInput.value.trim();
  if (username) {
    currentUser = username;
    authContainer.style.display = 'none';
    roomContainer.style.display = 'block';
  }
});

// Handle room selection using a 6-digit room number
joinRoomButton.addEventListener('click', () => {
  const roomNumber = roomNumberInput.value.trim();
  if (roomNumber && roomNumber.length === 6 && !isNaN(roomNumber)) {
    currentRoom = roomNumber; // Set the room as the 6-digit number
    roomContainer.style.display = 'none';
    chatContainer.style.display = 'block';
    
    socket.emit('join-room', { user: currentUser, room: currentRoom, timestamp: getTimestamp() });
    socket.emit('new-message', { user: 'System', message: `${currentUser} has joined Room ${currentRoom}.`, room: currentRoom, timestamp: getTimestamp() });
  } else {
    alert('Please enter a valid 6-digit room number.');
  }
});

// Handle sending messages (images, videos, or text)
sendButton.addEventListener('click', () => {
  const message = messageInput.value.trim();
  const file = fileInput.files[0]; // Get the selected file
  const timestamp = getTimestamp();

  // Check if there's a message or file
  if (message || file) {
    // If file is selected, process it
    if (file) {
      const fileType = file.type.split('/')[0]; // 'image', 'video', or others

      const reader = new FileReader();
      reader.onloadend = () => {
        const fileUrl = reader.result; // Get the file URL (base64 string)

        // Emit the message with the file
        socket.emit('new-message', { 
          user: currentUser, 
          message, 
          file: fileUrl,  // Send the file URL
          fileType, // Send file type ('image', 'video', etc.)
          room: currentRoom,
          timestamp 
        });
      };
      reader.readAsDataURL(file); // Convert the file to base64
    } else {
      // If no file, just send the message as text
      socket.emit('new-message', { user: currentUser, message, room: currentRoom, timestamp });
    }

    // Clear inputs after sending
    messageInput.value = '';
    fileInput.value = '';  // Clear the file input
  } else {
    alert('Please enter a message or select a file to upload.');
  }
});

// Handle logging out
logoutButton.addEventListener('click', () => {
  if (currentUser && currentRoom) {
    socket.emit('new-message', { user: 'System', message: `${currentUser} has left Room ${currentRoom}.`, room: currentRoom, timestamp: getTimestamp() });
  }

  // Reset the UI elements
  authContainer.style.display = 'block';
  chatContainer.style.display = 'none';
  roomContainer.style.display = 'none';

  // Clear the messages div
  messagesDiv.innerHTML = '';

  // Reset state
  currentUser = null;
  currentRoom = null;
});

socket.on('new-message', (messageData) => {
  if (messageData.room === currentRoom) { // Display message only if it's from the current room
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    
    if (messageData.file) {
      const fileType = messageData.fileType;
      
      if (fileType === 'image') {
        const imageElement = document.createElement('img');
        imageElement.src = messageData.file; // Set the image source to the base64 string
        imageElement.style.maxWidth = '100%'; // Ensure the image fits the container
        imageElement.style.maxHeight = '300px'; // Limit the image height for a better layout
        messageElement.appendChild(imageElement);  // Append the image to the message

        // Append a message indicating the file was uploaded (this message will appear together with the image)
        const systemMessage = document.createElement('div');
        systemMessage.innerHTML = `<strong>System</strong>: ${messageData.user} uploaded an image`;
        messageElement.appendChild(systemMessage);
        
      } else {
        // For other files, show a download link
        const linkElement = document.createElement('a');
        linkElement.href = messageData.file;
        linkElement.target = '_blank';
        linkElement.textContent = `Download ${messageData.fileType} file`;
        messageElement.appendChild(linkElement);
      }
    } else {
      // Handle text message (existing code)
      messageElement.innerHTML = `<strong>${messageData.user}</strong> [${messageData.timestamp}]: ${messageData.message}`;
    }

    // Append the message to the chat
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }
});
