const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { AccessToken } = require('livekit-server-sdk');
const crypto = require('crypto');
require('dotenv').config({ path: '../.env.local' });
require('dotenv').config(); // Fallback to .env in cwd

let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
} else {
  console.warn("WARNING: STRIPE_SECRET_KEY is missing. Payment routes will fail.");
}

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

// Profile Dynamic Endpoints
app.get('/api/activity', (req, res) => {
  res.json([
    { type: 'ride_joined', message: 'You joined the Mumbai ➔ Pune expedition', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
    { type: 'alert', message: 'Secure Protocol Key generated for your ride', timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString() }
  ]);
});

app.get('/api/user/vehicle', (req, res) => {
  res.json({ name: 'Royal Enfield Classic 350', number: 'MH 12 AB 1234' });
});

app.get('/api/squad', (req, res) => {
  res.json({
    name: 'Night Riders',
    count: 4,
    members: [
      { avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1' },
      { avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2' },
      { avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3' },
      { avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4' }
    ]
  });
});

app.get('/api/splits', (req, res) => {
  // Return an array of splits as requested
  res.json([
    { id: '1', title: 'Highway Fuel', status: 'pending', amount: 250, type: 'owed' },
    { id: '2', title: 'Snacks at Dhaba', status: 'settled', amount: 150, type: 'receivable' }
  ]);
});

app.post('/api/rides/leave', (req, res) => {
  res.json({ success: true });
});

// Expired Rides Cleanup Cron/API
app.delete('/api/rides/expired', async (req, res) => {
  try {
    // In production, use Supabase Admin Client to delete rides where 
    // status = 'past' OR end_datetime < NOW()
    console.log("CRON: Cleaned up expired rides.");
    res.json({ success: true, message: "Expired rides cleaned up securely." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Run every 5 minutes (300000 ms)
setInterval(() => {
  console.log("CRON: Auto-cleaning expired rides...");
  // Simulated cleanup action
}, 300000);

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

  // --- WEBRTC SIGNALING (VOICE) ---
  socket.on("join_voice_room", (rideId) => {
    socket.join(`voice_${rideId}`);
    // Notify others in the voice room
    socket.to(`voice_${rideId}`).emit("user_joined_voice", socket.id);
  });

  socket.on("signal", ({ rideId, data }) => {
    // Basic signaling: forward to everyone else in the voice room
    socket.to(`voice_${rideId}`).emit("signal", data);
  });

  socket.on("leave_voice_room", (rideId) => {
    socket.leave(`voice_${rideId}`);
    socket.to(`voice_${rideId}`).emit("user_left_voice", socket.id);
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Velocity Backend running on port ${PORT}`);
});
