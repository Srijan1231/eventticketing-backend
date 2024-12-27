import { Request, Response, NextFunction } from "express";
import {
  createUser,
  createUserTableFunction,
  deleteUserByID,
  findUserByEmail,
  updateUserByID,
} from "../../models/pg/user/model.js";

import { comparePassword, hashPassword } from "../../utils/bcrypt.js";
import { createAccessToken, createRefreshToken } from "../../utils/jwt.js";
import UserMetaData from "../../models/mongodb/Schema/UserMetaData.js";
// This is for core data
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await createUserTableFunction();

    const { password } = req.body;
    req.body.password = hashPassword(password);
    const result = await createUser(req.body);
    if (result?.id) {
      const { metadata } = req.body;
      if (metadata && typeof metadata === "object") {
        try {
          await UserMetaData.create({
            userId: result.id,
            metadata,
          });
        } catch (metaError) {
          console.log("Error creating user metadata:", metaError);
        }
      }
      return res.json({
        status: "success",
        message: "User Created successfully",
      });
    }
    res.json({
      status: "Error",
      message: "Unable to create user",
    });
  } catch (error: any) {
    if (error.code === "23505") {
      return res.status(400).json({
        status: "error",
        message:
          "This email is already used by another user. Use a different email or reset your password.",
      });
    }

    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    const user = await findUserByEmail({ email });

    if (user?.id) {
      const isMatched = comparePassword(password, user.password);
      if (isMatched) {
        const accessToken = await createAccessToken(email);
        const refreshToken = await createRefreshToken(email);

        return res.json({
          status: "success",
          message: "Login successful",
          token: { accessToken, refreshToken },
        });
      }
    }
    return res.json({
      status: "Error",
      message: "Invalid login details",
    });
  } catch (error) {
    next(error);
  }
};

export const getUser = (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.json({
      status: "Success",
      message: "Here is the requested user",
      user: req.userInfo,
    });
  } catch (error) {
    next(error);
  }
};

export const logOut = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { refreshToken, id } = req.body;
    if (refreshToken && id) {
      await updateUserByID(id, { refreshToken: "" });
    }
    res.json({
      status: "success",
      message: "Logged out",
    });
  } catch (error) {
    next(error);
  }
};
export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id, newFields, ...rest } = req.body;
    const result = await updateUserByID(id, { ...rest });
    if (result?.id) {
      if (newFields && typeof newFields === "object") {
        try {
          const updatedMetadata = await UserMetaData.findOneAndUpdate(
            { userId: result.id },
            { $set: { ...newFields } }, // Add or update fields in metadata
            { new: true, upsert: true }
          );
          console.log("Updated metadata from user:", updatedMetadata);
        } catch (metaError) {
          console.log("Error creating user metadata:", metaError);
        }
      }
      return res.status(200).json({
        status: "success",
        message: "User successfully updated",
      });
    }
    return res.status(500).json({
      status: "error",
      message: "Error updating user",
    });
  } catch (error) {
    next(error);
  }
};
export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const result = await deleteUserByID(id);
    if (result?.id) {
      try {
        const deleteUserMetaData = await UserMetaData.findOneAndDelete({
          userId: result.id,
        });

        console.log("User metadata deleted:", deleteUserMetaData);
      } catch (metaError) {
        console.log("Error creating user metadata:", metaError);
      }

      return res.json({
        status: "success",
        message: "User has been deleted",
      });
    }

    return res.json({
      status: "error",
      message: "Error deleting user",
    });
  } catch (error) {
    next(error);
  }
};
// This is for  metadata
