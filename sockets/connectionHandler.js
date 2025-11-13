// connectionHandler.js

import joinRoom from "./events/joinRoom.js";
import leaveRoom from "./events/leaveRoom.js";
import markMessageSeen from "./events/markMessageSeen.js";
import userDisconnect from "./events/userDisconnect.js";
import userOnline from "./events/userOnline.js";

// userId => Set(socketIds)
const onlineUserMap = new Map();
const disconnectTimeoutMap = new Map(); // userId => Timeout

export default function connectionHandler(io, socket) {

  // Event handlers
  socket.on("user-online", userOnline(io, socket, onlineUserMap, disconnectTimeoutMap));
  socket.on("join-room", joinRoom(socket));
  socket.on("leave-room", leaveRoom(socket));
  socket.on("mark-message-seen", markMessageSeen(socket));
  socket.on("disconnect", userDisconnect(io, socket, onlineUserMap, disconnectTimeoutMap));
}
