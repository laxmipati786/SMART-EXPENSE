import { useState } from 'react';
import api from '../api/axios';

const AIAdvisor = ({ transactions, summary }) => {
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const analyzeSpending = async () => {
        setLoading(true);
        setError('');
        setInsights(null);
        try {
            const { data } = await api.post('/ai/analyze');
            setInsights(data.insights);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to connect to AI... showing local insights instead.');
        } finally {
            setLoading(false);
        }
    };

    // Advanced Local Insights Engine (Calculations based on user data dynamically)
    const getLocalInsights = () => {
        if (!transactions?.length) return null;

        const income = summary?.income || 0;
        const expenses = summary?.expense || 0;
        const savings = summary?.balance || 0;

        const savingsRate = income > 0 ? ((savings / income) * 100).toFixed(1) : 0;

        const expensesByCategory = {};
        transactions.filter(t => t.type === 'expense').forEach(t => {
            expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
        });

        const topCategory = Object.keys(expensesByCategory).reduce((a, b) => expensesByCategory[a] > expensesByCategory[b] ? a : b, null);
        const topCategoryAmount = topCategory ? expensesByCategory[topCategory] : 0;
        const topCategoryPercent = (expenses > 0) ? ((topCategoryAmount / expenses) * 100).toFixed(1) : 0;
        const topCategoryIncomePercent = (income > 0) ? ((topCategoryAmount / income) * 100).toFixed(1) : 0;

        const tips = [];
        if (savingsRate < 20 && income > 0) {
            tips.push({ text: 'Your savings rate is below 20%.', action: 'Consider reducing discretionary spending like Entertainment or Shopping.', icon: '⚠️', color: '#f43f5e' });
        } else if (savingsRate >= 50) {
            tips.push({ text: 'Incredible savings rate!', action: 'You are saving over 50%. Consider investing the surplus.', icon: '🌟', color: '#10b981' });
        } else {
            tips.push({ text: 'You have a healthy savings habit.', action: 'Try pushing your savings rate up by another 5% this month.', icon: '📈', color: '#6366f1' });
        }

        if (topCategoryIncomePercent > 35) {
            tips.push({ text: `High spending in ${topCategory}.`, action: `You spend ${topCategoryIncomePercent}% of your income on ${topCategory}. Evaluate if you can cut costs here.`, icon: '✂️', color: '#f97316' });
        }

        if (expenses > income && income > 0) {
            tips.push({ text: 'Expenses exceeded income.', action: 'Your total expenses are higher than your income. Review your budget limits immediately.', icon: '🚨', color: '#e11d48' });
        }

        return { savingsRate, topCategory, topCategoryAmount, topCategoryPercent, tips };
    };

    const localData = getLocalInsights();

    return (
        <div className="glass-card animate-pulse-glow mt-8">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black glow-text flex items-center gap-2">
                    <span>🤖</span> AI Financial Advisor
                </h3>
                <span className="text-xs px-3 py-1.5 rounded-full font-bold uppercase tracking-wider" style={{
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.15))',
                    color: '#a78bfa',
                    border: '1px solid rgba(139, 92, 246, 0.2)'
                }}>
                    Smart Insights
                </span>
            </div>

            {/* Local Advanced Category Insights */}
            {localData && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {/* Data Points Card */}
                    <div className="p-5 rounded-2xl" style={{ background: 'rgba(10, 10, 26, 0.6)', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
                        <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#8888aa' }}>Advanced Analysis</p>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm" style={{ color: '#aaaac0' }}>Savings Rate</span>
                                <span className={`text-sm font-bold px-2.5 py-1 rounded-lg ${localData.savingsRate >= 20 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                    {localData.savingsRate}%
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm" style={{ color: '#aaaac0' }}>Highest Expense</span>
                                <div className="text-right">
                                    <span className="text-sm font-bold text-white block">{localData.topCategory}</span>
                                    <span className="text-[11px]" style={{ color: '#5a5a7e' }}>{localData.topCategoryPercent}% of all expenses</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* AI Tips Cards */}
                    <div className="space-y-3">
                        {localData.tips.map((tip, i) => (
                            <div key={i} className="p-4 rounded-xl flex items-start gap-3 slide-up" style={{
                                background: 'rgba(10, 10, 26, 0.5)',
                                borderLeft: `3px solid ${tip.color}`
                            }}>
                                <span className="text-lg mt-0.5">{tip.icon}</span>
                                <div>
                                    <p className="text-sm font-bold text-white mb-1">{tip.text}</p>
                                    <p className="text-xs leading-relaxed" style={{ color: '#8888aa' }}>{tip.action}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* GPT Analysis Trigger Section */}
            {!insights && !loading && (
                <div className="text-center py-6 border-t border-indigo-500/10 mt-2">
                    <p className="text-sm mb-5 mt-2" style={{ color: '#8888aa' }}>
                        Want deeper personalized advice? Let GPT analyze your specific spending habits.
                    </p>
                    <button onClick={analyzeSpending} className="btn-primary inline-flex items-center gap-2" style={{ padding: '12px 28px' }}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Ask GPT Advisor
                    </button>
                </div>
            )}

            {loading && (
                <div className="text-center py-8 border-t border-indigo-500/10">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4"
                        style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2))' }}>
                        <div className="w-6 h-6 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
                    </div>
                    <p className="text-sm" style={{ color: '#8888aa' }}>GPT is analyzing your spending patterns...</p>
                    <div className="w-48 h-1 mx-auto mt-3 rounded-full overflow-hidden" style={{ background: 'rgba(99, 102, 241, 0.1)' }}>
                        <div className="h-full rounded-full loading-shimmer" style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #6366f1)', backgroundSize: '200% 100%' }} />
                    </div>
                </div>
            )}

            {error && !insights && (
                <div className="p-4 rounded-xl mb-4 mt-4"
                    style={{ background: 'rgba(244, 63, 94, 0.08)', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
                    <p className="text-sm" style={{ color: '#fb7185' }}>{error}</p>
                </div>
            )}

            {insights && (
                <div className="fade-in border-t border-indigo-500/10 pt-6 mt-4">
                    <h4 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: '#a78bfa' }}>🤖 AI Deep Dive</h4>
                    <div className="p-5 rounded-2xl" style={{
                        background: 'rgba(10, 10, 26, 0.5)',
                        border: '1px solid rgba(99, 102, 241, 0.15)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.2) inset'
                    }}>
                        <div className="prose prose-invert text-sm leading-relaxed whitespace-pre-wrap" style={{ color: '#e2e8f0' }}
                            dangerouslySetInnerHTML={{
                                __html: insights
                                    .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#a78bfa">$1</strong>')
                                    .replace(/\n/g, '<br />')
                            }}
                        />
                    </div>
                    <button
                        onClick={analyzeSpending}
                        className="btn-ghost mt-5 w-full text-sm"
                    >
                        🔄 Re-generate GPT Advice
                    </button>
                </div>
            )}
        </div>
    );
};

export default AIAdvisor;
