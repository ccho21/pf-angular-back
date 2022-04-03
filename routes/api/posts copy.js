const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const Post = require('../../models/Post');
const User = require('../../models/User');

//  @route      POST api/posts
//  @desc       Create a post
//  @access     Private
router.put(
  '/',
  [
    auth,
    [
      check('content', 'Content is required').not().isEmpty(),
      // check('images', 'Images are required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    console.log('REQ BODY', req.body);
    console.log('REQ USER', req.user);
    try {
      const user = await User.findById(req.user.id).select('-password');
      console.log(user);
      const newPost = new Post({
        username: user.username,
        thumbnail: user.thumbnail,
        author: req.user.id,
        content: req.body.content,
        images: req.body.images,
      });
      const post = await newPost.save();
      res.json(post);
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
      const user = await User.findById(req.user.id).select('-password');
      const post = await Post.findById(req.params.id);
      post.content = req.body.content;
      // post.images.unshift(...req.body.images);
      post.images = req.body.images;

      const updatedPost = await post.save();
      res.json(updatedPost);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

//  @route      GET api/posts
//  @desc       get all posts
//  @access     Private

router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
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
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    await post.remove();

    res.json({ msg: 'Post removed' });
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
    console.log('WORKING?', req.params.id);
    const posts = await Post.find({ user: req.params.id });
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
