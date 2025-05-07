import { Server } from 'socket.io';

const configureSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.PROD_FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization'],
    },
  });

  // 👇 Track connected users: { userId: socketId }
  const onlineUsers = new Map();

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // When user comes online, client must emit 'setup' with their userId
    socket.on('setup', (userId) => {
      if (userId) {
        onlineUsers.set(userId, socket.id);
        console.log(`User ${userId} is online`);

        // Emit updated list
        io.emit('onlineUsers', Array.from(onlineUsers.keys()));
      }
    });

    socket.on('joinRoom', (chatId) => {
      socket.join(chatId);
      console.log(`User ${socket.id} joined chat ${chatId}`);
    });

    socket.on('leaveRoom', (chatId) => {
      socket.leave(chatId);
      console.log(`User ${socket.id} left chat ${chatId}`);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);

      // Find userId and remove from map
      for (let [userId, id] of onlineUsers.entries()) {
        if (id === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }

      // Emit updated list
      io.emit('onlineUsers', Array.from(onlineUsers.keys()));
    });
  });

  return io;
};

export default configureSocket;
