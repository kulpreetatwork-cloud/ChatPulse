import express from "express";
import { allMessages, sendMessage } from "../controllers/messageController";
import protect from "../middlewares/authMiddleware";

const router = express.Router();

router.route("/:chatId").get(protect, allMessages); // Fetch history
router.route("/").post(protect, sendMessage);       // Send new message

export default router;