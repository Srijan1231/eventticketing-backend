import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";
import { updateUserForEmailJWT } from "../models/pg/user/model.js";

const accessSecret = process.env.JWT_ACCESS_SECRET;
const refreshSecret = process.env.JWT_REFRESH_SECRET;

if (!accessSecret || !refreshSecret) {
  throw new Error("JWT secrets are not defined");
}
export const createAccessToken = async (email: string) => {
  const token = jwt.sign({ email }, accessSecret, {
    expiresIn: "15m",
  });
  return token;
};
export const verifyAccessToken = async (token: string) => {
  return jwt.verify(token, accessSecret);
};

export const createRefreshToken = async (email: string) => {
  const token = jwt.sign({ email }, refreshSecret, {
    expiresIn: "30d",
  });
  try {
    await updateUserForEmailJWT(email, { refreshToken: token });
  } catch (error) {
    console.log("Error updating refreshToken to user", error);
  }
  return token;
};
export const verifyRefreshJWT = async (token: string) => {
  return jwt.verify(token, refreshSecret);
};
