import QRCode from "qrcode";
import dotenv from "dotenv";

// โหลดตัวแปรจาก .env
dotenv.config();

const clientUrl = process.env.CLIENT_URL || "http://localhost";

export const generateQRCode = async (sessionId) => {
    return QRCode.toDataURL(`${clientUrl}/api/verify/${sessionId}`);
};
