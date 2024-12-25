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
import UserMetaData from "../../models/mongodb/Schema/UserMetaData.js";
// This is for core data
export const register = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield createUserTableFunction();
        const { password } = req.body;
        req.body.password = hashPassword(password);
        const result = yield createUser(req.body);
        if (result === null || result === void 0 ? void 0 : result.id) {
            const { metadata } = req.body;
            if (metadata && typeof metadata === "object") {
                try {
                    yield UserMetaData.create({
                        userId: result.id,
                        metadata,
                    });
                }
                catch (metaError) {
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
        const _a = req.body, { id, newFields } = _a, rest = __rest(_a, ["id", "newFields"]);
        const result = yield updateUserByID(id, Object.assign({}, rest));
        if (result === null || result === void 0 ? void 0 : result.id) {
            if (newFields && typeof newFields === "object") {
                try {
                    const updatedMetadata = yield UserMetaData.findOneAndUpdate({ userId: result.id }, { $set: Object.assign({}, newFields) }, // Add or update fields in metadata
                    { new: true, upsert: true });
                    console.log("Updated metadata from user:", updatedMetadata);
                }
                catch (metaError) {
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
    }
    catch (error) {
        next(error);
    }
});
export const deleteUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const result = yield deleteUserByID(id);
        if (result === null || result === void 0 ? void 0 : result.id) {
            try {
                const deleteUserMetaData = yield UserMetaData.findOneAndDelete({
                    userId: result.id,
                });
                console.log("User metadata deleted:", deleteUserMetaData);
            }
            catch (metaError) {
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
    }
    catch (error) {
        next(error);
    }
});
// This is for  metadata
