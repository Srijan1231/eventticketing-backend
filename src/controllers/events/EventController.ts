import { Request, Response, NextFunction } from "express";
import {
  createEvent,
  createEventTableFunction,
  findAllEvent,
  findEventByID,
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
    console.log("Error fetching events:", error);
  }
};
export { postEvent, getEvents };
