import Chat from '../model/chatSchema.js';

import User from '../model/userSchema.js';

const startChat = async (req, res) => {
  const { receiverId } = req.body;
  const senderId = req.user.id;

  try {
    // Verify receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    // Check if chat already exists
    let chat = await Chat.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!chat) {
      // Create new chat if it doesn't exist
      chat = new Chat({
        participants: [senderId, receiverId],
        messages: [],
      });
      await chat.save();
    }

    res.json({ chatId: chat._id });
  } catch (error) {
    console.error('Error starting chat:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getUserChats = async (req, res) => {
  const userId = req.user.id;

  try {
    const chats = await Chat.find({ participants: userId })
      .populate('participants', 'username email avatar') // Add fields you need
      .populate({
        path: 'lastMessage',
        select: 'content createdAt',
      })
      .sort({ updatedAt: -1 }); // Most recent chats first

    res.json(chats);
  } catch (error) {
    console.error('Error fetching user chats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export default { startChat, getUserChats };
