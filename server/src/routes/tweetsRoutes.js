import express from "express";
import { createTweet, getTweets, deleteTweet, toggleLike, addComment, deleteComment } from "../controllers/tweetController.js";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) { 
    cb(null, uploadDir); 
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, unique + ext);
  }
});

// Filtro para validar tipos de archivo
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}`), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB máximo
  }
});

const router = express.Router();

// Middleware para manejar errores de multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'FILE_TOO_LARGE') {
      return res.status(400).json({ message: 'Archivo demasiado grande (máximo 5MB)' });
    }
    return res.status(400).json({ message: `Error al subir archivo: ${err.message}` });
  } else if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};

// Rutas de tweets
router.post("/", upload.single('image'), handleMulterError, createTweet);   // crear tweet
router.get("/", getTweets);      // obtener tweets
router.delete("/:id", deleteTweet); // borrar tweet

// Rutas de likes
router.post("/:id/like", toggleLike);  // like/unlike

// Rutas de comentarios
router.post("/:id/comments", addComment);  // agregar comentario
router.delete("/:tweetId/comments/:commentId", deleteComment);  // eliminar comentario

export default router;
