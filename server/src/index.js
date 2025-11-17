import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import tweetRoutes from "./routes/tweetsRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
// Aumentar límite para evitar PayloadTooLargeError cuando se envían strings grandes
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Configuración para ESM: definir __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carpeta para archivos estáticos uploads
const uploadsPath = path.resolve(__dirname, "../uploads");

// Crear uploads si no existe
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
console.log("📁 Sirviendo archivos estáticos desde:", uploadsPath);

// Servir archivos estáticos en la ruta /uploads
app.use("/uploads", express.static(uploadsPath));

// Rutas API
app.use("/api/users", userRoutes);
app.use("/api/tweets", tweetRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
