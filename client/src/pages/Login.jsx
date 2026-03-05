import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
            {/* Background orbs */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute w-[400px] h-[400px] rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1), transparent 70%)', top: '10%', left: '10%', filter: 'blur(80px)', animation: 'float3d 8s ease-in-out infinite' }} />
                <div className="absolute w-[300px] h-[300px] rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08), transparent 70%)', bottom: '20%', right: '10%', filter: 'blur(60px)', animation: 'float3d 10s ease-in-out infinite reverse' }} />
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo */}
                <div className="text-center mb-10 slide-up">
                    <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center animate-neon"
                        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 8px 32px rgba(99,102,241,0.35)' }}>
                        <span className="text-2xl">💰</span>
                    </div>
                    <div className="mb-3">
                        <span className="text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                            ExpenseAI — Smart Expense Tracker
                        </span>
                    </div>
                    <h1 className="text-3xl font-black glow-text">Welcome Back</h1>
                    <p className="text-sm mt-2" style={{ color: '#5a5a7e' }}>Sign in to your financial dashboard</p>
                </div>

                {/* Form Card */}
                <div className="card-3d slide-up" style={{ animationDelay: '0.15s' }}>
                    <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                        {error && (
                            <div className="p-3.5 rounded-xl text-sm font-medium fade-in" style={{
                                background: 'rgba(244, 63, 94, 0.06)',
                                border: '1px solid rgba(244, 63, 94, 0.15)',
                                color: '#fb7185',
                                boxShadow: '0 4px 12px rgba(244, 63, 94, 0.06)'
                            }}>
                                {error}
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-semibold mb-2" style={{ color: '#8888aa' }}>Email Address</label>
                            <input
                                id="login-email"
                                type="email" value={email} onChange={e => setEmail(e.target.value)}
                                className="input-field" placeholder="you@example.com" required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2" style={{ color: '#8888aa' }}>Password</label>
                            <input
                                id="login-password"
                                type="password" value={password} onChange={e => setPassword(e.target.value)}
                                className="input-field" placeholder="••••••••" required
                            />
                        </div>
                        <button
                            id="login-submit"
                            type="submit" disabled={loading}
                            className="btn-primary w-full flex items-center justify-center gap-2"
                            style={{ padding: '14px', fontSize: '1rem', borderRadius: '14px' }}
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : 'Sign In'}
                        </button>
                    </form>

                    <p className="text-center text-sm mt-6 relative z-10" style={{ color: '#5a5a7e' }}>
                        Don't have an account?{' '}
                        <Link to="/signup" className="font-semibold glow-text hover:underline">Sign Up</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
