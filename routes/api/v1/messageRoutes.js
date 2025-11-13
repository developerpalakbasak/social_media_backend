import express from "express";
import { isAuthenticated } from "../../../middleware/auth.js";
import { getMessages, getMyConversations, getSingleConversation, markAsRead, sendMessage } from "../../../controllers/messageController.js";


const messageRouter = express.Router();

// favorite
messageRouter.get("/getall", isAuthenticated, getMyConversations);
messageRouter.get("/getsingleconv", isAuthenticated, getSingleConversation);
messageRouter.get("/getmessages/:convId", isAuthenticated, getMessages);
messageRouter.post("/sendmessage/:id", isAuthenticated, sendMessage);
messageRouter.patch("/message/read", isAuthenticated, markAsRead);

export default messageRouter;
