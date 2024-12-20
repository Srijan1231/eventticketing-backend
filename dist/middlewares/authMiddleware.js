var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { verifyAccessToken } from "../utils/jwt.js";
import { findUserByEmail } from "../models/pg/model.js";
export const auth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { authorization } = req.headers;
    if (!authorization) {
        return res.status(400).json({
            status: "error",
            message: "No JWT passed",
        });
    }
    const decoded = yield verifyAccessToken(authorization);
    if (decoded && typeof decoded !== "string" && "email" in decoded) {
        const user = yield findUserByEmail({ email: decoded.email });
        if (user === null || user === void 0 ? void 0 : user.id) {
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
});
