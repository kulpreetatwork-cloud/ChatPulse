import { useRef, useEffect, useState } from "react";
import axios from "axios";
import useChatStore from "../../store/chatStore";

interface Sender {
  _id: string;
  name: string;
  pic: string;
  email: string;
}

interface Reaction {
  user: { _id: string; name: string; pic: string } | string;
  emoji: string;
}

interface Message {
  _id: string;
  content: string;
  sender: Sender;
  createdAt?: string;
  reactions?: Reaction[];
  readBy?: { _id: string; name: string; pic: string }[];
}

interface ScrollableChatProps {
  messages: Message[];
  onReactionUpdate?: (updatedMessage: Message) => void;
}

const EMOJI_OPTIONS = ["👍", "❤️", "😂", "😮", "😢", "😡"];

const ScrollableChat = ({ messages, onReactionUpdate }: ScrollableChatProps) => {
  const { user, selectedChat } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [activeReactionPicker, setActiveReactionPicker] = useState<string | null>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Close reaction picker on click outside
  useEffect(() => {
    const handleClick = () => setActiveReactionPicker(null);
    if (activeReactionPicker) {
      document.addEventListener("click", handleClick);
      return () => document.removeEventListener("click", handleClick);
    }
  }, [activeReactionPicker]);

  if (!user) return null;

  const isImage = (content: string) => {
    return content.includes("cloudinary.com") &&
      (content.endsWith(".png") || content.endsWith(".jpg") || content.endsWith(".jpeg") || content.includes("/image/upload/"));
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const isNewSender = (index: number) => {
    if (index === 0) return true;
    return messages[index].sender._id !== messages[index - 1].sender._id;
  };

  const shouldShowAvatar = (index: number) => {
    const isLastInThread = index === messages.length - 1 ||
      messages[index + 1].sender._id !== messages[index].sender._id;
    return isLastInThread;
  };

  const toggleReaction = async (messageId: string, emoji: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveReactionPicker(null);

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put(`/api/message/${messageId}/react`, { emoji }, config);

      if (onReactionUpdate) {
        onReactionUpdate(data);
      }
    } catch (error) {
      console.error("Failed to add reaction:", error);
    }
  };

  // Group reactions by emoji and get count
  const getReactionGroups = (reactions: Reaction[] = []) => {
    const groups: { [emoji: string]: { count: number; users: string[]; hasUserReacted: boolean } } = {};

    reactions.forEach((r) => {
      const userId = typeof r.user === "string" ? r.user : r.user._id;
      const userName = typeof r.user === "string" ? "User" : r.user.name;

      if (!groups[r.emoji]) {
        groups[r.emoji] = { count: 0, users: [], hasUserReacted: false };
      }
      groups[r.emoji].count++;
      groups[r.emoji].users.push(userName);
      if (userId === user._id) {
        groups[r.emoji].hasUserReacted = true;
      }
    });

    return groups;
  };

  // Check if message is read by all recipients
  const isReadByAll = (message: Message) => {
    if (!selectedChat || !message.readBy) return false;
    const recipients = selectedChat.users.filter((u: any) => u._id !== user._id);
    return recipients.every((r: any) =>
      message.readBy?.some((reader) => {
        const readerId = typeof reader === "string" ? reader : reader._id;
        return readerId === r._id;
      })
    );
  };

  return (
    <div className="flex flex-col h-full px-2 md:px-4 py-2">
      {messages &&
        messages.map((m: Message, i: number) => {
          const isOwnMessage = m.sender._id === user._id;
          const isImageMsg = isImage(m.content);
          const showAvatar = shouldShowAvatar(i) && !isOwnMessage;
          const isFirstInGroup = isNewSender(i);
          const reactionGroups = getReactionGroups(m.reactions);
          const hasReactions = Object.keys(reactionGroups).length > 0;
          const isRead = isReadByAll(m);

          return (
            <div
              key={m._id}
              className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
              style={{ marginTop: isFirstInGroup ? 12 : 2, marginBottom: hasReactions ? 14 : 0 }}
            >
              <div className={`flex items-end gap-2 max-w-[75%] ${isOwnMessage ? "flex-row-reverse" : ""}`}>
                {/* Avatar - Only for received messages */}
                {!isOwnMessage && (
                  <div className="flex-shrink-0 w-8">
                    {showAvatar ? (
                      <img
                        src={m.sender.pic}
                        alt={m.sender.name}
                        title={m.sender.name}
                        className="w-8 h-8 rounded-lg object-cover border border-dark-border hover:border-brand/50 transition-all cursor-pointer"
                      />
                    ) : null}
                  </div>
                )}

                {/* Message Bubble */}
                <div className="relative group">
                  {isImageMsg ? (
                    <img
                      src={m.content}
                      alt="attachment"
                      className={`rounded-2xl max-w-[250px] md:max-w-[300px] border-2 object-cover cursor-pointer hover:opacity-90 transition shadow-lg ${isOwnMessage ? "border-brand/30" : "border-dark-border"
                        }`}
                      onClick={() => window.open(m.content, "_blank")}
                    />
                  ) : (
                    <div
                      className={`px-4 py-2.5 ${isOwnMessage
                        ? "bg-gradient-to-br from-brand to-brand-hover text-white rounded-2xl rounded-br-sm shadow-lg"
                        : "bg-dark-hover text-slate-100 border border-dark-border/50 rounded-2xl rounded-bl-sm"
                        }`}
                    >
                      <p className="text-[15px] leading-relaxed break-words whitespace-pre-wrap">
                        {m.content}
                      </p>
                    </div>
                  )}

                  {/* Reaction Picker Button (appears on hover) */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveReactionPicker(activeReactionPicker === m._id ? null : m._id);
                    }}
                    className={`absolute ${isOwnMessage ? "-left-8" : "-right-8"} top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 bg-dark-surface border border-dark-border rounded-lg hover:bg-dark-hover transition-all text-sm`}
                  >
                    😊
                  </button>

                  {/* Reaction Picker Popup */}
                  {activeReactionPicker === m._id && (
                    <div
                      className={`absolute ${isOwnMessage ? "right-0" : "left-0"} -top-12 z-20 flex gap-1 bg-dark-surface border border-dark-border rounded-xl p-2 shadow-premium animate-fade-in`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {EMOJI_OPTIONS.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={(e) => toggleReaction(m._id, emoji, e)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-dark-hover rounded-lg transition-all hover:scale-110 text-lg"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Display Reactions */}
                  {hasReactions && (
                    <div className={`absolute -bottom-5 ${isOwnMessage ? "right-0" : "left-0"} flex gap-1`}>
                      {Object.entries(reactionGroups).map(([emoji, data]) => (
                        <button
                          key={emoji}
                          onClick={(e) => toggleReaction(m._id, emoji, e)}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-all ${data.hasUserReacted
                            ? "bg-brand/20 border-brand/50 text-brand-light"
                            : "bg-dark-surface border-dark-border hover:border-brand/30"
                            }`}
                          title={data.users.join(", ")}
                        >
                          <span>{emoji}</span>
                          {data.count > 1 && <span>{data.count}</span>}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Timestamp & Read Receipt */}
                  <div
                    className={`absolute ${isOwnMessage ? "right-0" : "left-0"} ${hasReactions ? "-bottom-10" : "-bottom-5"} flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-slate-500 whitespace-nowrap`}
                  >
                    {formatTime(m.createdAt)}
                    {/* Read receipts - only for own messages */}
                    {isOwnMessage && (
                      <span className={isRead ? "text-brand" : "text-slate-500"}>
                        {isRead ? "✓✓" : "✓"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

      {/* Invisible element to scroll to */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ScrollableChat;