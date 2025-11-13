import mongoose from "mongoose";
import cloudinary from "../config/cloudinaryConfig.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import uploadOnCloudinary from "../utils/uploadOnCloudinary.js";
import Notification from "../models/notificationModel.js";

// Add Post
export const addPost = catchAsyncErrors(async (req, res, next) => {
  const { text } = req.body;

  const userId = req.user._id;
  const user = await User.findById(userId)

  let image = req.file ? req.file.path : null;

  if (image) {
    // Upload the file to Cloudinary
    const cloudinaryResponse = await uploadOnCloudinary(image);
    image = cloudinaryResponse.secure_url;

    if (!cloudinaryResponse || !cloudinaryResponse.url) {
      return next(new ErrorHandler("Failed to upload file to Cloudinary", 500));
    }
  }

  // Create post data
  const postData = {
    author: user._id,
    text: text || "", // default to empty string if not provided
    image, // will be null if no image is uploaded
  };

  const post = await Post.create(postData);

  user.posts.push(post.id);

  await user.save();

  res.status(200).json({
    success: true,
    message: "Post created successfully",
    post,
  });
});

// delete post
export const deletePost = catchAsyncErrors(async (req, res, next) => {
  const { postId } = req.query;
  const userId = req.user._id;
  const user = await User.findById(userId)

  if (!postId) {
    return next(new ErrorHandler("Post ID is required", 400));
  }

  const post = await Post.findById(postId);

  if (!post) {
    return next(new ErrorHandler("Post not found", 404));
  }

  // Check if the logged-in user is the author of the post
  if (post.author.toString() !== user._id.toString()) {
    return next(new ErrorHandler("Unauthorized action", 403));
  }

  // Extract public_id from the Cloudinary image URL
  if (post.image) {
    const parts = post.image.split("/");
    const fileNameWithExt = parts[parts.length - 1]; // tmmtjjnqdtzgumryrdtx.jpg
    const fileName = fileNameWithExt.split(".")[0]; // tmmtjjnqdtzgumryrdtx
    const folder = parts.slice(parts.length - 2, parts.length - 1)[0]; // social_media_app
    const publicId = `${folder}/${fileName}`; // social_media_app/tmmtjjnqdtzgumryrdtx

    await cloudinary.uploader.destroy(publicId);
  }

  await post.deleteOne();
  user.posts.pull(postId);
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: "Post deleted successfully",
  });
});

// get my post
export const myPost = catchAsyncErrors(async (req, res, next) => {

  const userId = req.user._id;

  let posts = await Post.find({ author: userId })
    .sort({ createdAt: -1 })
    .populate("author", "fullName username profilePicture")
    .lean({ virtuals: true });

  const postCount = posts?.length;

  res.status(200).json({
    success: true,
    message: "Post retrived successfully",
    postCount,
    posts,
  });
});

// get my timelines post
export const myTimeline = catchAsyncErrors(async (req, res, next) => {

  // ...task for later.... Fetch posts from the user and their followings
  const posts = await Post.find()
    .sort({ createdAt: -1 }) // Newest first
    .populate("author", "fullName username profilePicture")
    .lean();

  // console.log(posts);
  res.status(200).json({
    success: true,
    message: "Timeline Posts",
    posts,
  });
});

// get timelines post from username
export const postsUsingUsername = catchAsyncErrors(async (req, res, next) => {
  const { username } = req.query;

  const userFromUsername = await User.findOne({ username });

  // Convert to ObjectId
  const objectIds = userFromUsername.posts.map(
    (id) => new mongoose.Types.ObjectId(id)
  );

  // Fetch posts from the user and their followings
  const posts = await Post.find({ _id: { $in: objectIds } })
    .sort({ createdAt: -1 }) // Newest first
    .populate("author", "fullName username profilePicture")
    .lean();

  // console.log(posts);
  res.status(200).json({
    success: true,
    message: "Posts using username",
    posts,
  });
});

// get post from id
export const postUsingId = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { notification } = req.query;

  // Find the post
  const post = await Post.findById(id)
    .populate("author", "fullName username profilePicture")
    .lean();

  if (!post) {
    return next(new ErrorHandler("Post not found", 404));
  }

  // Handle notification logic
  if (notification) {
    const noti = await Notification.findById(notification)
      .populate({
        path: "comment",
        populate: {
          path: "author",
          select: "fullName username profilePicture", // optional fields
        },
      })
      .lean();

    // If the notification doesn't exist or doesn't match the post, ignore it
    if (!noti || noti.post?.toString() !== id) {
      return res.status(200).json({
        success: true,
        message: "Single post",
        post,
      });
    }

    const isNotificationOwner =
      noti.receiver?.toString() === req.user._id.toString();

    if (isNotificationOwner) {
      return res.status(200).json({
        success: true,
        message: "Single post from notification",
        post,
        comment: noti.comment,
      });
    }

    // If not the owner, still return the post without comment
    return res.status(200).json({
      success: true,
      message: "Single post",
      post,
    });
  }

  // Return post if no notification query
  return res.status(200).json({
    success: true,
    message: "Single post",
    post,
  });
});
