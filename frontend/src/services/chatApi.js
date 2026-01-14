const API_BASE = import.meta.env.VITE_API_BASE;

export const sendChatMessage = async ({ message, history }) => {
    const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history }),
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data?.error || "Backend error");
    }

    return data; // { reply, ... }
};
