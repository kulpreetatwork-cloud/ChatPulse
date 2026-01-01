import express from "express";
import { allMessages, sendMessage, toggleReaction, markAsRead } from "../controllers/messageController";
import protect from "../middlewares/authMiddleware";

const router = express.Router();

router.route("/:chatId").get(protect, allMessages);     // Fetch history
router.route("/").post(protect, sendMessage);            // Send new message
router.route("/:messageId/react").put(protect, toggleReaction); // Toggle reaction
router.route("/read/:chatId").put(protect, markAsRead);  // Mark messages as read

export default router;