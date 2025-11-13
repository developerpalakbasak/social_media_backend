// models/Post.js
import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: { type: String, maxlength: 500 },
    image: { type: String },
    hashtags: [String],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],

    // 👇 New field added here
    visibility: {
      type: String,
      enum: ["only_me", "friends", "public", "followers"],
      default: "public", // or fetch from user's setting at post creation
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

postSchema.virtual("likesCount").get(function () {
  return this.likes?.length || 0;
});
postSchema.virtual("commentsCount").get(function () {
  return this.comments?.length || 0;
});

// Cascade delete comments when a post is deleted
postSchema.pre("remove", async function (next) {
  await this.model("Comment").deleteMany({ post: this._id });
  next();
});

const Post = mongoose.model("Post", postSchema);

export default Post;
