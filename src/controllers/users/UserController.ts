import { Request, Response, NextFunction } from "express";
import { createUser, createUserTableFunction } from "../../models/pg/model.js";

import { hashPassword } from "../../utils/bcrypt.js";

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
