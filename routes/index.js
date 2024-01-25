const express = require('express');

const router = express.Router();

const messageController = require('../controllers/messageController');

// GET home page.
router.get('/', messageController.index);

module.exports = router;
