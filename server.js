const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files (HTML, CSS, JS)
app.use(express.static('public'));

// Handle real-time messaging with Socket.io
io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle user logging in
  socket.on('user-logged-in', (username) => {
    console.log(`${username} has logged in`);
  });

  // Handle user logging out
  socket.on('user-logged-out', (username) => {
    console.log(`${username} has logged off`);
  });

  // Send the new message to all users
  socket.on('new-message', (message) => {
    io.emit('new-message', message);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Start the server on port 3000
server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
