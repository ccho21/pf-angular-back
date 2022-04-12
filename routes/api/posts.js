const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');

const User = require('../../models/User');
const Like = require('../../models/Like');
const Post = require('../../models/Post');
const Comment = require('../../models/Comment');

//  @route      GET api/posts
//  @desc       get all posts
//  @access     Private

router.get('/', auth, async (req, res) => {
  try {
    
    const posts = await Post.find().sort({ date: -1 });
    // console.log('### posts', posts);
    res.json(posts);
  } catch (err) {
    console.log(err.message);
    res.status(500).send('Server Error');
  }
});

//  @route      GET api/posts/:id
//  @desc       Get post by ID
//  @access     Private

router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });
    res.json(post);
  } catch (err) {
    console.log(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.status(500).send('Server Error');
  }
});

//  @route      POST api/posts
//  @desc       Create a post
//  @access     Private
router.post(
  '/',
  [
    auth,
    [
      check('content', 'Content is required').not().isEmpty(),
      check('images', 'Images are required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const user = await User.findById(req.user.id).select('-password');
      const post = new Post({
        content: req.body.content,
        images: req.body.images,
        author: user._id,
      });
      const query = await post.save();
      const populatedPost = await query.populate('author').execPopulate();
      console.log('POSTS ###', populatedPost);
      res.json(populatedPost);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

//  @route      PUT api/posts/:id
//  @desc       Update a post
//  @access     Private
router.put(
  '/:id',
  [
    auth,
    [
      check('content', 'Content is required').not().isEmpty(),
      check('images', 'Images are required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const post = await Post.findById(req.params.id);
      post.content = req.body.content;
      // post.images.unshift(...req.body.images);
      post.images = req.body.images;

      const query = await post.save();
      const populatedPost = await query.populate('author').execPopulate();
      console.log("### populated, ", populatedPost)
      res.json(populatedPost);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

//  @route      GET api/posts/user/:id
//  @desc       Get post by User ID
//  @access     Private

router.get('/user/:id', auth, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.id }).sort({ date: -1 });
    if (!posts.length) return res.status(404).json({ msg: 'Post not found' });
    res.json(posts);
  } catch (err) {
    console.log(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.status(500).send('Server Error');
  }
});

//  @route      DELTE api/posts/:id
//  @desc       DELTE post by ID
//  @access     Private

router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.author._id.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Remove all comments related to this post
    if (post.comments.length) {
      const comments = await Comment.find({ parentId: req.params.id });
      const commentIds = comments.map((comment) => comment._id);
      await Comment.deleteMany({ _id: commentIds });
    }
    // Remove All likes related to this post
    if (post.likes.length) {
      const likes = await Like.find({ parentId: req.params.id });
      const likeIds = likes.map((like) => like._id);
      await Like.deleteMany({ _id: likeIds });
    }

    await post.remove();

    res.json({ msg: 'Post and its removed' });
  } catch (err) {
    console.log(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.status(500).send('Server Error');
  }
});

//  @route      GET api/posts/user/:userId
//  @desc       Get post by User ID
//  @access     Private

router.get('/user/:id', auth, async (req, res) => {
  try {
    const posts = await Post.find({ author: req.params.id });
    if (!posts) return res.status(404).json({ msg: 'Post not found' });
    res.json(posts);
  } catch (err) {
    console.log(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
