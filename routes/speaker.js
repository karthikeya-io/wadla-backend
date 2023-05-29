const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { isSignedIn, isAuthenticated } = require('../controllers/auth');
const { getEventCreatorById } = require('../controllers/event');
const { createSpeaker, getSpeakers, uploadSpearkerPicToFirebase } = require('../controllers/speaker');
const multer = require('multer');


const upload = multer({ storage: multer.memoryStorage() });

router.param('eventId', getEventCreatorById);

router.post('/speakers/:eventId', 
    upload.single('photo'),
[
    check('name', 'Name should be at least 3 characters').isLength({ min: 3 }),
], isSignedIn, isAuthenticated, 
uploadSpearkerPicToFirebase,
createSpeaker);

router.get('/speakers/:eventId', getSpeakers);

module.exports = router;