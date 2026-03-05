const express = require('express');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const auth = require('../middleware/auth');
const { sendBudgetAlert } = require('../utils/sendEmail');

const router = express.Router();

// All routes require authentication
router.use(auth);

// @route   GET /api/transactions
// @desc    Get all transactions for the logged-in user (with optional filters)
router.get('/', async (req, res) => {
    try {
        const { month, year, category, type, minAmount, maxAmount } = req.query;

        // Build filter
        const filter = { userId: req.user._id };

        if (category) filter.category = category;
        if (type) filter.type = type;

        // Date filter (by month/year)
        if (month && year) {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0, 23, 59, 59, 999);
            filter.date = { $gte: startDate, $lte: endDate };
        } else if (year) {
            const startDate = new Date(year, 0, 1);
            const endDate = new Date(year, 11, 31, 23, 59, 59, 999);
            filter.date = { $gte: startDate, $lte: endDate };
        }

        // Amount range filter
        if (minAmount || maxAmount) {
            filter.amount = {};
            if (minAmount) filter.amount.$gte = Number(minAmount);
            if (maxAmount) filter.amount.$lte = Number(maxAmount);
        }

        const transactions = await Transaction.find(filter).sort({ date: -1 });

        // Calculate totals
        const income = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        const expense = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        res.json({
            transactions,
            summary: {
                income,
                expense,
                balance: income - expense,
                count: transactions.length
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching transactions' });
    }
});

// @route   POST /api/transactions
// @desc    Create a new transaction
router.post('/', async (req, res) => {
    try {
        const { type, category, amount, date, description } = req.body;

        const transaction = await Transaction.create({
            userId: req.user._id,
            type,
            category,
            amount,
            date: date || Date.now(),
            description
        });

        // Auto-check budget alerts after adding an expense
        if (type === 'expense') {
            checkBudgetAlerts(req.user._id, req.user.email, req.user.name).catch(err =>
                console.error('Budget alert check failed:', err.message)
            );
        }

        res.status(201).json(transaction);
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: 'Server error creating transaction' });
    }
});

// Auto budget alert checker — runs after every expense transaction
async function checkBudgetAlerts(userId, userEmail, userName) {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    // Get all active budgets for this month that haven't sent alerts yet
    const budgets = await Budget.find({
        userId,
        month,
        year,
        emailAlert: true,
        alertSent: false
    });

    if (budgets.length === 0) return;

    // Get this month's expenses
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const transactions = await Transaction.find({
        userId,
        type: 'expense',
        date: { $gte: startDate, $lte: endDate }
    });

    const spendingByCategory = {};
    let totalSpending = 0;
    transactions.forEach(t => {
        spendingByCategory[t.category] = (spendingByCategory[t.category] || 0) + t.amount;
        totalSpending += t.amount;
    });

    // Check each budget
    for (const budget of budgets) {
        const spent = budget.category === 'Overall' ? totalSpending : (spendingByCategory[budget.category] || 0);
        const percentage = (spent / budget.limit) * 100;

        if (percentage >= budget.alertThreshold) {
            console.log(`🚨 Budget alert triggered! ${budget.category}: ${percentage.toFixed(1)}% (₹${spent} / ₹${budget.limit})`);

            try {
                const emailResult = await sendBudgetAlert(userEmail, userName, {
                    category: budget.category,
                    limit: budget.limit,
                    spent,
                    percentage: percentage.toFixed(1)
                });

                if (emailResult && !emailResult.success) {
                    console.error('📧 Email send failed inside transaction:', emailResult.error);
                } else {
                    console.log(`📧 Budget alert email sent to ${userEmail} for ${budget.category}`);
                    // Mark alert as sent so we don't spam
                    budget.alertSent = true;
                    await budget.save();
                }
            } catch (emailErr) {
                console.error('📧 Email send failed:', emailErr.message);
            }
        }
    }
}

// @route   DELETE /api/transactions/:id
// @desc    Delete a transaction
router.delete('/:id', async (req, res) => {
    try {
        const transaction = await Transaction.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        await transaction.deleteOne();
        res.json({ message: 'Transaction deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error deleting transaction' });
    }
});

module.exports = router;
