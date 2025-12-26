const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Configuration check - Redirect to setup if no config exists
const configPath = path.join(__dirname, 'config', 'config.json');
const isConfigured = fs.existsSync(configPath);

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for frontend
app.use(express.static(path.join(__dirname, '..', 'frontend', 'build')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', configured: isConfigured });
});

// Configuration status endpoint
app.get('/api/config/status', (req, res) => {
  res.json({ configured: isConfigured });
});

// Setup routes (always available)
const setupRoutes = require('./app/routes/setup.routes');
app.use('/api/setup', setupRoutes);

// Main routes (only if configured)
if (isConfigured) {
  const config = require('./config/config.json');
  
  // Initialize database
  const db = require('./app/db/database');
  db.initDatabase(config.database);
  
  // Initialize socket.io for real-time features
  require('./app/sockets/socket.handler')(io);
  
  // API Routes
  const authRoutes = require('./app/routes/auth.routes');
  const userRoutes = require('./app/routes/user.routes');
  
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  
  // Module routes (loaded dynamically based on config)
  if (config.modules.feed) {
    const feedRoutes = require('./modules/feed/feed.routes');
    app.use('/api/feed', feedRoutes);
  }
  
  if (config.modules.groups) {
    const groupRoutes = require('./modules/groups/group.routes');
    app.use('/api/groups', groupRoutes);
  }
  
  if (config.modules.profiles) {
    const profileRoutes = require('./modules/profiles/profile.routes');
    app.use('/api/profiles', profileRoutes);
  }
  
  if (config.modules.messaging) {
    const messageRoutes = require('./modules/messaging/message.routes');
    app.use('/api/messages', messageRoutes);
  }
  
  if (config.modules.notifications) {
    const notificationRoutes = require('./modules/notifications/notification.routes');
    app.use('/api/notifications', notificationRoutes);
  }
}

// Serve React frontend for all other routes
app.get('*', (req, res) => {
  if (!isConfigured) {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'build', 'index.html'));
  } else {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'build', 'index.html'));
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  if (!isConfigured) {
    console.log('⚠️  Configuration not found. Please visit http://localhost:${PORT}/setup to configure the application.');
  } else {
    console.log('✅ Application configured and ready!');
  }
});

module.exports = { app, server, io };
