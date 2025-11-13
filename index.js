import dotenv from "dotenv";
dotenv.config({ path: ".env" });

import server from "./server.js";
import ConnectDB from "./config/db.js";

const PORT = process.env.PORT || 8000;

ConnectDB();

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
