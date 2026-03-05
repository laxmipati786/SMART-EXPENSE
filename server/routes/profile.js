const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

// @route   GET /api/profile
// @desc    Get user profile
router.get('/', async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json({ user: user.toJSON() });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/profile
// @desc    Update user profile (name, email)
router.put('/', async (req, res) => {
    try {
        const { name, email } = req.body;
        const user = await User.findById(req.user._id);

        if (email && email !== user.email) {
            const existing = await User.findOne({ email });
            if (existing) return res.status(400).json({ message: 'Email already in use' });
            user.email = email;
        }

        if (name) user.name = name;
        await user.save();

        res.json({ user: user.toJSON(), message: 'Profile updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error updating profile' });
    }
});

// @route   PUT /api/profile/password
// @desc    Change password
router.put('/password', async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Please provide current and new password' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters' });
        }

        const user = await User.findById(req.user._id);
        const isMatch = await user.comparePassword(currentPassword);

        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error changing password' });
    }
});

module.exports = router;
