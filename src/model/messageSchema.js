import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Message = mongoose.model('Message', messageSchema);

export default Message;
