/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { FaSearch, FaBell, FaChevronDown } from "react-icons/fa";
import { AiOutlineLogout, AiOutlineUser } from "react-icons/ai";
import useChatStore from "../../store/chatStore";
import ProfileModal from "./ProfileModal";
import { getSender } from "../../config/ChatLogics"; // Import this

const Navbar = () => {
  const navigate = useNavigate();
  // 1. Get Notification state
  const { user, setSelectedChat, chats, setChats, logout, notification, setNotification } = useChatStore();

  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false); // Local state for bell dropdown

  const logoutHandler = () => {
    logout();
    navigate("/");
    toast.success("Logged out successfully");
  };

  const handleSearch = async () => {
    if (!search) {
      toast.error("Please enter something to search");
      return;
    }
    if (!user) return;

    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`/api/user?search=${search}`, config);
      setLoading(false);
      setSearchResult(data);
    } catch {
      setLoading(false);
      toast.error("Failed to load search results");
    }
  };

  const accessChat = async (userId: string) => {
    if (!user) return;
    try {
      setLoadingChat(true);
      const config = { headers: { "Content-type": "application/json", Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post("/api/chat", { userId }, config);

      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setLoadingChat(false);
      setIsDrawerOpen(false);
    } catch {
      setLoadingChat(false);
      toast.error("Error fetching chat");
    }
  };

  return (
    <>
      <div className="flex justify-between items-center bg-dark-surface/80 backdrop-blur-md w-full px-6 py-4 border-b border-dark-border sticky top-0 z-20">
        
        <button 
            onClick={() => setIsDrawerOpen(true)}
            className="group flex items-center gap-3 bg-dark-bg border border-dark-border px-4 py-2 rounded-full text-slate-400 hover:text-white hover:border-brand-light/50 transition-all duration-300 w-full max-w-[200px]"
        >
          <FaSearch className="text-sm group-hover:text-brand transition-colors" />
          <span className="text-sm font-medium">Search...</span>
        </button>

        <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand to-purple-500 tracking-tight cursor-default">
          ChatPulse
        </h1>

        <div className="flex items-center gap-6">
          
          {/* --- NOTIFICATION BELL --- */}
          <div className="relative cursor-pointer group">
            <button onClick={() => setIsNotifOpen(!isNotifOpen)} className="relative">
                <FaBell className="text-xl text-slate-400 group-hover:text-brand-light transition duration-300" />
                {notification.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-dark-surface animate-bounce">
                        {notification.length}
                    </span>
                )}
            </button>

            {/* Notification Dropdown */}
            {isNotifOpen && (
                <div className="absolute right-0 top-full mt-3 w-64 bg-dark-surface border border-dark-border rounded-xl shadow-glass z-50 overflow-hidden">
                    <div className="p-2">
                        {notification.length === 0 && (
                            <div className="px-4 py-3 text-sm text-slate-500 text-center">No New Messages</div>
                        )}
                        {notification.map((notif: any) => (
                            <div 
                                key={notif._id}
                                onClick={() => {
                                    setSelectedChat(notif.chat);
                                    setNotification(notification.filter((n) => n !== notif));
                                    setIsNotifOpen(false);
                                }}
                                className="px-4 py-3 text-sm text-slate-300 hover:bg-dark-hover cursor-pointer border-b border-dark-border last:border-0"
                            >
                                {notif.chat.isGroupChat
                                    ? `New message in ${notif.chat.chatName}`
                                    : `New message from ${getSender(user, notif.chat.users)}`}
                            </div>
                        ))}
                    </div>
                </div>
            )}
          </div>
          
          <div className="relative group z-30">
            <button className="flex items-center gap-3 focus:outline-none">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand to-purple-600 p-[2px]">
                   <img 
                     src={user?.pic} 
                     alt={user?.name} 
                     className="w-full h-full rounded-full object-cover border-2 border-dark-surface" 
                   />
                </div>
                <FaChevronDown className="text-xs text-slate-500 group-hover:text-white transition" />
            </button>

            <div className="absolute right-0 top-full mt-3 w-56 bg-dark-surface border border-dark-border rounded-xl shadow-glass opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right z-50">
                <div className="p-2">
                  <div className="px-4 py-2 border-b border-dark-border mb-1">
                    <p className="text-sm text-white font-semibold">{user?.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  </div>
                  
                  <button 
                      onClick={() => setIsProfileOpen(true)}
                      className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-dark-hover hover:text-white rounded-lg transition flex items-center gap-2"
                  >
                      <AiOutlineUser /> Profile
                  </button>
                  
                  <button 
                      onClick={logoutHandler}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition flex items-center gap-2"
                  >
                      <AiOutlineLogout /> Logout
                  </button>
                </div>
            </div>
          </div>
        </div>
      </div>

      <ProfileModal user={user} isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

      {isDrawerOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsDrawerOpen(false)}></div>
            
            <div className="relative bg-dark-surface w-80 md:w-96 h-full shadow-2xl p-6 flex flex-col border-r border-dark-border transform transition-transform duration-300 animate-slide-in">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <FaSearch className="text-brand" /> Search Users
                </h2>
                
                <div className="flex gap-2 mb-6">
                    <input 
                        className="w-full bg-dark-bg border border-dark-border text-white rounded-lg px-4 py-3 outline-none focus:border-brand focus:ring-1 focus:ring-brand transition placeholder-slate-500"
                        placeholder="Search by name or email"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        autoFocus
                    />
                    <button 
                        onClick={handleSearch} 
                        className="bg-brand hover:bg-brand-hover text-white px-4 rounded-lg transition shadow-glow font-medium"
                    >
                      Go
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto flex flex-col gap-2 custom-scrollbar pr-2">
                    {loading ? (
                       <div className="flex flex-col items-center mt-10 space-y-3">
                          <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin"></div>
                          <p className="text-slate-500 text-sm">Searching global directory...</p>
                       </div>
                    ) : (
                        searchResult.map((u: any) => (
                            <div 
                                key={u._id}
                                onClick={() => accessChat(u._id)}
                                className="flex items-center gap-4 bg-dark-bg hover:bg-dark-hover p-3 rounded-xl cursor-pointer transition border border-transparent hover:border-dark-border group"
                            >
                                <img src={u.pic} alt={u.name} className="w-10 h-10 rounded-full object-cover border border-dark-border group-hover:border-brand transition" />
                                <div>
                                    <p className="text-white font-medium text-sm group-hover:text-brand-light transition">{u.name}</p>
                                    <p className="text-xs text-slate-500">Email: {u.email}</p>
                                </div>
                            </div>
                        ))
                    )}
                    {loadingChat && (
                      <div className="absolute bottom-5 left-0 w-full text-center">
                         <span className="bg-brand text-white text-xs px-3 py-1 rounded-full animate-pulse shadow-glow">Initializing Secure Chat...</span>
                      </div>
                    )}
                </div>
            </div>
          </div>
      )}
    </>
  );
};

export default Navbar;