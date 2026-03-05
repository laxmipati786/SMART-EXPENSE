const CATEGORIES = ['All', 'Food', 'Transport', 'Shopping', 'Rent', 'Entertainment', 'Health', 'Education', 'Utilities', 'Salary', 'Freelance', 'Other'];

const Filters = ({ filters, onFilterChange }) => {
    const currentYear = new Date().getFullYear();
    const months = [
        { value: '', label: 'All Months' },
        { value: '1', label: 'January' }, { value: '2', label: 'February' },
        { value: '3', label: 'March' }, { value: '4', label: 'April' },
        { value: '5', label: 'May' }, { value: '6', label: 'June' },
        { value: '7', label: 'July' }, { value: '8', label: 'August' },
        { value: '9', label: 'September' }, { value: '10', label: 'October' },
        { value: '11', label: 'November' }, { value: '12', label: 'December' }
    ];

    const years = [];
    for (let y = currentYear; y >= currentYear - 5; y--) {
        years.push(y);
    }

    return (
        <div className="glass-card">
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#e2e8f0' }}>
                <span className="mr-2">🔍</span>Filters
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Month */}
                <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: '#8888aa' }}>Month</label>
                    <select
                        id="filter-month"
                        value={filters.month}
                        onChange={(e) => onFilterChange({ ...filters, month: e.target.value })}
                        className="input-field text-sm"
                    >
                        {months.map(m => (
                            <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                    </select>
                </div>

                {/* Year */}
                <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: '#8888aa' }}>Year</label>
                    <select
                        id="filter-year"
                        value={filters.year}
                        onChange={(e) => onFilterChange({ ...filters, year: e.target.value })}
                        className="input-field text-sm"
                    >
                        <option value="">All Years</option>
                        {years.map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>

                {/* Category */}
                <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: '#8888aa' }}>Category</label>
                    <select
                        id="filter-category"
                        value={filters.category}
                        onChange={(e) => onFilterChange({ ...filters, category: e.target.value === 'All' ? '' : e.target.value })}
                        className="input-field text-sm"
                    >
                        {CATEGORIES.map(c => (
                            <option key={c} value={c === 'All' ? '' : c}>{c}</option>
                        ))}
                    </select>
                </div>

                {/* Type */}
                <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: '#8888aa' }}>Type</label>
                    <select
                        id="filter-type"
                        value={filters.type}
                        onChange={(e) => onFilterChange({ ...filters, type: e.target.value })}
                        className="input-field text-sm"
                    >
                        <option value="">All Types</option>
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default Filters;
