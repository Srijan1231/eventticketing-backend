var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { createUser, createUserTableFunction, deleteUserByID, findUserByEmail, updateUserByID, } from "../../models/pg/user/model.js";
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
export const logOut = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { refreshToken, id } = req.body;
        if (refreshToken && id) {
            yield updateUserByID(id, { refreshToken: "" });
        }
        res.json({
            status: "success",
            message: "Logged out",
        });
    }
    catch (error) {
        next(error);
    }
});
export const updateUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _a = req.body, { id } = _a, rest = __rest(_a, ["id"]);
        const result = yield updateUserByID(id, Object.assign({}, rest));
        (result === null || result === void 0 ? void 0 : result.id)
            ? res.json({
                status: "success",
                message: "The user  has been updated successfully",
            })
            : res.json({
                status: "error",
                message: "Unable to update user, try again later",
            });
    }
    catch (error) {
        next(error);
    }
});
export const deleteUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.body;
        const result = yield deleteUserByID(id);
        (result === null || result === void 0 ? void 0 : result.id)
            ? res.json({
                status: "success",
                message: "User has been deleted",
            })
            : res.json({
                status: "error",
                message: "Error deleting user",
            });
    }
    catch (error) {
        next(error);
    }
});
