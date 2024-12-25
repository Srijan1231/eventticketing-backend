import { Request, Response, NextFunction } from "express";
import {
  createEvent,
  createEventTableFunction,
  deleteEventByID,
  findAllEvent,
  findEventByID,
  updateEventByID,
} from "../../models/pg/events/model.js";
import EventMetaData from "../../models/mongodb/Schema/EventMetaData.js";
// This is for core data
const postEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await createEventTableFunction();

    const result = await createEvent(req.body);
    console.log(result);
    if (result.id) {
      const { metadata } = req.body;

      if (metadata && typeof metadata === "object") {
        try {
          await EventMetaData.create({
            eventId: result.id,
            metadata,
          });
        } catch (metaError) {
          console.log("Error creating event metadata:", metaError);
        }
      }

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
    const { id, newFields, ...rest } = req.body;
    const result = await updateEventByID(id, { ...rest });
    if (result?.id) {
      const updatedMetaEvent = await EventMetaData.findOneAndUpdate(
        { eventId: result.id },
        { $set: { ...newFields } },
        { new: true, upsert: true }
      );
      console.log("Event metadata updated:", updatedMetaEvent);
      return res.status(200).json({
        status: "success",
        message: "Event update successfully",
      });
    }
    return res.status(500).json({
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
    if (result?.id) {
      const deleteEventMetaData = await EventMetaData.findOneAndDelete({
        eventId: result.id,
      });
      console.log("Event metadata deleted:", deleteEventMetaData);
      return res.json({
        status: "success",
        message: "Event deleted",
      });
    }

    return res.json({
      status: "error",
      message: "Unable to delete event",
    });
  } catch (error) {
    next(error);
  }
};
// This is for  metadata
export { postEvent, getEvents, updateEvents, deleteEvents };
