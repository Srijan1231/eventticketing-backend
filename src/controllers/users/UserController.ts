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
    const { id, ...rest } = req.body;
    const result = await updateUserByID(id, { ...rest });
    result?.id
      ? res.json({
          status: "success",
          message: "The user  has been updated successfully",
        })
      : res.json({
          status: "error",
          message: "Unable to update user, try again later",
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
    result?.id
      ? res.json({
          status: "success",
          message: "User has been deleted",
        })
      : res.json({
          status: "error",
          message: "Error deleting user",
        });
  } catch (error) {
    next(error);
  }
};
