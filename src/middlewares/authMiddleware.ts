import { NextFunction, Response, Request } from "express";
import {
  createAccessToken,
  verifyAccessToken,
  verifyRefreshJWT,
} from "../utils/jwt.js";
import { findOneUser, findUserByEmail } from "../models/pg/user/model.js";

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

export const refreshAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) {
      return res.status(400).json({
        status: "error",
        message: "No JWT passed",
      });
    }

    const decoded = await verifyRefreshJWT(authorization);

    if (decoded && typeof decoded !== "string" && "email" in decoded) {
      const user = await findOneUser({
        email: decoded.email,
        refreshtoken: authorization,
      });
      if (user?.id) {
        const accessJWT = await createAccessToken(decoded.email);
        return res.json({
          status: "success",
          accessJWT,
        });
      }
    }
    res.status(401).json({
      status: "error",
      message: "Unauthorized",
    });
  } catch (error) {
    next(error);
  }
};
