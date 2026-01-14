export default function ChatInput({
  input,
  setInput,
  onSend,
  onMic,
  onStop,
  isListening,
  isSpeaking,
}) {
  return (
    <div className="mt-4 flex gap-2">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type or use mic..."
        className="flex-1 p-3 rounded-xl bg-zinc-950 border border-zinc-800 outline-none"
        onKeyDown={(e) => {
          if (e.key === "Enter") onSend();
        }}
      />

      <button
        onClick={onSend}
        className="px-4 py-3 rounded-xl bg-white text-black font-semibold"
        title="Send Message"
      >
        Send
      </button>

      {/* ✅ Mic toggle button */}
      <button
        onClick={onMic}
        className="px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700"
        title={isListening ? "Stop Listening" : "Start Listening"}
      >
        {isListening ? "🛑🎙️" : "🎤"}
      </button>

      {/* ✅ Stop Everything */}
      <button
        onClick={onStop}
        className="px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700"
        title="Stop Speaking / Stop Mic"
      >
        ⏹️
      </button>

      {/* ✅ Optional status indicator */}
      <div className="flex items-center text-xs text-zinc-400 pl-2">
        {isListening ? "Listening..." : isSpeaking ? "Speaking..." : "Idle"}
      </div>
    </div>
  );
}
