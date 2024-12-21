import { NextFunction, Request, Response } from "express";
import {
  createBooking,
  createBookingTableFunction,
} from "../../models/pg/bookings/model";

const postBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await createBookingTableFunction();
    const result = await createBooking(req.body);
    result?.id
      ? res.json({
          status: "success",
          message: "Booked",
        })
      : res.json({
          status: "error",
          message: "Error booking",
        });
  } catch (error) {
    next(error);
  }
};
export { postBooking };
