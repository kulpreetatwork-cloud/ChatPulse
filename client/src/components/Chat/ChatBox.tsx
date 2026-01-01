import useChatStore from "../../store/chatStore";
import SingleChat from "./SingleChat";

interface ChatBoxProps {
  fetchAgain: boolean;
  setFetchAgain: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChatBox = ({ fetchAgain, setFetchAgain }: ChatBoxProps) => {
  const { selectedChat } = useChatStore();

  return (
    <div
      className={`${selectedChat ? "flex" : "hidden md:flex"
        } flex-1 flex-col bg-dark-surface/60 backdrop-blur-sm rounded-2xl border border-dark-border overflow-hidden shadow-glass transition-all duration-300`}
    >
      <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
    </div>
  );
};

export default ChatBox;