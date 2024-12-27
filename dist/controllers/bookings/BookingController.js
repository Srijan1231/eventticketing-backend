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
import BookingMetaData from "../../models/mongodb/Schema/BookingMetaData.js";
//This is core controller
const postBooking = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield createBookingTableFunction();
        const result = yield createBooking(req.body);
        if (result === null || result === void 0 ? void 0 : result.id) {
            const { metadata } = req.body;
            if (metadata && typeof metadata === "object") {
                try {
                    yield BookingMetaData.create({
                        bookingId: result.id,
                        metadata,
                    });
                }
                catch (metaError) {
                    console.log("Error creating booking metadata:", metaError);
                }
            }
            return res.json({
                status: "success",
                message: "Booked",
            });
        }
        return res.json({
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
        const _a = req.body, { id, newFields } = _a, rest = __rest(_a, ["id", "newFields"]);
        const booking = yield updateBookingByID(id, Object.assign({}, rest));
        if (booking === null || booking === void 0 ? void 0 : booking.id) {
            if (newFields && newFields === "object") {
                const updatedBookingMetaData = yield BookingMetaData.findOneAndUpdate({ bookingId: booking.id }, { $set: Object.assign({}, newFields) }, { new: true, upsert: true });
                console.log("Booking metadata updated:", updatedBookingMetaData);
            }
            return res.json({
                status: "success",
                message: "Booking details updated successfully",
            });
        }
        return res.json({
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
        if (booking === null || booking === void 0 ? void 0 : booking.id) {
            const deleteBookingMetaData = yield BookingMetaData.findOneAndDelete({
                bookingId: booking.id,
            });
            console.log("Booking metadata deleted:", deleteBookingMetaData);
            return res.json({
                status: "success",
                message: "Booking details deleted",
            });
        }
        return res.json({
            status: "error",
            message: "Error deleting booking details",
        });
    }
    catch (error) {
        next(error);
    }
});
// This is for metaData
export { postBooking, getBooking, updateBooking, deleteBooking };
