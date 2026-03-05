import jsPDF from 'jspdf';
import Papa from 'papaparse';

const ExportReport = ({ transactions, summary }) => {
    const downloadCSV = () => {
        if (!transactions?.length) return;

        const data = transactions.map(t => ({
            Date: new Date(t.date).toLocaleDateString('en-IN'),
            Type: t.type,
            Category: t.category,
            Amount: t.amount,
            Description: t.description || ''
        }));

        const csv = Papa.unparse(data);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `expense-report-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const downloadPDF = () => {
        if (!transactions?.length) return;

        const doc = new jsPDF();

        // Dynamic calculations
        const income = summary?.income || 0;
        const expenses = summary?.expense || 0;
        const savings = summary?.balance || 0;
        const savingsRate = income > 0 ? ((savings / income) * 100).toFixed(1) : 0;

        const categoryTotals = {};
        transactions.filter(t => t.type === 'expense').forEach(t => {
            categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
        });

        // 1. Document Header Layout
        doc.setFontSize(24);
        doc.setTextColor(99, 102, 241); // Indigo
        doc.text('ExpenseAI', 20, 25);

        doc.setFontSize(14);
        doc.setTextColor(60, 60, 80);
        doc.text('Monthly Financial Report', 20, 33);

        doc.setFontSize(10);
        doc.setTextColor(136, 136, 170);
        doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}`, 20, 40);

        // Divider
        doc.setDrawColor(99, 102, 241);
        doc.setLineWidth(0.5);
        doc.line(20, 45, 190, 45);

        // 2. Executive Summary Box
        doc.setFillColor(250, 250, 255);
        doc.roundedRect(20, 52, 170, 30, 3, 3, 'F');
        doc.setDrawColor(220, 220, 240);
        doc.roundedRect(20, 52, 170, 30, 3, 3, 'S');

        doc.setFontSize(11);

        // Income column
        doc.setTextColor(100, 100, 120);
        doc.text('Total Income', 30, 62);
        doc.setTextColor(16, 185, 129); // Green
        doc.setFont(undefined, 'bold');
        doc.text(`Rs. ${income.toLocaleString('en-IN')}`, 30, 70);
        doc.setFont(undefined, 'normal');

        // Expense column
        doc.setTextColor(100, 100, 120);
        doc.text('Total Expenses', 85, 62);
        doc.setTextColor(244, 63, 94); // Red
        doc.setFont(undefined, 'bold');
        doc.text(`Rs. ${expenses.toLocaleString('en-IN')}`, 85, 70);
        doc.setFont(undefined, 'normal');

        // Savings column
        doc.setTextColor(100, 100, 120);
        doc.text('Savings Rate', 140, 62);
        doc.setTextColor(99, 102, 241); // Indigo
        doc.setFont(undefined, 'bold');
        doc.text(`${savingsRate}% (Rs. ${savings.toLocaleString('en-IN')})`, 140, 70);
        doc.setFont(undefined, 'normal');

        // 3. Category Breakdown
        doc.setFontSize(14);
        doc.setTextColor(60, 60, 80);
        doc.text('Category-wise Spending', 20, 95);

        doc.setDrawColor(200, 200, 220);
        doc.line(20, 98, 190, 98);

        let y = 106;
        doc.setFontSize(10);
        Object.entries(categoryTotals)
            .sort((a, b) => b[1] - a[1]) // Sort highest spend first
            .forEach(([category, amount]) => {
                if (y > 270) {
                    doc.addPage();
                    y = 20;
                }
                const percentage = ((amount / expenses) * 100).toFixed(1);

                doc.setTextColor(80, 80, 100);
                doc.text(category, 20, y);
                doc.text(`${percentage}%`, 100, y);
                doc.setTextColor(244, 63, 94);
                doc.text(`Rs. ${amount.toLocaleString('en-IN')}`, 150, y);

                // Visual bar
                doc.setFillColor(244, 63, 94);
                doc.rect(20, y + 2, (amount / expenses) * 130, 2, 'F');

                y += 10;
            });

        y += 10;

        // 4. Detailed Transactions Header
        if (y > 250) {
            doc.addPage();
            y = 20;
        }

        doc.setFontSize(14);
        doc.setTextColor(60, 60, 80);
        doc.text('Recent Transactions', 20, y);
        y += 3;
        doc.setDrawColor(200, 200, 220);
        doc.line(20, y, 190, y);

        y += 8;
        doc.setFontSize(10);
        doc.setTextColor(99, 102, 241);
        doc.text('Date', 20, y);
        doc.text('Type', 55, y);
        doc.text('Category', 80, y);
        doc.text('Amount', 120, y);
        doc.text('Description', 150, y);

        y += 4;
        doc.line(20, y, 190, y);
        y += 8;

        // 5. Transaction Rows (Limit to 50 for report or loop)
        doc.setFontSize(9);
        transactions.slice(0, 70).forEach(t => { // safety limit
            if (y > 275) {
                doc.addPage();
                y = 20;
            }
            doc.setTextColor(80, 80, 100);
            doc.text(new Date(t.date).toLocaleDateString('en-IN'), 20, y);

            doc.setTextColor(t.type === 'income' ? 16 : 244, t.type === 'income' ? 185 : 63, t.type === 'income' ? 129 : 94);
            doc.text(t.type.charAt(0).toUpperCase() + t.type.slice(1), 55, y);

            doc.setTextColor(80, 80, 100);
            doc.text(t.category, 80, y);

            doc.text(`Rs. ${t.amount.toLocaleString('en-IN')}`, 120, y);
            doc.text((t.description || '').substring(0, 22) + ((t.description?.length > 22) ? '...' : ''), 150, y);

            y += 7;
        });

        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 170);
            doc.text(`ExpenseAI Financial Tracker • Page ${i} of ${pageCount}`, 190, 285, { align: 'right' });
        }

        doc.save(`expense-report-${new Date().toISOString().split('T')[0]}.pdf`);
    };

    return (
        <div className="glass-card">
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#e2e8f0' }}>
                <span className="mr-2">📥</span>Export Report
            </h3>
            <p className="text-xs mb-4" style={{ color: '#8888aa' }}>
                Download a comprehensive monthly summary including savings rate, categories, and trends.
            </p>
            <div className="flex gap-3">
                <button
                    id="export-pdf-btn"
                    onClick={downloadPDF}
                    disabled={!transactions?.length}
                    className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm disabled:opacity-40"
                    title="Download Professional PDF Report"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Monthly Report (PDF)
                </button>
                <button
                    id="export-csv-btn"
                    onClick={downloadCSV}
                    disabled={!transactions?.length}
                    className="btn-ghost flex-1 flex items-center justify-center gap-2 text-sm disabled:opacity-40"
                    title="Download Raw Data"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    CSV
                </button>
            </div>
        </div>
    );
};

export default ExportReport;
