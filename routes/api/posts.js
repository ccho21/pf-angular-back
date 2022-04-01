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
      check('images', 'Images are required').not().isEmpty(),
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

//  @route      PUT api/posts/like/:id
//  @desc       Like a post
//  @access     Private

router.put('/like/:id', auth, async (req, res) => {
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
router.put(
  '/comment/:id',
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
      console.log(user);
      const newComment = new Post({
        content: req.body.content,
        username: user.username,
        thumbnail: user.thumbnail,
        user: req.user.id,
      });

      post.comments.unshift(newComment);
      // console.log('### post ', post);

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

//  @route      PUT api/posts/like/:postId/:commentId
//  @desc       Like a comment
//  @access     Private

router.put('/like/:id/:commentId', auth, async (req, res) => {
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

//  @route      PUT api/posts/unlike/:id/:commentId
//  @desc       Unlike a Comment
//  @access     Private

router.put('/unlike/:id/:commentId', auth, async (req, res) => {
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

//  @route      PUT api/posts/views/:id/
//  @desc       Add Views to a Post
//  @access     Private

router.put('/views/:id', auth, async (req, res) => {
  try {
    console.log('came in?');
    const user = await User.findById(req.user.id).select('-password');
    const post = await Post.findById(req.params.id);
    console.log(user);
    console.log(post);
    // Check if the post has already been liked
    if (post.likes.some((like) => like.user.toString() === req.user.id)) {
      return res.status(400).json({ msg: 'Post already liked' });
    }

    post.views.unshift({
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

module.exports = router;
