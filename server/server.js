const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { AccessToken } = require('livekit-server-sdk');
const crypto = require('crypto');
require('dotenv').config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// API endpoint to generate LiveKit tokens
app.post('/api/livekit/token', async (req, res) => {
  const { roomName, participantName } = req.body;
  if (!roomName || !participantName) {
    return res.status(400).json({ error: 'roomName and participantName are required' });
  }

  // Load credentials from .env
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!apiKey || !apiSecret) {
    return res.status(500).json({ error: 'Server LiveKit credentials are not configured' });
  }

  try {
    const at = new AccessToken(apiKey, apiSecret, {
      identity: participantName,
      name: participantName,
    });
    
    at.addGrant({ roomJoin: true, room: roomName, canPublish: true, canSubscribe: true });
    const token = await at.toJwt();
    res.json({ token });
  } catch (err) {
    console.error("Token generation error:", err);
    res.status(500).json({ error: 'Failed to generate LiveKit token' });
  }
});

// Stripe Payment Intent API
app.post('/api/payments/create-intent', async (req, res) => {
  const { amount, currency, userId, splitMemberId, splitId } = req.body;

  if (!amount || !userId || !splitMemberId) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects cents
      currency: currency || 'inr',
      metadata: {
        userId,
        splitMemberId,
        splitId
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY // Sending it back for convenience if needed
    });
  } catch (err) {
    console.error("Stripe Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Real-time Text Chat via Socket.IO
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // User joins a ride room
  socket.on('join-ride', (roomId, userData) => {
    socket.join(roomId);
    console.log(`User ${userData?.name} joined ride room: ${roomId}`);
    
    // Broadcast to others in the room
    socket.to(roomId).emit('user-joined', {
      user: userData,
      time: new Date().toISOString()
    });
  });

  // User sends a message
  socket.on('send-message', (data) => {
    const { roomId, message, user } = data;
    io.in(roomId).emit('receive-message', {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(7),
      message,
      user,
      time: new Date().toISOString()
    });
  });

  // User leaves a ride room
  socket.on('leave-ride', (roomId, userData) => {
    socket.leave(roomId);
    console.log(`User ${userData?.name} left ride room: ${roomId}`);
    socket.to(roomId).emit('user-left', {
      user: userData,
      time: new Date().toISOString()
    });
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Velocity Backend running on port ${PORT}`);
});
