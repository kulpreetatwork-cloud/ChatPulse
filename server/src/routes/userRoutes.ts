import express from "express";
import { registerUser, authUser, allUsers } from "../controllers/userController";
import protect from "../middlewares/authMiddleware";

const router = express.Router();

// Chain methods for cleaner code
router.route("/").post(registerUser).get(protect, allUsers);
router.post("/login", authUser);

export default router;