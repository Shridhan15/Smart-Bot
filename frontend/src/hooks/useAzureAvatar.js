import { useState, useRef, useEffect } from "react";
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";

export default function useAzureAvatar() {
    const [viseme, setViseme] = useState(0);
    const [isSpeaking, setIsSpeaking] = useState(false);

    // Refs for state that doesn't trigger re-renders
    const audioPlayerRef = useRef(null);
    const visemeQueueRef = useRef([]);
    const syncIntervalRef = useRef(null);

    const stop = () => {
        if (audioPlayerRef.current) {
            audioPlayerRef.current.pause();
            audioPlayerRef.current = null;
        }
        if (syncIntervalRef.current) {
            clearInterval(syncIntervalRef.current);
        }
        setViseme(0);
        setIsSpeaking(false);
    };

    const speak = async (text) => {
        stop(); // Stop any previous speech
        setIsSpeaking(true);
        visemeQueueRef.current = [];

        const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
            import.meta.env.VITE_AZURE_SPEECH_KEY,
            import.meta.env.VITE_AZURE_REGION
        );

        // 1. Voice Settings
        speechConfig.speechSynthesisVoiceName = "en-IN-PrabhatNeural"; // Indian Male

        // 2. DISABLE Automatic Playback (We will play it manually to sync lips)
        const synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig, null);

        // 3. Capture Visemes (Mouth Shapes) into a Queue
        synthesizer.visemeReceived = (s, e) => {
            // Azure sends "AudioOffset" in ticks (100ns). Divide by 10,000 to get milliseconds.
            visemeQueueRef.current.push({
                offset: e.audioOffset / 10000, // Convert to ms
                id: e.visemeId
            });
        };

        return new Promise((resolve, reject) => {
            // 4. Synthesize (Download Audio + Visemes)
            synthesizer.speakTextAsync(
                text,
                (result) => {
                    if (result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted) {

                        // 5. Create Audio Object from the downloaded data
                        const blob = new Blob([result.audioData], { type: "audio/wav" });
                        const url = URL.createObjectURL(blob);
                        const audio = new Audio(url);
                        audioPlayerRef.current = audio;

                        // 6. START PLAYBACK & ANIMATION LOOP
                        audio.play();

                        // 7. SYNC LOOP: Check every 20ms which mouth shape to show
                        syncIntervalRef.current = setInterval(() => {
                            if (!audio || audio.paused || audio.ended) {
                                stop();
                                resolve();
                                return;
                            }

                            // Current Audio Time in Milliseconds
                            const currentTimeMs = audio.currentTime * 1000;

                            // Find the last viseme that happened before this time
                            // (Iterate backwards to find the closest one)
                            const queue = visemeQueueRef.current;
                            for (let i = queue.length - 1; i >= 0; i--) {
                                if (queue[i].offset <= currentTimeMs) {
                                    setViseme(queue[i].id); // Update Mouth
                                    break;
                                }
                            }
                        }, 20); // 20ms = 50fps update rate

                        audio.onended = () => {
                            stop();
                            resolve();
                        };

                    } else {
                        console.error("Speech Synthesis Failed", result.errorDetails);
                        stop();
                        reject(result.errorDetails);
                    }
                    synthesizer.close();
                },
                (error) => {
                    console.error(error);
                    stop();
                    reject(error);
                }
            );
        });
    };

    return { speak, stop, viseme, isSpeaking };
}