import Tweet from "../models/tweets.js";
import User from "../models/User.js";

// Create tweet (accepts multipart/form-data with 'image' field or JSON with image)
export const createTweet = async (req, res) => {
  try {
    console.log('createTweet - body:', req.body);
    console.log('createTweet - file:', req.file ? { filename: req.file.filename, mimetype: req.file.mimetype, size: req.file.size } : null);
    const { text, userId } = req.body;

    // If multer processed a file, it will be in req.file
    let image = "";
    if (req.file) {
      // Save relative path so client can normalize it (e.g., /uploads/xxx.jpg)
      image = `/uploads/${req.file.filename}`;
    } else if (req.body.image) {
      image = req.body.image; // Can be data:... or full URL
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

// Get all tweets
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

// Delete tweet
export const deleteTweet = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    console.log('deleteTweet - id:', id, 'userId:', userId);

    const tweet = await Tweet.findById(id);
    if (!tweet) return res.status(404).json({ message: "Tweet not found" });

    // Validate that the user is the author of the tweet
    if (tweet.author.toString() !== userId) {
      return res.status(403).json({ message: "You don't have permission to delete this tweet" });
    }

    // If tweet has an image stored in uploads, try to delete the file (optional)
    try {
      if (tweet.image && typeof tweet.image === 'string' && tweet.image.startsWith('/uploads')) {
        const path = `./uploads/${tweet.image.split('/').pop()}`;
        import('fs').then(fs => {
          if (fs.existsSync(path)) fs.unlinkSync(path);
        }).catch(() => {});
      }
    } catch (e) {
      // Don't block deletion if file removal fails
      console.error('Could not delete image file:', e);
    }

    await tweet.deleteOne();
    res.json({ message: "Tweet deleted successfully" });
  } catch (error) {
    console.error("Error en deleteTweet:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};
