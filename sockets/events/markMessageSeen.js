import Message from "../../models/messagesModel.js";

export default function markMessageSeen(socket) {
  return async ({ conversationId, messageId }) => {

    const message = await Message.findById(messageId).populate("sender", "username profilePicture");

    message.isRead = true;
    message.save();

    socket.to(conversationId).emit("message-seen", {conversationId ,message});
  };
}
