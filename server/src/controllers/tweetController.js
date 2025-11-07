import Tweet from "../models/Tweet.js";
import User from "../models/User.js";

// Get feed for the logged in user
// Shows their tweets + tweets from people they follow
export const getFeed = async (req, res) => {
  try {
    const userId = req.user.id; // comes from auth middleware
    const page = parseInt(req.query.page, 10) || 1;
    const limit = 10; // max 10 tweets per page
    const skip = (page - 1) * limit;

    // get the user to know who they follow
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // fetch tweets from user + following
    const feedUserIds = [userId, ...user.following];

    const tweets = await Tweet.find({ user: { $in: feedUserIds } })
      .sort({ createdAt: -1 }) // newest first
      .skip(skip)
      .limit(limit)
      .populate("user", "username fullName") // get user info without password
      .populate("likes", "username");

    // total count for pagination info
    const totalTweets = await Tweet.countDocuments({ 
      user: { $in: feedUserIds } 
    });

    res.status(200).json({
      tweets,
      currentPage: page,
      totalPages: Math.ceil(totalTweets / limit),
      totalTweets,
    });
  } catch (error) {
    console.error("Error getting feed:", error);
    res.status(500).json({ message: "Server error fetching feed" });
  }
};

// Create a new tweet
export const createTweet = async (req, res) => {
  try {
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: "Tweet content cannot be empty" });
    }

    if (content.length > 280) {
      return res.status(400).json({ message: "Tweet is too long (max 280 characters)" });
    }

    const newTweet = new Tweet({
      user: userId,
      content: content.trim(),
    });

    await newTweet.save();
    
    // populate user data before sending response
    await newTweet.populate("user", "username fullName");

    res.status(201).json({
      message: "Tweet created successfully",
      tweet: newTweet,
    });
  } catch (error) {
    console.error("Error creating tweet:", error);
    res.status(500).json({ message: "Server error creating tweet" });
  }
};

// Get tweets from a specific user (for profile page)
export const getUserTweets = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const tweets = await Tweet.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "username fullName")
      .populate("likes", "username");

    const totalTweets = await Tweet.countDocuments({ user: userId });

    res.status(200).json({
      tweets,
      currentPage: page,
      totalPages: Math.ceil(totalTweets / limit),
      totalTweets,
    });
  } catch (error) {
    console.error("Error getting user tweets:", error);
    res.status(500).json({ message: "Server error fetching user tweets" });
  }
};
