import { Server } from "socket.io";
import isAuthSocket from "../middleware/socketAuth.js";
import connectionHandler from "./connectionHandler.js";

export default function setupSocketIO(server, app) {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
    },
  });

  app.set("io", io)

  io.use(isAuthSocket);

  io.on("connection", (socket) => connectionHandler(io, socket));



}
