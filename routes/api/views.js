const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');

const Post = require('../../models/Post');
const User = require('../../models/User');

//  @route      PUT api/views/:id/
//  @desc       Add Views to a Post
//  @access     Private

router.put('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    // Check if the post has already been liked
    if (post.views.some((view) => view.toString() === req.user.id)) {
      return res.status(400).json({ msg: 'Post already viewed by user' });
    }

    post.views.push(req.user.id);
    console.log(post);
    await post.save();
    res.json(post.views);
  } catch (err) {
    console.log(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
