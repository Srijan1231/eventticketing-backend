var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { createBooking, createBookingTableFunction, } from "../../models/pg/bookings/model";
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
export { postBooking };
