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
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-glow rounded-full blur-[120px] opacity-20"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900 rounded-full blur-[120px] opacity-20"></div>
      </div>

      <div className="relative z-10 flex flex-col h-full">
        {user && <Navbar />}

        <div className="flex flex-1 w-full h-[90vh] p-4 gap-4">
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