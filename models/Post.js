const mongoose = require('mongoose');
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
  username: {
    type: String,
    required: true,
  },
  images: [
    {
      filename: {
        type: String,
        required: false,
      },
      url: {
        type: String,
        required: false,
      },
    },
  ],
  avatar: {
    type: String,
  },
  likes: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: 'user',
      },
    },
  ],
  comments: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: 'user',
      },
      content: {
        type: String,
        required: true,
      },
      username: {
        type: String,
        required: true,
      },
      avatar: {
        type: String,
      },
      createdAt: {
        type: Date,
        defualt: Date.now,
      },
      updatedAt: {
        type: Date,
        defualt: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    defualt: Date.now,
  },
  updatedAt: {
    type: Date,
    defualt: Date.now,
  },
});

module.exports = mongoose.model('post', PostSchema);
