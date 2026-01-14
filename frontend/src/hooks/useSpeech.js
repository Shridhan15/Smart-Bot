import { useEffect, useRef, useState } from "react";

export default function useSpeech() {
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [speechError, setSpeechError] = useState("");

    const recognitionRef = useRef(null);
    const shouldKeepListeningRef = useRef(false);

    useEffect(() => {
        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setSpeechError("Speech Recognition not supported (use Chrome/Edge).");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = "en-IN";
        recognition.interimResults = true; // ✅ partial results
        recognition.continuous = true;     // ✅ don't stop on small pauses

        recognition.onstart = () => {
            setIsListening(true);
            setSpeechError("");
        };

        recognition.onend = () => {
            setIsListening(false);

            // ✅ Auto restart if user didn't manually stop
            if (shouldKeepListeningRef.current) {
                setTimeout(() => {
                    try {
                        recognition.start();
                    } catch (e) {
                        // ignore if already started
                    }
                }, 200);
            }
        };

        recognition.onerror = (e) => {
            setSpeechError("Mic error: " + e.error);
            setIsListening(false);

            // ✅ Try restarting on network/no-speech (optional)
            if (
                shouldKeepListeningRef.current &&
                (e.error === "no-speech" || e.error === "network")
            ) {
                setTimeout(() => {
                    try {
                        recognition.start();
                    } catch (err) { }
                }, 400);
            }
        };

        recognitionRef.current = recognition;

        return () => {
            recognition.stop();
        };
    }, []);

    const startListening = (onResult) => {
        if (!recognitionRef.current) return;

        setSpeechError("");
        shouldKeepListeningRef.current = true;

        recognitionRef.current.onresult = (event) => {
            // ✅ Build final text properly (continuous mode)
            let finalText = "";
            for (let i = 0; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    finalText += event.results[i][0].transcript + " ";
                }
            }

            finalText = finalText.trim();
            if (finalText && onResult) onResult(finalText);
        };

        try {
            recognitionRef.current.start();
        } catch (err) {
            // already started
        }
    };

    const stopListening = () => {
        shouldKeepListeningRef.current = false;
        try {
            recognitionRef.current?.stop();
        } catch (err) { }
        setIsListening(false);
    };

    const speak = (text) => {
        if (!window.speechSynthesis) return;

        window.speechSynthesis.cancel();

        const utter = new SpeechSynthesisUtterance(text);
        utter.rate = 1;
        utter.pitch = 1;

        utter.onstart = () => setIsSpeaking(true);
        utter.onend = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utter);
    };

    const stopSpeaking = () => {
        window.speechSynthesis.cancel();
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
