const { Number, Int32, ObjectID } = require('mongodb');
const mongoose = require('mongoose');
var NumberInt = require('mongoose-int32');

const Schema = mongoose.Schema;

const commentSchema = new Schema(
  {
    username: { type: String, required: true },
    usertype: { type: String, required: true },
    comment: { type: String, required: true },
    filename: { type: String, default: 'user.png' },
    replies: [
      {
        _id: { type: String },
        reply: { type: String },
        username: { type: String },
        usertype: { type: String },
        date: { type: Date },
        filename: { type: String, default: 'user.png' },
      },
    ],
    likeCount: { type: NumberInt, default: 0, required: false },
    dislikeCount: { type: NumberInt, default: 0, required: false },
    likedislike: [{ username: { type: String }, status: { type: String } }],
  },
  { timestamps: true }
);

const Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;
