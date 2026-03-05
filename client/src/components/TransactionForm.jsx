import { useState } from 'react';

const EXPENSE_CATEGORIES = ['Food', 'Transport', 'Shopping', 'Rent', 'Entertainment', 'Health', 'Education', 'Utilities', 'Other'];
const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Other'];

const TransactionForm = ({ onAdd }) => {
    const [type, setType] = useState('expense');
    const [category, setCategory] = useState('Food');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

    const handleTypeChange = (newType) => {
        setType(newType);
        setCategory(newType === 'income' ? 'Salary' : 'Food');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!amount || Number(amount) <= 0) return;
        setLoading(true);
        try {
            await onAdd({ type, category, amount: Number(amount), date, description });
            setAmount('');
            setDescription('');
            setShowForm(false);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-card">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold" style={{ color: '#e2e8f0' }}>
                    <span className="mr-2">➕</span>Add Transaction
                </h3>
                <button
                    id="toggle-form-btn"
                    onClick={() => setShowForm(!showForm)}
                    className="btn-ghost text-xs"
                >
                    {showForm ? 'Cancel' : 'New'}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="space-y-4 fade-in">
                    {/* Type Toggle */}
                    <div className="flex gap-2 p-1 rounded-xl" style={{ background: 'rgba(10, 10, 26, 0.5)' }}>
                        <button
                            type="button"
                            onClick={() => handleTypeChange('expense')}
                            className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
                            style={{
                                background: type === 'expense' ? 'linear-gradient(135deg, #f43f5e, #e11d48)' : 'transparent',
                                color: type === 'expense' ? 'white' : '#8888aa'
                            }}
                        >
                            💸 Expense
                        </button>
                        <button
                            type="button"
                            onClick={() => handleTypeChange('income')}
                            className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
                            style={{
                                background: type === 'income' ? 'linear-gradient(135deg, #10b981, #059669)' : 'transparent',
                                color: type === 'income' ? 'white' : '#8888aa'
                            }}
                        >
                            💰 Income
                        </button>
                    </div>

                    {/* Category & Amount */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium mb-1.5" style={{ color: '#8888aa' }}>Category</label>
                            <select
                                id="transaction-category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="input-field text-sm"
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium mb-1.5" style={{ color: '#8888aa' }}>Amount (₹)</label>
                            <input
                                id="transaction-amount"
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="input-field text-sm"
                                placeholder="0.00"
                                min="0.01"
                                step="0.01"
                                required
                            />
                        </div>
                    </div>

                    {/* Date & Description */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium mb-1.5" style={{ color: '#8888aa' }}>Date</label>
                            <input
                                id="transaction-date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="input-field text-sm"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium mb-1.5" style={{ color: '#8888aa' }}>Description</label>
                            <input
                                id="transaction-description"
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="input-field text-sm"
                                placeholder="Optional note"
                            />
                        </div>
                    </div>

                    <button
                        id="add-transaction-btn"
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>Add {type === 'income' ? 'Income' : 'Expense'}</>
                        )}
                    </button>
                </form>
            )}
        </div>
    );
};

export default TransactionForm;
