import dotenv from "dotenv";
dotenv.config();

import express, { NextFunction, Request, Response } from "express";
const PORT = 8188;
const app = express();
import {
  connectMongoDB,
  connectPGSQl,
  connectRedis,
} from "./config/dbConnect.js";
//middlewares
import cors from "cors";
import morgan from "morgan";

app.use(cors());
app.use(morgan("dev"));

app.use(express.json());
//DB connect

connectMongoDB();
const postgresPool = connectPGSQl();
const redisDB = connectRedis();
//Server setup

app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Server is up and running for event-ticketing backend",
  });
});
interface IServer {
  statusCode: number;
  message: string;
}
app.use((error: IServer, req: Request, res: Response, next: NextFunction) => {
  const code = error.statusCode || 500;
  res.status(code).json({
    status: "error",
    message: error.message,
  });
});

app.listen(PORT, (error?: Error) => {
  error
    ? console.log(error)
    : console.log(`server is running at http://localhost:${PORT}`);
});