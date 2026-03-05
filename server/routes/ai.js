const express = require('express');
const OpenAI = require('openai');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

// @route   POST /api/ai/analyze
// @desc    Get AI-powered spending insights
router.post('/analyze', async (req, res) => {
    try {
        if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
            return res.status(400).json({
                message: 'OpenAI API key not configured. Please add your API key to the .env file.',
                insights: getFallbackInsights(req.user._id)
            });
        }

        // Get last 3 months of transactions
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const transactions = await Transaction.find({
            userId: req.user._id,
            date: { $gte: threeMonthsAgo }
        }).sort({ date: -1 });

        if (transactions.length === 0) {
            return res.json({
                insights: 'No transactions found in the last 3 months. Add some transactions first to get AI-powered insights!'
            });
        }

        // Build spending summary
        const summary = buildSpendingSummary(transactions);

        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: `You are a professional financial advisor. Analyze the user's spending data and provide actionable insights. Be specific with numbers and percentages. Give 4-5 bullet points of advice. Format with emoji bullets for readability.`
                },
                {
                    role: 'user',
                    content: `Here is my financial summary for the last 3 months:\n\n${summary}\n\nPlease analyze my spending patterns and give me personalized financial advice.`
                }
            ],
            max_tokens: 500,
            temperature: 0.7
        });

        res.json({
            insights: completion.choices[0].message.content,
            summary
        });
    } catch (error) {
        console.error('AI Analysis Error:', error.message);

        // Fallback to basic analysis if OpenAI fails
        try {
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
            const transactions = await Transaction.find({
                userId: req.user._id,
                date: { $gte: threeMonthsAgo }
            });

            res.json({
                insights: generateBasicInsights(transactions),
                note: 'AI service unavailable — showing basic analysis'
            });
        } catch (fallbackError) {
            res.status(500).json({ message: 'Server error during analysis' });
        }
    }
});

function buildSpendingSummary(transactions) {
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    // Category breakdown
    const categoryBreakdown = {};
    transactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
            categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
        });

    const categoryDetails = Object.entries(categoryBreakdown)
        .sort((a, b) => b[1] - a[1])
        .map(([cat, amount]) => `  - ${cat}: ₹${amount.toFixed(2)} (${((amount / totalExpense) * 100).toFixed(1)}%)`)
        .join('\n');

    return `Total Income: ₹${totalIncome.toFixed(2)}
Total Expenses: ₹${totalExpense.toFixed(2)}
Net Savings: ₹${(totalIncome - totalExpense).toFixed(2)}
Savings Rate: ${totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome * 100).toFixed(1) : 0}%
Number of Transactions: ${transactions.length}

Expense Breakdown by Category:
${categoryDetails}`;
}

function generateBasicInsights(transactions) {
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome * 100).toFixed(1) : 0;

    const categoryBreakdown = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
        categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
    });

    const topCategory = Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1])[0];

    let insights = `📊 **Basic Financial Analysis**\n\n`;
    insights += `💰 Your total income: ₹${totalIncome.toFixed(2)}\n`;
    insights += `💸 Your total expenses: ₹${totalExpense.toFixed(2)}\n`;
    insights += `📈 Your savings rate: ${savingsRate}%\n\n`;

    if (topCategory) {
        const percentage = ((topCategory[1] / totalExpense) * 100).toFixed(1);
        insights += `🔍 Your biggest expense category is **${topCategory[0]}** at ₹${topCategory[1].toFixed(2)} (${percentage}% of spending)\n\n`;
    }

    if (savingsRate < 20) {
        insights += `⚠️ Your savings rate is below 20%. Consider reducing discretionary spending.\n`;
    } else {
        insights += `✅ Great job! Your savings rate of ${savingsRate}% is healthy.\n`;
    }

    return insights;
}

module.exports = router;
