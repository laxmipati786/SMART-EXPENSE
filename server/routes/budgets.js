const express = require('express');
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');
const { sendBudgetAlert } = require('../utils/sendEmail');

const router = express.Router();
router.use(auth);

// @route   GET /api/budgets
// @desc    Get all budgets for current month/year (or specified)
router.get('/', async (req, res) => {
    try {
        const now = new Date();
        const month = parseInt(req.query.month) || (now.getMonth() + 1);
        const year = parseInt(req.query.year) || now.getFullYear();

        const budgets = await Budget.find({ userId: req.user._id, month, year });

        // Calculate current spending for each budget
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59, 999);

        const transactions = await Transaction.find({
            userId: req.user._id,
            type: 'expense',
            date: { $gte: startDate, $lte: endDate }
        });

        const spendingByCategory = {};
        let totalSpending = 0;
        transactions.forEach(t => {
            spendingByCategory[t.category] = (spendingByCategory[t.category] || 0) + t.amount;
            totalSpending += t.amount;
        });

        const budgetsWithSpending = budgets.map(b => {
            const spent = b.category === 'Overall' ? totalSpending : (spendingByCategory[b.category] || 0);
            const percentage = (spent / b.limit) * 100;
            const isOverBudget = percentage >= 100;
            const isNearLimit = percentage >= b.alertThreshold;

            return {
                ...b.toObject(),
                spent,
                percentage: Math.min(percentage, 100),
                actualPercentage: percentage,
                isOverBudget,
                isNearLimit,
                remaining: Math.max(b.limit - spent, 0)
            };
        });

        res.json({ budgets: budgetsWithSpending, month, year });
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching budgets' });
    }
});

// @route   POST /api/budgets
// @desc    Create or update a budget
router.post('/', async (req, res) => {
    try {
        const { category, limit, month, year, alertThreshold, emailAlert } = req.body;

        const now = new Date();
        const budgetMonth = month || (now.getMonth() + 1);
        const budgetYear = year || now.getFullYear();

        let budget = await Budget.findOne({
            userId: req.user._id,
            category,
            month: budgetMonth,
            year: budgetYear
        });

        if (budget) {
            budget.limit = limit;
            budget.alertThreshold = alertThreshold || 80;
            budget.emailAlert = emailAlert !== undefined ? emailAlert : true;
            budget.alertSent = false;
            await budget.save();
        } else {
            budget = await Budget.create({
                userId: req.user._id,
                category,
                limit,
                month: budgetMonth,
                year: budgetYear,
                alertThreshold: alertThreshold || 80,
                emailAlert: emailAlert !== undefined ? emailAlert : true
            });
        }

        res.status(201).json(budget);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Budget already exists for this category and month' });
        }
        res.status(500).json({ message: 'Server error creating budget' });
    }
});

// @route   DELETE /api/budgets/:id
// @desc    Delete a budget
router.delete('/:id', async (req, res) => {
    try {
        const budget = await Budget.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });
        if (!budget) return res.status(404).json({ message: 'Budget not found' });
        res.json({ message: 'Budget deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error deleting budget' });
    }
});

// @route   POST /api/budgets/check-alerts
// @desc    Check budgets and send email alerts if thresholds exceeded
router.post('/check-alerts', async (req, res) => {
    try {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        const budgets = await Budget.find({
            userId: req.user._id,
            month,
            year,
            emailAlert: true,
            alertSent: false
        });

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59, 999);

        const transactions = await Transaction.find({
            userId: req.user._id,
            type: 'expense',
            date: { $gte: startDate, $lte: endDate }
        });

        const spendingByCategory = {};
        let totalSpending = 0;
        transactions.forEach(t => {
            spendingByCategory[t.category] = (spendingByCategory[t.category] || 0) + t.amount;
            totalSpending += t.amount;
        });

        const alerts = [];
        for (const budget of budgets) {
            const spent = budget.category === 'Overall' ? totalSpending : (spendingByCategory[budget.category] || 0);
            const percentage = (spent / budget.limit) * 100;

            if (percentage >= budget.alertThreshold) {
                alerts.push({ budget, spent, percentage });

                // Send email
                try {
                    const emailResult = await sendBudgetAlert(req.user.email, req.user.name, {
                        category: budget.category,
                        limit: budget.limit,
                        spent,
                        percentage: percentage.toFixed(1)
                    });

                    if (emailResult && !emailResult.success) {
                        console.error('Email send failed:', emailResult.error);
                    } else {
                        budget.alertSent = true;
                        await budget.save();
                    }
                } catch (emailErr) {
                    console.error('Email send exception:', emailErr.message);
                }
            }
        }

        res.json({
            alertsSent: alerts.length, alerts: alerts.map(a => ({
                category: a.budget.category,
                limit: a.budget.limit,
                spent: a.spent,
                percentage: a.percentage.toFixed(1)
            }))
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error checking alerts' });
    }
});

module.exports = router;
