const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

const auth = require('../../middleware/auth');
const User = require('../../models/User');
const Post = require('../../models/Post');
const Like = require('../../models/Like');
const Comment = require('../../models/Comment');

//  @route      PUT api/likes/p/:id
//  @desc       Like a post
//  @access     Private

router.post('/p/:postId', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    // Check if the post has already been liked
    if (post.likes.some((like) => like.user.toString() === req.user.id)) {
      return res.status(400).json({ msg: 'Post already liked' });
    }

    // create Like Object
    const like = new Like({
      user: req.user.id,
      author: req.user.id,
      parentId: req.params.postId,
    });

    // store the like object and populate the author
    const query = await like.save();
    const populatedLike = await query.populate('author').execPopulate();

    // insert the like to post like array
    post.likes.unshift(populatedLike);
    await post.save(like);

    res.json(post.likes);
  } catch (err) {
    console.log(err.message);
    res.status(500).send('Server Error');
  }
});

//  @route      DELETE api/likes/p/:id
//  @desc       Unlike a post
//  @access     Private

router.delete('/p/:postId', auth, async (req, res) => {
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

//  @route      PUT api/likes/p/:postId/c/:commentId
//  @desc       Like a comment
//  @access     Private

router.post('/p/:postId/c/:commentId', auth, async (req, res) => {
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

    const query = await like.save();
    const populatedLike = await query.populate('author').execPopulate();
    comment.likes.unshift(populatedLike);

    like.save();
    await comment.save();
    res.json(comment);
  } catch (err) {
    console.log(err.message);
    res.status(500).send('Server Error');
  }
});

//  @route      DELETE api/likes/p/:postId/c/:commentId
//  @desc       Unlike a Comment
//  @access     Private

router.delete('/p/:postId/c/:commentId', auth, async (req, res) => {
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
