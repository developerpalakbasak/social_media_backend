// commentRoutes.js

import express from "express";
import { isAuthenticated } from "../../../middleware/auth.js";
import { addComment, deleteComment, getPostComments, getRepliesForComment } from "../../../controllers/commentController.js";

const commentRouter = express.Router();


// Auth User Routes
commentRouter
  .route("/:id") // delete : comment mongoid / other / :Posts mongoid 
  .post(isAuthenticated, addComment) // add a comment
  .delete(isAuthenticated, deleteComment) // delete own comment 
  .get(isAuthenticated, getPostComments);  // get all comments

  // fetch more replies 
commentRouter.get("/replies/:parentCommentId", getRepliesForComment);


export default commentRouter;
