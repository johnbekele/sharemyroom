import express from 'express';
import chatController from '../../controllers/chatController.js';
import verifyJWT from '../../middleware/verifyJWT.js';

const router = express.Router();

router.post('/start', verifyJWT, chatController.startChat);
router.get('/', verifyJWT, chatController.getUserChats);

export default router;
