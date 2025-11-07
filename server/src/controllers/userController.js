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
      id: user._id,
      username: user.username,
      email: user.email,
    });
  } catch (error) {
    console.error("Error en loginUser:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

// get user profile by username
export const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;

    // find user and exclude password
    const user = await User.findOne({ username })
      .select("-password")
      .populate("followers", "username fullName")
      .populate("following", "username fullName");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // return profile data with counts
    res.json({
      id: user._id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      bio: user.bio,
      profilePicture: user.profilePicture,
      followersCount: user.followers.length,
      followingCount: user.following.length,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error("Error getting user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// update user profile (name, bio, profile picture)
export const updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { fullName, bio, profilePicture } = req.body;

    // find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // update fields if provided
    if (fullName) user.fullName = fullName;
    if (bio !== undefined) user.bio = bio; // allow empty string
    if (profilePicture !== undefined) user.profilePicture = profilePicture;

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        bio: user.bio,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};
