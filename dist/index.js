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
dotenv.config();
import express from "express";
const PORT = 8188;
const app = express();
import { connectMongoDB, connectPGSQl, connectRedis, } from "./config/dbConnect.js";
//middlewares
import cors from "cors";
import morgan from "morgan";
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
//DB connect
connectMongoDB();
connectPGSQl();
connectRedis();
//API
import userRouter from "./routers/users/userRouter.js";
import eventRouter from "./routers/events/eventRouter.js";
import bookingRouter from "./routers/bookings/bookingRouter.js";
import { auth } from "./middlewares/authMiddleware.js";
const eventAPI = "/event-ticketing/api/v1";
app.use(`${eventAPI}/user`, userRouter);
app.use(`${eventAPI}/event`, auth, eventRouter);
app.use(`${eventAPI}/booking`, auth, bookingRouter);
//Server setup
app.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json({
        status: "success",
        message: "Server is up and running for event-ticketing backend",
    });
}));
app.use((error, req, res, next) => {
    const code = error.statusCode || 500;
    res.status(code).json({
        status: "error",
        message: error.message,
    });
});
app.listen(PORT, (error) => {
    error
        ? console.log(error)
        : console.log(`server is running at http://localhost:${PORT}`);
});
