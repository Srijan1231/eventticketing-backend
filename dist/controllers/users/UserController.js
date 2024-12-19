var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { createUser, createUserTableFunction } from "../../models/pg/model.js";
import { hashPassword } from "../../utils/bcrypt.js";
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
