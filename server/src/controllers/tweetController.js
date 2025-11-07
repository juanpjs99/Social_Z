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
