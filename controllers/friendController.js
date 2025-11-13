import mongoose from "mongoose";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import User from "../models/userModel.js";
import ErrorHandler from "../utils/errorHandler.js";

// Send or Remove Friend Request (toggle)
export const sendRemoveFriendRequest = catchAsyncErrors(async (req, res) => {
  const { id } = req.query;
  const userId = req.user._id;
  const user = await User.findById(userId)

  if (!id) throw new ErrorHandler("User ID is required", 400);
  if (user._id.toString() === id.toString()) {
    throw new ErrorHandler("You cannot send request to yourself", 400);
  }

  const targetUser = await User.findById(id);
  if (!targetUser) throw new ErrorHandler("User not found", 404);

  const alreadySent = user.sentRequests.includes(targetUser._id);
  const targetUserAlreadySent = targetUser.sentRequests.includes(
    targetUser._id
  );

  if (alreadySent) {
    // Remove friend request
    user.sentRequests.pull(targetUser._id);
    targetUser.friendRequests.pull(user._id);
    await user.save({ validateBeforeSave: false });
    await targetUser.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
      type: "remove",
      message: "Friend request removed (follow unchanged)",
    });
  }
  if (targetUserAlreadySent) {
    // Remove friend request

    return res.status(200).json({
      success: true,
      message: "You can accept or delete",
    });
  }

  // Add friend request + follow
  user.sentRequests.addToSet(targetUser._id);
  targetUser.friendRequests.addToSet(user._id);
  user.followings.addToSet(targetUser._id);
  targetUser.followers.addToSet(user._id);

  await user.save({ validateBeforeSave: false });
  await targetUser.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    type: "send",
    message: "Friend request sent and following",
  });
});

// Accept Friend Request
export const acceptFriendRequest = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.query;
   const userId = req.user._id;
  const user = await User.findById(userId)

  if (!id) return next(new ErrorHandler("User ID is required", 400));
  if (user._id.equals(id))
    return next(new ErrorHandler("You can't friend yourself", 400));

  const targetUser = await User.findById(id);
  if (!targetUser) return next(new ErrorHandler("User not found", 404));

  const hasIncoming = user.friendRequests.includes(targetUser._id);
  const hasSent = targetUser.sentRequests.includes(user._id);

  if (!(hasIncoming && hasSent)) {
    return next(new ErrorHandler("No valid friend request to accept", 400));
  }

  user.friends.addToSet(targetUser._id);
  user.followings.addToSet(targetUser._id);
  targetUser.friends.addToSet(user._id);

  user.friendRequests.pull(targetUser._id);
  user.sentRequests.pull(targetUser._id);
  targetUser.sentRequests.pull(user._id);
  targetUser.friendRequests.pull(user._id);

  await user.save({ validateBeforeSave: false });
  await targetUser.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: "Request accepted",
  });
});

// Delete Friend Request (decline or cancel both sides)
export const deleteFriendRequest = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.query;
  const userId = req.user._id;
  const user = await User.findById(userId)

  if (!id) return next(new ErrorHandler("User ID is required", 400));
  if (user._id.equals(id))
    return next(new ErrorHandler("You can't remove yourself", 400));

  const targetUser = await User.findById(id);
  if (!targetUser) return next(new ErrorHandler("User not found", 404));

  user.friendRequests.pull(targetUser._id);
  user.sentRequests.pull(targetUser._id);
  targetUser.friendRequests.pull(user._id);
  targetUser.sentRequests.pull(user._id);

  await user.save({ validateBeforeSave: false });
  await targetUser.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: "Friend request deleted",
  });
});

// Remove Friend
export const unFriend = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.query;
    const userId = req.user._id;
  const user = await User.findById(userId)

  if (!id) return next(new ErrorHandler("User ID is required", 400));
  if (user._id.equals(id))
    return next(new ErrorHandler("You can't unfriend yourself", 400));

  const targetUser = await User.findById(id);
  if (!targetUser) return next(new ErrorHandler("User not found", 404));

  const isFriend = user.friends.includes(targetUser._id);
  if (!isFriend) return next(new ErrorHandler("You are not friends", 400));

  user.friends.pull(targetUser._id);
  targetUser.friends.pull(user._id);

  await user.save({ validateBeforeSave: false });
  await targetUser.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: "Friend removed",
  });
});

// Cancel Sent Friend Request (by sender only)
export const cancelFriendRequest = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.query;
    const userId = req.user._id;
  const user = await User.findById(userId)

  if (!id) return next(new ErrorHandler("User ID is required", 400));
  if (user._id.equals(id))
    return next(new ErrorHandler("You cannot cancel your own request", 400));

  const targetUser = await User.findById(id);
  if (!targetUser) return next(new ErrorHandler("User not found", 404));

  const hasSent = user.sentRequests.includes(targetUser._id);
  const isInTheirList = targetUser.friendRequests.includes(user._id);

  if (!hasSent || !isInTheirList) {
    return next(new ErrorHandler("No friend request to cancel", 400));
  }

  user.sentRequests.pull(targetUser._id);
  targetUser.friendRequests.pull(user._id);

  await user.save({ validateBeforeSave: false });
  await targetUser.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: "Friend request canceled",
  });
});

// My Friends
export const myFriends = catchAsyncErrors(async (req, res) => {
  const userWithFriends = await User.findById(req.user._id).populate(
    "friends",
    "username fullName profilePicture"
  );

  res.status(200).json({
    success: true,
    friends: userWithFriends.friends,
  });
});

// Friend Requests Received
export const queryFriendRequests = catchAsyncErrors(async (req, res) => {
  const userWithReq = await User.findById(req.user._id).populate(
    "friendRequests",
    "username fullName profilePicture"
  );

  res.status(200).json({
    success: true,
    friendRequests: userWithReq.friendRequests,
  });
});

// Friend Requests Sent
export const querySentFriendRequests = catchAsyncErrors(async (req, res) => {

  const userWithSent = await User.findById(req.user._id).populate(
    "sentRequests",
    "username fullName profilePicture"
  );

  res.status(200).json({
    success: true,
    sentRequests: userWithSent.sentRequests,
  });
});

// Get Favorites
export const getFavorites = catchAsyncErrors(async (req, res) => {

  const userFavorites = await User.findById(req.user._id, "favorites").populate(
    "favorites",
    "username fullName profilePicture"
  );

  res.status(200).json({
    success: true,
    favorites: userFavorites.favorites,
  });
});

// add/remove favorites
export const favoriteToggle = catchAsyncErrors(async (req, res) => {
  const { id } = req.query;
  const userId = req.user._id;
  const user = await User.findById(userId)

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ErrorHandler("Invalid User ID", 400);
  }

  if (user._id == id) throw new ErrorHandler("You cannot make favorite youself", 404);

  const targetUser = await User.findById(id);
  if (!targetUser) throw new ErrorHandler("User not found", 404);

  const isAlreadyInFav = user.favorites.some(favId => favId.toString() === id);

  if (isAlreadyInFav) {
    user.favorites.pull(id);
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
      type: "removed",
      message: "Removed from favorites",
    });
  }

  // ✅ This will only add if not already present
  user.favorites.addToSet(targetUser._id);
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    type: "added",
    message: "Added to favorites",
  });
});
