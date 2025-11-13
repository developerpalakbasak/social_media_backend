// postRoutes.js

import express from "express";
import { isAuthenticated } from "../../../middleware/auth.js";
import { addPost, deletePost, myPost, myTimeline, postsUsingUsername, postUsingId,  } from "../../../controllers/postController.js";
import upload from "../../../middleware/multer.js";
import reactionRouter from "./reactionRoutes.js";
import commentRouter from "./commentRoutes.js";
const postRouter = express.Router();


// Auth User Routes
postRouter.post("/addpost", isAuthenticated, upload.single("image"),addPost );
postRouter.delete("/deletepost", isAuthenticated ,deletePost );
postRouter.get("/mypost", isAuthenticated, myPost );
postRouter.get("/timeline", isAuthenticated, myTimeline );
postRouter.get("/postusingusername", isAuthenticated, postsUsingUsername );
postRouter.get("/:id", isAuthenticated,  postUsingId);


// reaction routes 
postRouter.use("/reaction", reactionRouter);
postRouter.use("/comment", commentRouter);


export default postRouter;
