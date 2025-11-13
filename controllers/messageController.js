import mongoose from "mongoose";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import Conversation from "../models/conversationModel.js";
import Message from "../models/messagesModel.js";
import ErrorHandler from "../utils/errorHandler.js";

// get messages
export const getMessages = catchAsyncErrors(async (req, res, next) => {
  const { convId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = 20;
  const skip = (page - 1) * limit;

  const conversation = await Conversation.findById(convId);
  
  // console.log(conversation)

  if(!conversation){
     return next(new ErrorHandler("Bad Request", 400));
  }

const isOwnMessage = conversation?.members.some(
  (item) => item.toString() === req.user._id.toString()
);

  if(!isOwnMessage){
     return next(new ErrorHandler("Bad Request", 400));
  }


  const filter = {
    $or: [
      { sender: conversation.members[0], receiver: conversation.members[1] },
      { sender: conversation.members[1], receiver: conversation.members[0] },
    ],
  };

  const totalMessages = await Message.countDocuments(filter);

  const fetchedMessages = await Message.find(filter)
    .populate("sender", "username profilePicture")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // console.log(req.user.id)

  // Return post if no notification query
  return res.status(200).json({
    success: true,
    message: `Fetched ${fetchedMessages.length} messages`,
    totalMessages,
    messages: fetchedMessages.reverse(),
    // conversation
  });
});

// send messages
export const sendMessage = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params; // receiver's ID
  const { user } = req; // sender (from middleware)
  const text = req.body?.text || null;

  if (!text && id && user._id) {
    // Check if conversation already exists

    console.log("if block");

    let conversation = await Conversation.findOne({
      members: { $all: [user._id, id], $size: 2 },
    });

    if (conversation) {
      return res.status(200).json({
        success: true,
        conversation,
      });
    } else {
      conversation = await Conversation.create({
        members: [user._id, id],
      });

      return res.status(201).json({
        success: true,
        conversation,
      });
    }
  }

  const message = await Message.create({
    sender: user._id,
    receiver: id,
    content: text,
  });
  await message.populate("sender", "username fullName profilePicture");

  // Check if conversation already exists
  let conversation = await Conversation.findOne({
    members: { $all: [user._id, id], $size: 2 },
  });

  if (conversation) {
    conversation.lastMessage = message._id;
    await conversation.save();
  } else {
    conversation = await Conversation.create({
      members: [user._id, id],
      lastMessage: message._id,
    });
  }

  const messageToEmit = {
    ...message.toObject(),
    conversationId: conversation._id.toString(),
  };
  const io = req.app.get("io");

  io.to(conversation._id.toString()).emit("receive-message", messageToEmit);

  console.log("after send socket io");

  return res.status(201).json({
    success: true,
    message,
  });
});

// get conversations
export const getMyConversations = catchAsyncErrors(async (req, res, next) => {
  const { user } = req;

  const conversation = await Conversation.find({
    members: user._id,
  })
    .populate("members", "fullName username profilePicture")
    .populate({
      path: "lastMessage",
      populate: {
        path: "sender",
        select: "username fullName profilePicture",
      },
    });

  return res.status(200).json({
    success: true,
    message: "My conversations",
    conversation: conversation.reverse(),
  });
});

// mark as read last message
export const markAsRead = catchAsyncErrors(async (req, res, next) => {
  const { conversationId, messageId } = req.query;

  const message = await Message.findById(messageId);

  // console.log(conversationId);
  // console.log(message);

  if (
    message.receiver.toString() == req.user._id.toString() &&
    !message.isRead
  ) {
    message.isRead = true;

    message.save();

    const messageToEmit = {
      isReadLastMessage: true,
    };

    // const io = req.app.get("io");

    // io.to(conversationId).emit("seen-lastMessage", messageToEmit);

    return res.status(200).json({
      success: true,
      message: "Marked as read",
    });
  } else {
    return res.status(200).json({
      success: true,
      message: "Already read",
    });
  }
});



// get single conversation
export const getSingleConversation = catchAsyncErrors(async (req, res, next) => {
  const { convId } = req.query;

  const conversation = await Conversation.findById(convId)

  return res.status(200).json({
    success: true,
    message: "Single Conversation",
    conversation,
  });
});