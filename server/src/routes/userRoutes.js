import express from "express";
import { registerUser, loginUser, getUserProfile } from "../controllers/userController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// get user profile by username
router.get("/profile/:username", getUserProfile);

export default router;
