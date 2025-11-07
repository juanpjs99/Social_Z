import Tweet from "../models/tweets.js";
import User from "../models/User.js";

// 🟢 Crear tweet
export const createTweet = async (req, res) => {
  try {
    const { text, image, userId } = req.body;

    if (!text && !image) {
      return res.status(400).json({ message: "El tweet no puede estar vacío" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const newTweet = new Tweet({ text, image, author: user._id });
    await newTweet.save();

    res.status(201).json({
      message: "Tweet publicado correctamente",
      tweet: newTweet,
    });
  } catch (error) {
    console.error("Error en createTweet:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

// 🟡 Obtener todos los tweets
export const getTweets = async (req, res) => {
  try {
    const tweets = await Tweet.find()
      .populate("author", "username email")
      .sort({ createdAt: -1 });

    res.json(tweets);
  } catch (error) {
    console.error("Error en getTweets:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

// 🔴 Eliminar tweet
export const deleteTweet = async (req, res) => {
  try {
    const { id } = req.params;

    const tweet = await Tweet.findById(id);
    if (!tweet) return res.status(404).json({ message: "Tweet no encontrado" });

    await tweet.deleteOne();
    res.json({ message: "Tweet eliminado correctamente" });
  } catch (error) {
    console.error("Error en deleteTweet:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};
