import dotenv from "dotenv";
import pkg from "pg";
const { Pool } = pkg;

import Redis from "ioredis";
import mongoose from "mongoose";

dotenv.config();

const connectMongoDB = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("MongoDB connected");
  } catch (error) {
    console.log("Error connecting MongoDB");
    process.exit(1);
  }
};
const connectPGSQl = (): pkg.Pool => {
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
    } else {
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
