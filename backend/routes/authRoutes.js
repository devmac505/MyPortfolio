const express = require('express');
const { login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes are working' });
});

// Test auth route for token verification
router.get('/test-auth', protect, (req, res) => {
  res.json({ success: true, message: 'Token is valid', user: req.user });
});

router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;
