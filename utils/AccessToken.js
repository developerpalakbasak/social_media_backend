import jwt from "jsonwebtoken";

// Create JWT token from userInfo
export const createAccessToken = (userInfo) => {
  const secret = process.env.JWT_SECRET_ACCESSTOKEN;

  const token = jwt.sign(userInfo, secret, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRE || "7d",
  });

  return token;
};
