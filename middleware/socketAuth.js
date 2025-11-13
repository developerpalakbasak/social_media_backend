import cookie from "cookie";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export default async function isAuthSocket(socket, next) {
  try {
    const rawCookie = socket.request.headers.cookie;
    if (!rawCookie) return next(new Error("No cookies found"));

    const cookies = cookie.parse(rawCookie);
    const accessToken = cookies.access_token;
    const refreshToken = cookies.refresh_token;

    if (!refreshToken) return next(new Error("Please login first"));

    let decodedAccess;

    // 1️⃣ Try verifying access token first
    try {
      decodedAccess = jwt.verify(accessToken, process.env.JWT_SECRET_ACCESSTOKEN);
    } catch (err) {
      
    }

    let user;

    // 2️⃣ If access token valid → get user from access token
    if (decodedAccess) {
      user = await User.findById(decodedAccess._id);
    } else {
      // 3️⃣ If access token expired → try verifying refresh token
      try {
        const decodedRefresh = jwt.verify(refreshToken, process.env.JWT_SECRET);
        user = await User.findById(decodedRefresh.id);
      } catch (refreshErr) {
        return next(new Error("Session expired, please login again"));
      }
    }

    if (!user) return next(new Error("User not found"));

    // 4️⃣ Attach user to socket
    socket.user = {
      _id: user._id,
      username: user.username,
      fullName: user.fullName,
    };

    

    next();

  } catch (error) {
    return next(new Error("Invalid or expired authentication"));
  }
}
