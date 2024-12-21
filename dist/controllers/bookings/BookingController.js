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
import { createBooking, createBookingTableFunction, deleteBookingByID, findBooking, updateBookingByID, } from "../../models/pg/bookings/model.js";
const postBooking = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield createBookingTableFunction();
        const result = yield createBooking(req.body);
        (result === null || result === void 0 ? void 0 : result.id)
            ? res.json({
                status: "success",
                message: "Booked",
            })
            : res.json({
                status: "error",
                message: "Error booking",
            });
    }
    catch (error) {
        next(error);
    }
});
const getBooking = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const filter = req.query;
        if (!filter || Object.keys(filter).length === 0) {
            return res.json({
                status: "error",
                message: "Error filter cannot be empty",
            });
        }
        const bookings = yield findBooking(filter);
        if (bookings.length === 0) {
            return res.json({
                status: "success",
                message: "No bookings found.",
            });
        }
        res.json({
            status: "success",
            message: "Here is the list of bookings",
            bookings,
        });
    }
    catch (error) {
        next(error);
    }
});
const updateBooking = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _a = req.body, { id } = _a, rest = __rest(_a, ["id"]);
        const booking = yield updateBookingByID(id, Object.assign({}, rest));
        (booking === null || booking === void 0 ? void 0 : booking.id)
            ? res.json({
                status: "success",
                message: "Booking details updated successfully",
            })
            : res.json({
                status: "error",
                message: "Error updating booking",
            });
    }
    catch (error) {
        next(error);
    }
});
const deleteBooking = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const booking = yield deleteBookingByID(id);
        (booking === null || booking === void 0 ? void 0 : booking.id)
            ? res.json({
                status: "success",
                message: "Booking details deleted",
            })
            : res.json({
                status: "error",
                message: "Error deleting booking details",
            });
    }
    catch (error) {
        next(error);
    }
});
export { postBooking, getBooking, updateBooking, deleteBooking };
