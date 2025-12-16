/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, type ReactNode } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { AiOutlineClose } from "react-icons/ai";
import useChatStore from "../../store/chatStore";
import UserListItem from "./UserListItem";
import UserBadgeItem from "./UserBadgeItem";

interface GroupChatModalProps {
  children: ReactNode;
}

interface User {
  _id: string;
  name: string;
  email: string;
  pic: string;
  token: string;
}

const GroupChatModal = ({ children }: GroupChatModalProps) => {
  const { user, chats, setChats } = useChatStore();

  const [isOpen, setIsOpen] = useState(false);
  const [groupChatName, setGroupChatName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  // 1. Handle Search
  const handleSearch = async (query: string) => {
    setSearch(query);
    if (!query) return;

    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      const { data } = await axios.get(`/api/user?search=${query}`, config);
      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      toast.error("Failed to load search results");
      setLoading(false);
    }
  };

  // 2. Add User to Group List
  const handleGroup = (userToAdd: User) => {
    if (selectedUsers.includes(userToAdd)) {
      toast.error("User already added");
      return;
    }
    setSelectedUsers([...selectedUsers, userToAdd]);
  };

  // 3. Remove User from Group List
  const handleDelete = (delUser: User) => {
    setSelectedUsers(selectedUsers.filter((sel) => sel._id !== delUser._id));
  };

  // 4. Submit Group Creation
  const handleSubmit = async () => {
    if (!groupChatName || !selectedUsers) {
      toast.error("Please fill all the fields");
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      
      const { data } = await axios.post(
        "/api/chat/group",
        {
          name: groupChatName,
          users: JSON.stringify(selectedUsers.map((u) => u._id)),
        },
        config
      );

      setChats([data, ...chats]);
      setIsOpen(false);
      toast.success("Group Chat Created!");
    } catch (error: any) {
      toast.error("Failed to create group");
    }
  };

  return (
    <>
      <span onClick={() => setIsOpen(true)}>{children}</span>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-dark-surface w-full max-w-lg rounded-xl border border-dark-border shadow-2xl flex flex-col overflow-hidden relative">
            
            {/* Header */}
            <div className="flex justify-between items-center p-5 border-b border-dark-border bg-dark-bg/50">
                <h3 className="text-xl font-bold text-white">Create Group Chat</h3>
                <button 
                    onClick={() => setIsOpen(false)}
                    className="text-slate-400 hover:text-white transition"
                >
                    <AiOutlineClose size={20} />
                </button>
            </div>

            {/* Body */}
            <div className="p-6 flex flex-col gap-4">
                {/* Group Name Input */}
                <input 
                    className="bg-dark-bg border border-dark-border text-white p-3 rounded-lg outline-none focus:border-brand focus:ring-1 focus:ring-brand placeholder-slate-500 transition"
                    placeholder="Group Name (e.g., Project Alpha)"
                    onChange={(e) => setGroupChatName(e.target.value)}
                />

                {/* User Search Input */}
                <input 
                    className="bg-dark-bg border border-dark-border text-white p-3 rounded-lg outline-none focus:border-brand focus:ring-1 focus:ring-brand placeholder-slate-500 transition"
                    placeholder="Add Users (e.g., John, Jane)"
                    onChange={(e) => handleSearch(e.target.value)}
                />

                {/* Selected Users Badges */}
                <div className="flex flex-wrap">
                    {selectedUsers.map((u) => (
                        <UserBadgeItem 
                            key={u._id} 
                            user={u} 
                            handleFunction={() => handleDelete(u)} 
                        />
                    ))}
                </div>

                {/* Search Results */}
                <div className="max-h-40 overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="text-center text-slate-500 py-2">Loading...</div>
                    ) : (
                        searchResult?.slice(0, 4).map((u) => (
                            <UserListItem 
                                key={u._id} 
                                user={u} 
                                handleFunction={() => handleGroup(u)} 
                            />
                        ))
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-dark-border flex justify-end bg-dark-bg/50">
                <button 
                    onClick={handleSubmit}
                    className="bg-brand hover:bg-brand-hover text-white font-medium py-2 px-6 rounded-lg transition shadow-glow"
                >
                    Create Group
                </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default GroupChatModal;