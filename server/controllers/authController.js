// ==========================================================
// controllers/authController.js — Authentication Controller
// Handles user signup, login, and profile retrieval
// ==========================================================

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendWelcomeEmail } = require('../utils/sendEmail');

/**
 * Generate a JWT token for authenticated sessions
 * @param {string} id — MongoDB user ID
 * @returns {string} JWT token valid for 30 days
 */
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// ==========================================================
// POST /api/auth/signup — Register a new user
// ==========================================================
const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                message: 'Please provide name, email, and password',
            });
        }

        // Check password minimum length
        if (password.length < 6) {
            return res.status(400).json({
                message: 'Password must be at least 6 characters',
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                message: 'User already exists with this email',
            });
        }

        // Create user in MongoDB
        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password,
        });

        // Generate JWT token
        const token = generateToken(user._id);

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // Send Welcome Email (non-blocking)
        // Email failure should NOT prevent signup
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        sendWelcomeEmail(user.email, user.name)
            .then((result) => {
                if (result.success) {
                    console.log(`📧 Welcome email sent to ${user.email}`);
                } else {
                    console.warn(`📧 Welcome email failed for ${user.email}: ${result.error}`);
                }
            })
            .catch((err) => {
                console.error(`📧 Welcome email error for ${user.email}:`, err.message);
            });

        // Respond to client immediately (don't wait for email)
        res.status(201).json({
            user: user.toJSON(),
            token,
            message: 'Account created successfully! Check your email for a welcome message.',
        });
    } catch (error) {
        // Handle Mongoose validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((e) => e.message);
            return res.status(400).json({ message: messages.join(', ') });
        }

        console.error('Signup Error:', error.message);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// ==========================================================
// POST /api/auth/login — Authenticate user & get token
// ==========================================================
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                message: 'Please provide email and password',
            });
        }

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Compare password hash
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate token and respond
        const token = generateToken(user._id);
        res.json({
            user: user.toJSON(),
            token,
        });
    } catch (error) {
        console.error('Login Error:', error.message);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// ==========================================================
// GET /api/auth/me — Get current user profile
// ==========================================================
const getMe = async (req, res) => {
    try {
        res.json({ user: req.user.toJSON() });
    } catch (error) {
        console.error('GetMe Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// ==========================================================
// Exports
// ==========================================================
module.exports = { signup, login, getMe };
