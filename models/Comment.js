const mongoose = require('mongoose');
const Populate = require('../util/autopopulate');

const Schema = mongoose.Schema;
const PostSchema = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user',
  },
  content: {
    type: String,
    required: true,
  },
  replyTo: {
    type: String,
    required: false,
  },
  username: {
    type: String,
    required: true,
  },
  thumbnail: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  },
});

module.exports = mongoose.model('post', PostSchema);
