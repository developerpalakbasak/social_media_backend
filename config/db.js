import mongoose from "mongoose";
import User from "../models/userModel.js";
import Post from "../models/postModel.js";
import syncAllIndexes from "../utils/syncAllIndexes.js";

const ConnectDB = async () => {
  if (mongoose.connections[0].readyState) return;

  await mongoose.connect(process.env.MONGO_URI);

  console.log("DB connected");

  // 🛠️ Ensure indexes (like `unique`) are synced
  try {
    // Sync all model indexes
    await syncAllIndexes([User, Post]);
    
  } catch (err) {
    console.error("Index sync failed:", err.message);
  }
};

export default ConnectDB;
