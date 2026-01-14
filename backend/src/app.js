import express from "express";
import cors from "cors";

import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import chatRoutes from "./routes/chat.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Smart-Bot Backend API Running");
});

app.use("/api/chat", chatRoutes);

app.use(errorHandler);

export default app;
