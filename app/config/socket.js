import { Server } from "socket.io";
import redis from "./redis.js";

const setupSocket = (server) => {
    const io = new Server(server, {
        cors: { origin: "*" },
        transports: ["websocket", "polling"], // รองรับ polling fallback
    });

    // ✅ ป้องกันการเข้าถึง `/socket.io/` โดยตรง
    io.engine.use((req, res, next) => {
        if (!req.headers.upgrade || req.headers.upgrade.toLowerCase() !== "websocket") {
            return res.writeHead(403, { "Content-Type": "application/json" }).end(
                JSON.stringify({ error: "Forbidden", message: "Direct access to WebSocket is not allowed" })
            );
        }
        next();
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

    return io;
};

export default setupSocket;
