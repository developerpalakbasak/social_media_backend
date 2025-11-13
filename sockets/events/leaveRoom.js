export default function leaveRoom(socket) {
  return (conversationId) => {
    socket.leave(conversationId);
  };
}
