// userOnline.js
import mongoose from "mongoose";
import User from "../../models/userModel.js";

export default function userOnline(io, socket, onlineUserMap, disconnectTimeoutMap) {
  return async (userId) => {

    if (!userId || userId !== socket.user._id.toString()) return;

    const user = await User.findById(socket.user._id);
    const userKey = socket.user._id.toString();

    // 🧹 Clear any pending disconnect timeout (avoid race conditions)
    const pending = disconnectTimeoutMap.get(userKey);
    if (pending) {
      clearTimeout(pending);
      disconnectTimeoutMap.delete(userKey);
    }

    // ✅ Clean up stale socket IDs (handles browser reloads)
    // Remove any old sockets that are no longer connected
    if (onlineUserMap.has(userKey)) {
      const sockets = onlineUserMap.get(userKey);
      for (const id of sockets) {
        const existingSocket = io.sockets.sockets.get(id);
        if (!existingSocket) sockets.delete(id); // remove stale one
      }
    }

    // Ensure a set exists
    if (!onlineUserMap.has(userKey)) {
      onlineUserMap.set(userKey, new Set());
    }

    const sockets = onlineUserMap.get(userKey);
    const isFirstConnection = sockets.size === 0;

    sockets.add(socket.id);
    onlineUserMap.set(userKey, sockets);

    const userObj = {
      _id: socket.user._id,
      fullName: socket.user.fullName,
      username: socket.user.username,
      profilePicture: socket.user.profilePicture,
      id: socket.user.id,
    };

    const friends = user.friends.map((fid) => fid.toString()) || [];

    // Notify friends if this is the first connection
    if (isFirstConnection) {
      friends.forEach((friendId) => {
        const friendSockets = onlineUserMap.get(friendId);
        if (friendSockets) {
          for (const friendSocketId of friendSockets) {
            io.to(friendSocketId).emit("new-friend-online", userObj);
          }
        }
      });
    }

    // Send list of currently online friends
    const onlineFriendsId = friends.filter((fid) => onlineUserMap.has(fid));
    const objectIds = onlineFriendsId.map((id) => new mongoose.Types.ObjectId(id));

    const onlineFriends = await User.find({ _id: { $in: objectIds } }).select(
      "profilePicture username fullName _id"
    );


    socket.emit("already-online-friends", onlineFriends);
  };
}
