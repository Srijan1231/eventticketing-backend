import express from "express";
import { auth } from "../../middlewares/authMiddleware.js";
import {
  getEvents,
  postEvent,
} from "../../controllers/events/EventController.js";

const router = express.Router();

router.post("/create", auth, postEvent);
router.get("/:id?", auth, getEvents);
export default router;
