import { Request, Response } from "express";
import Chat from "../models/chatModel";
import User from "../models/userModel";

// @desc    Create or fetch One-on-One Chat
// @route   POST /api/chat
// @access  Protected
export const accessChat = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.body;

  if (!userId) {
    res.status(400).json({ message: "UserId param not sent with request" });
    return;
  }

  // 1. Check if chat exists
  let isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password") // Populate user details
    .populate("latestMessage"); // Populate the last message info

  // 2. Populate the sender of the latest message
  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  }) as any;

  // 3. If chat exists, return it. If not, create it.
  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).json(FullChat);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
};

// @desc    Fetch all chats for a user
// @route   GET /api/chat
// @access  Protected
export const fetchChats = async (req: Request, res: Response): Promise<void> => {
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 }) // Show new chats first
      .then(async (results: any) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "name pic email",
        });
        res.status(200).send(results);
      });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// ... (Keep accessChat and fetchChats code above)

// @desc    Create New Group Chat
// @route   POST /api/chat/group
// @access  Protected
export const createGroupChat = async (req: Request, res: Response): Promise<void> => {
  if (!req.body.users || !req.body.name) {
    res.status(400).send({ message: "Please Fill all the fields" });
    return;
  }

  // Parse stringified array from frontend
  var users = JSON.parse(req.body.users);

  if (users.length < 2) {
    res.status(400).send("More than 2 users are required to form a group chat");
    return;
  }

  // Add current user to the group
  users.push(req.user);

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Rename Group
// @route   PUT /api/chat/rename
// @access  Protected
export const renameGroup = async (req: Request, res: Response): Promise<void> => {
  const { chatId, chatName } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    { chatName },
    { new: true } // Return the updated object
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(updatedChat);
  }
};

// @desc    Add user to Group
// @route   PUT /api/chat/groupadd
// @access  Protected
export const addToGroup = async (req: Request, res: Response): Promise<void> => {
  const { chatId, userId } = req.body;

  const added = await Chat.findByIdAndUpdate(
    chatId,
    { $push: { users: userId } },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!added) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(added);
  }
};

// @desc    Remove user from Group
// @route   PUT /api/chat/groupremove
// @access  Protected
export const removeFromGroup = async (req: Request, res: Response): Promise<void> => {
  const { chatId, userId } = req.body;

  const removed = await Chat.findByIdAndUpdate(
    chatId,
    { $pull: { users: userId } },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!removed) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(removed);
  }
};