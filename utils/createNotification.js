// utils/createNotification.js
import Notification from "../models/notificationModel.js";

export const createNotification = async ({
  type,
  senderId,
  receiverId,
  postId,
  commentId,
}) => {
  // console.log(type, senderId, receiverId, postId, commentId);

  if (senderId.toString() === receiverId.toString()) return;

  await Notification.create({
    type,
    sender: senderId,
    receiver: receiverId,
    post: postId || null,
    comment: commentId || null,
  });
};
