import express from "express";
import userRoutes from "./api/v1/userRoutes.js";
import followRouter from "./api/v1/followRoutes.js";
import postRouter from "./api/v1/postRoutes.js";
import friendRouter from "./api/v1/friendRoutes.js";
import notificationRouter from "./api/v1/notificationRoutes.js";
import messageRouter from "./api/v1/messageRoutes.js";

const indexRouter = express.Router();

// API v1 routes
indexRouter.use("/api/v1/user", userRoutes);
indexRouter.use("/api/v1/follow", followRouter);
indexRouter.use("/api/v1/friends", friendRouter);

// like comment also
indexRouter.use("/api/v1/post", postRouter);



indexRouter.use("/api/v1/notification", notificationRouter);
indexRouter.use("/api/v1/conversation", messageRouter);

// Add more route groups here if needed


export default indexRouter;