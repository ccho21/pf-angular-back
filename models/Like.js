const mongoose = require('mongoose');
const Populate = require('../util/autopopulate');

const Schema = mongoose.Schema;
const LikeSchema = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user',
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'user',
  },
  parentId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

LikeSchema.pre('findOne', Populate('author')).pre('find', Populate('author'));

module.exports = mongoose.model('like', LikeSchema);
