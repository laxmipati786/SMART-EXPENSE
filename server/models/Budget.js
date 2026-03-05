const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['Food', 'Transport', 'Shopping', 'Rent', 'Entertainment', 'Health', 'Education', 'Utilities', 'Overall', 'Other']
    },
    limit: {
        type: Number,
        required: [true, 'Budget limit is required'],
        min: [1, 'Budget limit must be greater than 0']
    },
    month: {
        type: Number,
        required: true,
        min: 1,
        max: 12
    },
    year: {
        type: Number,
        required: true
    },
    alertThreshold: {
        type: Number,
        default: 80, // Alert when spending reaches 80% of limit
        min: 50,
        max: 100
    },
    emailAlert: {
        type: Boolean,
        default: true
    },
    alertSent: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

budgetSchema.index({ userId: 1, month: 1, year: 1, category: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
