import { useState } from "react";
import Header from "../components/Header";
import ChatBubble from "../components/ChatBubble";
import ChatInput from "../components/ChatInput";
import useSpeech from "../hooks/useSpeech";
import { sendChatMessage } from "../services/chatApi";

export default function VoiceChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  const {
    isListening,
    isSpeaking,
    speechError,
    startListening,
    speak,
    stopSpeaking,
  } = useSpeech();

  const handleSend = async (textOverride) => {
    const userText = (textOverride ?? input).trim();
    if (!userText) return;

    setError("");

    const userMsg = { role: "user", content: userText };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    try {
      const history = messages.slice(-10);

      const data = await sendChatMessage({
        message: userText,
        history,
      });

      const botReply = data.reply || "No reply";

      const botMsg = { role: "assistant", content: botReply };
      setMessages((prev) => [...prev, botMsg]);

      speak(botReply);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleMic = () => {
    startListening((spokenText) => {
      setInput(spokenText);
      // ✅ optionally auto-send after speaking:
      // handleSend(spokenText);
    });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-zinc-900/60 rounded-2xl shadow-lg border border-zinc-800 p-4">
        <Header isListening={isListening} isSpeaking={isSpeaking} />

        {(error || speechError) && (
          <div className="mb-3 p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-200">
            {error || speechError}
          </div>
        )}

        <div className="h-[420px] overflow-y-auto rounded-xl bg-zinc-950/60 border border-zinc-800 p-3 space-y-3">
          {messages.length === 0 ? (
            <div className="text-zinc-400 text-sm">
              Say something like: <br />
              <span className="text-zinc-200">
                “Explain cloud security in simple words”
              </span>
            </div>
          ) : (
            messages.map((m, idx) => (
              <ChatBubble key={idx} role={m.role} content={m.content} />
            ))
          )}
        </div>

        <ChatInput
          input={input}
          setInput={setInput}
          onSend={() => handleSend()}
          onMic={handleMic}
          onStop={stopSpeaking}
          isListening={isListening}
        />
      </div>
    </div>
  );
}
