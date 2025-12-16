import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db";
import userRoutes from "./routes/userRoutes";
import chatRoutes from "./routes/chatRoutes";
import messageRoutes from "./routes/messageRoutes";
import uploadRoutes from "./routes/uploadRoutes";
import { Server } from "socket.io";

dotenv.config();

const app = express();

// --- 1. DEFINE ALLOWED ORIGINS (Crucial Step) ---
// We define this once and use it for both Express and Socket.io
const allowedOrigins = [
  "http://localhost:5173",
  "https://chat-pulse-seven.vercel.app" // NO trailing slash!
];

// --- 2. MIDDLEWARES ---
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      console.log("Blocked by CORS:", origin); // Log the blocked origin for debugging
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json()); 
app.use(cookieParser());

// --- 3. ROUTES ---
app.get("/", (req, res) => { res.send("API is running..."); });
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/upload", uploadRoutes);

// Error Handling Middlewares (Add these if you have the file, otherwise skip)
// app.use(notFound);
// app.use(errorHandler);

// --- 4. START SERVER ---
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  
  const server = app.listen(PORT, () => {
      console.log(`\n🚀 Server running on port ${PORT}`);
  });

  // --- 5. SOCKET.IO SETUP ---
  const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
      origin: allowedOrigins, // Use the SAME allowed list as Express
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Connected to socket.io");

    socket.on("setup", (userData) => {
      socket.join(userData._id);
      socket.emit("connected");
    });

    socket.on("join chat", (room) => {
      socket.join(room);
      console.log("User Joined Room: " + room);
    });

    socket.on("typing", (room) => socket.in(room).emit("typing"));
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

    socket.on("new message", (newMessageRecieved) => {
      var chat = newMessageRecieved.chat;

      if (!chat.users) return console.log("chat.users not defined");

      chat.users.forEach((user: any) => {
        if (user._id == newMessageRecieved.sender._id) return;
        socket.in(user._id).emit("message received", newMessageRecieved);
      });
    });

    socket.off("setup", () => {
      console.log("USER DISCONNECTED");
      socket.leave(""); 
    });
  });
};

startServer();