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

// TODO: REFACTOR LATER
//  @route      PUT api/likes/p/:postId/c/:commentId
//  @desc       Like a comment
//  @access     Private

router.post('/p/:postId/c/:commentId', auth, async (req, res) => {
  try {
    // console.log('req params', req.params);
    const post = await Post.findById(req.params.postId);
    const { comments } = post;
    const comment = await Comment.findById(req.params.commentId);

    // check if the comment is already liked
    if (comment.likes.some((like) => like.user.toString() === req.user.id)) {
      return res.status(400).json({ msg: 'Comment already liked' });
    }

    // create Like Object
    const parentId = comment.depth === 1 ? req.params.postId : comment.parentId;
    const like = new Like({
      user: req.user.id,
      author: req.user.id,
      parentId,
    });

    // save the sub like and populate the fields for author
    const query = await like.save();
    const populatedLike = await query.populate('author').execPopulate();
    let updatedComments = [];
    comment.likes.push(populatedLike);
    comment.save();

    if (comment.depth === 1) {
      // loop the comments to find the right position for the sub like
      // Also, Save the parent comment to keep the sub like
      for (let i = 0; i < comments.length; i++) {
        if (post.comments[i]._id.toString() === req.params.commentId) {
          post.comments[i] = comment;
        }
      }
    } else if (comment.depth === 2) {
      for (let i = 0; i < post.comments.length; i++) {
        if (post.comments[i]._id.toString() === comment.parentId) {
          for (let j = 0; j < comments[i].comments.length; j++) {
            if (
              post.comments[i].comments[j]._id.toString() ===
              req.params.commentId
            ) {
              post.comments[i].comments[j] = comment;
            }
          }
        }
      }
    }

    // save the comments to keep it on the post model
    await post.save();

    // return comments for rxjs update
    res.json(post.comments);
  } catch (err) {
    console.log(err.message);
    res.status(500).send('Server Error');
  }
});

// TODO: REFACTOR LATER
//  @route      DELETE api/likes/p/:postId/c/:commentId
//  @desc       Unlike a Comment
//  @access     Private

router.delete('/p/:postId/c/:commentId', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    const comment = await Comment.findById(req.params.commentId);

    const { comments } = post;

    // Check if the post has already been liked
    if (comment.likes.every((like) => like.user.toString() !== req.user.id)) {
      return res.status(400).json({ msg: 'Comment has not yet been liked' });
    }

    // Get remove index
    const removeIndex = comment.likes
      .map((like) => like.user.toString())
      .indexOf(req.user.id);

    await comment.likes[removeIndex].remove();
    comment.likes.splice(removeIndex, 1);
    await comment.save();

    if (comment.depth === 1) {
      for (let i = 0; i < comments.length; i++) {
        if (post.comments[i]._id.toString() === req.params.commentId) {
          post.comments[i] = comment;
        }
      }
    }

    if (comment.depth === 2) {
      for (let i = 0; i < post.comments.length; i++) {
        if (post.comments[i]._id.toString() === comment.parentId) {
          for (let j = 0; j < comments[i].comments.length; j++) {
            if (
              post.comments[i].comments[j]._id.toString() ===
              req.params.commentId
            ) {
              // console.log('!!!!!!!', comments[i].comments[j]._id);
              // console.log('!!!!!!!', req.params.commentId);
              post.comments[i].comments[j] = comment;
            }
          }
        }
      }
    }
    // remove the like from comments array and save the comment
    // save the post

    // post.comments = [...updatedComments];

    // await post.save();

    res.json(post.comments);
  } catch (err) {
    console.log(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
