const jwt = require('jsonwebtoken');
const config = require('../../config/config.json');

module.exports = (io) => {
  // Authentication middleware for sockets
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, config.security.jwtSecret);
      socket.userId = decoded.id;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);

    // Join user's personal room for notifications
    socket.join(`user:${socket.userId}`);

    // Handle real-time messaging
    socket.on('join_conversation', (conversationId) => {
      socket.join(`conversation:${conversationId}`);
    });

    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
    });

    socket.on('send_message', (data) => {
      io.to(`conversation:${data.conversationId}`).emit('new_message', {
        ...data,
        senderId: socket.userId,
        timestamp: new Date()
      });
    });

    // Handle typing indicators
    socket.on('typing_start', (conversationId) => {
      socket.to(`conversation:${conversationId}`).emit('user_typing', {
        userId: socket.userId,
        conversationId
      });
    });

    socket.on('typing_stop', (conversationId) => {
      socket.to(`conversation:${conversationId}`).emit('user_stopped_typing', {
        userId: socket.userId,
        conversationId
      });
    });

    // Handle notifications
    socket.on('mark_notification_read', (notificationId) => {
      socket.emit('notification_updated', { id: notificationId, isRead: true });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });
};
