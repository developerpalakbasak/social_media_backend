// like controller
import mongoose from "mongoose";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import Post from "../models/postModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import Comment from "../models/commentModel.js";
import { createNotification } from "../utils/createNotification.js";

// Add comment
export const addComment = catchAsyncErrors(async (req, res, next) => {
  const { user } = req;
  const postId = req.params.id;
  const { text, parentCommentId } = req.body;

  // Validate post ID
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return next(new ErrorHandler("Invalid post ID", 400));
  }

  const post = await Post.findById(postId);

  if (!post) {
    return next(new ErrorHandler("Post not found", 404));
  }

  const commentData = {
    author: user._id,
    post: postId,
    text,
    parentComment: parentCommentId || null,
  };

  // Add comment
  const newComment = await Comment.create(commentData);
  await newComment.populate("author", "username fullName profilePicture");
  // If it's a reply, push it to parent's `replies` array
  if (parentCommentId) {
    await Comment.findByIdAndUpdate(parentCommentId, {
      $push: { replies: newComment._id },
    });
  }

  // console.log(post.author)
  await createNotification({
    type: "comment",
    senderId: user._id,
    receiverId: post.author,
    postId,
    commentId: newComment._id,
  });

  // Add new comment
  post.comments.push(newComment._id);
  await post.save();

  res.status(200).json({
    success: true,
    message: "Comment added",
    newComment,
  });
});

// Add comment
export const deleteComment = catchAsyncErrors(async (req, res, next) => {
  const commentId = req.params.id;

  // Validate comment ID
  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    return next(new ErrorHandler("Invalid comment ID", 400));
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    return next(new ErrorHandler("Comment not found", 404));
  }

  const post = await Post.findById(comment.post);
  if (!post) {
    return next(new ErrorHandler("Post not found", 404));
  }

  // Remove comment ID from post
  post.comments.pull(comment._id);
  await post.save();

  // Delete the comment itself
  await Comment.findByIdAndDelete(commentId);

  res.status(200).json({
    success: true,
    message: "Comment deleted",
  });
});

// get all comments of posts

export const getPostComments = catchAsyncErrors(async (req, res, next) => {

  const postId = req.params.id;
  const click = req.query.click || 1;
  

  const skip = 5 * (click - 1);
  // Validate post ID
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return next(new ErrorHandler("Invalid post ID", 400));
  }

  const filter = {
    post: postId,
    parentComment: null,
  };

  const comments = await Comment.find(filter)
    .sort({ createdAt: -1 })
    .populate("author", "fullName username profilePicture")
    .populate({
      path: "replies",
      select: "text author replies parentComment createdAt",
      options: { limit: 2, sort: { createdAt: -1 } }, // get latest 2 replies
      populate: {
        path: "author",
        select: "username fullName profilePicture",
      },
    })
    .limit(5)
    .skip(skip)
    .lean();

  const totalComments = await Comment.countDocuments({
    post: postId,
    parentComment: null,
  });

  // Step 2: Count replies for each comment and add totalReplies
  const commentsWithReplyCount = await Promise.all(
    comments.map(async (comment) => {
      const totalReplies = await Comment.countDocuments({
        parentComment: comment._id,
      });
      return {
        ...comment,
        totalReplies,
      };
    })
  );

  res.status(200).json({
    success: true,
    message: "Comments fetched",
    comments: commentsWithReplyCount,
    totalComments,
  });
});

// get replies for comment
export const getRepliesForComment = catchAsyncErrors(async (req, res, next) => {
  const { parentCommentId } = req.params;
  const { page = 1, limit = 2 } = req.query;

  if (!mongoose.Types.ObjectId.isValid(parentCommentId)) {
    return next(new ErrorHandler("Invalid comment ID", 400));
  }

  // console.log(page)
  // console.log(limit)

  const replies = await Comment.find({ parentComment: parentCommentId })
    .sort({ createdAt: -1 }) // oldest first (you can use -1 for newest first)
    .skip(page * limit)
    .limit(parseInt(limit))
    .populate("author", "username fullName profilePicture")
    .lean();

  // console.log(replies)

  const totalReplies = await Comment.countDocuments({
    parentComment: parentCommentId,
  });

  res.status(200).json({
    success: true,
    message: "Replies fetched",
    replies,
    totalReplies,
  });
});
