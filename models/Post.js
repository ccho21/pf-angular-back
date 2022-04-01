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
  thumbnail: {
    type: String,
    required: true,
  },
  images: {
    type: [String],
    required: true,
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
      likes: [
        {
          user: {
            type: Schema.Types.ObjectId,
            ref: 'user',
          },
        },
      ],
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  },
});

module.exports = mongoose.model('post', PostSchema);
