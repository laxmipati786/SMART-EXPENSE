// ==========================================================
// utils/sendEmail.js — Core Email Utility
// Reusable email sender using Nodemailer + Gmail SMTP
// ==========================================================

const nodemailer = require('nodemailer');

/**
 * Creates a Nodemailer transporter using SMTP credentials
 * from environment variables. Returns null if not configured.
 *
 * Required ENV variables:
 *   EMAIL_HOST  — SMTP host (e.g., smtp.gmail.com)
 *   EMAIL_PORT  — SMTP port (e.g., 587)
 *   EMAIL_USER  — Sender email address
 *   EMAIL_PASS  — App-specific password (NOT your Gmail password)
 *
 * For Gmail:
 *   1. Enable 2-Step Verification
 *   2. Generate App Password at https://myaccount.google.com/apppasswords
 *   3. Use that 16-char password as EMAIL_PASS
 */
const createTransporter = () => {
    const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = process.env;

    // Validate all required credentials exist
    if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASS) {
        console.warn('⚠️  Email not configured — EMAIL_HOST, EMAIL_USER, or EMAIL_PASS missing in .env');
        return null;
    }

    return nodemailer.createTransport({
        host: EMAIL_HOST,
        port: parseInt(EMAIL_PORT || '587'),
        secure: parseInt(EMAIL_PORT || '587') === 465, // SSL for port 465, STARTTLS for 587
        auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASS,
        },
        // Connection pooling for better performance
        pool: true,
        maxConnections: 3,
        maxMessages: 100,
    });
};

// Singleton transporter — created once, reused across requests
let transporter = null;

/**
 * Get or create the email transporter (lazy initialization)
 * @returns {Object|null} Nodemailer transporter or null
 */
const getTransporter = () => {
    if (!transporter) {
        transporter = createTransporter();
    }
    return transporter;
};

// ==========================================================
// Core sendEmail Function — Reusable across the entire app
// ==========================================================

/**
 * Send an email using SMTP
 *
 * @param {string} to       — Recipient email address
 * @param {string} subject  — Email subject line
 * @param {string} text     — Plain text body (fallback)
 * @param {string} [html]   — HTML body (optional, takes priority)
 *
 * @returns {Object} { success: boolean, messageId: string|null, mock: boolean }
 *
 * @example
 *   await sendEmail('user@example.com', 'Hello!', 'Plain text body');
 *   await sendEmail('user@example.com', 'Hello!', 'Fallback', '<h1>HTML Body</h1>');
 */
const sendEmail = async (to, subject, text, html = null) => {
    const emailTransporter = getTransporter();

    // If SMTP not configured, log to console (development fallback)
    if (!emailTransporter) {
        console.log('═══════════════════════════════════════════');
        console.log('📧 [MOCK EMAIL] — SMTP not configured');
        console.log(`   To:      ${to}`);
        console.log(`   Subject: ${subject}`);
        console.log(`   Body:    ${text.substring(0, 200)}...`);
        console.log('═══════════════════════════════════════════');
        return { success: true, messageId: null, mock: true };
    }

    try {
        // Send the email
        const info = await emailTransporter.sendMail({
            from: `"ExpenseAI" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,       // Plain text fallback
            ...(html && { html }), // HTML body if provided
        });

        console.log(`✅ Email sent successfully to ${to} — MessageID: ${info.messageId}`);
        return { success: true, messageId: info.messageId, mock: false };
    } catch (error) {
        console.error(`❌ Email failed to ${to}:`, error.message);

        // Don't throw — email failure shouldn't crash the app
        // Log the error and return failure status
        return { success: false, messageId: null, mock: false, error: error.message };
    }
};

// ==========================================================
// Pre-built Email Templates
// ==========================================================

/**
 * Send a welcome email to a newly registered user
 *
 * @param {string} to   — User's email address
 * @param {string} name — User's display name
 */
const sendWelcomeEmail = async (to, name) => {
    const subject = '🎉 Welcome to Smart Expense Tracker!';

    // Plain text version
    const text = `Hello ${name},\n\nWelcome to Smart Expense Tracker! Your account has been successfully created.\n\nYou can now:\n- Track your income and expenses\n- Set monthly budgets with alerts\n- Get AI-powered financial insights\n- Export PDF & CSV reports\n\nStart managing your finances smartly!\n\n— The ExpenseAI Team`;

    // Styled HTML version
    const html = `
    <div style="font-family: 'Inter', 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f23; color: #e2e8f0; border-radius: 16px; overflow: hidden; border: 1px solid rgba(99, 102, 241, 0.15);">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 40px 30px; text-align: center;">
        <div style="font-size: 48px; margin-bottom: 12px;">🎉</div>
        <h1 style="margin: 0; font-size: 26px; color: white; font-weight: 800;">Welcome to ExpenseAI!</h1>
        <p style="margin: 10px 0 0; color: rgba(255,255,255,0.8); font-size: 14px;">Smart Financial Analytics Platform</p>
      </div>

      <!-- Body -->
      <div style="padding: 35px 30px;">
        <p style="font-size: 16px; margin: 0 0 24px; line-height: 1.6;">
          Hello <strong style="color: #a78bfa;">${name}</strong>,
        </p>
        <p style="font-size: 15px; margin: 0 0 24px; color: #aaaac0; line-height: 1.6;">
          Your account has been successfully created. Welcome aboard! Here's what you can do:
        </p>

        <!-- Feature cards -->
        <div style="margin-bottom: 24px;">
          ${[
            { emoji: '💰', title: 'Track Expenses', desc: 'Log income & expenses with smart categorization' },
            { emoji: '🎯', title: 'Budget Alerts', desc: 'Set limits and get email alerts when you overspend' },
            { emoji: '🤖', title: 'AI Insights', desc: 'Get personalized financial advice powered by GPT' },
            { emoji: '📊', title: 'Visual Analytics', desc: 'Beautiful charts showing your spending patterns' },
        ].map(f => `
            <div style="display: flex; align-items: center; gap: 14px; padding: 14px; margin-bottom: 8px; background: rgba(99, 102, 241, 0.06); border-radius: 12px; border-left: 3px solid #6366f1;">
              <span style="font-size: 24px;">${f.emoji}</span>
              <div>
                <strong style="color: #e2e8f0; font-size: 14px;">${f.title}</strong>
                <p style="margin: 2px 0 0; color: #8888aa; font-size: 12px;">${f.desc}</p>
              </div>
            </div>
          `).join('')}
        </div>

        <p style="font-size: 14px; color: #8888aa; line-height: 1.6; margin: 0;">
          Start managing your finances smartly today. If you have any questions, just reply to this email!
        </p>
      </div>

      <!-- Footer -->
      <div style="padding: 20px 30px; border-top: 1px solid rgba(99, 102, 241, 0.1); text-align: center;">
        <p style="font-size: 12px; color: #5a5a7e; margin: 0;">
          © ${new Date().getFullYear()} ExpenseAI — Smart Financial Analytics
        </p>
        <p style="font-size: 11px; color: #3a3a5e; margin: 6px 0 0;">
          You received this because you signed up for an account.
        </p>
      </div>
    </div>
  `;

    return await sendEmail(to, subject, text, html);
};

/**
 * Send a budget alert email when spending exceeds the threshold
 *
 * @param {string} to         — User's email address
 * @param {string} name       — User's display name
 * @param {Object} budgetData — { category, limit, spent, percentage }
 */
const sendBudgetAlert = async (to, name, budgetData) => {
    const { category, limit, spent, percentage } = budgetData;
    const isOver = parseFloat(percentage) >= 100;

    const subject = isOver
        ? `🚨 Budget Exceeded: ${category} spending at ${percentage}%!`
        : `⚠️ Budget Alert: ${category} spending at ${percentage}%`;

    // Plain text version
    const text = `Hello ${name},\n\n${isOver ? 'You have EXCEEDED' : 'You are approaching'} your monthly ${category} budget!\n\nSpent: ₹${spent}\nBudget Limit: ₹${limit}\nUsage: ${percentage}%\n\nConsider reviewing your ${category.toLowerCase()} expenses and see where you can cut back.\n\n— ExpenseAI Budget Alerts`;

    // Styled HTML version
    const html = `
    <div style="font-family: 'Inter', 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f23; color: #e2e8f0; border-radius: 16px; overflow: hidden; border: 1px solid ${isOver ? 'rgba(244, 63, 94, 0.2)' : 'rgba(249, 115, 22, 0.2)'};">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, ${isOver ? '#e11d48, #f43f5e' : '#ea580c, #f97316'}); padding: 35px 30px; text-align: center;">
        <div style="font-size: 42px; margin-bottom: 10px;">${isOver ? '🚨' : '⚠️'}</div>
        <h1 style="margin: 0; font-size: 24px; color: white; font-weight: 800;">
          ${isOver ? 'Budget Exceeded!' : 'Budget Alert'}
        </h1>
        <p style="margin: 8px 0 0; color: rgba(255,255,255,0.8); font-size: 14px;">
          ExpenseAI — Smart Financial Analytics
        </p>
      </div>

      <!-- Body -->
      <div style="padding: 35px 30px;">
        <p style="font-size: 16px; margin: 0 0 20px; line-height: 1.6;">
          Hi <strong style="color: #a78bfa;">${name}</strong>,
        </p>
        <p style="font-size: 15px; margin: 0 0 24px; color: #aaaac0; line-height: 1.6;">
          ${isOver
            ? `You have <strong style="color: #fb7185;">exceeded</strong> your monthly <strong style="color: #e2e8f0;">${category}</strong> spending limit.`
            : `You are approaching your monthly <strong style="color: #e2e8f0;">${category}</strong> spending limit.`
        }
        </p>

        <!-- Budget Stats Card -->
        <div style="background: ${isOver ? 'rgba(244, 63, 94, 0.06)' : 'rgba(249, 115, 22, 0.06)'}; border: 1px solid ${isOver ? 'rgba(244, 63, 94, 0.15)' : 'rgba(249, 115, 22, 0.15)'}; border-radius: 14px; padding: 24px; margin-bottom: 24px;">

          <!-- Progress Bar -->
          <div style="margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
              <span style="font-size: 13px; font-weight: 600; color: ${isOver ? '#fb7185' : '#fb923c'};">${percentage}% used</span>
              <span style="font-size: 13px; color: #8888aa;">${category}</span>
            </div>
            <div style="width: 100%; height: 8px; background: rgba(255,255,255,0.06); border-radius: 4px; overflow: hidden;">
              <div style="width: ${Math.min(parseFloat(percentage), 100)}%; height: 100%; background: linear-gradient(90deg, ${isOver ? '#e11d48, #f43f5e' : '#ea580c, #f97316'}); border-radius: 4px;"></div>
            </div>
          </div>

          <!-- Stats Row -->
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px; text-align: center; border-right: 1px solid rgba(99, 102, 241, 0.1);">
                <p style="font-size: 11px; color: #5a5a7e; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">Spent</p>
                <p style="font-size: 22px; font-weight: 800; color: ${isOver ? '#fb7185' : '#fb923c'}; margin: 4px 0 0;">₹${Number(spent).toLocaleString('en-IN')}</p>
              </td>
              <td style="padding: 10px; text-align: center; border-right: 1px solid rgba(99, 102, 241, 0.1);">
                <p style="font-size: 11px; color: #5a5a7e; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">Limit</p>
                <p style="font-size: 22px; font-weight: 800; color: #10b981; margin: 4px 0 0;">₹${Number(limit).toLocaleString('en-IN')}</p>
              </td>
              <td style="padding: 10px; text-align: center;">
                <p style="font-size: 11px; color: #5a5a7e; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">${isOver ? 'Over By' : 'Remaining'}</p>
                <p style="font-size: 22px; font-weight: 800; color: ${isOver ? '#fb7185' : '#a78bfa'}; margin: 4px 0 0;">₹${Math.abs(Number(limit) - Number(spent)).toLocaleString('en-IN')}</p>
              </td>
            </tr>
          </table>
        </div>

        <!-- Tip -->
        <div style="padding: 14px; background: rgba(99, 102, 241, 0.06); border-radius: 10px; border-left: 3px solid #6366f1;">
          <p style="font-size: 13px; color: #aaaac0; margin: 0; line-height: 1.5;">
            💡 <strong style="color: #e2e8f0;">Tip:</strong> Review your ${category.toLowerCase()} expenses in the dashboard and identify areas to cut back for the rest of the month.
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div style="padding: 20px 30px; border-top: 1px solid rgba(99, 102, 241, 0.1); text-align: center;">
        <p style="font-size: 12px; color: #5a5a7e; margin: 0;">
          Sent by ExpenseAI • Manage alerts in your dashboard
        </p>
        <p style="font-size: 11px; color: #3a3a5e; margin: 6px 0 0;">
          You received this because budget alerts are enabled on your account.
        </p>
      </div>
    </div>
  `;

    return await sendEmail(to, subject, text, html);
};

/**
 * Send a monthly expense summary email
 *
 * @param {string} to      — User's email address
 * @param {string} name    — User's display name
 * @param {Object} summary — { income, expense, balance, topCategory, topAmount, month }
 */
const sendMonthlySummary = async (to, name, summary) => {
    const subject = `📊 Your ${summary.month} Financial Summary`;

    const text = `Hello ${name},\n\nHere's your ${summary.month} financial summary:\n\nIncome: ₹${summary.income}\nExpenses: ₹${summary.expense}\nNet Balance: ₹${summary.balance}\nTop Category: ${summary.topCategory} (₹${summary.topAmount})\n\n— ExpenseAI`;

    const html = `
    <div style="font-family: 'Inter', 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f23; color: #e2e8f0; border-radius: 16px; overflow: hidden; border: 1px solid rgba(99, 102, 241, 0.15);">
      <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 35px 30px; text-align: center;">
        <div style="font-size: 42px; margin-bottom: 10px;">📊</div>
        <h1 style="margin: 0; font-size: 24px; color: white; font-weight: 800;">${summary.month} Summary</h1>
        <p style="margin: 8px 0 0; color: rgba(255,255,255,0.8); font-size: 14px;">Your Financial Overview</p>
      </div>
      <div style="padding: 35px 30px;">
        <p style="font-size: 16px; margin: 0 0 24px;">Hi <strong style="color: #a78bfa;">${name}</strong>,</p>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <tr>
            <td style="padding: 16px; text-align: center; background: rgba(16, 185, 129, 0.06); border-radius: 12px;">
              <p style="font-size: 11px; color: #5a5a7e; margin: 0; text-transform: uppercase;">Income</p>
              <p style="font-size: 22px; font-weight: 800; color: #10b981; margin: 4px 0 0;">₹${Number(summary.income).toLocaleString('en-IN')}</p>
            </td>
            <td style="width: 8px;"></td>
            <td style="padding: 16px; text-align: center; background: rgba(244, 63, 94, 0.06); border-radius: 12px;">
              <p style="font-size: 11px; color: #5a5a7e; margin: 0; text-transform: uppercase;">Expenses</p>
              <p style="font-size: 22px; font-weight: 800; color: #f43f5e; margin: 4px 0 0;">₹${Number(summary.expense).toLocaleString('en-IN')}</p>
            </td>
            <td style="width: 8px;"></td>
            <td style="padding: 16px; text-align: center; background: rgba(99, 102, 241, 0.06); border-radius: 12px;">
              <p style="font-size: 11px; color: #5a5a7e; margin: 0; text-transform: uppercase;">Savings</p>
              <p style="font-size: 22px; font-weight: 800; color: #6366f1; margin: 4px 0 0;">₹${Number(summary.balance).toLocaleString('en-IN')}</p>
            </td>
          </tr>
        </table>
        <p style="font-size: 14px; color: #8888aa;">Your top spending category was <strong style="color: #e2e8f0;">${summary.topCategory}</strong> at ₹${Number(summary.topAmount).toLocaleString('en-IN')}.</p>
      </div>
      <div style="padding: 20px 30px; border-top: 1px solid rgba(99, 102, 241, 0.1); text-align: center;">
        <p style="font-size: 12px; color: #5a5a7e; margin: 0;">© ${new Date().getFullYear()} ExpenseAI — Smart Financial Analytics</p>
      </div>
    </div>
  `;

    return await sendEmail(to, subject, text, html);
};

// ==========================================================
// Verify transporter on startup (non-blocking)
// ==========================================================
const verifyEmailConnection = async () => {
    const emailTransporter = getTransporter();
    if (!emailTransporter) {
        console.log('📧 Email: Running in MOCK mode (configure EMAIL_* env vars for live emails)');
        return;
    }
    try {
        await emailTransporter.verify();
        console.log('✅ Email: SMTP connection verified — emails are live!');
    } catch (error) {
        console.error('❌ Email: SMTP verification failed —', error.message);
        console.log('   Check EMAIL_HOST, EMAIL_USER, EMAIL_PASS in your .env');
    }
};

// ==========================================================
// Exports
// ==========================================================
module.exports = {
    sendEmail,           // Core reusable function
    sendWelcomeEmail,    // Welcome email on signup
    sendBudgetAlert,     // Budget threshold alert
    sendMonthlySummary,  // Monthly expense summary
    verifyEmailConnection, // Verify SMTP on startup
};
