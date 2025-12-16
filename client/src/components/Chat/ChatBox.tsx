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
      className={`${
        selectedChat ? "flex" : "hidden md:flex"
      } flex-col bg-dark-surface w-full md:w-[68%] rounded-xl border border-dark-border h-full overflow-hidden shadow-xl`}
    >
      <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
    </div>
  );
};

export default ChatBox;