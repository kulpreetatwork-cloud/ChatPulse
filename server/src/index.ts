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

// 1. Load Environment Variables
dotenv.config();

// 2. Initialize Express App
const app = express();

// --- 3. CORS CONFIGURATION (CRITICAL FIXES) ---
const allowedOrigins = [
  "http://localhost:5173",
  "https://chat-pulse-seven.vercel.app" // REMOVED trailing slash '/'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  // FIX: Explicitly allow Authorization header so the token is passed
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

const startServer = async () => {
  await connectDB();
  
  // Store the server instance
  const server = app.listen(PORT, () => {
      console.log(`\n🚀 Server running on port ${PORT}`);
  });

  // --- SOCKET.IO SETUP ---
  const io = new Server(server, {
    pingTimeout: 60000, 
    cors: {
      // FIX: Use the variable allowedOrigins, NOT hardcoded localhost
      origin: allowedOrigins, 
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"], 
    },
  });

  io.on("connection", (socket) => {
    console.log("Connected to socket.io");

    // A. Setup: User connects and joins their own room
    socket.on("setup", (userData) => {
      socket.join(userData._id);
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
        // Don't send the message back to the sender
        if (user._id == newMessageRecieved.sender._id) return;

        // Send to the specific user's room
        socket.in(user._id).emit("message received", newMessageRecieved);
      });
    });

    // D. Cleanup (Optional)
    socket.off("setup", (userData) => {
      console.log("USER DISCONNECTED");
      socket.leave(userData._id);
    });
  });
};

startServer();