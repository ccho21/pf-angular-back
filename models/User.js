const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
    select: false,
  },
  lastname: {
    type: String,
    required: true,
    select: false,
  },
  username: {
    type: String,
    required: true,
  },
  thumbnail: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  },
});

module.exports = mongoose.model('user', UserSchema);
