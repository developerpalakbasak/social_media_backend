import Conversation from "../../models/conversationModel.js";

export default function joinRoom(socket) {
  return async (conversationId) => {
    if (!conversationId) return;
    // if (conversationId !== socket.user._id.toString()) return;

    const currentUser = socket.user._id;

    const conversation = await Conversation.findById(conversationId);
  
    const isAuth = conversation.members.includes(currentUser);
    
    if (isAuth) {
      socket.join(conversationId);
    } else {
      return new Error("Unauthorize");
    }
  };
}
