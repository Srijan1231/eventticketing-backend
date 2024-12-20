var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { createUser, createUserTableFunction, findUserByEmail, } from "../../models/pg/model.js";
import { comparePassword, hashPassword } from "../../utils/bcrypt.js";
import { createAccessToken, createRefreshToken } from "../../utils/jwt.js";
export const register = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield createUserTableFunction();
        const { password } = req.body;
        req.body.password = hashPassword(password);
        const result = yield createUser(req.body);
        if (result === null || result === void 0 ? void 0 : result.id) {
            return res.json({
                status: "success",
                message: "User Created successfully",
            });
        }
        res.json({
            status: "Error",
            message: "Unable to create user",
        });
    }
    catch (error) {
        if (error.code === "23505") {
            return res.status(400).json({
                status: "error",
                message: "This email is already used by another user. Use a different email or reset your password.",
            });
        }
        next(error);
    }
});
export const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield findUserByEmail({ email });
        if (user === null || user === void 0 ? void 0 : user.id) {
            const isMatched = comparePassword(password, user.password);
            if (isMatched) {
                const accessToken = yield createAccessToken(email);
                const refreshToken = yield createRefreshToken(email);
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
    }
    catch (error) {
        next(error);
    }
});
export const getUser = (req, res, next) => {
    try {
        return res.json({
            status: "Success",
            message: "Here is the requested user",
            user: req.userInfo,
        });
    }
    catch (error) {
        next(error);
    }
};
