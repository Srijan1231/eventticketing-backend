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
import { findUserByEmail, updateUserByEmailJWT } from "../models/pg/model.js";
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
        yield updateUserByEmailJWT(email, { refreshToken: token });
    }
    catch (error) {
        console.log("Error updating refreshToken to user", error);
    }
    return token;
});
export const verifyRefreshJWT = (token) => {
    return jwt.verify(token, refreshSecret);
};
export const refreshAccessToken = (refreshToken) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Verify the refresh token and cast to the correct type
        const decoded = verifyRefreshJWT(refreshToken);
        const { email } = decoded;
        // Fetch the user details to validate the refresh token
        const user = yield findUserByEmail({ email });
        if (!user) {
            throw new Error("User not found");
        }
        // Validate that the refresh token matches the stored one
        if (user.refreshJWT !== refreshToken) {
            throw new Error("Invalid refresh token");
        }
        // Generate a new access token
        const newAccessToken = jwt.sign({ email }, process.env.JWT_ACCESS_SECRET, // Ensure this is set correctly in your .env
        { expiresIn: "15m" });
        const result = yield updateUserByEmailJWT(email, {
            accessToken: newAccessToken,
        });
        if (result && newAccessToken) {
            console.log("successfully  refreshed new access token ");
        }
        return newAccessToken;
    }
    catch (error) {
        // Log the error for debugging purposes
        console.error("Error refreshing access token:", error);
        throw new Error("Unable to refresh access token");
    }
});
