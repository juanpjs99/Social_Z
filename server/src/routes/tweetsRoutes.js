import express from "express";
import { createTweet, getTweets, deleteTweet } from "../controllers/tweetController.js";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, uploadDir); },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

const router = express.Router();

// Usamos upload.single('image') para aceptar fichero multipart/form-data
router.post("/", upload.single('image'), createTweet);   // crear tweet
router.get("/", getTweets);      // obtener tweets
router.delete("/:id", deleteTweet); // borrar tweet

export default router;
