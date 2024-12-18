import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";
import { findUserByEmail, updateUserByEmailJWT } from "../models/pg/model.js";

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
    await updateUserByEmailJWT(email, { refreshToken: token });
  } catch (error) {
    console.log("Error updating refreshToken to user", error);
  }
  return token;
};
export const verifyRefreshJWT = (token: string) => {
  return jwt.verify(token, refreshSecret);
};
interface IRefreshAccessToken {
  email: string;
}

export const refreshAccessToken = async (refreshToken: string) => {
  try {
    // Verify the refresh token and cast to the correct type
    const decoded = verifyRefreshJWT(refreshToken) as IRefreshAccessToken;
    const { email } = decoded;

    // Fetch the user details to validate the refresh token
    const user = await findUserByEmail({ email });

    if (!user) {
      throw new Error("User not found");
    }

    // Validate that the refresh token matches the stored one
    if (user.refreshJWT !== refreshToken) {
      throw new Error("Invalid refresh token");
    }

    // Generate a new access token
    const newAccessToken = jwt.sign(
      { email },
      process.env.JWT_ACCESS_SECRET as string, // Ensure this is set correctly in your .env
      { expiresIn: "15m" }
    );
    const result = await updateUserByEmailJWT(email, {
      accessToken: newAccessToken,
    });
    if (result && newAccessToken) {
      console.log("successfully  refreshed new access token ");
    }
    return newAccessToken;
  } catch (error) {
    // Log the error for debugging purposes
    console.error("Error refreshing access token:", error);
    throw new Error("Unable to refresh access token");
  }
};
