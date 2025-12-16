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
      .populate("chat");

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