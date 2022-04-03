const mongoose = require('mongoose');
const Populate = require('../util/autopopulate');

const Schema = mongoose.Schema;
const CommentSchema = new mongoose.Schema({
  author: {
    type: Schema.Types.ObjectId,
    ref: 'user',
  },
  comments: [{ type: Schema.Types.ObjectId, ref: 'comment' }],
  content: {
    type: String,
    required: true,
  },
  replyTo: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  },
});

CommentSchema.pre('findOne', Populate('author'))
  .pre('find', Populate('author'))
  .pre('findOne', Populate('comments'))
  .pre('find', Populate('comments'));

module.exports = mongoose.model('comment', CommentSchema);
