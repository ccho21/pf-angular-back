const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');

const Project = require('../../models/Project');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

const Helper = require('./helper');

//  @route      GET api/projects
//  @desc       GET all projects
//  @access     Public
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find().sort({
      date: -1,
    });
    res.json(projects);
  } catch (err) {
    console.log(err.message);
    res.status(500).send('Server Error');
  }
});

//  @route      GET api/projects/me
//  @desc       GET all projects/me
//  @access     private
router.get('/me', auth, async (req, res) => {
  try {
    const projects = await Project.find({ user: req.user.id }).sort({
      date: -1,
    });
    if (!projects) {
      return res.status(400).json({ msg: 'There is no profile for this user' });
    }
    res.json(projects);
  } catch (err) {
    console.log(err.message);
    res.status(500).send('Server Error');
  }
});

//  @route      GET api/projects/:id
//  @desc       GET PROJECT BY ID
//  @access     private
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ msg: 'Post not found' });
    res.json(project);
  } catch (err) {
    console.log(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.status(500).send('Server Error');
  }
});

//  @route      Project api/projects
//  @desc       Create a project
//  @access     Private
router.post(
  '/',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('description', 'Description is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, url, images } = req.body;
    // Build profile object;
    const projectFields = {};
    projectFields.user = req.user.id;
    if (title) projectFields.title = title;
    if (description) projectFields.description = description;
    if (url) projectFields.url = url;
    if (images) projectFields.images = projectFields.images = images;

    try {
      let project = new Project(projectFields);
      await project.save();
      res.json(project);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

//  @route      Project api/projects
//  @desc       Create a project
//  @access     Private
router.put(
  '/:id',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('description', 'Description is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    console.log('### req body ', req.body);

    const { title, description, url, images } = req.body;
    // Build profile object;
    const projectFields = {};
    projectFields.user = req.user.id;
    if (title) projectFields.title = title;
    if (description) projectFields.description = description;
    if (url) projectFields.url = url;
    if (images) projectFields.images = images;

    try {
      project = await Project.findOneAndUpdate(
        req.params.id,
        { $set: projectFields },
        { new: true }
      );
      return res.json(project);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

//  @route      DELTE api/projects/:id
//  @desc       DELTE project by ID
//  @access     Private

router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (project.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    await project.remove();

    res.json({ msg: 'Project removed' });
  } catch (err) {
    console.log(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Project not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
