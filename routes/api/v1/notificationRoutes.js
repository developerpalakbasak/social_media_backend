// notificationRoutes.js

import express from "express";
import { isAuthenticated } from "../../../middleware/auth.js";
import {
  getAllNotifications,
  getUnreadNotifications,
  markAllAsRead,
  markNotificationRead,
  notificationToPost,
} from "../../../controllers/notificationController.js";

const notificationRouter = express.Router();

// Auth User Routes
notificationRouter.get("/", isAuthenticated, getAllNotifications);
notificationRouter.get("/unread", isAuthenticated, getUnreadNotifications);
notificationRouter.get("/read", isAuthenticated, markNotificationRead);
notificationRouter.get("/readAll", isAuthenticated, markAllAsRead);
notificationRouter.get("/postfromnotification", isAuthenticated, notificationToPost);

export default notificationRouter;
