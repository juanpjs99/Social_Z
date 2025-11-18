import Post from "../models/Post.js";

// 🟢 Crear un nuevo tweet/post
export const createPost = async (req, res) => {
  try {
    const { content, user } = req.body;

    if (!content || content.trim() === "") {
      return res.status(400).json({ message: "El contenido no puede estar vacío" });
    }

    const newPost = new Post({
      content,
      user: user || "Anonymous", // por si no se envía usuario
    });

    await newPost.save();

    res.status(201).json({
      message: "Tweet publicado correctamente",
      post: newPost,
    });
  } catch (error) {
    console.error("❌ Error en createPost:", error);
    res.status(500).json({ message: "Error al crear el tweet", error });
  }
};

// 🟣 Obtener todos los tweets/posts
export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    console.error("❌ Error en getPosts:", error);
    res.status(500).json({ message: "Error al obtener los tweets", error });
  }
};

