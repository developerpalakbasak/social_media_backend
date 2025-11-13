// like controller
import mongoose from "mongoose";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import Post from "../models/postModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import { createNotification } from "../utils/createNotification.js";

// Add Or Remove Like

export const addOrRemoveLike = catchAsyncErrors(async (req, res, next) => {
  const { user } = req;
  const postId = req.query.id;

  // console.log(postId)

  // Validate post ID
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return next(new ErrorHandler("Invalid post ID", 400));
  }

  const post = await Post.findById(postId);

  if (!post) {
    return next(new ErrorHandler("Post not found", 404));
  }

  // Check if user already liked the post
  const alreadyLiked = post.likes.some(like => like.equals(user._id));
  
  if (alreadyLiked) {
    // Remove like if already exists (toggle behavior)
    post.likes = post.likes.filter(like => !like.equals(user._id));
    await post.save();
    
    return res.status(200).json({
      success: true,
      message: "Like removed successfully",
      post,
      liked: false,
      likesCount: post.likesCount
    });
  }

  // Add new like
  post.likes.push(user._id);
  await post.save();

  // console.log(post.author)
  await createNotification({
     type: "like",
    senderId: user._id,
    receiverId: post.author,
    postId,
  })


  res.status(200).json({
    success: true,
    message: "Post liked successfully",
    post,
    liked: true,
    likesCount: post.likes.length
  });
});