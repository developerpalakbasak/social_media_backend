import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import User from "../models/userModel.js";
import ErrorHandler from "../utils/errorHandler.js";

// Add Followings
export const addFollowing = catchAsyncErrors(async (req, res) => {
  const { id } = req.query; // id of the user to follow
  const userId = req.user._id;
  const user = await User.findById(userId);

  const userToFollow = await User.findById(id);

  if (!userToFollow) {
    throw new ErrorHandler("User not found", 404);
  }

  if (user._id.equals(userToFollow._id)) {
    throw new ErrorHandler("You cannot follow yourself", 400);
  }

  // ✅ Check if already following
  const isAlreadyFollowing = user.followings.includes(userToFollow._id);
  if (isAlreadyFollowing) {
    return res.status(400).json({
      success: false,
      message: "You are already following this user",
    });
  }

  // ✅ Push to following/followers arrays
  user.followings.push(userToFollow._id);
  userToFollow.followers.push(user._id);

  await user.save({ validateBeforeSave: false });
  await userToFollow.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: "Successfully followed the user",
    user,
    userToFollow,
  });
});

// Remove Followings
export const removeFollowing = catchAsyncErrors(async (req, res) => {
  const { id } = req.query; // id of the user to follow
  const userId = req.user._id;
  const user = await User.findById(userId);

  const userToUnfollow = await User.findById(id);

  if (!userToUnfollow) {
    throw new ErrorHandler("User not found", 404);
  }

  if (user._id.equals(userToUnfollow._id)) {
    throw new ErrorHandler("You cannot unfollow yourself", 400);
  }

  // ✅ Check if not following
  const isFollowing = user.followings.includes(userToUnfollow._id);
  if (!isFollowing) {
    return res.status(400).json({
      success: false,
      message: "You are not following this user",
    });
  }

  // ✅ Remove from following/followers arrays
  user.followings = user.followings.filter(
    (followedId) => !followedId.equals(userToUnfollow._id)
  );

  userToUnfollow.followers = userToUnfollow.followers.filter(
    (followerId) => !followerId.equals(user._id)
  );

  await user.save({ validateBeforeSave: false });
  await userToUnfollow.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: "Unfollowed successfull",
    user,
    userToUnfollow,
  });
});

// get my following users
export const myFollowings = catchAsyncErrors(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId)
    .populate("followings", "fullName username profilePicture")
    .lean({ virtuals: true });

  res.status(200).json({
    success: true,
    message: "Successfully fetched to followings",
    followings: user.followings,
  });
});

// get my following users
export const myFollowers = catchAsyncErrors(async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId)
    .populate("followers", "fullName username profilePicture")
    .lean({ virtuals: true });

  res.status(200).json({
    success: true,
    message: "Successfully fetched to followings",
    followers: user.followers,
  });
});


// Remove follower
export const removefollower = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.query;
  const userId = req.user._id;
  const user = await User.findById(userId);
  if (!id) {
    return next(new ErrorHandler("User ID is required", 400));
  }

  if (user._id.toString() === id.toString()) {
    return next(new ErrorHandler("Bad request", 400));
  }

  const targetUser = await User.findById(id);
  if (!targetUser) {
    return next(new ErrorHandler("User not found", 404));
  }

  // ✅ Check if the target user is actually following the current user
  const isFollower = user.followers.includes(targetUser._id);
  const isFollowing = targetUser.followings.includes(user._id);

  if (!isFollower || !isFollowing) {
    return next(new ErrorHandler("This user is not your follower", 400));
  }

  // ✅ Remove follower/following relationship
  user.followers.pull(targetUser._id); // You lose a follower
  targetUser.followings.pull(user._id); // They stop following you

  await user.save({ validateBeforeSave: false });
  await targetUser.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: "Follower removed successfully",
  });
});