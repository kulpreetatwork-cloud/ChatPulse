/* eslint-disable prefer-const */
/* eslint-disable no-var */
import { useEffect, useState, useCallback, type KeyboardEvent, type MouseEvent, type ChangeEvent } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaArrowLeft, FaImage } from "react-icons/fa"; // Added FaImage
import { AiOutlineSend, AiOutlineInfoCircle } from "react-icons/ai"; 
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
}

interface Message {
  _id: string;
  content: string;
  sender: Sender;
  chat: { _id: string };
}

interface SingleChatProps {
  fetchAgain: boolean;
  setFetchAgain: React.Dispatch<React.SetStateAction<boolean>>;
}

const ENDPOINT = import.meta.env.MODE === "development" 
  ? "http://localhost:5000" 
  : "https://chatpulse-server.onrender.com"; 

let socket: Socket;

const SingleChat = ({ fetchAgain, setFetchAgain }: SingleChatProps) => {
  // We only pull 'user' and setters from the hook to avoid re-renders on notification changes here
  const { user, selectedChat, setSelectedChat, setNotification } = useChatStore();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [uploading, setUploading] = useState(false); // Added Uploading State

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

  // --- FETCH MESSAGES ---
  const fetchMessages = useCallback(async () => {
      if (!selectedChat) return;
      if (!user) return;

      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        setLoading(true);
        const { data } = await axios.get(`/api/message/${selectedChat._id}`, config);
        setMessages(data);
        setLoading(false);
        socket.emit("join chat", selectedChat._id);
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
        // Access latest state directly without adding dependencies
        const state = useChatStore.getState();
        const currentSelectedChat = state.selectedChat;
        const currentNotifications = state.notification;

        if (!currentSelectedChat || currentSelectedChat._id !== newMessageRecieved.chat._id) {
            // Check for duplicates using ID (safer than object reference)
            if (!currentNotifications.some((n: Message) => n._id === newMessageRecieved._id)) {
                setNotification([newMessageRecieved, ...currentNotifications]);
                setFetchAgain(!fetchAgain); // Trigger sidebar refresh
            }
        } else {
            setMessages((prev) => [...prev, newMessageRecieved]);
        }
    };

    socket.on("message received", messageHandler);

    return () => {
        socket.off("message received", messageHandler);
    };
    // Dependency array is minimal: only re-subscribe if socket or fetchAgain function reference changes
  }, [socketConnected, fetchAgain, setFetchAgain, setNotification]); 

  // --- TYPING HANDLER ---
  const typingHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    if (!selectedChat || !socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }

    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  // --- SEND MESSAGE (TEXT) ---
  const sendMessage = async (event: KeyboardEvent<HTMLInputElement> | MouseEvent<HTMLButtonElement>) => {
    const isEnter = (event as KeyboardEvent).key === "Enter";
    const isClick = event.type === "click";

    if ((isEnter || isClick) && newMessage) {
        if (!user || !selectedChat) {
            toast.error("Error sending message");
            return;
        }

      socket.emit("stop typing", selectedChat._id); 

      try {
        const config = { headers: { "Content-type": "application/json", Authorization: `Bearer ${user.token}` } };
        const messageContent = newMessage;
        setNewMessage(""); 
        
        const { data } = await axios.post("/api/message", {
          content: messageContent,
          chatId: selectedChat._id,
        }, config);

        socket.emit("new message", data);
        setMessages([...messages, data]);
        setFetchAgain(!fetchAgain); 
      } catch {
        toast.error("Failed to send message");
      }
    }
  };

  // --- IMAGE UPLOAD HANDLER (ADDED) ---
  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !selectedChat) return;

    if (file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/jpg") {
        try {
            setUploading(true);
            const data = new FormData();
            data.append("image", file);

            // Upload to Cloudinary via Backend
            const uploadConfig = { headers: { "Content-type": "multipart/form-data" } };
            const uploadRes = await axios.post("/api/upload", data, uploadConfig);
            const imageUrl = uploadRes.data.url;

            // Send URL as Message
            const msgConfig = { headers: { "Content-type": "application/json", Authorization: `Bearer ${user.token}` } };
            const { data: msgData } = await axios.post("/api/message", {
                content: imageUrl, 
                chatId: selectedChat._id,
            }, msgConfig);

            socket.emit("new message", msgData);
            setMessages([...messages, msgData]);
            setFetchAgain(!fetchAgain);
            setUploading(false);
            toast.success("Image Sent!");

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
  }

  return (
    <>
      {selectedChat ? (
        <div className="flex flex-col h-full bg-dark-bg/50 backdrop-blur-sm">
            <div className="px-6 py-3 flex justify-between items-center bg-dark-surface/90 border-b border-dark-border shadow-sm z-10">
                <div className="flex items-center gap-4">
                    <button 
                        className="md:hidden p-2 bg-dark-hover rounded-full hover:bg-dark-border text-slate-300 transition"
                        onClick={() => setSelectedChat(null)}
                    >
                        <FaArrowLeft />
                    </button>
                    
                    <div className="flex flex-col">
                        <span className="text-lg font-bold text-white tracking-wide">
                            {getHeaderContent()}
                        </span>
                        <span className="text-xs text-brand-light font-medium flex items-center gap-1 h-4">
                           {isTyping ? (
                               <span className="animate-pulse">Typing...</span>
                           ) : (
                               <>
                                <span className={`w-1.5 h-1.5 rounded-full ${socketConnected ? "bg-green-500" : "bg-orange-500"}`}></span> 
                                {socketConnected ? "Live" : "Connecting..."}
                               </>
                           )}
                        </span>
                    </div>
                </div>
                
                <div>
                    {!selectedChat.isGroupChat ? (
                        <>
                            <button 
                                onClick={() => setIsProfileOpen(true)} 
                                className="p-2 text-slate-400 hover:text-brand transition hover:bg-dark-hover rounded-full"
                            >
                                <AiOutlineInfoCircle size={24} />
                            </button>
                            <ProfileModal user={getHeaderUser()} isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
                        </>
                    ) : (
                        <UpdateGroupChatModal 
                            fetchAgain={fetchAgain} 
                            setFetchAgain={setFetchAgain} 
                            fetchMessages={fetchMessages} 
                        />
                    )}
                </div>
            </div>

            <div className="flex flex-col justify-end p-4 w-full h-full overflow-y-hidden relative bg-dark-bg">
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

                {loading ? (
                    <div className="self-center m-auto flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-slate-500 text-sm animate-pulse">Decrypting history...</p>
                    </div>
                ) : (
                    <div className="flex flex-col overflow-y-scroll custom-scrollbar h-full mb-3 pr-2">
                        <ScrollableChat messages={messages} />
                        {isTyping && <TypingIndicator />}
                        {/* Added Uploading Indicator */}
                        {uploading && <p className="text-xs text-brand-light animate-pulse ml-4 mb-2">Sending Image...</p>}
                    </div>
                )}

                <div className="relative w-full z-20">
                    <input 
                        className="w-full bg-dark-surface text-slate-200 border border-dark-border p-4 pl-4 pr-24 rounded-xl shadow-lg outline-none focus:ring-1 focus:ring-brand focus:border-brand transition placeholder-slate-500"
                        placeholder="Type a message..."
                        onChange={typingHandler} 
                        value={newMessage}
                        onKeyDown={sendMessage}
                    />
                    
                    {/* --- ACTIONS AREA (UPDATED) --- */}
                    <div className="absolute right-2 top-2 bottom-2 flex items-center gap-1">
                        
                        {/* Image Upload Button */}
                        <label className="p-2 text-slate-400 hover:text-brand hover:bg-dark-hover rounded-lg cursor-pointer transition">
                            <FaImage size={18} />
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                        </label>

                        {/* Send Button */}
                        <button 
                            onClick={sendMessage}
                            className="bg-brand hover:bg-brand-hover text-white p-2.5 rounded-lg transition-all shadow-glow hover:scale-105 active:scale-95"
                        >
                            <AiOutlineSend size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-dark-bg relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand/5 rounded-full blur-[100px]"></div>
            
            <div className="z-10 flex flex-col items-center gap-4">
                <div className="bg-dark-surface p-6 rounded-2xl border border-dark-border shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
                    <img src="/vite.svg" className="w-16 h-16 opacity-80 grayscale" alt="Logo" />
                </div>
                <h2 className="text-3xl font-bold text-white mt-4">Welcome to ChatPulse</h2>
                <p className="text-slate-500 max-w-sm text-center">
                    Select a conversation from the sidebar or search for a user to start messaging securely.
                </p>
            </div>
        </div>
      )}
    </>
  );
};

export default SingleChat;