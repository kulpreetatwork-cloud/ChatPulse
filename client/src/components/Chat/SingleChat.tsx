/* eslint-disable prefer-const */
/* eslint-disable no-var */
import { useEffect, useState, useCallback, type KeyboardEvent, type MouseEvent, type ChangeEvent } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaArrowLeft, FaImage, FaPaperPlane, FaSpinner } from "react-icons/fa";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { io, Socket } from "socket.io-client";
import useChatStore from "../../store/chatStore";
import { getSenderFull } from "../../config/ChatLogics";
import ProfileModal from "../Miscellaneous/ProfileModal";
import UpdateGroupChatModal from "../Miscellaneous/UpdateGroupChatModal";
import ScrollableChat from "./ScrollableChat";
import TypingIndicator from "./TypingIndicator";

interface Sender {
  _id: string;
  name: string;
  pic: string;
  email: string;
  isOnline?: boolean;
  lastSeen?: string;
}

interface Reaction {
  user: { _id: string; name: string; pic: string } | string;
  emoji: string;
}

interface Message {
  _id: string;
  content: string;
  sender: Sender;
  chat: { _id: string; users?: any[] };
  reactions?: Reaction[];
  readBy?: { _id: string; name: string; pic: string }[];
  createdAt?: string;
}

interface SingleChatProps {
  fetchAgain: boolean;
  setFetchAgain: React.Dispatch<React.SetStateAction<boolean>>;
}

const ENDPOINT = import.meta.env.MODE === "development"
  ? "http://localhost:5000"
  : "https://chatpulse-server-oxb9.onrender.com";

let socket: Socket;

const SingleChat = ({ fetchAgain, setFetchAgain }: SingleChatProps) => {
  const { user, selectedChat, setSelectedChat, setNotification } = useChatStore();

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [uploading, setUploading] = useState(false);

  // --- SOCKET SETUP ---
  useEffect(() => {
    if (!user) return;
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));

    return () => { socket.disconnect(); };
  }, [user]);

  // --- FETCH MESSAGES (used for refresh, without join/markAsRead) ---
  const refreshMessages = useCallback(async () => {
    if (!selectedChat || !user) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`/api/message/${selectedChat._id}`, config);
      setMessages(data);
    } catch {
      // Silently fail on refresh
    }
  }, [selectedChat, user]);

  // --- INITIAL FETCH (with join chat and mark as read) ---
  const fetchMessages = useCallback(async () => {
    if (!selectedChat) return;
    if (!user) return;

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      setLoading(true);
      const { data } = await axios.get(`/api/message/${selectedChat._id}`, config);
      setMessages(data);
      setLoading(false);
      if (socket) socket.emit("join chat", selectedChat._id);

      // Mark messages as read when opening chat
      await axios.put(`/api/message/read/${selectedChat._id}`, {}, config);

      // Emit read status to other users
      if (socket && selectedChat.users) {
        socket.emit("messages read", {
          chatId: selectedChat._id,
          readByUser: user,
          chatUsers: selectedChat.users,
        });
      }
    } catch {
      toast.error("Failed to load messages");
      setLoading(false);
    }
  }, [selectedChat, user]);

  useEffect(() => {
    fetchMessages();
  }, [selectedChat, fetchMessages]);

  // --- STABLE REAL-TIME LISTENER ---
  useEffect(() => {
    if (!socket) return;

    const messageHandler = (newMessageRecieved: Message) => {
      const state = useChatStore.getState();
      const currentSelectedChat = state.selectedChat;
      const currentNotifications = state.notification;

      if (!currentSelectedChat || currentSelectedChat._id !== newMessageRecieved.chat._id) {
        if (!currentNotifications.some((n: Message) => n._id === newMessageRecieved._id)) {
          setNotification([newMessageRecieved, ...currentNotifications]);
          setFetchAgain((prev) => !prev);
        }
      } else {
        setMessages((prev) => [...prev, newMessageRecieved]);
      }
    };

    socket.on("message received", messageHandler);

    // Reaction update handler
    const reactionHandler = (updatedMessage: any) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === updatedMessage._id ? updatedMessage : m))
      );
    };
    socket.on("reaction updated", reactionHandler);

    // Read status handler - just refresh messages, don't re-join or re-mark
    const readHandler = () => {
      refreshMessages();
    };
    socket.on("messages marked read", readHandler);

    return () => {
      socket.off("message received", messageHandler);
      socket.off("reaction updated", reactionHandler);
      socket.off("messages marked read", readHandler);
    };
  }, [socketConnected, setFetchAgain, setNotification, refreshMessages]);

  // --- TYPING HANDLER ---
  const typingHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    if (!selectedChat || !socketConnected || !socket) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }

    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;

    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing && socket) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  // --- SEND MESSAGE (TEXT) ---
  const sendMessage = async (event: KeyboardEvent<HTMLInputElement> | MouseEvent<HTMLButtonElement>) => {
    const isEnter = (event as KeyboardEvent).key === "Enter";
    const isClick = event.type === "click";

    if ((isEnter || isClick) && newMessage.trim()) {
      if (!user || !selectedChat) {
        toast.error("Error sending message");
        return;
      }

      if (socket) socket.emit("stop typing", selectedChat._id);

      try {
        const config = { headers: { "Content-type": "application/json", Authorization: `Bearer ${user.token}` } };
        const messageContent = newMessage;
        setNewMessage("");

        const { data } = await axios.post("/api/message", {
          content: messageContent,
          chatId: selectedChat._id,
        }, config);

        if (socket) socket.emit("new message", data);
        setMessages((prev) => [...prev, data]);
        setFetchAgain((prev) => !prev);
      } catch {
        toast.error("Failed to send message");
      }
    }
  };

  // --- IMAGE UPLOAD HANDLER ---
  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !selectedChat) return;

    if (file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/jpg") {
      try {
        setUploading(true);
        const data = new FormData();
        data.append("image", file);

        const uploadConfig = { headers: { "Content-type": "multipart/form-data" } };
        const uploadRes = await axios.post("/api/upload", data, uploadConfig);
        const imageUrl = uploadRes.data.url;

        const msgConfig = { headers: { "Content-type": "application/json", Authorization: `Bearer ${user.token}` } };
        const { data: msgData } = await axios.post("/api/message", {
          content: imageUrl,
          chatId: selectedChat._id,
        }, msgConfig);

        if (socket) socket.emit("new message", msgData);
        setMessages((prev) => [...prev, msgData]);
        setFetchAgain((prev) => !prev);
        setUploading(false);
        toast.success("Image sent!");

      } catch {
        toast.error("Image upload failed");
        setUploading(false);
      }
    } else {
      toast.error("Please select a valid image (JPEG/PNG)");
    }
  };

  const getHeaderContent = () => {
    if (!selectedChat) return "";
    if (selectedChat.isGroupChat) return selectedChat.chatName;
    if (!user) return "Chat";
    return getSenderFull(user, selectedChat.users).name;
  };

  const getHeaderUser = () => {
    if (!selectedChat || selectedChat.isGroupChat || !user) return null;
    return getSenderFull(user, selectedChat.users);
  };

  const headerUser = getHeaderUser();

  return (
    <>
      {selectedChat ? (
        <div className="flex flex-col h-full">
          {/* Chat Header */}
          <div className="px-4 md:px-6 py-3 flex justify-between items-center bg-dark-surface/80 backdrop-blur-md border-b border-dark-border/50">
            <div className="flex items-center gap-3">
              {/* Back Button (Mobile) */}
              <button
                className="md:hidden p-2 bg-dark-hover hover:bg-dark-muted rounded-xl text-slate-400 hover:text-white transition"
                onClick={() => setSelectedChat(null)}
              >
                <FaArrowLeft />
              </button>

              {/* Avatar */}
              {!selectedChat.isGroupChat && headerUser && (
                <div className="relative">
                  <img
                    src={headerUser.pic}
                    alt={headerUser.name}
                    className="w-10 h-10 rounded-xl object-cover border-2 border-brand/30"
                  />
                  {headerUser.isOnline && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-accent-emerald rounded-full border-2 border-dark-surface" />
                  )}
                </div>
              )}

              {/* Info */}
              <div>
                <h2 className="text-base md:text-lg font-bold text-white">{getHeaderContent()}</h2>
                <div className="flex items-center gap-2 text-xs">
                  {isTyping ? (
                    <span className="text-brand-light animate-pulse">Typing...</span>
                  ) : !selectedChat.isGroupChat && headerUser ? (
                    <>
                      <span className={`w-2 h-2 rounded-full ${headerUser.isOnline ? "bg-accent-emerald" : "bg-slate-500"}`} />
                      <span className={headerUser.isOnline ? "text-accent-emerald" : "text-slate-500"}>
                        {headerUser.isOnline ? "Online" : headerUser.lastSeen ? `Last seen ${new Date(headerUser.lastSeen).toLocaleString()}` : "Offline"}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className={`w-2 h-2 rounded-full ${socketConnected ? "bg-accent-emerald" : "bg-orange-500 animate-pulse"}`} />
                      <span className={socketConnected ? "text-accent-emerald" : "text-orange-400"}>
                        {socketConnected ? "Connected" : "Connecting..."}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div>
              {!selectedChat.isGroupChat ? (
                <button
                  onClick={() => setIsProfileOpen(true)}
                  className="p-2 text-slate-400 hover:text-brand hover:bg-dark-hover rounded-xl transition"
                >
                  <AiOutlineInfoCircle size={22} />
                </button>
              ) : (
                <UpdateGroupChatModal
                  fetchAgain={fetchAgain}
                  setFetchAgain={setFetchAgain}
                  fetchMessages={fetchMessages}
                />
              )}
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 flex flex-col p-4 overflow-hidden relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 border-3 border-brand border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-500 text-sm">Loading messages...</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <ScrollableChat
                  messages={messages}
                  onReactionUpdate={(updatedMessage: any) => {
                    // Update local messages
                    setMessages((prev) =>
                      prev.map((m) => (m._id === updatedMessage._id ? updatedMessage as Message : m))
                    );
                    // Emit to other users via socket
                    if (socket && selectedChat?.users) {
                      socket.emit("reaction update", {
                        message: updatedMessage,
                        chatUsers: selectedChat.users,
                      });
                    }
                  }}
                />
                {isTyping && <TypingIndicator />}
                {uploading && (
                  <div className="flex items-center gap-2 text-brand-light text-xs ml-4 mb-2 animate-pulse">
                    <FaSpinner className="animate-spin" />
                    Uploading image...
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="p-4 pt-0">
            <div className="relative flex items-center gap-2 bg-dark-bg border border-dark-border rounded-2xl p-2 focus-within:border-brand/50 focus-within:ring-2 focus-within:ring-brand/10 transition-all">
              {/* Image Upload */}
              <label className="p-3 text-slate-500 hover:text-brand hover:bg-dark-hover rounded-xl cursor-pointer transition">
                <FaImage size={18} />
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
              </label>

              {/* Text Input */}
              <input
                className="flex-1 bg-transparent text-white outline-none placeholder-slate-500 text-sm py-2"
                placeholder="Type a message..."
                onChange={typingHandler}
                value={newMessage}
                onKeyDown={sendMessage}
              />

              {/* Send Button */}
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                className={`p-3 rounded-xl transition-all ${newMessage.trim()
                  ? "bg-brand hover:bg-brand-hover text-white shadow-glow"
                  : "bg-dark-hover text-slate-600 cursor-not-allowed"
                  }`}
              >
                <FaPaperPlane size={16} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Empty State
        <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
          {/* Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand/5 rounded-full blur-[100px]" />

          <div className="relative z-10 flex flex-col items-center text-center max-w-sm">
            {/* Icon */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand/20 to-accent-purple/20 flex items-center justify-center mb-6 border border-brand/10">
              <svg className="w-10 h-10 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">Welcome to ChatPulse</h2>
            <p className="text-slate-500 mb-6">
              Select a conversation from the sidebar or search for a user to start messaging.
            </p>

            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="w-2 h-2 bg-accent-emerald rounded-full animate-pulse" />
              Ready to connect
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal - Rendered at root level for proper z-index */}
      {selectedChat && !selectedChat.isGroupChat && (
        <ProfileModal
          user={getHeaderUser()}
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
        />
      )}
    </>
  );
};

export default SingleChat;