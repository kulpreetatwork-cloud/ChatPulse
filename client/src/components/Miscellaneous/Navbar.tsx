/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { FaSearch, FaBell, FaChevronDown, FaTimes, FaSignOutAlt, FaUser, FaSpinner } from "react-icons/fa";
import useChatStore from "../../store/chatStore";
import ProfileModal from "./ProfileModal";
import { getSender } from "../../config/ChatLogics";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, setSelectedChat, chats, setChats, logout, notification, setNotification } = useChatStore();

  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const logoutHandler = () => {
    logout();
    navigate("/");
    toast.success("Logged out successfully");
  };

  // Live search function
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim() || !user) {
      setSearchResult([]);
      return;
    }

    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`/api/user?search=${query}`, config);
      setLoading(false);
      setSearchResult(data);
    } catch {
      setLoading(false);
      // Silently fail for live search to avoid spamming toasts
    }
  }, [user]);

  // Debounced search - triggers 300ms after user stops typing
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      performSearch(search);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search, performSearch]);

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
      setSearch("");
      setSearchResult([]);
    } catch {
      setLoadingChat(false);
      toast.error("Error fetching chat");
    }
  };

  return (
    <>
      {/* Main Navbar */}
      <header className="flex justify-between items-center glass w-full px-4 md:px-6 py-3 border-b border-dark-border/50 sticky top-0 z-30">
        {/* Search Button */}
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="group flex items-center gap-2 md:gap-3 bg-dark-bg/80 border border-dark-border px-3 md:px-4 py-2 md:py-2.5 rounded-xl text-slate-400 hover:text-white hover:border-brand/50 transition-all duration-300"
        >
          <FaSearch className="text-sm group-hover:text-brand transition-colors" />
          <span className="text-sm font-medium hidden sm:inline">Search users...</span>
          <span className="text-sm font-medium sm:hidden">Search</span>
          <kbd className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] text-slate-500 bg-dark-hover rounded border border-dark-border">
            ⌘K
          </kbd>
        </button>

        {/* Logo */}
        <h1 className="text-xl md:text-2xl font-extrabold gradient-text cursor-default select-none">
          ChatPulse
        </h1>

        {/* Right Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 md:p-2.5 rounded-xl bg-dark-bg/80 border border-dark-border hover:border-brand/50 transition-all group"
            >
              <FaBell className="text-lg text-slate-400 group-hover:text-brand transition-colors" />
              {notification.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-dark-surface animate-pulse">
                  {notification.length}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {isNotifOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-72 md:w-80 bg-dark-surface border border-dark-border rounded-xl shadow-premium z-50 overflow-hidden animate-fade-in-down">
                  <div className="p-3 border-b border-dark-border flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-white">Notifications</h3>
                    {notification.length > 0 && (
                      <button
                        onClick={() => setNotification([])}
                        className="text-xs text-slate-500 hover:text-brand transition"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto custom-scrollbar">
                    {notification.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-dark-hover flex items-center justify-center">
                          <FaBell className="text-slate-500" />
                        </div>
                        <p className="text-sm text-slate-500">No new messages</p>
                      </div>
                    ) : (
                      notification.map((notif: any) => (
                        <div
                          key={notif._id}
                          onClick={() => {
                            setSelectedChat(notif.chat);
                            setNotification(notification.filter((n) => n !== notif));
                            setIsNotifOpen(false);
                          }}
                          className="px-4 py-3 hover:bg-dark-hover cursor-pointer border-b border-dark-border/50 last:border-0 transition-colors"
                        >
                          <p className="text-sm text-slate-300">
                            {notif.chat.isGroupChat
                              ? `New message in ${notif.chat.chatName}`
                              : `New message from ${getSender(user, notif.chat.users)}`}
                          </p>
                          <p className="text-xs text-slate-500 mt-1 truncate">{notif.content}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl bg-dark-bg/80 border border-dark-border hover:border-brand/50 transition-all"
            >
              <div className="w-8 h-8 rounded-lg overflow-hidden ring-2 ring-brand/30">
                <img
                  src={user?.pic}
                  alt={user?.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <FaChevronDown className={`text-xs text-slate-500 transition-transform hidden md:block ${isProfileDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsProfileDropdownOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-56 bg-dark-surface border border-dark-border rounded-xl shadow-premium z-50 overflow-hidden animate-fade-in-down">
                  <div className="p-4 border-b border-dark-border">
                    <p className="text-sm text-white font-semibold truncate">{user?.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setIsProfileOpen(true);
                        setIsProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2.5 text-sm text-slate-300 hover:bg-dark-hover hover:text-white rounded-lg transition flex items-center gap-3"
                    >
                      <FaUser className="text-slate-500" />
                      View Profile
                    </button>
                    <button
                      onClick={logoutHandler}
                      className="w-full text-left px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition flex items-center gap-3"
                    >
                      <FaSignOutAlt />
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Profile Modal */}
      <ProfileModal user={user} isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

      {/* Search Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative bg-dark-surface w-full max-w-md h-full shadow-premium flex flex-col border-r border-dark-border animate-slide-in-left">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b border-dark-border">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FaSearch className="text-brand" />
                Find Users
              </h2>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-dark-hover rounded-lg transition"
              >
                <FaTimes />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-4">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  className="w-full bg-dark-bg border border-dark-border text-white rounded-xl pl-11 pr-4 py-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition placeholder-slate-500 caret-brand"
                  placeholder="Start typing to search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                />
                {loading && (
                  <FaSpinner className="absolute right-4 top-1/2 -translate-y-1/2 text-brand animate-spin" />
                )}
              </div>
              <p className="text-xs text-slate-600 mt-2 px-1">
                Search by name or email address
              </p>
            </div>

            {/* Search Results */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="w-10 h-10 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                  <p className="text-slate-500 text-sm">Searching...</p>
                </div>
              ) : searchResult.length > 0 ? (
                <div className="space-y-2">
                  {searchResult.map((u: any) => (
                    <div
                      key={u._id}
                      onClick={() => accessChat(u._id)}
                      className="flex items-center gap-4 bg-dark-bg hover:bg-dark-hover p-3 rounded-xl cursor-pointer transition-all border border-transparent hover:border-brand/30 group"
                    >
                      <div className="relative">
                        <img
                          src={u.pic}
                          alt={u.name}
                          className="w-12 h-12 rounded-xl object-cover border border-dark-border group-hover:border-brand/50 transition"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm group-hover:text-brand-light transition truncate">
                          {u.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{u.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : search && !loading ? (
                <div className="text-center py-12">
                  <p className="text-slate-500">No users found for "{search}"</p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-dark-hover flex items-center justify-center">
                    <FaSearch className="text-2xl text-slate-600" />
                  </div>
                  <p className="text-slate-500 text-sm">Start typing to find users</p>
                </div>
              )}

              {/* Loading Chat Indicator */}
              {loadingChat && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2">
                  <div className="bg-brand text-white text-sm px-4 py-2 rounded-full shadow-glow flex items-center gap-2 animate-pulse">
                    <FaSpinner className="animate-spin" />
                    Opening chat...
                  </div>
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