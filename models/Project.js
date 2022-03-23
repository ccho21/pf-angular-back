const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ProjectSchema = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user',
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  url: {
    type: String,
  },
  repositoryUrl: {
    type: String,
  },
  images: [
    {
      title: {
        type: String,
      },
      src: {
        type: String,
      },
    },
  ],
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
      text: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      avatar: {
        type: String,
      },
      date: {
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

module.exports = mongoose.model('project', ProjectSchema);
