const mongoose = require('mongoose');
const Populate = require('../util/autopopulate');

const Schema = mongoose.Schema;
const LikeSchema = new mongoose.Schema({
  author: {
    type: Schema.Types.ObjectId,
    ref: 'user',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// LikeSchema.pre('findOne', Populate('author')).pre('find', Populate('author'));

module.exports = mongoose.model('like', LikeSchema);
