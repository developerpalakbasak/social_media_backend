// followRoutes.js

import express from "express";
import { isAuthenticated } from "../../../middleware/auth.js";
import { addFollowing, myFollowers, myFollowings, removefollower, removeFollowing } from "../../../controllers/followController.js";
const followRouter = express.Router();


// Auth User Routes
followRouter.get("/myfollowings", isAuthenticated, myFollowings );
followRouter.get("/myfollowers", isAuthenticated, myFollowers );
followRouter.post("/addfollowing", isAuthenticated, addFollowing );
followRouter.delete("/removefollowing", isAuthenticated, removeFollowing );
followRouter.delete("/removefollower", isAuthenticated, removefollower );

export default followRouter;
