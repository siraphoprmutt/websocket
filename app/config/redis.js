import { createClient } from "redis";
import dotenv from "dotenv";

// โหลดตัวแปรจาก .env
dotenv.config();

const redisHost = process.env.REDIS_HOST || "127.0.0.1";
const redisPort = process.env.REDIS_PORT || "6379";

// สร้าง Redis Client
const redis = createClient({ url: `redis://${redisHost}:${redisPort}` });

redis.on("error", (err) => console.error("❌ Redis Client Error:", err));

await redis.connect();

export default redis;
