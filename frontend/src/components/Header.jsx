import AudioWave from "./AudioWave";

export default function Header({ isListening, isSpeaking }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <AudioWave isActive={isListening || isSpeaking} />
      <h1 className="text-xl font-semibold">🎤 Smart Voice Bot</h1>
      <div className="text-sm text-zinc-300">
        {isListening ? "Listening..." : isSpeaking ? "Speaking..." : "Idle"}
      </div>
    </div>
  );
}
