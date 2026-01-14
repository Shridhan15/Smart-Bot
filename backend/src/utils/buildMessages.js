export const buildMessages = (message, history = []) => {
    return [
        {
            role: "system",
            content: `
You are Smart-Bot, a voice-based assistant.
Goals:
- Give clear, correct, useful answers.
- Be natural, friendly, and direct.
- If the user asks something unclear, ask 1 short follow-up question.
- Prefer short paragraphs + bullet points when helpful.
- If user writes in Hinglish, reply in Hinglish.
- Do not add filler text.
      `.trim(),
        },
        ...(Array.isArray(history) ? history : []),
        { role: "user", content: message },
    ];
};
