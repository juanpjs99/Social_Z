import Tweet from "../models/tweets.js";
import User from "../models/User.js";

// 🟢 Crear tweet (acepta multipart/form-data con campo 'image' o JSON con image)
export const createTweet = async (req, res) => {
  try {
    console.log('createTweet - body:', req.body);
    console.log('createTweet - file:', req.file ? { filename: req.file.filename, mimetype: req.file.mimetype, size: req.file.size } : null);
    const { text, userId } = req.body;

    // Si multer ha procesado un archivo, estará en req.file
    let image = "";
    if (req.file) {
      // Guardamos la ruta relativa para que el cliente la normalice (ej: /uploads/xxx.jpg)
      image = `/uploads/${req.file.filename}`;
    } else if (req.body.image) {
      image = req.body.image; // puede ser data:... o URL completa
    }

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
      .populate("likes", "username")
      .populate("comments.author", "username email")
      .sort({ createdAt: -1 });

    res.json(tweets);
  } catch (error) {
    console.error("Error en getTweets:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

// 👍 Like/Unlike tweet
export const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId es requerido" });
    }

    const tweet = await Tweet.findById(id);
    if (!tweet) {
      return res.status(404).json({ message: "Tweet no encontrado" });
    }

    // Verificar si ya está likeado
    const alreadyLiked = tweet.likes.includes(userId);

    if (alreadyLiked) {
      // Remover like
      tweet.likes = tweet.likes.filter((id) => id.toString() !== userId.toString());
    } else {
      // Agregar like
      tweet.likes.push(userId);
    }

    await tweet.save();
    await tweet.populate("author", "username email");
    await tweet.populate("likes", "username");

    res.json({
      message: alreadyLiked ? "Like removido" : "Tweet likeado",
      tweet,
      isLiked: !alreadyLiked,
    });
  } catch (error) {
    console.error("Error en toggleLike:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

// 💬 Agregar comentario
export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, userId } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ message: "El comentario no puede estar vacío" });
    }

    if (!userId) {
      return res.status(400).json({ message: "userId es requerido" });
    }

    const tweet = await Tweet.findById(id);
    if (!tweet) {
      return res.status(404).json({ message: "Tweet no encontrado" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const newComment = {
      text,
      author: userId,
    };

    tweet.comments.push(newComment);
    await tweet.save();
    await tweet.populate("comments.author", "username email");

    res.status(201).json({
      message: "Comentario agregado",
      tweet,
    });
  } catch (error) {
    console.error("Error en addComment:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

// 🗑️ Eliminar comentario
export const deleteComment = async (req, res) => {
  try {
    const { tweetId, commentId } = req.params;

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
      return res.status(404).json({ message: "Tweet no encontrado" });
    }

    tweet.comments = tweet.comments.filter(
      (comment) => comment._id.toString() !== commentId
    );
    await tweet.save();

    res.json({ message: "Comentario eliminado", tweet });
  } catch (error) {
    console.error("Error en deleteComment:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

// 🔴 Eliminar tweet
export const deleteTweet = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('deleteTweet - id:', id);

    const tweet = await Tweet.findById(id);
    if (!tweet) return res.status(404).json({ message: "Tweet no encontrado" });

    // Si el tweet tiene imagen guardada en uploads, intentar borrar el fichero (opcional)
    try {
      if (tweet.image && typeof tweet.image === 'string' && tweet.image.startsWith('/uploads')) {
        const path = `./uploads/${tweet.image.split('/').pop()}`;
        import('fs').then(fs => {
          if (fs.existsSync(path)) fs.unlinkSync(path);
        }).catch(() => {});
      }
    } catch (e) {
      // no bloquear la eliminación por errores de fichero
      console.error('No se pudo borrar el fichero de imagen:', e);
    }

    await tweet.deleteOne();
    res.json({ message: "Tweet eliminado correctamente" });
  } catch (error) {
    console.error("Error en deleteTweet:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};
