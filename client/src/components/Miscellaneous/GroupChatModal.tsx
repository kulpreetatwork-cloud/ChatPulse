/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, type ReactNode } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaTimes, FaUsers, FaSpinner } from "react-icons/fa";
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
  const [creating, setCreating] = useState(false);

  const handleSearch = async (query: string) => {
    setSearch(query);
    if (!query) {
      setSearchResult([]);
      return;
    }

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

  const handleGroup = (userToAdd: User) => {
    if (selectedUsers.find(u => u._id === userToAdd._id)) {
      toast.error("User already added");
      return;
    }
    setSelectedUsers([...selectedUsers, userToAdd]);
  };

  const handleDelete = (delUser: User) => {
    setSelectedUsers(selectedUsers.filter((sel) => sel._id !== delUser._id));
  };

  const handleSubmit = async () => {
    if (!groupChatName.trim()) {
      toast.error("Please enter a group name");
      return;
    }
    if (selectedUsers.length < 2) {
      toast.error("Please add at least 2 members");
      return;
    }

    try {
      setCreating(true);
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
      setCreating(false);
      setGroupChatName("");
      setSelectedUsers([]);
      setSearchResult([]);
      toast.success("Group created successfully!");
    } catch (error: any) {
      toast.error("Failed to create group");
      setCreating(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setGroupChatName("");
    setSelectedUsers([]);
    setSearchResult([]);
  };

  return (
    <>
      <span onClick={() => setIsOpen(true)}>{children}</span>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in"
          onClick={handleClose}
        >
          <div
            className="bg-dark-surface w-full max-w-md rounded-2xl border border-dark-border shadow-premium overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-dark-border bg-dark-bg/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand/20 flex items-center justify-center">
                  <FaUsers className="text-brand" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">New Group</h3>
                  <p className="text-xs text-slate-500">Add at least 2 members</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-dark-hover rounded-lg transition"
              >
                <FaTimes />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              {/* Group Name Input */}
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1.5 block">Group Name</label>
                <input
                  className="w-full bg-dark-bg border border-dark-border text-white p-3 rounded-xl outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 placeholder-slate-500 transition"
                  placeholder="Enter group name..."
                  value={groupChatName}
                  onChange={(e) => setGroupChatName(e.target.value)}
                />
              </div>

              {/* User Search Input */}
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1.5 block">Add Members</label>
                <input
                  className="w-full bg-dark-bg border border-dark-border text-white p-3 rounded-xl outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 placeholder-slate-500 transition"
                  placeholder="Search users..."
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>

              {/* Selected Users Badges */}
              {selectedUsers.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map((u) => (
                    <UserBadgeItem
                      key={u._id}
                      user={u}
                      handleFunction={() => handleDelete(u)}
                    />
                  ))}
                </div>
              )}

              {/* Search Results */}
              <div className="max-h-36 overflow-y-auto custom-scrollbar space-y-1">
                {loading ? (
                  <div className="flex items-center justify-center py-4 gap-2 text-slate-500">
                    <FaSpinner className="animate-spin" />
                    <span className="text-sm">Searching...</span>
                  </div>
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
            <div className="p-5 pt-0 flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 bg-dark-hover hover:bg-dark-muted text-slate-300 font-medium py-3 rounded-xl transition border border-dark-border"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={creating || !groupChatName.trim() || selectedUsers.length < 2}
                className="flex-1 bg-brand hover:bg-brand-hover text-white font-semibold py-3 rounded-xl transition shadow-glow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {creating ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Group"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GroupChatModal;