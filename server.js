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
  console.log('LOW COST CHAT V1.0 SERVER');
  console.log('Server is running on https://lowcostchat.onrender.com/');
});
