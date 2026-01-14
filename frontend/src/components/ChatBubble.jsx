export default function ChatBubble({ role, content }) {
  const isUser = role === "user";

  return (
    <div
      className={`p-3 rounded-xl max-w-[85%] ${
        isUser ? "ml-auto bg-zinc-800" : "mr-auto bg-zinc-700/60"
      }`}
    >
      <div className="text-xs text-zinc-300 mb-1">{isUser ? "You" : "Bot"}</div>
      <div className="whitespace-pre-wrap">{content}</div>
    </div>
  );
}
