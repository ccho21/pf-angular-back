const mongoose = require('mongoose');
const Populate = require('../util/autopopulate');

const Schema = mongoose.Schema;
const CommentSchema = new mongoose.Schema({
  author: {
    type: Schema.Types.ObjectId,
    ref: 'user',
  },
  comments: [{ type: Schema.Types.ObjectId, ref: 'comment' }],
  likes: [{ type: Schema.Types.ObjectId, ref: 'like' }],
  content: {
    type: String,
    required: true,
  },
  parentId: {
    type: String,
    required: true,
  },
  depth: {
    type: Number,
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

CommentSchema.pre('findOne', Populate('author'), '[Author] FindOne')
  .pre('find', Populate('author'), '[Author] Find')
  .pre('findOne', Populate('comments'), '[Comments] FindOne')
  .pre('find', Populate('comments'), '[Comments] Find')
  .pre('findOne', Populate('likes'), '[Likes] FindOne')
  .pre('find', Populate('likes'), '[Likes] Find');

module.exports = mongoose.model('comment', CommentSchema);
