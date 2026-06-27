const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.use(authenticate);

router.post('/', messageController.sendMessage);
router.get('/inbox', messageController.getInbox);
router.get('/sent', messageController.getSent);
router.patch('/:id/read', messageController.markMessageRead);

module.exports = router;
