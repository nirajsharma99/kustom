const mongoose = require('mongoose')

const Schema = mongoose.Schema

const commentSchema = new Schema(
  {
    username: { type: String, required: true },
    usertype: { type: String, required: true },
    comment: { type: String, require: true },
    replies: { type: [Schema.Types.Mixed], required: false },
  },
  { timestamps: true }
);

const Comment = mongoose.model('Comment',commentSchema)
module.exports = Comment