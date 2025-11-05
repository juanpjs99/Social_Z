import express from "express";
import { registerUser, loginUser } from "../controllers/userController.js";

const router = express.Router();

router.post("/register", registerUser); // /api/users/register
router.post("/login", loginUser);       // /api/users/login

export default router;
