// controllers/messageController.js
import mongoose from 'mongoose';
import Message from '../model/messageSchema.js';
import Chat from '../model/chatSchema.js';

const sendMessage = async (req, res) => {
  const { chatId, content } = req.body;
  const senderId = req.user.id;

  if (!content || content.trim() === '') {
    return res.status(400).json({ message: 'Message content cannot be empty' });
  }

  try {
    // Check if chatId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ message: 'Invalid chat ID' });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Ensure the sender is part of the chat
    if (!chat.participants.includes(senderId)) {
      return res.status(403).json({ message: 'You are not part of this chat' });
    }

    // Create a new message
    const newMessage = new Message({
      content,
      sender: senderId,
      roomId: chatId,
    });

    await newMessage.save();

    // Update the chat with the new message
    chat.messages.push(newMessage._id);
    chat.lastMessage = newMessage._id;
    chat.updatedAt = Date.now();
    await chat.save();

    // Return the new message with populated sender info
    const populatedMessage = await Message.findById(newMessage._id).populate(
      'sender',
      'username email avatar'
    );

    //Emitting the new message to room
    const io = req.app.get('io');
    io.to(chatId).emit('reciveMessage', populatedMessage);

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getChatMessages = async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    return res.status(400).json({ message: 'Invalid chat ID' });
  }

  try {
    const chat = await Chat.findById({ _id: chatId });
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (!chat.participants.includes(userId)) {
      return res.status(403).json({ message: 'You are not part of this chat' });
    }

    const messages = await Message.find({ roomId: chatId })
      .populate('sender', 'username email avatar')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Delete a message
 */
const deleteMessage = async (req, res) => {
  const { messageId } = req.params;
  const userId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(messageId)) {
    return res.status(400).json({ message: 'Invalid message ID' });
  }

  try {
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user is the sender
    if (message.sender.toString() !== userId) {
      return res
        .status(403)
        .json({ message: 'You cannot delete this message' });
    }

    // Remove message from chat's messages array
    await Chat.updateOne(
      { _id: message.roomId },
      { $pull: { messages: messageId } }
    );

    // Update lastMessage if this was the last message
    const chat = await Chat.findById(message.roomId);
    if (chat.lastMessage && chat.lastMessage.toString() === messageId) {
      // Find the new last message (if any)
      const newLastMessage = await Message.findOne(
        { roomId: message.roomId },
        {},
        { sort: { createdAt: -1 } }
      );

      chat.lastMessage = newLastMessage ? newLastMessage._id : null;
      await chat.save();
    }

    // Delete the message
    await Message.findByIdAndDelete(messageId);

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export default { sendMessage, getChatMessages, deleteMessage };
