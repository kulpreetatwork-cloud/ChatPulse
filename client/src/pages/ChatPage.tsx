import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useChatStore from "../store/chatStore";
import Navbar from "../components/Miscellaneous/Navbar";
import MyChats from "../components/Chat/MyChats";
import ChatBox from "../components/Chat/ChatBox";

const ChatPage = () => {
  const { user, setUser } = useChatStore();
  const navigate = useNavigate();

  // State Lifting: Triggers sidebar refresh
  const [fetchAgain, setFetchAgain] = useState(false);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "null");

    if (!userInfo) {
      navigate("/");
    } else {
      setUser(userInfo);
    }
  }, [navigate, setUser]);

  return (
    <div className="w-full h-screen bg-dark-bg flex flex-col overflow-hidden relative">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs */}
        <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] bg-brand/15 rounded-full blur-[150px] animate-float-slow" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[600px] h-[600px] bg-accent-purple/10 rounded-full blur-[180px] animate-float-slow animate-delay-300" />
        <div className="absolute top-1/2 right-1/4 w-[300px] h-[300px] bg-accent-cyan/5 rounded-full blur-[100px]" />

        {/* Subtle Grid */}
        <div className="absolute inset-0 bg-grid opacity-20" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col h-full">
        {user && <Navbar />}

        <div className="flex flex-1 w-full p-3 md:p-4 gap-3 md:gap-4 overflow-hidden">
          {/* Sidebar */}
          {user && <MyChats fetchAgain={fetchAgain} />}

          {/* Chat Window */}
          {user && <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;