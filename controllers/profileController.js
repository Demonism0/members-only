const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const passport = require('passport');

const User = require('../models/user');

// Display profile home page
exports.index = (req, res) => {
  res.render('user_home', {
    title: 'Profile',
    user: req.user,
  });
};

// Display User create form on GET
exports.userCreateGET = (req, res) => {
  res.render('user_create', {
    title: 'Sign Up',
    user: req.user,
  });
};

// Handle User create on POST
exports.userCreatePOST = [
  // Validate and sanitize fields
  body('first', 'First name must not be empty')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('last', 'Last name must not be empty')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('username')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Username must not be empty')
    .isLength({ max: 38 })
    .withMessage('Username must not be longer than 38 characters')
    .escape()
    .custom(async (value) => {
      const user = await User.findOne({ username: value });
      if (user) {
        throw new Error();
      }
    })
    .withMessage('Username is already taken'),
  body('password')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Password must not be empty')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .escape(),
  body('cfmPassword')
    .trim()
    .custom((value, { req }) => (value === req.body.password))
    .withMessage('Passwords do not match')
    .escape(),

  // Process request after validation and sanitization
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages
      res.render('user_create', {
        title: 'Sign Up',
        fields: {
          first: req.body.first,
          last: req.body.last,
          username: req.body.username,
        },
        errors: errors.array(),
        user: req.user,
      });
    } else {
      // Data from the form is valid. Save User
      bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
        if (err) {
          return next(err);
        }
        const user = new User({
          firstName: req.body.first,
          lastName: req.body.last,
          username: req.body.username,
          password: hashedPassword,
        });
        await user.save();
        res.redirect('/profile');
      });
    }
  }),
];

exports.userJoinGET = (req, res) => {
  res.render('user_join', {
    title: 'Join',
    user: req.user,
  });
};

exports.userJoinPOST = [
  body('passcode')
    .trim()
    .isLength({ min: 1 })
    .withMessage('You did not enter a passcode')
    .escape()
    .custom((value) => value === process.env.MEMBER_CODE || value === process.env.ADMIN_CODE)
    .withMessage('Passcode rejected!'),
  body('userid')
    .escape(),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render('user_join', {
        title: 'Join',
        user: req.user,
        errors: errors.array(),
      });
    } else {
      if (req.body.passcode === process.env.MEMBER_CODE) {
        await User.findByIdAndUpdate(req.body.userid, { memberStatus: 'Member' });
      } else if (req.body.passcode === process.env.ADMIN_CODE) {
        await User.findByIdAndUpdate(req.body.userid, { memberStatus: 'Admin' });
      }
      res.redirect('/profile');
    }
  }),
];

exports.userLoginGET = (req, res) => {
  res.render('user_login', {
    title: 'Log In',
    errors: req.session.messages,
    user: req.user,
  });
};

exports.userLoginPOST = [
  body('username')
    .trim()
    .escape(),
  body('password')
    .trim()
    .escape(),

  passport.authenticate('local', {
    failureRedirect: '/profile/login',
    failureMessage: true,
    successRedirect: '/',
  }),
];

exports.userLogoutGET = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/profile');
  });
};
