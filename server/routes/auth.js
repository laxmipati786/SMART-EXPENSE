// ==========================================================
// routes/auth.js — Authentication Routes
// POST /api/auth/signup  — Register new user + welcome email
// POST /api/auth/login   — Login and get JWT token
// GET  /api/auth/me      — Get current user profile
// ==========================================================

const express = require('express');
const auth = require('../middleware/auth');
const { signup, login, getMe } = require('../controllers/authController');

const router = express.Router();

// Public routes (no auth required)
router.post('/signup', signup);
router.post('/login', login);

// Protected route (auth required)
router.get('/me', auth, getMe);

module.exports = router;
