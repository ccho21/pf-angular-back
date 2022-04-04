const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');

const Post = require('../../models/Post');
const Comment = require('../../models/Comment');
const User = require('../../models/User');

//  @route      POST api/posts/comment/:id
//  @desc       Create a comment to a post
//  @access     Private
router.put(
  '/:id',
  [auth, [check('content', 'Content is required').not().isEmpty()]],
  async (req, res) => {
    console.log('### update req comment', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('-password');
      const post = await Post.findById(req.params.id);
      // console.log(user);
      const comment = new Comment({
        content: req.body.content,
        author: req.user.id,
      });

      await comment.save();

      post.comments.unshift(comment);
      await post.save();
      res.json(post.comments);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

//  @route      DELTE api/posts/comments/:id/:comment_id
//  @desc       Delete comment
//  @access     Private

router.delete('/:id/:comment_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Pull out comment
    const comment = post.comments.find(
      (comment) => comment.id === req.params.comment_id
    );

    // Make sure comment exists
    if (!comment) {
      return res.status(400).json({ msg: 'Comment does not exists' });
    }

    // Check user
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    // Get removeIndex
    const removeIndex = post.likes
      .map((comment) => comment.user.toString())
      .indexOf(req.user.id);

    post.comments.splice(removeIndex, 1);

    await post.save();

    res.json(post.comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//  @route      POST api/posts/comments/:id/commentId
//  @desc       Comment on a post
//  @access     Private
router.put(
  '/:id/:commentId',
  [auth, [check('content', 'Content is required').not().isEmpty()]],
  async (req, res) => {
    console.log('### update req comment', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('-password');
      const post = await Post.findById(req.params.id);

      const { comments } = post;

      const subComment = new Post({
        replyTo: req.body.replyTo,
        content: req.body.content,
        username: user.username,
        thumbnail: user.thumbnail,
        user: req.user.id,
      });
      console.log('### SUB COMMENT DETAIL ###', subComment);

      comments.forEach((comment) => {
        if (comment._id === req.params.commentId) {
          comment.comments.push(subComment);
        }
      });
      console.log('### SUB COMMENT ###', post.comments);

      post.comments = [...comments];
      await post.save();

      res.json(post.comments);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);
module.exports = router;
