// models/Notification.js
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["like", "comment", "follow", "mention", "friendRequest", "reply"],
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post", // Optional: Only if related to a post
    },
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment", // Optional: if the notification is about a comment
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);



const Notification = mongoose.model("Notification", notificationSchema);



export default Notification;