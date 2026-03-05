import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';
import Filters from '../components/Filters';
import Charts from '../components/Charts';
import AIAdvisor from '../components/AIAdvisor';
import ExportReport from '../components/ExportReport';
import BudgetAlerts from '../components/BudgetAlerts';
import AIChatbot from '../components/AIChatbot';
import AnimatedCounter from '../components/AnimatedCounter';

const Dashboard = () => {
    const [transactions, setTransactions] = useState([]);
    const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
    const [filters, setFilters] = useState({ month: '', year: '', category: '', type: '' });
    const [loading, setLoading] = useState(true);

    const fetchTransactions = useCallback(async () => {
        try {
            const params = {};
            if (filters.month) params.month = filters.month;
            if (filters.year) params.year = filters.year;
            if (filters.category) params.category = filters.category;
            if (filters.type) params.type = filters.type;

            const { data } = await api.get('/transactions', { params });
            setTransactions(data.transactions);
            setSummary(data.summary);
        } catch (err) {
            console.error('Failed to fetch transactions:', err);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const handleAdd = async (transaction) => {
        await api.post('/transactions', transaction);
        fetchTransactions();
    };

    const handleDelete = async (id) => {
        await api.delete(`/transactions/${id}`);
        fetchTransactions();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center animate-pulse-glow"
                            style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))' }}>
                            <div className="w-8 h-8 border-3 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
                        </div>
                        <p className="glow-text font-semibold text-lg">Loading Financial Data...</p>
                        <div className="w-48 h-1 mx-auto mt-4 rounded-full overflow-hidden" style={{ background: 'rgba(99,102,241,0.1)' }}>
                            <div className="h-full rounded-full loading-shimmer" style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #6366f1)', backgroundSize: '200% 100%' }} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* === 3D Summary Cards === */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {/* Income Card */}
                    <div className="glass-card summary-card-income slide-up group" style={{ animationDelay: '0.05s' }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#5a5a7e', letterSpacing: '0.12em' }}>
                                    Total Income
                                </p>
                                <p className="text-3xl font-extrabold mt-2">
                                    <AnimatedCounter value={summary.income} prefix="₹" color="#10b981" duration={1200} />
                                </p>
                            </div>
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110 group-hover:rotate-6"
                                style={{ background: 'rgba(16, 185, 129, 0.1)', boxShadow: '0 4px 16px rgba(16, 185, 129, 0.1)' }}>
                                💰
                            </div>
                        </div>
                    </div>

                    {/* Expense Card */}
                    <div className="glass-card summary-card-expense slide-up group" style={{ animationDelay: '0.15s' }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#5a5a7e', letterSpacing: '0.12em' }}>
                                    Total Expenses
                                </p>
                                <p className="text-3xl font-extrabold mt-2">
                                    <AnimatedCounter value={summary.expense} prefix="₹" color="#f43f5e" duration={1200} />
                                </p>
                            </div>
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110 group-hover:rotate-6"
                                style={{ background: 'rgba(244, 63, 94, 0.1)', boxShadow: '0 4px 16px rgba(244, 63, 94, 0.1)' }}>
                                💸
                            </div>
                        </div>
                    </div>

                    {/* Balance Card */}
                    <div className={`glass-card slide-up group ${summary.balance >= 0 ? 'summary-card-balance' : 'summary-card-expense'}`}
                        style={{ animationDelay: '0.25s' }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#5a5a7e', letterSpacing: '0.12em' }}>
                                    Net Balance
                                </p>
                                <p className="text-3xl font-extrabold mt-2">
                                    <AnimatedCounter
                                        value={Math.abs(summary.balance)}
                                        prefix={summary.balance < 0 ? '-₹' : '₹'}
                                        color={summary.balance >= 0 ? '#6366f1' : '#f43f5e'}
                                        duration={1200}
                                    />
                                </p>
                            </div>
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110 group-hover:rotate-6"
                                style={{
                                    background: summary.balance >= 0 ? 'rgba(99, 102, 241, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                                    boxShadow: `0 4px 16px ${summary.balance >= 0 ? 'rgba(99, 102, 241, 0.1)' : 'rgba(244, 63, 94, 0.1)'}`
                                }}>
                                📊
                            </div>
                        </div>
                    </div>
                </div>

                {/* === Filters === */}
                <Filters filters={filters} onFilterChange={setFilters} />

                {/* === Main Content Grid === */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 space-y-6">
                        <TransactionForm onAdd={handleAdd} />
                        <BudgetAlerts transactions={transactions} />
                        <ExportReport transactions={transactions} summary={summary} />
                    </div>
                    <div className="lg:col-span-2">
                        <TransactionList transactions={transactions} onDelete={handleDelete} />
                    </div>
                </div>

                {/* === Charts === */}
                <Charts transactions={transactions} />

                {/* === AI Advisor === */}
                <AIAdvisor transactions={transactions} summary={summary} />
            </main>

            {/* AI Chatbot */}
            <AIChatbot />

            {/* Footer */}
            <footer className="text-center py-8 text-xs" style={{ color: '#5a5a7e', borderTop: '1px solid rgba(99, 102, 241, 0.05)' }}>
                <p className="glow-text font-medium mb-1">ExpenseAI</p>
                <p>© 2026 Smart Financial Analytics Platform</p>
            </footer>
        </div>
    );
};

export default Dashboard;
