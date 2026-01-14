import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import app from "./src/app.js";
console.log("✅ GROQ KEY:", process.env.GROQ_API_KEY);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});