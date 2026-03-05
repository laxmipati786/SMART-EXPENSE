const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { verifyEmailConnection } = require('./utils/sendEmail');

// Load env variables
dotenv.config();

// Connect to database
connectDB();

// Verify Email Connection on startup
verifyEmailConnection();

const app = express();

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/budgets', require('./routes/budgets'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/chat', require('./routes/chat'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Smart Expense Tracker API is running' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err.stack);
    res.status(500).json({ message: 'Something went wrong on the server' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 API available at http://localhost:${PORT}/api`);
});
