const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');

const Message = require('../models/message');

exports.index = asyncHandler(async (req, res) => {
  const messageList = await Message.find().sort({ time: -1 }).populate('user').exec();

  res.render('index', {
    title: 'Clubhouse Homepage',
    user: req.user,
    messageList,
  });
});

exports.messageCreateGET = (req, res) => {
  if (!req.user) {
    res.redirect('/');
  } else {
    res.render('message_create', {
      title: 'New Message',
      user: req.user,
    });
  }
};

exports.messageCreatePOST = [
  body('messageTitle')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Title must not be empty')
    .isLength({ max: 70 })
    .withMessage('Title must not contain more than 70 characters')
    .escape(),
  body('messageBody')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Body must not be empty')
    .isLength({ max: 280 })
    .withMessage('Body must not contain more than 280 characters')
    .escape(),

  asyncHandler(async (req, res) => {
    if (!req.user) {
      res.redirect('/');
    }

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render('message_create', {
        title: 'New Message',
        user: req.user,
        fields: {
          title: req.body.messageTitle,
          body: req.body.messageBody,
        },
        errors: errors.array(),
      });
    } else {
      const message = new Message({
        title: req.body.messageTitle,
        body: req.body.messageBody,
        user: req.user._id,
        date: new Date(),
      });
      await message.save();
      res.redirect('/');
    }
  }),
];

exports.messageDeleteGET = asyncHandler(async (req, res) => {
  if (!req.user) {
    res.redirect('/');
  } else if (req.user.memberStatus !== 'Admin') {
    res.redirect('/');
  } else {
    const message = await Message.findById(req.params.id).populate('user').exec();

    if (message === null) {
      res.redirect('/');
    }

    res.render('message_delete', {
      title: 'Delete Message',
      message,
      user: req.user,
    });
  }
});

exports.messageDeletePOST = asyncHandler(async (req, res) => {
  if (!req.user) {
    res.redirect('/');
  } else if (req.user.memberStatus !== 'Admin') {
    res.redirect('/');
  } else {
    await Message.findByIdAndDelete(req.body.messageid);
    res.redirect('/');
  }
});
