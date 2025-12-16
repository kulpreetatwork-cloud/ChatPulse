/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";

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

// 1. Add Notification Type
interface ChatState {
  user: User | null;
  selectedChat: Chat | null;
  chats: Chat[];
  notification: any[]; // New State for Notifications

  setUser: (user: User | null) => void;
  setSelectedChat: (chat: Chat | null) => void;
  setChats: (chats: Chat[]) => void;
  setNotification: (notification: any[]) => void; // New Action
  logout: () => void;
}

const useChatStore = create<ChatState>((set) => ({
  user: JSON.parse(localStorage.getItem("userInfo") || "null"),
  selectedChat: null,
  chats: [],
  notification: [], // Initial state is empty

  setUser: (user) => set({ user }),
  setSelectedChat: (chat) => set({ selectedChat: chat }),
  setChats: (chats) => set({ chats }),
  setNotification: (notification) => set({ notification }), // Action implementation
  logout: () => {
    localStorage.removeItem("userInfo");
    set({ user: null, selectedChat: null, chats: [], notification: [] });
  },
}));

export default useChatStore;