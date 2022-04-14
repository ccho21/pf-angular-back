const mongoose = require('mongoose');
const Populate = require('../util/autopopulate');

const Schema = mongoose.Schema;
const PostSchema = new mongoose.Schema({
  author: {
    type: Schema.Types.ObjectId,
    ref: 'user',
  },
  comments: [{ type: Schema.Types.ObjectId, ref: 'comment' }],
  likes: [{ type: Schema.Types.ObjectId, ref: 'like' }],
  views: [
    {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
  ],
  content: {
    type: String,
    required: true,
  },
  images: {
    type: [String],
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

// Always populate the author field
PostSchema.pre('findOne', Populate('author'))
  .pre('find', Populate('author'))
  .pre('findOne', Populate('comments'))
  .pre('find', Populate('comments'))
  .pre('findOne', Populate('likes'))
  .pre('find', Populate('likes'));

module.exports = mongoose.model('post', PostSchema);
