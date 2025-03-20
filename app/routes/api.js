import express from "express";
import redis from "../config/redis.js";
import { generateQRCode } from "../utils/qrcode.js";

const router = express.Router();

// 📌 ตรวจสอบสถานะล็อกอิน
router.get("/check-login/:sessionId", async (req, res) => {
    console.log("sessionId: ", req.params.sessionId);
    const sessionData = await redis.get(`session:${req.params.sessionId}`);
    if (!sessionData) return res.status(404).json({ error: "Session not found" });

    res.json({ loggedIn: JSON.parse(sessionData).loggedIn });
});

// 📌 สร้าง QR Code
router.get("/generate-qr", async (req, res) => {
    const sessionId = Math.random().toString(36).substring(2, 10);
    try {
        const qrCode = await generateQRCode(sessionId);
        const ttl = 300; // 5 นาที
        const expiresAt = Date.now() + ttl * 1000;

        const sessionData = { loggedIn: false, qrCode, expiresAt };
        await redis.setEx(`session:${sessionId}`, ttl, JSON.stringify(sessionData));

        res.json({ sessionId, qrCode, expiresAt });
    } catch (error) {
        console.error("❌ Failed to generate QR Code:", error);
        res.status(500).json({ error: "Failed to generate QR Code" });
    }
});

// 📌 ดึง QR Code เดิม
router.get("/get-qr/:sessionId", async (req, res) => {
    const sessionKey = `session:${req.params.sessionId}`;
    const sessionData = await redis.get(sessionKey);

    if (!sessionData) {
        return res.status(404).json({ error: "Session expired or not found" });
    }

    const ttl = await redis.ttl(sessionKey);
    const expiresAt = Date.now() + ttl * 1000;

    const session = JSON.parse(sessionData);
    session.expiresAt = expiresAt;
    res.json(session);
});

// 📌 จำลองการสแกน QR Code
router.get("/verify/:sessionId", async (req, res) => {
    const sessionData = await redis.get(`session:${req.params.sessionId}`);
    if (!sessionData) {
        return res.status(404).json({ error: "Invalid session ID" });
    }

    const session = JSON.parse(sessionData);
    session.loggedIn = true;

    await redis.set(`session:${req.params.sessionId}`, JSON.stringify(session));

    // ✅ ใช้ `req.app.get("io")` เพื่อให้แน่ใจว่า io ถูกต้อง
    req.app.get("io").emit("login-status", { sessionId: req.params.sessionId, status: "logged-in" });

    await redis.del(`session:${req.params.sessionId}`);
    console.log(`🗑️ Deleted session ${req.params.sessionId} after login.`);

    res.json({ success: true, message: `Session ${req.params.sessionId} logged in.` });
});

export default router;