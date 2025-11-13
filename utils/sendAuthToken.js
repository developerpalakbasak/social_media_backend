import { createAccessToken } from "./AccessToken.js";

const sendToken = (user, statusCode, res) => {

  const userInfo = {
    _id: user._id,
    username: user.username,
    fullName: user.fullName
  };

  const refresh_token = user.generateAuthToken();
  const access_token = createAccessToken(userInfo)


  // Option for cookie
  const optionsRefreshToken = {
    expires: new Date(
      Date.now() + Number(process.env.REFRESH_COOKIE_EXPIRE) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  const optionsAccessToken = {
    expires: new Date(
      Date.now() + Number(process.env.ACCESS_COOKIE_EXPIRE) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  res.status(statusCode)
    .cookie("refresh_token", refresh_token, optionsRefreshToken)
    .cookie("access_token", access_token, optionsAccessToken)
    .json({
      success: true,
      message: "Success",
      user,
    });
};

export default sendToken;
