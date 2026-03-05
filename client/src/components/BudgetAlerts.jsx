import { useState, useEffect } from 'react';
import api from '../api/axios';

const CATEGORIES = ['Overall', 'Food', 'Transport', 'Shopping', 'Rent', 'Entertainment', 'Health', 'Education', 'Utilities', 'Other'];

const BudgetAlerts = () => {
    const [budgets, setBudgets] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [category, setCategory] = useState('Overall');
    const [limit, setLimit] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchBudgets();
    }, []);

    const fetchBudgets = async () => {
        try {
            const { data } = await api.get('/budgets');
            setBudgets(data.budgets);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!limit || Number(limit) <= 0) return;
        setSaving(true);
        try {
            await api.post('/budgets', { category, limit: Number(limit) });
            setLimit('');
            setShowForm(false);
            fetchBudgets();
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/budgets/${id}`);
            fetchBudgets();
        } catch (err) {
            console.error(err);
        }
    };

    const checkAlerts = async () => {
        try {
            const { data } = await api.post('/budgets/check-alerts');
            if (data.alertsSent > 0) {
                alert(`${data.alertsSent} budget alert(s) triggered!`);
            }
            fetchBudgets();
        } catch (err) {
            console.error(err);
        }
    };

    const getProgressColor = (percentage, isOver) => {
        if (isOver) return '#f43f5e';
        if (percentage >= 80) return '#f97316';
        if (percentage >= 60) return '#eab308';
        return '#10b981';
    };

    if (loading) {
        return <div className="glass-card"><div className="loading-shimmer h-32 rounded-xl" /></div>;
    }

    return (
        <div className="glass-card">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold" style={{ color: '#e2e8f0' }}>
                    <span className="mr-2">🎯</span>Budget Alerts
                </h3>
                <div className="flex gap-2">
                    <button onClick={checkAlerts} className="btn-ghost text-xs" style={{ padding: '4px 10px' }} title="Check & send email alerts">
                        🔔
                    </button>
                    <button onClick={() => setShowForm(!showForm)} className="btn-ghost text-xs">
                        {showForm ? 'Cancel' : '+ Set Budget'}
                    </button>
                </div>
            </div>

            {showForm && (
                <form onSubmit={handleAdd} className="space-y-3 mb-4 p-4 rounded-xl fade-in" style={{
                    background: 'rgba(10, 10, 26, 0.4)',
                    border: '1px solid rgba(99, 102, 241, 0.1)'
                }}>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: '#8888aa' }}>Category</label>
                            <select value={category} onChange={e => setCategory(e.target.value)} className="input-field text-sm">
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: '#8888aa' }}>Monthly Limit (₹)</label>
                            <input type="number" value={limit} onChange={e => setLimit(e.target.value)} className="input-field text-sm" placeholder="10000" required min="1" />
                        </div>
                    </div>
                    <button type="submit" disabled={saving} className="btn-primary w-full text-sm">
                        {saving ? 'Saving...' : 'Set Budget'}
                    </button>
                </form>
            )}

            {budgets.length === 0 ? (
                <div className="text-center py-6">
                    <div className="text-3xl mb-2">🎯</div>
                    <p className="text-sm" style={{ color: '#8888aa' }}>No budgets set yet</p>
                    <p className="text-xs mt-1" style={{ color: '#5a5a7e' }}>Set monthly spending limits to stay on track</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {budgets.map((b) => {
                        const color = getProgressColor(b.actualPercentage, b.isOverBudget);
                        return (
                            <div key={b._id} className="p-3 rounded-xl transition-all fade-in" style={{
                                background: 'rgba(10, 10, 26, 0.4)',
                                border: `1px solid ${b.isOverBudget ? 'rgba(244, 63, 94, 0.2)' : b.isNearLimit ? 'rgba(249, 115, 22, 0.2)' : 'rgba(99, 102, 241, 0.08)'}`
                            }}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium" style={{ color: '#e2e8f0' }}>{b.category}</span>
                                        {b.isOverBudget && (
                                            <span className="text-xs px-2 py-0.5 rounded-full" style={{
                                                background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185'
                                            }}>Over Budget!</span>
                                        )}
                                        {b.isNearLimit && !b.isOverBudget && (
                                            <span className="text-xs px-2 py-0.5 rounded-full" style={{
                                                background: 'rgba(249, 115, 22, 0.15)', color: '#fb923c'
                                            }}>Near Limit</span>
                                        )}
                                    </div>
                                    <button onClick={() => handleDelete(b._id)} className="text-xs" style={{ color: '#5a5a7e' }} title="Delete budget">✕</button>
                                </div>

                                {/* Progress Bar */}
                                <div className="w-full h-2 rounded-full overflow-hidden mb-2" style={{ background: 'rgba(99, 102, 241, 0.08)' }}>
                                    <div className="h-full rounded-full transition-all duration-700" style={{
                                        width: `${Math.min(b.actualPercentage, 100)}%`,
                                        background: `linear-gradient(90deg, ${color}, ${color}cc)`,
                                        boxShadow: b.isOverBudget ? `0 0 8px ${color}40` : 'none'
                                    }} />
                                </div>

                                <div className="flex justify-between text-xs">
                                    <span style={{ color }}>{b.actualPercentage.toFixed(0)}% used</span>
                                    <span style={{ color: '#8888aa' }}>
                                        ₹{b.spent.toLocaleString('en-IN')} / ₹{b.limit.toLocaleString('en-IN')}
                                    </span>
                                </div>
                                {b.remaining > 0 && (
                                    <p className="text-xs mt-1" style={{ color: '#5a5a7e' }}>
                                        ₹{b.remaining.toLocaleString('en-IN')} remaining
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default BudgetAlerts;
