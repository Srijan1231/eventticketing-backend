import dotenv from "dotenv";
dotenv.config();
import express from "express";
const PORT = 8188;
const app = express();
//middlewares
import cors from "cors";
import morgan from "morgan";
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
//Server setup
app.get("/", (req, res) => {
    res.json({
        status: "success",
        message: "Server is up and running for event-ticketing backend",
    });
});
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
