/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaPlus } from "react-icons/fa"; 
import useChatStore from "../../store/chatStore";
import { getSender } from "../../config/ChatLogics";
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

  return (
    <div
      className={`${
        selectedChat ? "hidden md:flex" : "flex"
      } flex-col p-4 bg-dark-surface w-full md:w-[31%] rounded-xl border border-dark-border h-full shadow-lg overflow-hidden`}
    >
      <div className="pb-4 px-2 flex w-full justify-between items-center border-b border-dark-border mb-2">
        <h2 className="text-xl font-bold text-white tracking-tight">Chats</h2>
        
        <GroupChatModal>
            <button
            className="flex items-center gap-2 bg-dark-bg border border-dark-border hover:border-brand hover:text-brand text-slate-300 px-3 py-1.5 rounded-lg transition-all duration-300 text-xs font-medium shadow-sm"
            >
            <FaPlus /> New Group
            </button>
        </GroupChatModal>
      </div>

      <div className="flex flex-col w-full h-full overflow-y-hidden">
        {chats ? (
          <div className="overflow-y-auto flex flex-col gap-2 h-full pr-1 custom-scrollbar">
            {chats.map((chat: Chat) => {
              const unreadCount = getUnreadCount(chat);
              
              return (
                <div
                  key={chat._id}
                  // --- CLICK HANDLER UPDATED ---
                  onClick={() => {
                    setSelectedChat(chat);
                    // Remove notifications associated with this chat ID
                    setNotification(notification.filter((n: any) => n.chat._id !== chat._id));
                  }}
                  className={`cursor-pointer px-4 py-4 rounded-lg transition-all duration-200 flex flex-col relative group border border-transparent ${
                    selectedChat === chat
                      ? "bg-brand/10 border-brand/20 shadow-inner" 
                      : "bg-transparent hover:bg-dark-hover hover:border-dark-border"
                  }`}
                >
                  {selectedChat === chat && (
                      <div className="absolute left-0 top-2 bottom-2 w-1 bg-brand rounded-r-full shadow-glow"></div>
                  )}

                  <div className="flex justify-between items-center w-full">
                      <div className="font-semibold text-sm md:text-base text-white group-hover:text-brand-light transition-colors truncate max-w-[70%]">
                        {!chat.isGroupChat
                            ? getSender(loggedUser, chat.users)
                            : chat.chatName}
                      </div>

                      {unreadCount > 0 && (
                        <div className="bg-brand text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-glow animate-pulse">
                          {unreadCount}
                        </div>
                      )}
                  </div>

                  {chat.latestMessage ? (
                      <p className={`text-xs mt-1 truncate transition ${unreadCount > 0 ? "text-brand-light font-bold" : "text-slate-500 group-hover:text-slate-400"}`}>
                          <span className="text-slate-400">{chat.latestMessage.sender.name}: </span>
                          {chat.latestMessage.content.length > 50
                          ? chat.latestMessage.content.substring(0, 51) + "..."
                          : chat.latestMessage.content}
                      </p>
                  ) : (
                      <p className="text-xs text-slate-600 mt-1 italic">No messages yet</p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
             <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-3">
                 <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin"></div>
                 <p className="text-xs">Syncing conversations...</p>
             </div>
        )}
      </div>
    </div>
  );
};

export default MyChats;