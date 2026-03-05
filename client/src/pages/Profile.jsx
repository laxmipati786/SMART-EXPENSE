import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api from '../api/axios';

const Profile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });
    const [pwMessage, setPwMessage] = useState({ text: '', type: '' });
    const [loading, setLoading] = useState(false);
    const [pwLoading, setPwLoading] = useState(false);
    const [stats, setStats] = useState({ totalTransactions: 0, totalIncome: 0, totalExpense: 0, memberSince: '' });

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
            fetchStats();
        }
    }, [user]);

    const fetchStats = async () => {
        try {
            const { data } = await api.get('/transactions');
            setStats({
                totalTransactions: data.summary.count,
                totalIncome: data.summary.income,
                totalExpense: data.summary.expense,
                memberSince: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : 'N/A'
            });
        } catch (err) { }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });
        try {
            await api.put('/profile', { name, email });
            setMessage({ text: 'Profile updated successfully!', type: 'success' });
        } catch (err) {
            setMessage({ text: err.response?.data?.message || 'Update failed', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setPwMessage({ text: 'Passwords do not match', type: 'error' });
            return;
        }
        setPwLoading(true);
        setPwMessage({ text: '', type: '' });
        try {
            await api.put('/profile/password', { currentPassword, newPassword });
            setPwMessage({ text: 'Password changed successfully!', type: 'success' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setPwMessage({ text: err.response?.data?.message || 'Password change failed', type: 'error' });
        } finally {
            setPwLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            logout();
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                    <button onClick={() => navigate('/dashboard')} className="btn-ghost text-sm">← Back</button>
                    <h1 className="text-2xl font-bold glow-text">Profile Settings</h1>
                </div>

                {/* User Card */}
                <div className="glass-card flex items-center gap-5 slide-up">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white"
                        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold" style={{ color: '#e2e8f0' }}>{user?.name}</h2>
                        <p className="text-sm" style={{ color: '#8888aa' }}>{user?.email}</p>
                        <p className="text-xs mt-1" style={{ color: '#5a5a7e' }}>Member since {stats.memberSince}</p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 slide-up" style={{ animationDelay: '0.1s' }}>
                    {[
                        { label: 'Transactions', value: stats.totalTransactions, icon: '📋' },
                        { label: 'Total Income', value: `₹${stats.totalIncome.toLocaleString('en-IN')}`, icon: '💰' },
                        { label: 'Total Spent', value: `₹${stats.totalExpense.toLocaleString('en-IN')}`, icon: '💸' }
                    ].map(s => (
                        <div key={s.label} className="glass-card text-center py-4">
                            <div className="text-2xl mb-1">{s.icon}</div>
                            <p className="text-lg font-bold" style={{ color: '#e2e8f0' }}>{s.value}</p>
                            <p className="text-xs" style={{ color: '#8888aa' }}>{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Edit Profile */}
                <div className="glass-card slide-up" style={{ animationDelay: '0.2s' }}>
                    <h3 className="text-lg font-semibold mb-4" style={{ color: '#e2e8f0' }}>
                        <span className="mr-2">✏️</span>Edit Profile
                    </h3>
                    {message.text && (
                        <div className="mb-4 p-3 rounded-xl text-sm font-medium fade-in" style={{
                            background: message.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)',
                            border: `1px solid ${message.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(244,63,94,0.3)'}`,
                            color: message.type === 'success' ? '#34d399' : '#fb7185'
                        }}>{message.text}</div>
                    )}
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5" style={{ color: '#8888aa' }}>Name</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} className="input-field" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5" style={{ color: '#8888aa' }}>Email</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" required />
                        </div>
                        <button type="submit" disabled={loading} className="btn-primary flex items-center justify-center gap-2">
                            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Save Changes'}
                        </button>
                    </form>
                </div>

                {/* Change Password */}
                <div className="glass-card slide-up" style={{ animationDelay: '0.3s' }}>
                    <h3 className="text-lg font-semibold mb-4" style={{ color: '#e2e8f0' }}>
                        <span className="mr-2">🔒</span>Change Password
                    </h3>
                    {pwMessage.text && (
                        <div className="mb-4 p-3 rounded-xl text-sm font-medium fade-in" style={{
                            background: pwMessage.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)',
                            border: `1px solid ${pwMessage.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(244,63,94,0.3)'}`,
                            color: pwMessage.type === 'success' ? '#34d399' : '#fb7185'
                        }}>{pwMessage.text}</div>
                    )}
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5" style={{ color: '#8888aa' }}>Current Password</label>
                            <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="input-field" required />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium mb-1.5" style={{ color: '#8888aa' }}>New Password</label>
                                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="input-field" required minLength={6} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5" style={{ color: '#8888aa' }}>Confirm Password</label>
                                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="input-field" required minLength={6} />
                            </div>
                        </div>
                        <button type="submit" disabled={pwLoading} className="btn-primary flex items-center justify-center gap-2">
                            {pwLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Change Password'}
                        </button>
                    </form>
                </div>

                {/* Danger Zone */}
                <div className="glass-card slide-up" style={{ animationDelay: '0.4s', borderColor: 'rgba(244, 63, 94, 0.15)' }}>
                    <h3 className="text-lg font-semibold mb-2" style={{ color: '#fb7185' }}>
                        <span className="mr-2">⚠️</span>Danger Zone
                    </h3>
                    <p className="text-sm mb-4" style={{ color: '#8888aa' }}>Once you delete your account, there is no going back.</p>
                    <button onClick={handleDeleteAccount} className="btn-danger">Delete Account</button>
                </div>
            </main>
        </div>
    );
};

export default Profile;
