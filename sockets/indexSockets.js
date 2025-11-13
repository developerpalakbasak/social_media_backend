import { Server } from "socket.io";
import isAuthSocket from "../middleware/socketAuth.js";
import connectionHandler from "./connectionHandler.js";

export default function setupSocketIO(server, app) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URI || "http://localhost:5173",
      credentials: true,
    },
  });

  app.set("io", io)

  io.use(isAuthSocket);

  io.on("connection", (socket) => connectionHandler(io, socket));



}
