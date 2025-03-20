import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import apiRoutes from "./routes/api.js";
import setupSocket from "./config/socket.js";

// 📌 โหลดตัวแปรจาก .env
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 📌 สร้าง HTTP Server และ WebSocket
const server = http.createServer(app);
const io = setupSocket(server);

// ✅ แชร์ `io` ให้ API ใช้
app.set("io", io);

// 📌 ใช้ API Routes
app.use("/api", apiRoutes);

// 📌 Middleware: Not Found Handler (404)
app.use((req, res) => {
    res.status(404).json({ error: "Not Found", message: `Route ${req.originalUrl} not found.` });
});

// 📌 Middleware: Error Handler (500)
app.use((err, req, res, next) => {
    console.error("❌ Internal Server Error:", err);
    res.status(500).json({ error: "Internal Server Error", message: err.message });
});

// 📌 Start Server
const PORT = process.env.PORT || 3000;
const HOST = "0.0.0.0";

server.listen(PORT, HOST, () => {
    console.log(`✅ WebSocket Server running on http://localhost:${PORT}`);
});
