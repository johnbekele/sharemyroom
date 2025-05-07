// routes/messageRoutes.js

import express from 'express';
import messageController from '../../controllers/messageController.js';
import verifyJWT from '../../middleware/verifyJWT.js';

const router = express.Router();

router.post('/send', verifyJWT, messageController.sendMessage);
router.get('/:chatId', verifyJWT, messageController.getChatMessages);
router.delete(
  '/messages/:messageId',
  verifyJWT,
  messageController.deleteMessage
);

export default router;
