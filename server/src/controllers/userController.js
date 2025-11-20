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
    const { userId } = req.query; // get current user id from query params

    // find user and exclude password
    const user = await User.findOne({ username })
      .select("-password")
      .populate("followers", "username fullName")
      .populate("following", "username fullName");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // check if current user is following this profile
    let isFollowing = false;
    if (userId) {
      const currentUser = await User.findById(userId);
      if (currentUser) {
        isFollowing = currentUser.following.some(
          followingId => followingId.toString() === user._id.toString()
        );
      }
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
      isFollowing: isFollowing,
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

// 🟢 Seguir usuario
export const followUser = async (req, res) => {
  try {
    const { id } = req.params; // usuario a seguir
    const { userId } = req.body; // quien sigue
    if (!userId) return res.status(400).json({ message: 'userId requerido' });
    if (id === userId) return res.status(400).json({ message: 'No puedes seguirte a ti mismo' });

    const follower = await User.findById(userId);
    const target = await User.findById(id);
    if (!follower || !target) return res.status(404).json({ message: 'Usuario no encontrado' });

    const already = follower.following.some(u => u.toString() === id.toString());
    if (already) {
      return res.status(200).json({ message: 'Ya sigues a este usuario', already: true });
    }
    follower.following.push(id);
    target.followers.push(userId);
    await follower.save();
    await target.save();
    res.json({ message: 'Usuario seguido', followed: true, targetId: id });
  } catch (error) {
    console.error('Error en followUser:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// 🟠 Dejar de seguir usuario (opcional por si se necesita luego)
export const unfollowUser = async (req, res) => {
  try {
    const { id } = req.params; // usuario objetivo
    const { userId } = req.body; // quien deja de seguir
    if (!userId) return res.status(400).json({ message: 'userId requerido' });
    if (id === userId) return res.status(400).json({ message: 'Operación inválida' });

    const follower = await User.findById(userId);
    const target = await User.findById(id);
    if (!follower || !target) return res.status(404).json({ message: 'Usuario no encontrado' });

    follower.following = follower.following.filter(u => u.toString() !== id.toString());
    target.followers = target.followers.filter(u => u.toString() !== userId.toString());
    await follower.save();
    await target.save();
    res.json({ message: 'Usuario dejado de seguir', unfollowed: true, targetId: id });
  } catch (error) {
    console.error('Error en unfollowUser:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// get list of followers for a user
export const getFollowers = async (req, res) => {
  try {
    const { username } = req.params;
    
    // find user and get followers list
    const user = await User.findOne({ username })
      .populate("followers", "username fullName profilePicture")
      .populate("following", "_id");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // add isFollowing flag to each follower
    const followingIds = user.following.map(f => f._id.toString());
    const followersWithStatus = user.followers.map(follower => ({
      ...follower.toObject(),
      isFollowing: followingIds.includes(follower._id.toString())
    }));

    res.json({ followers: followersWithStatus });
  } catch (error) {
    console.error("Error getting followers:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// get list of users that this user is following
export const getFollowing = async (req, res) => {
  try {
    const { username } = req.params;
    
    // find user and get following list
    const user = await User.findOne({ username })
      .populate("following", "username fullName profilePicture");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ following: user.following });
  } catch (error) {
    console.error("Error getting following:", error);
    res.status(500).json({ message: "Server error" });
  }
};
