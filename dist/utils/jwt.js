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
import jwt from "jsonwebtoken";
import { updateUserForEmailJWT } from "../models/pg/user/model.js";
const accessSecret = process.env.JWT_ACCESS_SECRET;
const refreshSecret = process.env.JWT_REFRESH_SECRET;
if (!accessSecret || !refreshSecret) {
    throw new Error("JWT secrets are not defined");
}
export const createAccessToken = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const token = jwt.sign({ email }, accessSecret, {
        expiresIn: "15m",
    });
    return token;
});
export const verifyAccessToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    return jwt.verify(token, accessSecret);
});
export const createRefreshToken = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const token = jwt.sign({ email }, refreshSecret, {
        expiresIn: "30d",
    });
    try {
        yield updateUserForEmailJWT(email, { refreshToken: token });
    }
    catch (error) {
        console.log("Error updating refreshToken to user", error);
    }
    return token;
});
export const verifyRefreshJWT = (token) => __awaiter(void 0, void 0, void 0, function* () {
    return jwt.verify(token, refreshSecret);
});
