import express from "express";
import http from "http";
import { Server } from "socket.io";
import QRCode from "qrcode";
import cors from "cors";
import { createClient } from "redis";

const app = express();
app.use(cors());
app.use(express.json());

// 📌 สร้าง HTTP Server สำหรับ WebSocket
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// ✅ ใช้ Redis แทน object ใน memory
const redis = createClient({ url: "redis://127.0.0.1:6379" });

redis.on("error", (err) => console.error("❌ Redis Client Error:", err));

await redis.connect(); // ✅ เชื่อมต่อ Redis โดยตรง

// 📌 ฟังก์ชันสร้าง QR Code
const generateQRCode = async (sessionId) => QRCode.toDataURL(`http://localhost/api/verify/${sessionId}`);

// 📌 API: ตรวจสอบสถานะล็อกอิน
app.get("/api/check-login/:sessionId", async (req, res) => {
    const sessionData = await redis.get(`session:${req.params.sessionId}`);
    res.json({ loggedIn: sessionData ? JSON.parse(sessionData).loggedIn : false });
});

// 📌 API: สร้าง QR Code
app.get("/api/generate-qr", async (req, res) => {
    const sessionId = Math.random().toString(36).substring(2, 10);
    try {
        const qrCode = await generateQRCode(sessionId);

        const ttl = 300; // 5 นาที
        const expiresAt = Date.now() + ttl * 1000; // คำนวณเวลาหมดอายุ

        const sessionData = { loggedIn: false, qrCode, expiresAt }; // ✅ เพิ่ม expiresAt

        await redis.setEx(`session:${sessionId}`, ttl, JSON.stringify(sessionData));

        res.json({ sessionId, qrCode, expiresAt }); // ✅ ส่ง expiresAt ไป UI
    } catch {
        res.status(500).json({ error: "Failed to generate QR Code" });
    }
});


// 📌 API: ดึง QR Code เดิม
app.get("/api/get-qr/:sessionId", async (req, res) => {
    const sessionKey = `session:${req.params.sessionId}`;
    const sessionData = await redis.get(sessionKey);

    if (!sessionData) {
        return res.status(404).json({ error: "Session expired or not found" });
    }

    // 📌 ดึง TTL ของ session จาก Redis
    const ttl = await redis.ttl(sessionKey);
    const expiresAt = Date.now() + ttl * 1000; // คำนวณเวลาหมดอายุ

    const session = JSON.parse(sessionData);
    session.expiresAt = expiresAt; // ✅ เพิ่ม expiresAt ลงใน response
    res.json(session);
});


// 📌 API: จำลองการสแกน QR Code
app.get("/api/verify/:sessionId", async (req, res) => {
    const sessionData = await redis.get(`session:${req.params.sessionId}`);
    if (!sessionData) return res.status(404).json({ error: "Invalid session ID" });

    const session = JSON.parse(sessionData);
    session.loggedIn = true;

    await redis.set(`session:${req.params.sessionId}`, JSON.stringify(session));
    io.emit("login-status", { sessionId: req.params.sessionId, status: "logged-in" });

    await redis.del(`session:${req.params.sessionId}`); // 📌 ลบ session หลังจาก login
    console.log(`🗑️ Deleted session ${req.params.sessionId} after login.`);

    res.json({ success: true, message: `Session ${req.params.sessionId} logged in.` });
});

// 📌 WebSocket Events
io.on("connection", (socket) => {
    console.log(`✅ WebSocket Client Connected: ${socket.id}`);

    socket.on("check-login", async (sessionId) => {
        const sessionData = await redis.get(`session:${sessionId}`);
        socket.emit("login-status", {
            sessionId,
            status: sessionData ? JSON.parse(sessionData).loggedIn : false,
        });
    });

    socket.on("disconnect", () => console.log(`❌ WebSocket Client Disconnected: ${socket.id}`));
});

// 📌 Start Server
server.listen(3000, "0.0.0.0", () => console.log(`✅ WebSocket Server running on http://0.0.0.0:3000`));
