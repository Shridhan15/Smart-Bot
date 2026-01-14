import { getGroqClient } from "../config/groq.js";
import { buildMessages } from "../utils/buildMessages.js";

export const chatWithAI = async (req, res, next) => {
    try {
        const { message, history } = req.body;

        if (!message) {
            return res.status(400).json({ error: "message is required" });
        }

        const groq = getGroqClient();

        const completion = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: buildMessages(message, history),
            temperature: 0.7,
            max_tokens: 400,
        });

        res.json({
            reply: completion.choices?.[0]?.message?.content || "No reply",
        });
    } catch (err) {
        next(err);
    }
};
