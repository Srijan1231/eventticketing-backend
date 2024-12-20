var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import dotenv from "dotenv";
import pkg from "pg";
const { Pool } = pkg;
import Redis from "ioredis";
import mongoose from "mongoose";
dotenv.config();
const connectMongoDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected");
    }
    catch (error) {
        console.log("Error connecting MongoDB");
        process.exit(1);
    }
});
const connectPGSQl = () => {
    const pool = new Pool({
        connectionString: process.env.PG_DATABASE_URL,
        ssl: {
            rejectUnauthorized: false, // Adjust this based on your environment (set to true in production)
        },
    });
    pool.connect((err, client, release) => {
        if (err) {
            console.error("PostgreSQL connection failed:", err.message);
            process.exit(1);
        }
        else {
            console.log("PostgreSQL Connected");
            release();
        }
    });
    return pool;
};
const connectRedis = () => {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
        console.error("REDIS_URL is not set in the environment variables.");
        process.exit(1);
    }
    const redis = new Redis(redisUrl, {
        // Check if SSL is required based on the REDIS_URL scheme
        tls: redisUrl.startsWith("rediss://")
            ? { rejectUnauthorized: false }
            : undefined,
    });
    redis.on("connect", () => {
        console.log("Connected to Redis");
    });
    redis.on("error", (err) => {
        console.error("Redis connection error:", err.message);
    });
    return redis;
};
export { connectMongoDB, connectPGSQl, connectRedis };
