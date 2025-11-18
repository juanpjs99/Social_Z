import mongoose from "mongoose";

// Schema for tweets - pretty straightforward structure
const tweetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 280, // keeping it like the real X
      trim: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // might add retweets or replies later if needed
  },
  { 
    timestamps: true // auto-creates createdAt and updatedAt
  }
);

// index to make queries faster when fetching by user
tweetSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model("Tweet", tweetSchema);
