import { Request, Response } from "express";
import Message from "../models/messageModel";
import User from "../models/userModel";
import Chat from "../models/chatModel";

// @desc    Get all Messages
// @route   GET /api/message/:chatId
// @access  Protected
export const allMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat")
      .populate("reactions.user", "name pic")
      .populate("readBy", "name pic");

    res.json(messages);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Create New Message
// @route   POST /api/message
// @access  Protected
export const sendMessage = async (req: Request, res: Response): Promise<void> => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    res.sendStatus(400);
    return;
  }

  var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
    readBy: [req.user._id], // Sender has read their own message
  };

  try {
    var message = await Message.create(newMessage);

    // Populate sender name and pic
    message = await message.populate("sender", "name pic");
    // Populate chat info
    message = await message.populate("chat");
    // Populate user info inside the chat object
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    }) as any;

    // Update the Latest Message in the Chat model
    await Chat.findByIdAndUpdate(req.body.chatId, {
      latestMessage: message,
    });

    res.json(message);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Add/Toggle Reaction on a Message
// @route   PUT /api/message/:messageId/react
// @access  Protected
export const toggleReaction = async (req: Request, res: Response): Promise<void> => {
  const { messageId } = req.params;
  const { emoji } = req.body;
  const userId = req.user._id;

  if (!emoji) {
    res.status(400).json({ message: "Emoji is required" });
    return;
  }

  try {
    const message = await Message.findById(messageId);

    if (!message) {
      res.status(404).json({ message: "Message not found" });
      return;
    }

    // Check if user already reacted with this emoji
    const existingReactionIndex = message.reactions.findIndex(
      (r) => r.user.toString() === userId.toString() && r.emoji === emoji
    );

    if (existingReactionIndex > -1) {
      // Remove reaction (toggle off)
      message.reactions.splice(existingReactionIndex, 1);
    } else {
      // Remove any existing reaction from this user (one reaction per user)
      message.reactions = message.reactions.filter(
        (r) => r.user.toString() !== userId.toString()
      );
      // Add new reaction
      message.reactions.push({ user: userId, emoji });
    }

    await message.save();

    // Populate and return updated message
    const updatedMessage = await Message.findById(messageId)
      .populate("sender", "name pic")
      .populate("reactions.user", "name pic")
      .populate("chat");

    res.json(updatedMessage);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Mark messages as read
// @route   PUT /api/message/read/:chatId
// @access  Protected
export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  const { chatId } = req.params;
  const userId = req.user._id;

  try {
    // Update all messages in this chat to include this user in readBy
    await Message.updateMany(
      {
        chat: chatId,
        readBy: { $ne: userId } // Only update messages not already read by this user
      },
      {
        $addToSet: { readBy: userId }
      }
    );

    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};