/* eslint-disable @typescript-eslint/no-unused-expressions */
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { AiOutlineClose } from "react-icons/ai";
import { FaCog } from "react-icons/fa";
import useChatStore from "../../store/chatStore";
import UserBadgeItem from "./UserBadgeItem";
import UserListItem from "./UserListItem";

interface User {
  _id: string;
  name: string;
  email: string;
  pic: string;
  token: string;
}

// Use strict types for props
interface UpdateGroupChatModalProps {
  fetchAgain: boolean;
  setFetchAgain: (val: boolean) => void;
  fetchMessages: () => void;
}

const UpdateGroupChatModal = ({ fetchAgain, setFetchAgain, fetchMessages }: UpdateGroupChatModalProps) => {
  const { user, selectedChat, setSelectedChat } = useChatStore();

  const [isOpen, setIsOpen] = useState(false);
  const [groupChatName, setGroupChatName] = useState("");
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [renameloading, setRenameloading] = useState(false);

  // 1. Remove User / Leave Group
  const handleRemove = async (user1: User) => {
    // FIX: TypeScript Guard Clause
    if (!selectedChat || !user) return;
    
    // Check if groupAdmin exists before accessing _id
    if (selectedChat.groupAdmin?._id !== user._id && user1._id !== user._id) {
      toast.error("Only admins can remove someone!");
      return;
    }

    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      const { data } = await axios.put(
        `/api/chat/groupremove`,
        {
          chatId: selectedChat._id,
          userId: user1._id,
        },
        config
      );

      user1._id === user._id ? setSelectedChat(null) : setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      fetchMessages();
      setLoading(false);
      toast.success(user1._id === user._id ? "You left the group" : "User Removed");
    } catch {
      toast.error("Error removing user");
      setLoading(false);
    }
  };

  // 2. Add User to Group
  const handleAddUser = async (user1: User) => {
    // FIX: TypeScript Guard Clause
    if (!selectedChat || !user) return;

    if (selectedChat.users.find((u: User) => u._id === user1._id)) {
      toast.error("User Already in group!");
      return;
    }

    // Check if groupAdmin exists
    if (selectedChat.groupAdmin?._id !== user._id) {
      toast.error("Only admins can add someone!");
      return;
    }

    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      const { data } = await axios.put(
        `/api/chat/groupadd`,
        {
          chatId: selectedChat._id,
          userId: user1._id,
        },
        config
      );

      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setLoading(false);
      toast.success("User Added!");
    } catch {
      toast.error("Error Adding User");
      setLoading(false);
    }
  };

  // 3. Rename Group
  const handleRename = async () => {
    if (!groupChatName) return;
    // FIX: TypeScript Guard Clause
    if (!selectedChat || !user) return;

    try {
      setRenameloading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      const { data } = await axios.put(
        `/api/chat/rename`,
        {
          chatId: selectedChat._id,
          chatName: groupChatName,
        },
        config
      );

      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setRenameloading(false);
      setGroupChatName(""); 
      toast.success("Group Name Updated!");
    } catch {
      toast.error("Rename Failed");
      setRenameloading(false);
    }
  };

  // 4. Search Users
  const handleSearch = async (query: string) => {
    setSearch(query);
    if (!query) return;
    if (!user) return;

    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`/api/user?search=${query}`, config);
      setLoading(false);
      setSearchResult(data);
    } catch {
      setLoading(false);
      toast.error("Failed to load search results");
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        className="p-2 text-slate-400 hover:text-brand transition hover:bg-dark-hover rounded-full"
      >
        <FaCog size={20} />
      </button>

      {isOpen && selectedChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-dark-surface w-full max-w-lg rounded-xl border border-dark-border shadow-2xl flex flex-col overflow-hidden relative">
            
            {/* Header */}
            <div className="flex justify-between items-center p-5 border-b border-dark-border bg-dark-bg/50">
                {/* Use optional chaining for safety */}
                <h3 className="text-xl font-bold text-white">{selectedChat.chatName}</h3>
                <button 
                    onClick={() => setIsOpen(false)}
                    className="text-slate-400 hover:text-white transition"
                >
                    <AiOutlineClose size={20} />
                </button>
            </div>

            {/* Body */}
            <div className="p-6 flex flex-col gap-6">
                
                {/* Current Members List */}
                <div className="flex flex-wrap gap-1">
                    {selectedChat.users.map((u: User) => (
                        <UserBadgeItem
                            key={u._id}
                            user={u}
                            handleFunction={() => handleRemove(u)}
                        />
                    ))}
                </div>

                {/* Rename Section */}
                <div className="flex gap-2">
                    <input 
                        className="w-full bg-dark-bg border border-dark-border text-white p-3 rounded-lg outline-none focus:border-brand focus:ring-1 focus:ring-brand placeholder-slate-500 transition"
                        placeholder="Rename Group..."
                        value={groupChatName}
                        onChange={(e) => setGroupChatName(e.target.value)}
                    />
                    <button 
                        onClick={handleRename}
                        disabled={renameloading}
                        className="bg-brand hover:bg-brand-hover text-white px-4 rounded-lg font-medium transition disabled:opacity-50"
                    >
                        {renameloading ? "..." : "Update"}
                    </button>
                </div>

                {/* Add User Section */}
                <div>
                     <input 
                        className="w-full bg-dark-bg border border-dark-border text-white p-3 rounded-lg outline-none focus:border-brand focus:ring-1 focus:ring-brand placeholder-slate-500 transition mb-3"
                        placeholder="Add User to Group"
                        value={search} 
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                     
                     {/* Search Results */}
                     <div className="max-h-40 overflow-y-auto custom-scrollbar">
                        {loading ? (
                            <div className="text-center text-slate-500 text-sm">Loading...</div>
                        ) : (
                            searchResult?.slice(0, 4).map((u: User) => (
                                <UserListItem
                                    key={u._id}
                                    user={u}
                                    handleFunction={() => handleAddUser(u)}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-dark-border flex justify-end bg-dark-bg/50">
                <button 
                    onClick={() => user && handleRemove(user)} 
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/50 font-medium py-2 px-6 rounded-lg transition"
                >
                    Leave Group
                </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UpdateGroupChatModal;