// server.js — Standalone Socket.io Microservice for Live Doubt Chat
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);

// Allow NoteNova's Next.js frontend to connect
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://notenova.com"],
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('A student connected:', socket.id);

  // When a student opens a specific Doubt thread
  socket.on('join_doubt_room', (doubtId) => {
    socket.join(doubtId);
    console.log(`User joined doubt room: ${doubtId}`);
  });

  // When someone sends an answer/message
  socket.on('send_message', (data) => {
    // data = { doubtId, sender, text, time }

    // Broadcast the message to everyone else in that specific doubt room
    socket.to(data.doubtId).emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    console.log('Student disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Socket.io engine running on port ${PORT}`);
});
