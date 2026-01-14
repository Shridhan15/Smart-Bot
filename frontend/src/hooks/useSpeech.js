import { useEffect, useRef, useState } from "react";

export default function useSpeech() {
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [speechError, setSpeechError] = useState("");

    const recognitionRef = useRef(null);

    useEffect(() => {
        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setSpeechError("Speech Recognition not supported (use Chrome/Edge).");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = "en-IN";
        recognition.interimResults = false;
        recognition.continuous = false;

        recognition.onstart = () => {
            setIsListening(true);
            setSpeechError("");
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.onerror = (e) => {
            setSpeechError("Mic error: " + e.error);
            setIsListening(false);
        };

        recognitionRef.current = recognition;
    }, []);

    const startListening = (onResult) => {
        if (!recognitionRef.current) return;

        recognitionRef.current.onresult = (event) => {
            const text = event.results?.[0]?.[0]?.transcript || "";
            if (onResult) onResult(text);
        };

        recognitionRef.current.start();
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
        speak,
        stopSpeaking,
    };
}
