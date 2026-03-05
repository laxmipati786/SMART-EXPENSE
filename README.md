# 🤖 ExpenseAI — Smart Financial Analytics Platform

A full-stack expense tracking application with AI-powered financial insights, analytics dashboard, and modern dark-mode UI.

## 🔥 Features

- **User Authentication** — JWT-based signup/login/logout with encrypted passwords
- **Expense Tracker** — Add income/expenses, categorize, delete transactions
- **Analytics Dashboard** — Pie charts (category breakdown), Bar charts (income vs expense)
- **AI Financial Advisor** — OpenAI-powered spending analysis and personalized advice
- **Smart Filters** — Filter by month, year, category, type
- **Export Reports** — Download PDF and CSV reports
- **Dark Mode UI** — Premium glassmorphism design with animations

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js, Vite, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| Auth | JWT + bcrypt |
| Charts | Chart.js |
| AI | OpenAI API |
| Export | jsPDF, PapaParse |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- OpenAI API key (optional — for AI insights)

### Setup

1. **Clone and install**:
```bash
cd smart-expense-tracker

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

2. **Configure environment** — Edit `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/smart-expense-tracker
JWT_SECRET=your_secret_key_here
OPENAI_API_KEY=your_openai_key_here
```

3. **Start development**:
```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

4. Open `http://localhost:5173` in your browser.

## 📁 Project Structure

```
smart-expense-tracker/
├── client/                  # React Frontend
│   ├── src/
│   │   ├── api/             # Axios instance
│   │   ├── components/      # UI components
│   │   ├── context/         # Auth context
│   │   ├── pages/           # Page components
│   │   ├── App.jsx          # Root component
│   │   ├── main.jsx         # Entry point
│   │   └── index.css        # Design system
│   └── index.html
├── server/                  # Express Backend
│   ├── config/              # DB connection
│   ├── middleware/           # JWT auth
│   ├── models/              # Mongoose models
│   ├── routes/              # API routes
│   ├── server.js            # Entry point
│   └── .env                 # Environment vars
└── README.md
```

## 📊 API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/signup` | Register user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get profile |
| GET | `/api/transactions` | List transactions |
| POST | `/api/transactions` | Add transaction |
| DELETE | `/api/transactions/:id` | Delete transaction |
| POST | `/api/ai/analyze` | AI spending analysis |
