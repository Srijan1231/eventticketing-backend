import { Request, Response, NextFunction } from "express";
import {
  createEvent,
  createEventTableFunction,
  deleteEventByID,
  findAllEvent,
  findEventByID,
  updateEventByID,
} from "../../models/pg/events/model.js";

const postEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await createEventTableFunction();

    const result = await createEvent(req.body);
    if (result?.id) {
      return res.json({
        status: "success",
        message: "Event created",
      });
    }
    res.json({
      status: "Error",
      message: "Unable to create Event",
    });
  } catch (error: any) {
    if (error.code === "23505") {
      // Unique constraint violation error code in PostgreSQL
      return res.status(409).json({
        status: "error",
        message:
          "Duplicate event: an event with the same name, date, and location already exists.",
      });
    }
  }
};

const getEvents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    console.log(id);

    const event = id ? await findEventByID(id) : await findAllEvent();

    return res.json({
      status: "success",
      message: "Here is events",
      event,
    });
  } catch (error) {
    next(error);
  }
};

const updateEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id, ...rest } = req.body;
    const result = await updateEventByID(id, { ...rest });
    result?.id
      ? res.json({ status: "success", message: "Event update successfully" })
      : res.json({
          status: "error",
          message: "Error updating events",
        });
  } catch (error) {
    next(error);
  }
};

const deleteEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const result = await deleteEventByID(id);
    return result?.id
      ? res.json({
          status: "success",
          message: "Event deleted",
        })
      : res.json({
          status: "error",
          message: "Unable to delete event",
        });
  } catch (error) {
    next(error);
  }
};
export { postEvent, getEvents, updateEvents, deleteEvents };
