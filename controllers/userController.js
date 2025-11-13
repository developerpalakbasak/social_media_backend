import cloudinary from "../config/cloudinaryConfig.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import User from "../models/userModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import sendToken from "../utils/sendAuthToken.js";
import { sendMail } from "../utils/sendMail.js";
import uploadOnCloudinary from "../utils/uploadOnCloudinary.js";
import crypto from "crypto"

// Create User
export const createUser = catchAsyncErrors(async (req, res, next) => {
  const { username, email, fullName, password, confirmPassword } = req.body;

  if (!username || !email || !fullName || !password || !confirmPassword) {
    return next(new ErrorHandler("Please provide all required fields", 400));
  }

  if (password !== confirmPassword) {
    return next(new ErrorHandler("Passwords must be the same", 400));
  }

  const userdata = {
    username,
    fullName,
    email,
    password,
  };

  const user = await User.create(userdata);
  sendToken(user, 201, res);
});

// Login User
export const loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Email or password is invalid", 400));
  }
  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Email or password is invalid", 400));
  }

  // console.log(isPasswordMatched)
  sendToken(user, 200, res);
});

// Add Bio
export const addBio = catchAsyncErrors(async (req, res, next) => {
  const { bioText } = req.body;

  if (!bioText) {
    return next(new ErrorHandler("bioText is missing", 400));
  }

  // Find and update user bio
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { bio: bioText },
    { new: true, runValidators: true } // return updated user & validate schema
  );

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Bio updated successfully",
    user,
  });
});


// Add location
export const addlocation = catchAsyncErrors(async (req, res, next) => {
  const { location } = req.body;

  if (!location) {
    return next(new ErrorHandler("location is missing", 400));
  }


  // Find and update user bio
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { location },
    { new: true, runValidators: true }
  );

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }



  res.status(200).json({
    success: true,
    message: "Location added successfully",
    user,
  });
});

// User Info
export const userInfo = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user._id;
  const user = await User.findById(userId)

  res.status(200).json({
    success: true,
    message: "User information retrieved successfully",
    user,
  });
});

// User logout
export const userLogout = catchAsyncErrors(async (req, res, next) => {

  // Clear the cookie
  res
    .clearCookie("refresh_token")
    .clearCookie("access_token")
    .json({
      success: true,
      message: "User logged out successfully",
    });
});

// Suggested User
export const suggestedUser = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user._id;
  const user = await User.findById(userId)
  const currentPage = req.query.page || 1;
  const userPerPage = 10;
  const skip = userPerPage * (currentPage - 1);

  // Exclude self and already-followed users
  const excludedUserIds = [userId, ...user.followings];

  const suggestedUsers = await User.find({ _id: { $nin: excludedUserIds } })
    .select("profilePicture username fullName _id")
    .limit(userPerPage)
    .skip(skip)
    .lean();

  // const isAlreadyFollowing = suggestedUser.following.includes(user.following);

  res.json({
    success: true,
    message: "Suggested Users",
    suggestedUsersCount: suggestedUsers.length,
    suggestedUsers,
    followings: user.following,
  });
});

// Update routes

export const updateAvatarImage = catchAsyncErrors(async (req, res, next) => {
  const imagePath = req.file ? req.file.path : null;

  if (!imagePath) {
    return next(new ErrorHandler("Please provide an image", 400));
  }

  // Upload to Cloudinary
  const cloudinaryResponse = await uploadOnCloudinary(imagePath);

  if (!cloudinaryResponse || !cloudinaryResponse.secure_url) {
    return next(new ErrorHandler("Failed to upload file to Cloudinary", 500));
  }

  // Update the user's profile picture
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { profilePicture: cloudinaryResponse.secure_url },
    { new: true, runValidators: true }
  );

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Avatar updated successfully",
  });
});


// delete profile image
export const deleteProfile = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user._id;

  // Find user first
  const user = await User.findById(userId);
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  if (!user.profilePicture) {
    return next(new ErrorHandler("Profile picture not found", 400));
  }

  // Extract Cloudinary public_id from URL
  const parts = user.profilePicture.split("/");
  const fileNameWithExt = parts[parts.length - 1]; // example.jpg
  const fileName = fileNameWithExt.split(".")[0]; // example
  const folder = parts.slice(parts.length - 2, parts.length - 1)[0]; // e.g. "social_media_app"
  const publicId = `${folder}/${fileName}`; // e.g. "social_media_app/example"

  // Delete from Cloudinary
  const result = await cloudinary.uploader.destroy(publicId);

  if (result.result === "ok") {
    // Use findByIdAndUpdate instead of save()
    await User.findByIdAndUpdate(
      userId,
      { profilePicture: "" },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Profile deleted successfully",
    });
  }

  if (result.result === "not found") {
    return next(new ErrorHandler("Profile not found on Cloudinary", 400));
  }

  // Fallback error
  return next(new ErrorHandler("Failed to delete profile picture", 500));
});

// User Info
export const userName = catchAsyncErrors(async (req, res, next) => {
  const { user } = req;
  const { username } = req.params;

  const userFromUsername = await User.findOne({ username });
  if (!userFromUsername) {
    return next(new ErrorHandler("Invalid username", 404));
  }

  if (user.username !== username) {
    res.status(200).json({
      success: true,
      message: "Profile page",
      userFromUsername,
      isAdmin: false,
    });
  } else {
    res.status(200).json({
      success: true,
      message: "Profile page",
      userFromUsername,
      isAdmin: true,
    });
  }
});

// User Info
export const userFromUserId = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findById(id).select(
    "profilePicture username fullName _id"
  );
  if (!user) {
    return next(new ErrorHandler("Invalid username", 404));
  }

  res.status(200).json({
    success: true,
    message: "Profile page",
    user,
  });

  // if (user.username !== username) {
  //   res.status(200).json({
  //     success: true,
  //     message: "Profile page",
  //     userFromUsername,
  //     isAdmin: false,
  //   });
  // } else {
  //   res.status(200).json({
  //     success: true,
  //     message: "Profile page",
  //     userFromUsername,
  //     isAdmin: true,
  //   });
  // }
});

// username availablity
export const userNameAvailability = catchAsyncErrors(async (req, res, next) => {
  const { username } = req.query;

  const userFromUsername = await User.findOne({ username });

  if (userFromUsername) {
    return next(new ErrorHandler("username not available", 400));
  }
  res.status(200).json({
    success: true,
    message: "username available",
  });
});

// Update userInfo
export const updateUserInfo = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user._id;
  const user = await User.findById(userId);

  // console.log(user)

  const { fullName, username, bio, location } = req.body;
  let hasChanged = false;

  console.log("from frontend", fullName, username, bio, location)
  console.log("from loggedinuser", user.fullName, user.username, user.bio, user.location)

  if (fullName !== user.fullName) {
    user.fullName = fullName;
    hasChanged = true;
  }

  if (username !== user.username) {
    user.username = username;
    hasChanged = true;
  }

  if (bio !== undefined && bio !== user.bio) {
    user.bio = bio;
    hasChanged = true;
  }

  if (location !== undefined && location !== user.location) {
    user.location = location;
    hasChanged = true;
  }

  if (!hasChanged) {
    return next(new ErrorHandler("No fields are changed!", 400));
  }
  try {

    await user.save();

    console.log("saved")
  } catch (error) {
    console.log(error)
  }

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
  });
});

// Delete user
export const deleteUser = catchAsyncErrors(async (req, res, next) => {
  const { password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return next(new ErrorHandler("Password must be same", 400));
  }

  // ✅ Fetch fresh Mongoose document
  const user = await User.findById(req.user._id).select("+password");
  if (!user) {
    return next(new ErrorHandler("Bad request", 400));
  }

  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Email or password is invalid", 400));
  }
  await user.deleteOne();

  res
  .clearCookie("access_token")
  .clearCookie("refresh_token")
  .json({
    success: true,
    message: "Account deleted successfully",
  });
});

// Search user
export const searchUser = catchAsyncErrors(async (req, res, next) => {
  const { q } = req.query;

  if (!q) {
    return next(new ErrorHandler("Search text is required", 400));
  }

  const users = await User.find({
    $or: [
      { fullName: { $regex: q, $options: "i" } },
      { username: { $regex: q, $options: "i" } },
    ],
  })
    .select("fullName username followers profilePicture _id")
    .limit(10);

  res.status(200).json({
    success: true,
    message: "search user successfully",
    users,
  });
});

// Recover user
export const findUser = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email }).select(
    "fullName profilePicture _id"
  );

  if (!user) {
    return next(new ErrorHandler("Invalid email entered", 400));
  }

  res.status(200).json({
    success: true,
    message: "search user successfully",
    user,
  });
});

// Recover send-mail
export const sendMailReq = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email }).select(
    "fullName email profilePicture _id"
  );

  if (!user) {
    return next(new ErrorHandler("Invalid credentials"));
  }

  const resetToken = await user.getResetToken();
  await user.save();

  const resetLink = `${process.env.CLIENT_URI}/account/recover/${resetToken}`;

  await sendMail(email, "Password recovery", resetLink);

  res.status(200).json({
    success: true,
    message: `Email sent to ${user.email} successfully`,
  });
});

// Reset Password
export const resetPassword = catchAsyncErrors(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  console.log(req.params.token)

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });


  if (!user) {
    return next(
      new ErrorHandler(
        "Reset Password Token is invalid or has been expired",
        400
      )
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password does not match", 400));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendToken(user, 200, res);
});
