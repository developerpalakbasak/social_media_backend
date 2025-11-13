// models/Comment.js
import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  author:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  post:     { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  text:     { type: String, required: true },

  parentComment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }, // for replies
  replies:       [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
}, { timestamps: true });

commentSchema.pre('remove', async function (next) {
  await this.model('Comment').deleteMany({ parentComment: this._id });
  next();
});

const Comment = mongoose.model('Comment', commentSchema);

export default Comment
