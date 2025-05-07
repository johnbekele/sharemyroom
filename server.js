import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import connectDB from './src/config/dbConfig.js';
import dotenv from 'dotenv';
import Auth from './src/routes/Auth.js';
import passport from 'passport';
import configurePassport from './src/config/passportConfig.js';
import logger from './utils/logger.js';
import message from './src/routes/api/message.js';
import chat from './src/routes/api/Chat.js';
import { Server } from 'socket.io';
import http from 'http';
import configureSocket from './src/config/socket.js';
dotenv.config();

const isDevelopment = process.env.NODE_ENV !== 'production';
const port = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with server
const io = configureSocket(server);
// Connect to database
connectDB();

// CORS setup
app.use(
  cors({
    origin: isDevelopment
      ? ['http://127.0.0.1:5173', 'http://localhost:5173']
      : [
          'https://bookapis.zapto.org',
          'http://localhost:5173',
          'http://127.0.0.1:5173',
          'https://book-and-memories.vercel.app',
        ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Security headers (optional in Render/Railway, since they also add headers)
if (!isDevelopment) {
  app.use((req, res, next) => {
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains'
    );
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.set('io', io);

configurePassport();

// Routes
app.use('/api/auth', Auth);
app.use('/api/messages', message);
app.use('/api/chat', chat);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Start server (simple HTTP, HTTPS handled by platform)
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
