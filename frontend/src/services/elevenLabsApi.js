const API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
const VOICE_ID = "21m00Tcm4TlvDq8ikWAM";

export const playElevenLabsAudio = async (text) => {
    // 1. Check Key immediately
    if (!API_KEY) throw new Error("Missing API Key in .env");
    console.log("DEBUG KEY:", API_KEY);

    const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "xi-api-key": API_KEY,
            },
            body: JSON.stringify({
                text: text,
                model_id: "eleven_v3",
                voice_settings: { stability: 0.5, similarity_boost: 0.5 },
            }),
        }
    );

    // 2. Check for 401/500 errors explicitly
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail?.message || "ElevenLabs API Error");
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);

    await audio.play();
    return audio;
};