// likeRoutes.js

import express from "express";
import { isAuthenticated } from "../../../middleware/auth.js";
import { addOrRemoveLike } from "../../../controllers/likeController.js";

const reactionRouter = express.Router();


// Auth User Routes
reactionRouter.post("/like", isAuthenticated, addOrRemoveLike);


export default reactionRouter;
