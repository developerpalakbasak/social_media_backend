import http from "http";
import app from "./app.js"; // express app
import setupSocketIO from "./sockets/indexSockets.js";

const server = http.createServer(app);

// Pass server to socket setup
setupSocketIO(server, app);

export default server;
