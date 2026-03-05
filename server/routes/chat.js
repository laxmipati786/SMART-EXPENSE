const express = require('express');
const OpenAI = require('openai');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

// Store conversation history per user (in-memory for simplicity)
const conversationHistory = new Map();

// @route   POST /api/chat
// @desc    AI Chatbot - conversational financial advisor
router.post('/', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ message: 'Message is required' });

        const userId = req.user._id.toString();

        // Get or create conversation history
        if (!conversationHistory.has(userId)) {
            conversationHistory.set(userId, []);
        }
        const history = conversationHistory.get(userId);

        // Get user's financial data for context
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const transactions = await Transaction.find({
            userId: req.user._id,
            date: { $gte: threeMonthsAgo }
        }).sort({ date: -1 });

        const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        const categoryBreakdown = {};
        transactions.filter(t => t.type === 'expense').forEach(t => {
            categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
        });

        const financialContext = `User's financial data (last 3 months):
- Total Income: ₹${totalIncome.toFixed(2)}
- Total Expenses: ₹${totalExpense.toFixed(2)}
- Net Savings: ₹${(totalIncome - totalExpense).toFixed(2)}
- Savings Rate: ${totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome * 100).toFixed(1) : 0}%
- Expense breakdown: ${Object.entries(categoryBreakdown).map(([k, v]) => `${k}: ₹${v.toFixed(2)}`).join(', ')}
- Recent transactions: ${transactions.slice(0, 5).map(t => `${t.type} ₹${t.amount} (${t.category})`).join(', ')}`;

        // Check if OpenAI is configured
        if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
            // Fallback response
            const fallbackResponses = [
                `Based on your data: You have ₹${totalIncome.toFixed(0)} income and ₹${totalExpense.toFixed(0)} expenses. Your savings rate is ${totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome * 100).toFixed(1) : 0}%. ${totalExpense > totalIncome ? 'You\'re spending more than you earn — try cutting back!' : 'Great job saving!'}`,
                `Your biggest expense category is ${Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}. Consider setting a budget for it!`,
                `💡 Tip: Try the 50/30/20 rule — 50% needs, 30% wants, 20% savings. Based on your income of ₹${totalIncome.toFixed(0)}, aim to save ₹${(totalIncome * 0.2).toFixed(0)} monthly.`
            ];

            return res.json({
                reply: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)] + '\n\n_(AI chatbot requires OpenAI API key for full functionality)_',
                isAI: false
            });
        }

        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        // Add user's message to history
        history.push({ role: 'user', content: message });

        // Keep only last 10 messages to manage tokens
        const recentHistory = history.slice(-10);

        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: `You are a friendly, expert financial advisor chatbot for the ExpenseAI app. You have access to the user's real financial data. Be concise (2-4 sentences), use emojis, and give actionable advice. Always reference their actual numbers. If they ask something non-financial, gently redirect to financial topics.\n\n${financialContext}`
                },
                ...recentHistory
            ],
            max_tokens: 250,
            temperature: 0.7
        });

        const reply = completion.choices[0].message.content;

        // Add AI response to history
        history.push({ role: 'assistant', content: reply });

        // Trim history if too long
        if (history.length > 20) {
            conversationHistory.set(userId, history.slice(-20));
        }

        res.json({ reply, isAI: true });
    } catch (error) {
        console.error('Chat Error:', error.message);
        res.status(500).json({
            reply: '😅 Sorry, I\'m having trouble processing that right now. Try again in a moment!',
            isAI: false,
            error: true
        });
    }
});

// @route   DELETE /api/chat/history
// @desc    Clear chat history
router.delete('/history', (req, res) => {
    conversationHistory.delete(req.user._id.toString());
    res.json({ message: 'Chat history cleared' });
});

module.exports = router;
