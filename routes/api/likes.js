const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

const auth = require('../../middleware/auth');
const User = require('../../models/User');
const Post = require('../../models/Post');
const Like = require('../../models/Like');
const Comment = require('../../models/Comment');

//  @route      PUT api/posts/likes/:id
//  @desc       Like a post
//  @access     Private

router.put('/:postId', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    // console.log('### LIKE IN LIKE FUNCTION', post);

    // Check if the post has already been liked
    if (post.likes.some((like) => like.user.toString() === req.user.id)) {
      return res.status(400).json({ msg: 'Post already liked' });
    }

    const like = new Like({
      user: req.user.id,
      author: req.user.id,
      parentId: req.params.postId,
    });

    await like.save();

    post.likes.unshift(like);
    await post.save(like);

    res.json(post.likes);
  } catch (err) {
    console.log(err.message);
    res.status(500).send('Server Error');
  }
});

//  @route      DELETE api/posts/likes/:id
//  @desc       Unlike a post
//  @access     Private

router.put('/u/:postId', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    const likeId = post.likes.find(
      (like) => like.user.toString() === req.user.id
    )._id;
    console.log(likeId);
    const like = await Like.findById(likeId);
    // Check if the post has already been liked
    if (post.likes.every((like) => like.user.toString() !== req.user.id)) {
      return res.status(400).json({ msg: 'Post has not yet been liked' });
    }

    // Get remove index
    const removeIndex = post.likes
      .map((like) => like.author._id.toString())
      .indexOf(req.user.id);

    post.likes.splice(removeIndex, 1);

    // remove like before saving the post.
    await like.remove();

    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.log(err.message);
    res.status(500).send('Server Error');
  }
});

//  @route      PUT api/posts/likes/:postId/comments/:commentId
//  @desc       Like a comment
//  @access     Private

router.put('/:postId/comments/:commentId', auth, async (req, res) => {
  try {
    // console.log('req params', req.params);
    const comment = await Comment.findById(req.params.commentId);
    // Check if the post does exist
    if (!comment) {
      return res.status(400).json({ msg: 'Comment does not exist' });
    }

    // check if the comment is already liked
    console.log('### :) ', comment);
    if (comment.likes.some((like) => like.user.toString() === req.user.id)) {
      return res.status(400).json({ msg: 'Comment already liked' });
    }

    const like = new Like({
      user: req.user.id,
      author: req.user.id,
    });

    comment.likes.unshift(like);

    like.save();
    await comment.save();
    res.json(comment);
  } catch (err) {
    console.log(err.message);
    res.status(500).send('Server Error');
  }
});

//  @route      DELETE api/posts/likes/:id/comments/:commentId
//  @desc       Unlike a Comment
//  @access     Private

router.put('/u/:postId/comments/:commentId', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    // console.log('### user', req.user);
    const { comments } = post;

    // get comment from comments array
    const comment = comments.find(
      (comment) => comment._id.toString() === req.params.commentId.toString()
    );

    // Check if the post has already been liked
    if (comment.likes.every((like) => like.user.toString() !== req.user.id)) {
      return res.status(400).json({ msg: 'Comment has not yet been liked' });
    }

    // Get remove index
    const removeIndex = comment.likes
      .map((like) => like.user.toString())
      .indexOf(req.user.id);

    comments.forEach((comment, i) => {
      if (comment._id.toString() === req.params.commentId) {
        comment.likes.splice(removeIndex, 1);
      }
    });

    post.comments = [...comments];

    await post.save();
    res.json(post.comments);
  } catch (err) {
    console.log(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
