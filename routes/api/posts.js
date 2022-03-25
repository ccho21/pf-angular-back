const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');

const Post = require('../../models/Post');
const User = require('../../models/User');

//  @route      POST api/posts
//  @desc       Create a post
//  @access     Private
router.post(
  '/',
  [auth, [check('content', 'Content is required').not().isEmpty()]],
  async (req, res) => {
    console.log('### post body', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const user = await User.findById(req.user.id).select('-password');
      const newPost = new Post({
        content: req.body.content,
        firstname: user.firstname,
        lastname: user.lastname,
        avatar: user.avatar,
        user: req.user.id,
      });
      const post = await newPost.save();
      res.json(post);
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
    console.log("WORKING?", req.params.id );
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

//  @route      PUT api/posts/like/:id
//  @desc       Like a post
//  @access     Private

router.put('/like/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    console.log(post.likes);
    // Check if the post has already been liked
    if (post.likes.some((like) => like.user.toString() === req.user.id)) {
      return res.status(400).json({ msg: 'Post already liked' });
    }

    post.likes.unshift({ user: req.user.id });
    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.log(err.message);
    res.status(500).send('Server Error');
  }
});

//  @route      PUT api/posts/unlike/:id
//  @desc       Unlike a post
//  @access     Private

router.put('/unlike/:id', auth, async (req, res) => {
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

//  @route      POST api/posts/comment/:id
//  @desc       Comment on a post
//  @access     Private
router.post(
  '/comment/:id',
  [auth, [check('content', 'Content is required').not().isEmpty()]],
  async (req, res) => {
    console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('-password');
      const post = await Post.findById(req.params.id);
      console.log(user);
      const newComment = new Post({
        content: req.body.content,
        firstname: user.firstname,
        lastname: user.lastname,
        avatar: user.avatar,
        user: req.user.id,
      });

      post.comments.unshift(newComment);

      await post.save();

      res.json(post.comments);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

//  @route      DELTE api/posts/comment/:id/:comment_id
//  @desc       Delete comment
//  @access     Private

router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
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

module.exports = router;
