import express from "express";
import { deleteBooking, getBooking, postBooking, updateBooking, } from "../../controllers/bookings/BookingController.js";
const router = express.Router();
router.post("/create", postBooking);
router.get("/", getBooking);
router.put("/update", updateBooking);
router.delete("/delete", deleteBooking);
export default router;
