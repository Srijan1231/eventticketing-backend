import { Request, Response, NextFunction } from "express";
import {
  createUser,
  createUserTableFunction,
  findUserByEmail,
} from "../../models/pg/model.js";

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
