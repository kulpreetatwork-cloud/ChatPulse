const TypingIndicator = () => {
  return (
    <div className="flex items-center gap-1 bg-dark-hover w-16 px-4 py-3 rounded-2xl rounded-tl-none border border-dark-border/50 ml-2 mt-2">
      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
    </div>
  );
};

export default TypingIndicator;