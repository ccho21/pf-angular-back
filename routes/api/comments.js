const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');

const Post = require('../../models/Post');
const Comment = require('../../models/Comment');
const User = require('../../models/User');

//  @route      POST api/comments/p/:id
//  @desc       Create a comment to a post
//  @access     Private
router.post(
  '/p/:postId',
  [auth, [check('content', 'Content is required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const post = await Post.findById(req.params.postId);
      const comment = new Comment({
        content: req.body.content,
        author: req.user.id,
        parentId: req.params.postId,
        depth: 1,
      });

      const query = await comment.save();
      const populatedComment = await query.populate('author').execPopulate();

      post.comments.unshift(populatedComment);
      await post.save();
      res.json(post.comments);
      //   res.json(populatedComment);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

//  @route      DELTE api/comments/p/:postId/c/:commentId
//  @desc       Delete comment
//  @access     Private

router.delete('/p/:postId/c/:commentId', auth, async (req, res) => {
  try {
    // Pull out post
    const post = await Post.findById(req.params.postId);

    // Pull out comment
    const comment = await Comment.findById(req.params.commentId);

    console.log('### comment', comment);

    // Make sure comment exists
    if (!comment) {
      return res.status(400).json({ msg: 'Comment does not exists' });
    }

    // Check user
    if (comment.author._id.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    console.log('### post likes', post.likes);

    // Get removeIndex
    const removeIndex = post.likes
      .map((comment) => comment.user)
      .indexOf(req.user.id);
    post.comments.splice(removeIndex, 1);
    console.log('### post comments', post.comments);

    // Remove all sub commentss
    if (comment.comments.length) {
      const subComments = find({ parentId: req.params.postId }).select('_id');
      await Comment.deleteMany({ _id: subComments });
    }
    // Remove All likes
    if (comment.likes.length) {
      const likes = find({ parentId: req.params.commentId }).select('_id');
      await Comment.deleteMany({ _id: likes });
    }

    // Finally remove comment
    comment.remove();

    // update the comments in Post
    await post.save();

    res.json(post.comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//  @route      POST api/comments/p/:postId/r/:commentId
//  @desc       Comment on a post
//  @access     Private
router.post(
  '/p/:postId/r/:commentId',
  [auth, [check('content', 'Content is required').not().isEmpty()]],
  async (req, res) => {
    console.log('### [SUB COMMENT REQ BODY]', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const post = await Post.findById(req.params.postId);
      //   const comments = await Comment.find({ parentId: req.params.postId });
      const { comments } = post;
      const comment = await Comment.find({ parentId: req.params.commentId });
      console.log('### comment!!! ', comment);

      const subComment = new Comment({
        author: req.user.id,
        parentId: req.params.commentId,
        replyTo: req.body.replyTo,
        content: req.body.content,
        depth: 2,
      });

      // save the sub comment and populate the fields for author
      const query = await subComment.save();
      const populatedSubComment = await query.populate('author').execPopulate();

      // loop the comments to find the right position for the sub comment
      // Also, Save the parent comment to keep the sub comment
      comments.forEach(async (comment) => {
        if (comment._id.toString() === req.params.commentId) {
          console.log('found the sub comment');
          comment.comments.push(populatedSubComment);
          await comment.save();
        }
      });

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
