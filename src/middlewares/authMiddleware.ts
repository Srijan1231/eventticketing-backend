import { NextFunction, Response, Request } from "express";
import { verifyAccessToken } from "../utils/jwt.js";
import { findUserByEmail } from "../models/pg/model.js";

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(400).json({
      status: "error",
      message: "No JWT passed",
    });
  }

  const decoded = await verifyAccessToken(authorization);

  if (decoded && typeof decoded !== "string" && "email" in decoded) {
    const user = await findUserByEmail({ email: decoded.email });
    if (user?.id) {
      user.refreshtoken = undefined;
      user.password = undefined;

      req.userInfo = user;
      return next();
    }
  }

  return res.status(401).json({
    status: "error",
    message: "Unauthorized",
  });
};
