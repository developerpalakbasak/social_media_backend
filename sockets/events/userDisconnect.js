// userDisconnect.js
import User from "../../models/userModel.js";

export default function userDisconnect(io, socket, onlineUserMap, disconnectTimeoutMap) {
  return async () => {
    const userId = socket.user._id.toString();
    if (!userId) return;

    const user = await User.findById(socket.user._id);
    if (!user) return;

    // If a timeout already exists, clear it first (avoid stacking)
    const existingTimeout = disconnectTimeoutMap.get(userId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      disconnectTimeoutMap.delete(userId);
    }

    // Set new timeout
    const timeout = setTimeout(() => {
      const userSockets = onlineUserMap.get(userId);
      console.log("usersocketbefore:-", userSockets);

      if (userSockets) {
        // Remove only the disconnected socket
        userSockets.delete(socket.id);

        // If no sockets left, user is fully offline
        if (userSockets.size === 0) {
          onlineUserMap.delete(userId);

          const friends = user.friends || [];
          friends.forEach((friendIdRaw) => {
            const friendId = friendIdRaw.toString();
            const friendSockets = onlineUserMap.get(friendId);
            if (friendSockets) {
              for (const friendSocketId of friendSockets) {
                io.to(friendSocketId).emit("friend-offline", userId);
              }
            }
          });
        } else {
          // Still has active sockets, update the map
          onlineUserMap.set(userId, userSockets);
        }
      }

      disconnectTimeoutMap.delete(userId);
      console.log("user socket after disconnect:", userSockets);
      console.log("disconnected user:", user._id);
      console.log("disconnected", onlineUserMap)
    }, 1000);

    disconnectTimeoutMap.set(userId, timeout);
  };
}
