import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// 🟢 Registrar usuario
export const registerUser = async (req, res) => {
  try {
    const { fullName, username, email, password } = req.body;

    if (!fullName || !username || !email || !password) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    // Verificar si ya existe el usuario
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "El usuario o correo ya existen" });
    }

    
    

    // Guardar usuario
    const newUser = new User({
      fullName,
      username,
      email,
      password,   
    });

    await newUser.save();

    // Crear token JWT
    const token = jwt.sign(
      { id: newUser._id, username: newUser.username },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Usuario registrado correctamente",
      token,
      user: { id: newUser._id, username: newUser.username, email: newUser.email },
    });

  } catch (error) {
    console.error("Error en registerUser:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

// 🟢 Login usuario
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Faltan credenciales" });
    }

    // Normaliza email para evitar mayúsculas o espacios
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: "Usuario no encontrado" });
    }

    // 🔑 Aquí se compara la contraseña en texto plano con el hash en BD
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Contraseña incorrecta" });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" }
    );

    res.json({
      message: "Inicio de sesión exitoso",
      token,
      username: user.username,
      email: user.email,
    });
  } catch (error) {
    console.error("Error en loginUser:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};
