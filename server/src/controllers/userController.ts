import { Request, Response } from "express";
import User from "../models/userModel";
import generateTokenAndSetCookie from "../utils/generateToken";

// @desc    Register a new user
// @route   POST /api/user
// @access  Public
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, pic } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ message: "Please enter all fields" });
      return;
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const user = await User.create({
      name,
      email,
      password,
      pic,
    });

    if (user) {
      const token = generateTokenAndSetCookie(user._id, res); // Send the cookie
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        pic: user.pic,
        token,
      });
    } else {
      res.status(400).json({ message: "Failed to create user" });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/user/login
// @access  Public
export const authUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      const token = generateTokenAndSetCookie(user._id, res); // Send the cookie
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        pic: user.pic,
        token,
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users (Search)
// @route   GET /api/user?search=john
// @access  Protected
export const allUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const keyword = req.query.search
      ? {
          $or: [
            { name: { $regex: req.query.search as string, $options: "i" } }, // Case insensitive regex
            { email: { $regex: req.query.search as string, $options: "i" } },
          ],
        }
      : {};

    // Find users matching keyword, but exclude the current logged-in user
    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
    
    res.send(users);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
