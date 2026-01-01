import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db";
import userRoutes from "./routes/userRoutes";
import chatRoutes from "./routes/chatRoutes";
import messageRoutes from "./routes/messageRoutes";
import { Server } from "socket.io";
import uploadRoutes from "./routes/uploadRoutes";
import User from "./models/userModel";

// 1. Load Environment Variables
dotenv.config();

// 2. Initialize Express App
const app = express();

// --- 3. CORS CONFIGURATION (CRITICAL FIXES) ---
const allowedOrigins = [
  "http://localhost:5173",
  "https://chat-pulse-seven.vercel.app"
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(cookieParser());

// 4. Routes
app.get("/", (req, res) => { res.send("API is running..."); });
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/upload", uploadRoutes);

// 5. Connect to Database and Start Server
const PORT = process.env.PORT || 5000;

// Track connected users: { odatabaseUserId: Set of socketIds }
const onlineUsers = new Map<string, Set<string>>();

const startServer = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`\n🚀 Server running on port ${PORT}`);
  });

  // --- SOCKET.IO SETUP ---
  const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
      origin: allowedOrigins,
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Connected to socket.io");

    let currentUserId: string | null = null;

    // A. Setup: User connects and joins their own room
    socket.on("setup", async (userData) => {
      if (!userData?._id) return;

      currentUserId = userData._id;
      socket.join(userData._id);

      // Track this socket connection
      if (!onlineUsers.has(userData._id)) {
        onlineUsers.set(userData._id, new Set());
      }
      onlineUsers.get(userData._id)!.add(socket.id);

      // Update user online status in database
      await User.findByIdAndUpdate(userData._id, { isOnline: true });

      // Broadcast online status to all connected users
      io.emit("user status", { userId: userData._id, isOnline: true });

      socket.emit("connected");
    });

    // B. Join Chat: User enters a specific chat room
    socket.on("join chat", (room) => {
      socket.join(room);
      console.log("User Joined Room: " + room);
    });

    // E. Typing Indicator
    socket.on("typing", (room) => socket.in(room).emit("typing"));
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

    // C. New Message: Send message to everyone in that chat
    socket.on("new message", (newMessageRecieved) => {
      var chat = newMessageRecieved.chat;

      if (!chat.users) return console.log("chat.users not defined");

      chat.users.forEach((user: any) => {
        if (user._id == newMessageRecieved.sender._id) return;
        socket.in(user._id).emit("message received", newMessageRecieved);
      });
    });

    // F. Reaction Update: Broadcast reaction changes to chat participants
    socket.on("reaction update", (data) => {
      const { message, chatUsers } = data;
      if (!chatUsers) return;

      chatUsers.forEach((user: any) => {
        socket.in(user._id).emit("reaction updated", message);
      });
    });

    // G. Messages Read: Notify sender that their messages have been read
    socket.on("messages read", (data) => {
      const { chatId, readByUser, chatUsers } = data;
      if (!chatUsers) return;

      chatUsers.forEach((user: any) => {
        if (user._id !== readByUser._id) {
          socket.in(user._id).emit("messages marked read", { chatId, readByUser });
        }
      });
    });

    // H. Get online status of specific users
    socket.on("get online users", (userIds: string[]) => {
      const statuses = userIds.map((id) => ({
        userId: id,
        isOnline: onlineUsers.has(id) && onlineUsers.get(id)!.size > 0,
      }));
      socket.emit("online users", statuses);
    });

    // D. Disconnect: Update user status
    socket.on("disconnect", async () => {
      if (currentUserId) {
        const userSockets = onlineUsers.get(currentUserId);
        if (userSockets) {
          userSockets.delete(socket.id);

          // Only mark offline if no other sockets are connected for this user
          if (userSockets.size === 0) {
            onlineUsers.delete(currentUserId);
            await User.findByIdAndUpdate(currentUserId, {
              isOnline: false,
              lastSeen: new Date(),
            });

            // Broadcast offline status
            io.emit("user status", { userId: currentUserId, isOnline: false });
          }
        }
        console.log("USER DISCONNECTED:", currentUserId);
      }
    });
  });
};

startServer();