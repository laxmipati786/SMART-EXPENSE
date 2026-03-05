import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <nav className="nav-3d sticky top-0 z-50" style={{ borderRadius: 0 }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/dashboard')}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-6 animate-neon"
                            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 20px rgba(99,102,241,0.3)' }}>
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <span className="text-xl font-extrabold glow-text hidden sm:block">ExpenseAI</span>
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-3">
                        {user && (
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => navigate('/profile')}
                                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all hover:scale-105"
                                    style={{
                                        background: 'rgba(99, 102, 241, 0.06)',
                                        border: '1px solid rgba(99, 102, 241, 0.08)',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                                    }}
                                    title="Profile Settings"
                                >
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                                        style={{
                                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                            boxShadow: '0 2px 8px rgba(99,102,241,0.3)'
                                        }}>
                                        {user.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-sm font-semibold hidden sm:block" style={{ color: '#aaaac0' }}>
                                        {user.name}
                                    </span>
                                </button>
                                <button
                                    id="logout-btn"
                                    onClick={() => { logout(); navigate('/'); }}
                                    className="btn-ghost text-xs"
                                    style={{ padding: '7px 14px' }}
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
