import express from "express";
import { createTweet, getTweets, deleteTweet } from "../controllers/tweetController.js";

const router = express.Router();

router.post("/", createTweet);   // crear tweet
router.get("/", getTweets);      // obtener tweets
router.delete("/:id", deleteTweet); // borrar tweet

export default router;
