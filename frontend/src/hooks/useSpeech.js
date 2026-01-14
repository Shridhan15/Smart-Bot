import { useEffect, useRef, useState } from "react";
// import { playElevenLabsAudio } from "../services/elevenLabsApi";

import { playAzureAudio } from "../services/azureSpeechApi";

export default function useSpeech() {
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [speechError, setSpeechError] = useState("");

    // Refs to keep objects alive during re-renders
    const recognitionRef = useRef(null);
    const silenceTimerRef = useRef(null);
    const currentAudioRef = useRef(null); // For ElevenLabs Audio
    const synthRef = useRef(window.speechSynthesis); // For Native Fallback

    useEffect(() => {
        // --- 1. Setup Speech Recognition ---
        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setSpeechError("Browser not supported (Use Chrome).");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = "en-IN";
        recognition.interimResults = true;
        recognition.continuous = true;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (e) => {
            // Ignore "no-speech" errors as they happen often in silence
            if (e.error !== 'no-speech') setSpeechError("Mic error: " + e.error);
            setIsListening(false);
        };

        recognitionRef.current = recognition;

        // Cleanup on unmount
        return () => {
            recognition.stop();
            if (currentAudioRef.current) {
                currentAudioRef.current.pause();
            }
            synthRef.current.cancel();
        };
    }, []);

    // --- 2. Listening Logic ---
    const startListening = (onResult) => {
        if (!recognitionRef.current) return;
        setSpeechError("");

        recognitionRef.current.onresult = (event) => {
            // Create a unified text string from results
            let interim = "";
            let final = "";

            for (let i = 0; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    final += event.results[i][0].transcript + " ";
                } else {
                    interim += event.results[i][0].transcript;
                }
            }

            // If we have final text, send it to the parent
            const totalText = (final + interim).trim();
            if (totalText && onResult) {
                onResult(totalText);
            }
        };

        try {
            recognitionRef.current.start();
        } catch (e) {
            // Already started
        }
    };

    const stopListening = () => {
        try {
            recognitionRef.current?.stop();
        } catch (e) { }
        setIsListening(false);
    };

    // --- 3. Speaking Logic (The Hybrid Fix) ---
    const speak = async (text) => {
        if (!text) return;
        setIsSpeaking(true);
        setSpeechError("");

        // 1. Stop any existing audio (Native or ElevenLabs)
        if (currentAudioRef.current) {
            currentAudioRef.current.pause();
            currentAudioRef.current = null;
        }
        synthRef.current.cancel();

        try {
            // --- Try ElevenLabs ---
            // const audio = await playElevenLabsAudio(text);

            // Switch to Azure
            const audio = await playAzureAudio(text);

            // SAFETY CHECK: If function returned undefined, throw error manually
            if (!audio) throw new Error("Audio object is undefined");

            currentAudioRef.current = audio;

            audio.onended = () => {
                setIsSpeaking(false);
                currentAudioRef.current = null;
            };

        } catch (err) {
            // --- Fallback to Native ---
            console.warn("Switching to native voice due to error:", err.message);

            // Small delay to prevent "Interrupted" error caused by the previous .cancel()
            setTimeout(() => {
                const utter = new SpeechSynthesisUtterance(text);

                // Force a voice (improves stability)
                const voices = synthRef.current.getVoices();
                utter.voice = voices.find(v => v.lang.includes('en')) || null;

                // Keep reference alive
                window.currentUtterance = utter;

                utter.onstart = () => setIsSpeaking(true);
                utter.onend = () => {
                    setIsSpeaking(false);
                    delete window.currentUtterance;
                };

                utter.onerror = (e) => {
                    // Ignore "interrupted" errors, they happen when typing fast
                    if (e.error !== 'interrupted') {
                        console.error("Native TTS Error", e);
                        setIsSpeaking(false);
                    }
                };

                synthRef.current.speak(utter);
            }, 50); // 50ms delay is usually enough
        }
    };

    const stopSpeaking = () => {
        if (currentAudioRef.current) {
            currentAudioRef.current.pause();
            setIsSpeaking(false);
        }
        synthRef.current.cancel();
        setIsSpeaking(false);
    };

    return {
        isListening,
        isSpeaking,
        speechError,
        startListening,
        stopListening,
        speak,
        stopSpeaking,
    };
}