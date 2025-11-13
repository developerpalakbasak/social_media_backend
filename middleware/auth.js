import catchAsyncErrors from "./catchAsyncErrors.js";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import ErrorHandler from "../utils/errorHandler.js";

const isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  const { access_token, refresh_token } = req.cookies;

  if (!refresh_token) {
    return next(new ErrorHandler("Please login first", 401));
  }

  try {
    // Try verifying access token
    const decodedAccess = jwt.verify(access_token, process.env.JWT_SECRET_ACCESSTOKEN);
    req.user = decodedAccess;
    return next();

  } catch (err) {
    // Access token invalid or expired
    console.log("Access token expired or invalid");

    try {
      // Try refreshing with refresh token
      const decodedRefresh = jwt.verify(refresh_token, process.env.JWT_SECRET);
      const user = await User.findById(decodedRefresh.id);

      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }

      // Create and send a new access token
      const userInfo = {
        _id: user._id,
        username: user.username,
        fullName: user.fullName,
      };

      const newAccessToken = jwt.sign(
        userInfo,
        process.env.JWT_SECRET_ACCESSTOKEN,
        { expiresIn: "10m" } // or whatever short time you want
      );

      res.cookie("access_token", newAccessToken, {
        httpOnly: true,
        expires: new Date(Date.now() + 10 * 60 * 1000),
      });

      // Important: send signal so frontend knows to retry
      return res.status(401).json({
        success: false,
        retry: true,
        message: "Access token refreshed. Retry request.",
      });

    } catch (refreshErr) {
      return next(new ErrorHandler("Session expired, please login again", 401));
    }
  }
});

export { isAuthenticated };
