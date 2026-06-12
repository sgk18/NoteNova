// server.js — Standalone Socket.io Microservice for Live Doubt Chat + DM System
require('dotenv').config({ path: '.env.local' });
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

// Allow NoteNova's Next.js frontend to connect
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://notenova.com"],
    methods: ["GET", "POST"]
  }
});

// ─── Mongoose connection ────────────────────────────────────────────
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/notenova';

mongoose.connect(MONGODB_URI, { bufferCommands: false })
  .then(() => console.log('Socket server connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// ─── Inline Mongoose Schemas (CommonJS for standalone server) ───────
const ConversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  lastMessage: {
    text: { type: String, default: '' },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now },
  },
}, { timestamps: true });

const MessageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', index: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  text: { type: String, required: true, trim: true },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

const Conversation = mongoose.models.Conversation || mongoose.model('Conversation', ConversationSchema);
const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema);

// ─── Track online users ─────────────────────────────────────────────
const onlineUsers = new Map(); // userId -> Set<socketId>

function setUserOnline(userId, socketId) {
  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, new Set());
  }
  onlineUsers.get(userId).add(socketId);
}

function setUserOffline(userId, socketId) {
  if (onlineUsers.has(userId)) {
    onlineUsers.get(userId).delete(socketId);
    if (onlineUsers.get(userId).size === 0) {
      onlineUsers.delete(userId);
      return true; // user is now fully offline
    }
  }
  return false;
}

function isUserOnline(userId) {
  return onlineUsers.has(userId) && onlineUsers.get(userId).size > 0;
}

// ─── Socket.io Events ───────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log('A student connected:', socket.id);

  // ── Existing Doubt Chat Events ──────────────────────────────────
  socket.on('join_doubt_room', (doubtId) => {
    socket.join(doubtId);
    console.log(`User joined doubt room: ${doubtId}`);
  });

  socket.on('send_message', (data) => {
    socket.to(data.doubtId).emit('receive_message', data);
  });

  // ── Existing Room/Escalation Events ─────────────────────────────
  socket.on('join-room', (room) => {
    socket.join(room);
  });

  socket.on('send-message', (data) => {
    socket.to(data.room).emit('receive-message', data);
  });

  socket.on('escalation-request', (data) => {
    socket.to(data.department).emit('new-escalation', data);
  });

  // ── DM System Events ───────────────────────────────────────────
  socket.on('dm:join', (userId) => {
    if (!userId) return;
    socket.userId = userId;
    socket.join(`user:${userId}`);
    setUserOnline(userId, socket.id);
    console.log(`DM: User ${userId} online (socket: ${socket.id})`);

    // Broadcast online status to all connected clients
    io.emit('dm:status', { userId, status: 'online' });

    // Send the current list of online users to the newly connected user
    const onlineList = Array.from(onlineUsers.keys());
    socket.emit('dm:online-users', onlineList);
  });

  socket.on('dm:message', async (data) => {
    try {
      const { conversationId, senderId, recipientId, text } = data;
      if (!conversationId || !senderId || !text) return;

      // Save message to the database
      const message = await Message.create({
        conversationId,
        sender: senderId,
        text,
        readBy: [senderId], // sender has already "read" their own message
      });

      // Update the conversation's lastMessage
      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: {
          text,
          sender: senderId,
          timestamp: message.createdAt,
        },
        updatedAt: new Date(),
      });

      const savedMessage = {
        _id: message._id.toString(),
        conversationId,
        sender: senderId,
        text,
        readBy: [senderId],
        createdAt: message.createdAt,
      };

      // Send to both sender and recipient
      io.to(`user:${senderId}`).emit('dm:message', savedMessage);
      if (recipientId) {
        io.to(`user:${recipientId}`).emit('dm:message', savedMessage);
      }
    } catch (err) {
      console.error('dm:message error:', err);
    }
  });

  socket.on('dm:typing', (data) => {
    const { conversationId, userId, recipientId } = data;
    if (recipientId) {
      io.to(`user:${recipientId}`).emit('dm:typing', { conversationId, userId });
    }
  });

  socket.on('dm:stop-typing', (data) => {
    const { conversationId, userId, recipientId } = data;
    if (recipientId) {
      io.to(`user:${recipientId}`).emit('dm:stop-typing', { conversationId, userId });
    }
  });

  socket.on('dm:seen', async (data) => {
    try {
      const { conversationId, userId, senderId } = data;
      if (!conversationId || !userId) return;

      // Mark all unread messages in the conversation as read by this user
      await Message.updateMany(
        {
          conversationId,
          sender: { $ne: userId },
          readBy: { $nin: [userId] },
        },
        { $addToSet: { readBy: userId } }
      );

      // Notify the original sender
      if (senderId) {
        io.to(`user:${senderId}`).emit('dm:seen', { conversationId, userId });
      }
    } catch (err) {
      console.error('dm:seen error:', err);
    }
  });

  // ── Disconnect ──────────────────────────────────────────────────
  socket.on('disconnect', () => {
    console.log('Student disconnected:', socket.id);
    if (socket.userId) {
      const isFullyOffline = setUserOffline(socket.userId, socket.id);
      if (isFullyOffline) {
        io.emit('dm:status', { userId: socket.userId, status: 'offline' });
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Socket.io engine running on port ${PORT}`);
});
