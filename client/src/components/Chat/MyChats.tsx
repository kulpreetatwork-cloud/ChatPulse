/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaPlus, FaUsers } from "react-icons/fa";
import useChatStore from "../../store/chatStore";
import { getSender, getSenderFull } from "../../config/ChatLogics";
import GroupChatModal from "../Miscellaneous/GroupChatModal";

interface User {
  _id: string;
  name: string;
  email: string;
  pic: string;
  token: string;
}

interface Chat {
  _id: string;
  chatName: string;
  isGroupChat: boolean;
  users: User[];
  latestMessage?: {
    content: string;
    sender: User;
  };
  groupAdmin?: User;
}

interface MyChatsProps {
  fetchAgain: boolean;
}

const MyChats = ({ fetchAgain }: MyChatsProps) => {
  const [loggedUser, setLoggedUser] = useState<User | null>(null);

  const { user, selectedChat, setSelectedChat, chats, setChats, notification, setNotification } = useChatStore();

  const fetchChats = async () => {
    if (!user) return;

    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };

      const { data } = await axios.get("/api/chat", config);
      setChats(data);
    } catch {
      toast.error("Failed to load the chats");
    }
  };

  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoggedUser(userInfo ? JSON.parse(userInfo) : null);

    fetchChats();
    // eslint-disable-next-line
  }, [user, fetchAgain]);

  const getUnreadCount = (chat: Chat) => {
    return notification.filter((n: any) => String(n.chat._id) === String(chat._id)).length;
  };

  const getChatAvatar = (chat: Chat) => {
    if (chat.isGroupChat) {
      return null; // Will show icon instead
    }
    const otherUser = getSenderFull(loggedUser, chat.users);
    return otherUser?.pic;
  };

  const formatLatestMessage = (content: string) => {
    // Check if it's an image
    if (content.includes("cloudinary.com")) {
      return "📷 Image";
    }
    return content.length > 35 ? content.substring(0, 35) + "..." : content;
  };

  return (
    <div
      className={`${selectedChat ? "hidden md:flex" : "flex"
        } flex-col bg-dark-surface/60 backdrop-blur-sm w-full md:w-80 lg:w-96 rounded-2xl border border-dark-border overflow-hidden shadow-glass`}
    >
      {/* Header */}
      <div className="p-4 flex justify-between items-center border-b border-dark-border/50">
        <h2 className="text-lg font-bold text-white">Messages</h2>

        <GroupChatModal>
          <button className="flex items-center gap-2 bg-brand/10 hover:bg-brand/20 border border-brand/30 hover:border-brand/50 text-brand px-3 py-2 rounded-xl transition-all duration-300 text-xs font-semibold">
            <FaPlus size={10} />
            New Group
          </button>
        </GroupChatModal>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {chats ? (
          chats.length > 0 ? (
            <div className="p-2 space-y-1">
              {chats.map((chat: Chat) => {
                const unreadCount = getUnreadCount(chat);
                const isSelected = selectedChat?._id === chat._id;
                const avatar = getChatAvatar(chat);

                return (
                  <div
                    key={chat._id}
                    onClick={() => {
                      setSelectedChat(chat);
                      setNotification(notification.filter((n: any) => n.chat._id !== chat._id));
                    }}
                    className={`relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 group ${isSelected
                        ? "bg-brand/15 border border-brand/30"
                        : "hover:bg-dark-hover border border-transparent hover:border-dark-border"
                      }`}
                  >
                    {/* Selection Indicator */}
                    {isSelected && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-brand rounded-r-full" />
                    )}

                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      {avatar ? (
                        <img
                          src={avatar}
                          alt="avatar"
                          className={`w-12 h-12 rounded-xl object-cover border-2 transition-colors ${isSelected ? "border-brand/50" : "border-dark-border group-hover:border-brand/30"
                            }`}
                        />
                      ) : (
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-colors ${isSelected
                              ? "bg-brand/20 border-brand/50"
                              : "bg-dark-hover border-dark-border group-hover:border-brand/30"
                            }`}
                        >
                          <FaUsers className={`${isSelected ? "text-brand" : "text-slate-500"}`} />
                        </div>
                      )}

                      {/* Unread Badge on Avatar */}
                      {unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-brand text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-dark-surface animate-pulse">
                          {unreadCount}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={`font-semibold text-sm truncate transition-colors ${isSelected ? "text-white" : "text-slate-200 group-hover:text-white"
                            }`}
                        >
                          {!chat.isGroupChat ? getSender(loggedUser, chat.users) : chat.chatName}
                        </p>
                      </div>

                      {/* Latest Message */}
                      {chat.latestMessage ? (
                        <p
                          className={`text-xs mt-0.5 truncate ${unreadCount > 0 ? "text-brand-light font-medium" : "text-slate-500"
                            }`}
                        >
                          <span className="text-slate-600">
                            {chat.latestMessage.sender.name.split(" ")[0]}:{" "}
                          </span>
                          {formatLatestMessage(chat.latestMessage.content)}
                        </p>
                      ) : (
                        <p className="text-xs text-slate-600 mt-0.5 italic">Start a conversation</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-dark-hover flex items-center justify-center mb-4">
                <FaUsers className="text-2xl text-slate-600" />
              </div>
              <p className="text-slate-400 font-medium mb-1">No conversations yet</p>
              <p className="text-slate-600 text-sm">Search for users to start chatting</p>
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="w-10 h-10 border-2 border-brand border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-500">Loading chats...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyChats;