import express from "express";
import {
  getUser,
  login,
  register,
} from "../../controllers/users/UserController.js";
import { auth } from "../../middlewares/authMiddleware.js";
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/", auth, getUser);
export default router;
