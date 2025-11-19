import express from "express";
import { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  updateUserProfile, 
  followUser, 
  unfollowUser,
  getFollowers,
  getFollowing
} from "../controllers/userController.js";

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

// get followers and following lists
router.get('/:username/followers', getFollowers);
router.get('/:username/following', getFollowing);

export default router;


