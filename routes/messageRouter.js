const express = require('express');

const router = express.Router();

const messageController = require('../controllers/messageController');

// GET request for creating a message.
router.get('/create', messageController.messageCreateGET);

// Handle message create on POST.
router.post('/create', messageController.messageCreatePOST);

// GET request for deleting a message.
router.get('/:id/delete', messageController.messageDeleteGET);

// Handle message delete on POST.
router.post('/:id/delete', messageController.messageDeletePOST);

module.exports = router;
