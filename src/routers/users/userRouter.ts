import express from "express";
import {
  deleteUser,
  getUser,
  login,
  logOut,
  register,
  updateUser,
} from "../../controllers/users/UserController.js";
import { auth, refreshAuth } from "../../middlewares/authMiddleware.js";
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/", auth, getUser);
router.get("/getAccessToken", refreshAuth);
router.post("/logout", logOut);
router.put("/update", auth, updateUser);
router.delete("/:id?", auth, deleteUser);
export default router;
