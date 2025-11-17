import express from "express";
import { registerUser, loginUser, getUserProfile, updateUserProfile, followUser, unfollowUser } from "../controllers/userController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// get user profile by username
router.get("/profile/:username", getUserProfile);

// update user profile
router.put("/profile/:userId", updateUserProfile);

// follow / unfollow
router.post('/:id/follow', followUser);
router.post('/:id/unfollow', unfollowUser);

export default router;


