const TypingIndicator = () => {
  return (
    <div className="flex items-center gap-1.5 ml-10 mt-3 mb-1">
      <div className="flex items-center gap-1 bg-dark-hover px-4 py-3 rounded-2xl rounded-bl-md border border-dark-border/50">
        <div className="typing-dot" />
        <div className="typing-dot" />
        <div className="typing-dot" />
      </div>
    </div>
  );
};

export default TypingIndicator;