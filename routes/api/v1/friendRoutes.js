import express from "express";
import { isAuthenticated } from "../../../middleware/auth.js";
import {
  sendRemoveFriendRequest,
  acceptFriendRequest,
  deleteFriendRequest,
  myFriends,
  queryFriendRequests,
  querySentFriendRequests,
  cancelFriendRequest,
  unFriend,
  getFavorites,
  favoriteToggle
} from "../../../controllers/friendController.js";

const friendRouter = express.Router();

// Friend request send/remove (toggle)
friendRouter.post("/friendrequest", isAuthenticated, sendRemoveFriendRequest);

// Accept/decline friend request
friendRouter.post("/acceptfriendreq", isAuthenticated, acceptFriendRequest);
friendRouter.post("/deletefriendreq", isAuthenticated, deleteFriendRequest);

// Cancel sent friend request (sent only)
friendRouter.delete("/cancelfriendreq", isAuthenticated, cancelFriendRequest);

// Unfriend
friendRouter.delete("/unfriend", isAuthenticated, unFriend);

// Friends and requests
friendRouter.get("/myfriends", isAuthenticated, myFriends);
friendRouter.get("/friendrequests", isAuthenticated, queryFriendRequests);
friendRouter.get("/sentfriendrequests", isAuthenticated, querySentFriendRequests);

// favorite
friendRouter.get("/favorite", isAuthenticated, getFavorites);
friendRouter.post("/favorite", isAuthenticated, favoriteToggle);

export default friendRouter;
