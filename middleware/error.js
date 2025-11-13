import ErrorHandler from "../utils/errorHandler.js";

export default (err, req, res, next) => {
  // console.log("ERROR MIDDLEWARE RECEIVED:", err);

  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal server error";

  // console.log("error middleware Error details:", {
  //   name: err.name,
  //   kind: err.kind,
  //   path: err.path,
  //   value: err.value,
  //   code: err.code,
  //   message: err.message,
  //   // stack: err.stack,
  // });

  //  Wrong Mongodb Id error
  if (err.name === "CastError" && err.kind === "ObjectId") {
    const message = `Invalid ${err.path}: ${err.value}`;
    err = new ErrorHandler(message, 400);
  }


  // missing path error for create product
  if (err.name == "ValidationError") {
    err.statusCode = 400;
  }

  // console.log(Object.keys(err.keyValue))
  // console.log(Object.values(err.keyValue))

  // Duplicate mongoose key error ( Duplicate User)
  if (err.code == 11000) {
    err.statusCode = 400;
    err.message = `Duplicate ${Object.keys(err.keyValue)} Entered`;
    err = new ErrorHandler(err.message, 400);
  }

  // Wrong JWT error
  if (err.name === "JsonWebTokenError") {
    const message = `Invalid JsonWebToken, try again`;
    err = new ErrorHandler(message, 400);
  }

  res.status(err.statusCode).json({
    success: false,
    statusCode: err.statusCode,
    message: err.message,
    // err
  });
};
