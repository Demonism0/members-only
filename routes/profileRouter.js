const express = require('express');

const router = express.Router();

// Require controller modules.
const profileController = require('../controllers/profileController');

// GET profile home page
router.get('/', profileController.index);

// GET sign-up page for creating a User
router.get('/sign-up', profileController.userCreateGET);

// Handle User create on POST
router.post('/sign-up', profileController.userCreatePOST);

// GET join page for updating User.memberStatus
router.get('/join', profileController.userJoinGET);

// Handle User.memberStatus update on POST
router.post('/join', profileController.userJoinPOST);

// GET log-in page for User
router.get('/login', profileController.userLoginGET);

// Hander User log in on POST
router.post('/login', profileController.userLoginPOST);

// Handle User log out on POST
router.get('/logout', profileController.userLogoutGET);

module.exports = router;
