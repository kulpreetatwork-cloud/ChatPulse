import ScrollableFeed from "react-scrollable-feed";
import { isLastMessage, isSameSender, isSameSenderMargin, isSameUser } from "../../config/ChatLogics";
import useChatStore from "../../store/chatStore";

interface Sender {
  _id: string;
  name: string;
  pic: string;
  email: string;
}

interface Message {
  _id: string;
  content: string;
  sender: Sender;
}

interface ScrollableChatProps {
  messages: Message[];
}

const ScrollableChat = ({ messages }: ScrollableChatProps) => {
  const { user } = useChatStore();

  if (!user) return null;

  const isImage = (content: string) => {
    return content.includes("cloudinary.com") && (content.endsWith(".png") || content.endsWith(".jpg") || content.endsWith(".jpeg") || content.includes("/image/upload/"));
  };

  return (
    <ScrollableFeed className="custom-scrollbar px-2">
      {messages &&
        messages.map((m: Message, i: number) => (
          <div className="flex" key={m._id}>
            {/* Avatar Logic */}
            {(isSameSender(messages, m, i, user._id) ||
              isLastMessage(messages, i, user._id)) && (
              <div className="mr-2 cursor-pointer mt-[7px] tooltip" data-tip={m.sender.name}>
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-dark-border shadow-sm hover:scale-110 transition-transform">
                     <img 
                        src={m.sender.pic} 
                        alt={m.sender.name} 
                        className="w-full h-full object-cover" 
                     />
                  </div>
              </div>
            )}

            <span
              style={{
                marginLeft: isSameSenderMargin(messages, m, i, user._id),
                marginTop: isSameUser(messages, m, i) ? 3 : 10,
              }}
              // FIX: Use 'inline-block' with 'max-w' to fit content perfectly without expanding or squashing
              className={`inline-block max-w-[75%] break-words text-sm md:text-[15px] shadow-sm transition-all hover:shadow-md ${
                isImage(m.content) 
                    ? "p-0 bg-transparent border-none" 
                    : m.sender._id === user._id 
                        ? "bg-gradient-to-r from-brand to-brand-hover text-white rounded-l-2xl rounded-tr-2xl rounded-br-md px-5 py-2.5" 
                        : "bg-dark-hover text-slate-200 border border-dark-border/50 rounded-r-2xl rounded-tl-2xl rounded-bl-md px-5 py-2.5"
              }`}
            >
              {isImage(m.content) ? (
                  <img 
                    src={m.content} 
                    alt="attachment" 
                    className="rounded-xl max-w-[250px] md:max-w-[300px] border border-dark-border object-cover cursor-pointer hover:opacity-90 transition"
                    onClick={() => window.open(m.content, "_blank")}
                  />
              ) : (
                  m.content
              )}
            </span>
          </div>
        ))}
    </ScrollableFeed>
  );
};

export default ScrollableChat;