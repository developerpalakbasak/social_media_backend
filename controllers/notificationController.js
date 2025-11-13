import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import Notification from "../models/notificationModel.js";
import ErrorHandler from "../utils/errorHandler.js";

// // @desc Send a notification
// export const sendNotification = catchAsyncErrors(async (req, res, next) => {
//   const { type, receiverId, postId, commentId } = req.body;
//   const senderId = req.user._id;

//   if (!type || !receiverId) {
//     return next(new ErrorHandler("Notification type and receiverId are required", 400));
//   }

//   if (senderId.toString() === receiverId.toString()) return res.status(200).json({ message: "Self-notification ignored" });

//   const notification = await Notification.create({
//     type,
//     sender: senderId,
//     receiver: receiverId,
//     post: postId || null,
//     comment: commentId || null,
//   });

//   res.status(201).json({ success: true, notification });
// });

// @desc Get all notifications for logged in user
export const getAllNotifications = catchAsyncErrors(async (req, res) => {
  const notifications = await Notification.find({ receiver: req.user._id })
    .sort({ createdAt: -1 })
    .populate("sender", "username fullName profilePicture")
    .populate("post", "content");

  res.status(200).json({ success: true, notifications });
});

// @desc Get unread notifications
export const getUnreadNotifications = catchAsyncErrors(async (req, res) => {
  const notifications = await Notification.find({
    receiver: req.user._id,
    isRead: false,
  })
    .sort({ createdAt: -1 })
    .populate("sender", "username avatar")
    .populate("post", "content");

  res.status(200).json({ success: true, notifications });
});

// @desc Mark one notification as read
export const markNotificationRead = catchAsyncErrors(async (req, res, next) => {

  const { id } = req.query;


  const notification = await Notification.findOneAndUpdate(
    { _id: id, receiver: req.user._id },
    { isRead: true },
    { new: true }
  );


  if (!notification) return next(new ErrorHandler("Notification not found", 404));

  res.status(200).json({ success: true, notification });
});

// @desc Mark all as read
export const markAllAsRead = catchAsyncErrors(async (req, res) => {
  await Notification.updateMany({ receiver: req.user._id, isRead: false }, { isRead: true });

  res.status(200).json({ success: true, message: "All notifications marked as read" });
});

// @desc Delete a notification
export const deleteNotification = catchAsyncErrors(async (req, res) => {
  const { id } = req.params;

  const notification = await Notification.findOneAndDelete({
    _id: id,
    receiver: req.user._id,
  });

  if (!notification) return next(new ErrorHandler("Notification not found", 404));

  res.status(200).json({ success: true, message: "Notification deleted" });
});



// Post from notification

export const notificationToPost = catchAsyncErrors(async (req, res) => {

    const { id } = req.query;

  // console.log(id)
  console.log(req.user._id.toString())

  const noti = await Notification.findById(id)

  console.log(noti.receiver.toString())
  console.log(noti)

  // await Notification.updateMany({ receiver: req.user._id, isRead: false }, { isRead: true });

  res.status(200).json({ success: true, message: "Notification to post" });
});
