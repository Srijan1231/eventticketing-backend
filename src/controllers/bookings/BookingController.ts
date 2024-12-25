import { NextFunction, Request, Response } from "express";
import {
  createBooking,
  createBookingTableFunction,
  deleteBookingByID,
  findBooking,
  updateBookingByID,
} from "../../models/pg/bookings/model.js";
import BookingMetaData from "../../models/mongodb/Schema/BookingMetaData.js";
//This is core controller
const postBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await createBookingTableFunction();
    const result = await createBooking(req.body);
    if (result?.id) {
      const { metadata } = req.body;
      if (metadata && typeof metadata === "object") {
        try {
          await BookingMetaData.create({
            bookingId: result.id,
            metadata,
          });
        } catch (metaError) {
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
    const { id, newFields, ...rest } = req.body;
    const booking = await updateBookingByID(id, { ...rest });
    if (booking?.id) {
      if (newFields && newFields === "object") {
        const updatedBookingMetaData = await BookingMetaData.findOneAndUpdate(
          { bookingId: booking.id },
          { $set: { ...newFields } },
          { new: true, upsert: true }
        );
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
    if (booking?.id) {
      const deleteBookingMetaData = await BookingMetaData.findOneAndDelete({
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
  } catch (error) {
    next(error);
  }
};
// This is for metaData

export { postBooking, getBooking, updateBooking, deleteBooking };
