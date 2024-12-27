import express from "express";

import {
  deleteEvents,
  getEvents,
  postEvent,
  updateEvents,
} from "../../controllers/events/EventController.js";

const router = express.Router();

router.post("/create", postEvent);
router.get("/:id?", getEvents);
router.put("/update", updateEvents);
router.delete("/:id?", deleteEvents);
export default router;
