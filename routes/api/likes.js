const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

const auth = require('../../middleware/auth');
const Post = require('../../models/Post');
const User = require('../../models/User');

//  @route      PUT api/posts/likes/:id
//  @desc       Like a post
//  @access     Private

router.put('/:id', auth, async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select('-password');
      const post = await Post.findById(req.params.id);
      // Check if the post has already been liked
      if (post.likes.some((like) => like.user.toString() === req.user.id)) {
        return res.status(400).json({ msg: 'Post already liked' });
      }
  
      post.likes.unshift({
        user: req.user.id,
        thumbnail: user.thumbnail,
        username: user.username,
      });
      await post.save();
      res.json(post.likes);
    } catch (err) {
      console.log(err.message);
      res.status(500).send('Server Error');
    }
  });
  
  //  @route      DELETE api/posts/likes/:id
  //  @desc       Unlike a post
  //  @access     Private
  
  router.delete('/:id', auth, async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      console.log(post.likes);
      // Check if the post has already been liked
      if (post.likes.every((like) => like.user.toString() !== req.user.id)) {
        return res.status(400).json({ msg: 'Post has not yet been liked' });
      }
  
      // Get remove index
      const removeIndex = post.likes
        .map((like) => like.user.toString())
        .indexOf(req.user.id);
  
      post.likes.splice(removeIndex, 1);
  
      await post.save();
      res.json(post.likes);
    } catch (err) {
      console.log(err.message);
      res.status(500).send('Server Error');
    }
  });
  
  
  


//  @route      PUT api/posts/likes/:postId/:commentId
//  @desc       Like a comment
//  @access     Private

router.put('/:id/:commentId', auth, async (req, res) => {
    try {
      // console.log('req params', req.params);
      const post = await Post.findById(req.params.id);
      // Check if the post does exist
      if (!post) {
        return res.status(400).json({ msg: 'Post does not exist' });
      }
  
      // console.log('### user', req.user);
      const user = await User.findById(req.user.id).select('-password');
      const { comments } = post;
  
      const comment = comments.find(
        (comment) => comment._id.toString() === req.params.commentId
      );
      // check if the comment is already liked
      if (comment.likes.some((like) => like.user.toString() === req.user.id)) {
        return res.status(400).json({ msg: 'Comment already liked' });
      }
  
      comments.forEach((comment) => {
        if (comment._id.toString() === req.params.commentId) {
          comment.likes.unshift({
            user: req.user.id,
            thumbnail: user.thumbnail,
            username: user.username,
          });
        }
      });
  
      post.comments = [...comments];
      console.log('### final ', post.comments);
      await post.save();
      res.json(post.comments);
    } catch (err) {
      console.log(err.message);
      res.status(500).send('Server Error');
    }
  });
  
  //  @route      DELETE api/posts/likes/:id/:commentId
  //  @desc       Unlike a Comment
  //  @access     Private
  
  router.delete('/:id/:commentId', auth, async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
  
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
  