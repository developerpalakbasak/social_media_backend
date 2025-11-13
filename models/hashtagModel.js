// models/Hashtag.js
import mongoose from 'mongoose';

const hashtagSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }]
});

export default mongoose.model('Hashtag', hashtagSchema);
