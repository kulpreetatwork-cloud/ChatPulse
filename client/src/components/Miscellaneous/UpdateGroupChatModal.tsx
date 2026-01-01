/* eslint-disable @typescript-eslint/no-unused-expressions */
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaTimes, FaCog, FaSpinner, FaUserPlus, FaEdit, FaSignOutAlt } from "react-icons/fa";
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
  const [renameLoading, setRenameLoading] = useState(false);

  const handleRemove = async (user1: User) => {
    if (!selectedChat || !user) return;

    if (selectedChat.groupAdmin?._id !== user._id && user1._id !== user._id) {
      toast.error("Only admins can remove members");
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
      toast.success(user1._id === user._id ? "You left the group" : "Member removed");
      if (user1._id === user._id) setIsOpen(false);
    } catch {
      toast.error("Error removing member");
      setLoading(false);
    }
  };

  const handleAddUser = async (user1: User) => {
    if (!selectedChat || !user) return;

    if (selectedChat.users.find((u: User) => u._id === user1._id)) {
      toast.error("User already in group");
      return;
    }

    if (selectedChat.groupAdmin?._id !== user._id) {
      toast.error("Only admins can add members");
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
      setSearch("");
      setSearchResult([]);
      toast.success("Member added!");
    } catch {
      toast.error("Error adding member");
      setLoading(false);
    }
  };

  const handleRename = async () => {
    if (!groupChatName.trim()) return;
    if (!selectedChat || !user) return;

    try {
      setRenameLoading(true);
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
      setRenameLoading(false);
      setGroupChatName("");
      toast.success("Group renamed!");
    } catch {
      toast.error("Rename failed");
      setRenameLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearch(query);
    if (!query) {
      setSearchResult([]);
      return;
    }
    if (!user) return;

    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`/api/user?search=${query}`, config);
      setLoading(false);
      setSearchResult(data);
    } catch {
      setLoading(false);
      toast.error("Search failed");
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-slate-400 hover:text-brand hover:bg-dark-hover rounded-xl transition"
      >
        <FaCog size={18} />
      </button>

      {isOpen && selectedChat && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-dark-surface w-full max-w-md rounded-2xl border border-dark-border shadow-premium overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-dark-border bg-dark-bg/50">
              <div>
                <h3 className="text-lg font-bold text-white">{selectedChat.chatName}</h3>
                <p className="text-xs text-slate-500">{selectedChat.users.length} members</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-dark-hover rounded-lg transition"
              >
                <FaTimes />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-5 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {/* Members */}
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Members</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedChat.users.map((u: User) => (
                    <UserBadgeItem
                      key={u._id}
                      user={u}
                      isAdmin={selectedChat.groupAdmin?._id === u._id}
                      handleFunction={() => handleRemove(u)}
                    />
                  ))}
                </div>
              </div>

              {/* Rename Group */}
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FaEdit size={10} /> Rename Group
                </h4>
                <div className="flex gap-2">
                  <input
                    className="flex-1 bg-dark-bg border border-dark-border text-white p-3 rounded-xl outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 placeholder-slate-500 transition text-sm"
                    placeholder="New group name..."
                    value={groupChatName}
                    onChange={(e) => setGroupChatName(e.target.value)}
                  />
                  <button
                    onClick={handleRename}
                    disabled={renameLoading || !groupChatName.trim()}
                    className="bg-brand hover:bg-brand-hover text-white px-4 rounded-xl font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {renameLoading ? <FaSpinner className="animate-spin" /> : "Save"}
                  </button>
                </div>
              </div>

              {/* Add Members */}
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FaUserPlus size={10} /> Add Members
                </h4>
                <input
                  className="w-full bg-dark-bg border border-dark-border text-white p-3 rounded-xl outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 placeholder-slate-500 transition text-sm"
                  placeholder="Search users to add..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                />

                {/* Search Results */}
                <div className="mt-3 space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
                  {loading ? (
                    <div className="flex items-center justify-center py-4 gap-2 text-slate-500">
                      <FaSpinner className="animate-spin" />
                      <span className="text-sm">Searching...</span>
                    </div>
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
            <div className="p-5 border-t border-dark-border bg-dark-bg/50">
              <button
                onClick={() => user && handleRemove(user)}
                className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-medium py-3 rounded-xl transition"
              >
                <FaSignOutAlt />
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