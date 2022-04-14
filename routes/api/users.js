const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

const User = require('../../models/User');

//  @route      GET api/user/:id
//  @desc       GET User Detail
//  @access     Public
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password +firstname +lastname');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//  @route      POST api/users/sign-up
//  @desc       Register user
//  @access     Public
router.post(
  '/sign-up',
  [
    check('firstname', 'First Name is required').not().isEmpty(),
    check('lastname', 'Last Name is required').not().isEmpty(),
    check('username', 'User Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    console.log('REQ BODY', req.body);
    const { username, firstname, lastname, email, password, thumbnail } =
      req.body;

    try {
      let user = await User.findOne({ email });

      // See if user exists
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already exists' }] });
      }

      user = new User({
        firstname,
        lastname,
        username,
        email,
        password,
        thumbnail,
      });
      // Encrypt password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();

      // Return jsonwebtoken
      const payload = {
        user: {
          id: user.id,
        },
      };

      const userWithNoPassword = JSON.parse(JSON.stringify(user));
      delete userWithNoPassword.password;

      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token, user: userWithNoPassword });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

//  @route      POST api/users
//  @desc       Register user
//  @access     Public
// router.put(
//   '/',
//   [
//     check('firstname', 'First Name is required').not().isEmpty(),
//     check('lastname', 'Last Name is required').not().isEmpty(),
//     check('email', 'Please include a valid email').isEmail(),
//   ],
//   async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }

//     const { firstname, lastname, email, password, avatar } = req.body;
//     // Build profile object;
//     const userFields = {};
//     if (firstname) userFields.firstname = firstname;
//     if (lastname) userFields.lastname = lastname;
//     if (password) userFields.password = password;
//     if (avatar) userFields.avatar = avatar;

//     try {
//       let user = await User.findOne({ email });
//       if (!user) {
//         return res
//           .status(400)
//           .json({ errors: [{ msg: 'User cannot be found' }] });
//       }

//       // // UPDATE EMAIL, PASSWORD, EMAIL
//       // const salt = await bcrypt.genSalt(10);
//       // userFields.password = await bcrypt.hash(password, salt);

//       user = await User.findOneAndUpdate(
//         { email },
//         { $set: userFields },
//         { new: true }
//       );
//       // See if user exists
//       res.json(user);
//     } catch (err) {
//       console.error(err.message);
//       res.status(500).send('Server Error');
//     }
//   }
// );

module.exports = router;
