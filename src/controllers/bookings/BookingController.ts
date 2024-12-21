import { NextFunction, Request, Response } from "express";
import {
  createBooking,
  createBookingTableFunction,
  deleteBookingByID,
  findBooking,
  updateBookingByID,
} from "../../models/pg/bookings/model.js";

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
const getBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter = req.query as Record<string, any>;

    if (!filter || Object.keys(filter).length === 0) {
      return res.json({
        status: "error",
        message: "Error filter cannot be empty",
      });
    }
    const bookings = await findBooking(filter);

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
  } catch (error) {
    next(error);
  }
};

const updateBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id, ...rest } = req.body;
    const booking = await updateBookingByID(id, { ...rest });
    booking?.id
      ? res.json({
          status: "success",
          message: "Booking details updated successfully",
        })
      : res.json({
          status: "error",
          message: "Error updating booking",
        });
  } catch (error) {
    next(error);
  }
};
const deleteBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const booking = await deleteBookingByID(id);
    booking?.id
      ? res.json({
          status: "success",
          message: "Booking details deleted",
        })
      : res.json({
          status: "error",
          message: "Error deleting booking details",
        });
  } catch (error) {
    next(error);
  }
};
export { postBooking, getBooking, updateBooking, deleteBooking };
