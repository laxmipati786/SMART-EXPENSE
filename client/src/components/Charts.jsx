import { useState } from 'react';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend);

const Charts = ({ transactions }) => {
    if (!transactions?.length) return null;

    // 1. Spending by Category (Pie Chart)
    const expenses = transactions.filter(t => t.type === 'expense');
    const categoryTotals = {};
    expenses.forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

    const categoryColors = {
        Food: '#f43f5e', Transport: '#6366f1', Shopping: '#8b5cf6',
        Rent: '#ec4899', Entertainment: '#f97316', Health: '#10b981',
        Education: '#06b6d4', Utilities: '#eab308', Other: '#6b7280'
    };

    const pieData = {
        labels: Object.keys(categoryTotals),
        datasets: [{
            data: Object.values(categoryTotals),
            backgroundColor: Object.keys(categoryTotals).map(c => categoryColors[c] || '#6b7280'),
            borderColor: 'rgba(5, 5, 16, 0.8)',
            borderWidth: 3,
            hoverBorderWidth: 0,
            hoverOffset: 12
        }]
    };

    // 2. Monthly Income vs Expense (Bar Chart)
    const monthlyData = {};
    transactions.forEach(t => {
        const date = new Date(t.date);
        const key = `${date.toLocaleDateString('en-IN', { month: 'short' })} ${date.getFullYear().toString().slice(-2)}`;
        if (!monthlyData[key]) monthlyData[key] = { income: 0, expense: 0, monthDate: new Date(date.getFullYear(), date.getMonth(), 1) };
        monthlyData[key][t.type] += t.amount;
    });

    // Sort by date to ensure chronological order
    const sortedMonths = Object.keys(monthlyData).sort((a, b) => monthlyData[a].monthDate - monthlyData[b].monthDate);

    const barData = {
        labels: sortedMonths,
        datasets: [
            {
                label: 'Income',
                data: sortedMonths.map(m => monthlyData[m].income),
                backgroundColor: 'rgba(16, 185, 129, 0.7)',
                borderColor: '#10b981',
                borderWidth: 1,
                borderRadius: 8,
                barPercentage: 0.6,
            },
            {
                label: 'Expense',
                data: sortedMonths.map(m => monthlyData[m].expense),
                backgroundColor: 'rgba(244, 63, 94, 0.7)',
                borderColor: '#f43f5e',
                borderWidth: 1,
                borderRadius: 8,
                barPercentage: 0.6,
            }
        ]
    };

    // 3. Last 6 Months Spending Trend (Line Chart)
    // Filter to exactly last 6 chronological months
    const last6Months = sortedMonths.slice(-6);

    const trendData = {
        labels: last6Months,
        datasets: [
            {
                label: 'Total Expenses',
                data: last6Months.map(m => monthlyData[m].expense),
                borderColor: '#f97316',
                backgroundColor: 'rgba(249, 115, 22, 0.2)',
                borderWidth: 3,
                tension: 0.4, // Smooth curved line
                fill: true,
                pointBackgroundColor: '#0a0a1a',
                pointBorderColor: '#f97316',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: '#8888aa',
                    font: { family: 'Inter', size: 12, weight: '500' },
                    usePointStyle: true,
                    padding: 20
                }
            },
            tooltip: {
                backgroundColor: 'rgba(10, 10, 26, 0.95)',
                titleColor: '#e2e8f0',
                bodyColor: '#aaaac0',
                borderColor: 'rgba(99, 102, 241, 0.2)',
                borderWidth: 1,
                cornerRadius: 12,
                padding: 14,
                displayColors: true,
                callbacks: {
                    label: function (context) {
                        return ` ₹${context.parsed.y !== undefined ? context.parsed.y.toLocaleString('en-IN') : context.parsed.toLocaleString('en-IN')}`;
                    }
                }
            }
        }
    };

    const axisOptions = {
        x: {
            ticks: { color: '#5a5a7e', font: { family: 'Inter', size: 11 } },
            grid: { color: 'rgba(99, 102, 241, 0.04)', drawBorder: false }
        },
        y: {
            ticks: {
                color: '#5a5a7e',
                font: { family: 'Inter', size: 11 },
                callback: (val) => `₹${val.toLocaleString('en-IN')}`
            },
            grid: { color: 'rgba(99, 102, 241, 0.04)', drawBorder: false }
        }
    };

    return (
        <div className="space-y-6 slide-up">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pie Chart */}
                <div className="chart-container">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: '#e2e8f0' }}>
                        <span className="animate-neon">🍩</span>
                        <span>Spending by Category</span>
                    </h3>
                    <div className="h-64 flex items-center justify-center">
                        <Pie data={pieData} options={{
                            ...chartOptions,
                            plugins: {
                                ...chartOptions.plugins,
                                tooltip: {
                                    ...chartOptions.plugins.tooltip,
                                    callbacks: {
                                        label: function (context) {
                                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                            const pct = ((context.parsed / total) * 100).toFixed(1);
                                            return ` ${context.label}: ₹${context.parsed.toLocaleString('en-IN')} (${pct}%)`;
                                        }
                                    }
                                }
                            }
                        }} />
                    </div>
                </div>

                {/* Line Chart — 6 Month Trend */}
                <div className="chart-container">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: '#e2e8f0' }}>
                        <span className="animate-neon">📈</span>
                        <span>6-Month Spending Trend</span>
                    </h3>
                    <div className="h-64">
                        <Line data={trendData} options={{
                            ...chartOptions,
                            scales: axisOptions
                        }} />
                    </div>
                </div>
            </div>

            {/* Bar Chart — Full View */}
            <div className="chart-container">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: '#e2e8f0' }}>
                    <span className="animate-neon">📊</span>
                    <span>Monthly Income vs Expense</span>
                </h3>
                <div className="h-72">
                    <Bar data={barData} options={{
                        ...chartOptions,
                        scales: axisOptions
                    }} />
                </div>
            </div>
        </div>
    );
};

export default Charts;
