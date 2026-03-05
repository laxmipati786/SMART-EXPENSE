const TransactionList = ({ transactions, onDelete }) => {
    if (!transactions?.length) {
        return (
            <div className="glass-card text-center py-16">
                <div className="text-5xl mb-4 float-3d inline-block">📭</div>
                <p className="text-lg font-semibold" style={{ color: '#8888aa' }}>No transactions yet</p>
                <p className="text-sm mt-2" style={{ color: '#5a5a7e' }}>Add your first income or expense to get started</p>
            </div>
        );
    }

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    };

    const getCategoryEmoji = (category) => {
        const emojis = {
            Food: '🍔', Transport: '🚗', Shopping: '🛍️', Rent: '🏠',
            Entertainment: '🎬', Health: '🏥', Education: '📚', Utilities: '⚡',
            Salary: '💼', Freelance: '💻', Other: '📦'
        };
        return emojis[category] || '📦';
    };

    return (
        <div className="glass-card">
            <h3 className="text-lg font-bold mb-5 flex items-center gap-2" style={{ color: '#e2e8f0' }}>
                <span className="text-xl">📋</span>
                <span>Recent Transactions</span>
                <span className="text-xs font-medium ml-1 px-2 py-0.5 rounded-full" style={{
                    background: 'rgba(99, 102, 241, 0.1)',
                    color: '#a78bfa',
                    border: '1px solid rgba(99, 102, 241, 0.15)'
                }}>
                    {transactions.length}
                </span>
            </h3>
            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {transactions.map((t, idx) => (
                    <div
                        key={t._id}
                        className="transaction-row flex items-center justify-between p-3.5 slide-up"
                        style={{ animationDelay: `${idx * 0.04}s` }}
                    >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 transition-transform hover:scale-110"
                                style={{
                                    background: t.type === 'income' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(244, 63, 94, 0.08)',
                                    boxShadow: `0 2px 8px ${t.type === 'income' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(244, 63, 94, 0.08)'}`
                                }}>
                                {getCategoryEmoji(t.category)}
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-sm truncate" style={{ color: '#e2e8f0' }}>
                                        {t.category}
                                    </span>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider" style={{
                                        background: t.type === 'income' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                                        color: t.type === 'income' ? '#34d399' : '#fb7185',
                                        border: `1px solid ${t.type === 'income' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)'}`
                                    }}>
                                        {t.type}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-xs" style={{ color: '#5a5a7e' }}>{formatDate(t.date)}</span>
                                    {t.description && (
                                        <span className="text-xs truncate" style={{ color: '#5a5a7e' }}>• {t.description}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                            <span className="font-extrabold text-sm" style={{
                                color: t.type === 'income' ? '#34d399' : '#fb7185',
                                filter: `drop-shadow(0 0 4px ${t.type === 'income' ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)'})`
                            }}>
                                {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                            </span>
                            <button
                                onClick={() => onDelete(t._id)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110 hover:rotate-12"
                                style={{
                                    background: 'rgba(244, 63, 94, 0.06)',
                                    border: '1px solid rgba(244, 63, 94, 0.1)',
                                    color: '#fb7185'
                                }}
                                title="Delete"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TransactionList;
