export default function ChatInput({
  input,
  setInput,
  onSend,
  onMic,
  onStop,
  isListening,
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
      >
        Send
      </button>

      <button
        onClick={onMic}
        disabled={isListening}
        className="px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700"
      >
        {isListening ? "🎙️" : "🎤"}
      </button>

      <button
        onClick={onStop}
        className="px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700"
      >
        ⏹️
      </button>
    </div>
  );
}
