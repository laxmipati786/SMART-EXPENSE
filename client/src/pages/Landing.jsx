import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

const features = [
    { icon: '💰', title: 'Expense Tracking', desc: 'Track income & expenses with smart categorization and instant summaries', color: '#10b981' },
    { icon: '📊', title: 'Visual Analytics', desc: 'Beautiful pie & bar charts showing your spending patterns at a glance', color: '#6366f1' },
    { icon: '🤖', title: 'AI Financial Advisor', desc: 'GPT-powered insights analyze your habits and give personalized tips', color: '#8b5cf6' },
    { icon: '💬', title: 'AI Chatbot', desc: 'Chat with your financial advisor anytime for real-time guidance', color: '#00d4ff' },
    { icon: '🎯', title: 'Budget Alerts', desc: 'Set spending limits and get notified before you overspend', color: '#f97316' },
    { icon: '📥', title: 'Export Reports', desc: 'Download professional PDF & CSV reports for your records', color: '#ec4899' },
];

const TiltCard = ({ children, className = '', style = {} }) => {
    const cardRef = useRef(null);
    const [transform, setTransform] = useState('perspective(800px) rotateX(0deg) rotateY(0deg)');
    const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        const rotateX = (y - 0.5) * -12;
        const rotateY = (x - 0.5) * 12;
        setTransform(`perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`);
        setGlare({ x: x * 100, y: y * 100, opacity: 0.12 });
    };

    const handleMouseLeave = () => {
        setTransform('perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)');
        setGlare({ x: 50, y: 50, opacity: 0 });
    };

    return (
        <div
            ref={cardRef}
            className={className}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ ...style, transform, transition: 'transform 0.15s ease-out', transformStyle: 'preserve-3d', position: 'relative', overflow: 'hidden' }}
        >
            {/* Glare overlay */}
            <div style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 'inherit',
                background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,${glare.opacity}), transparent 70%)`,
                pointerEvents: 'none',
                zIndex: 2,
                transition: 'opacity 0.3s ease'
            }} />
            {children}
        </div>
    );
};

const Landing = () => {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleMouse = (e) => setMousePos({ x: e.clientX, y: e.clientY });
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('mousemove', handleMouse);
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('mousemove', handleMouse);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <div className="min-h-screen overflow-x-hidden">
            {/* Animated Background Orbs */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute w-[500px] h-[500px] rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12), transparent 70%)',
                        top: `${15 + scrollY * 0.02}%`,
                        left: '5%',
                        filter: 'blur(80px)',
                        animation: 'float3d 8s ease-in-out infinite'
                    }} />
                <div className="absolute w-[400px] h-[400px] rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.09), transparent 70%)',
                        top: `${55 - scrollY * 0.01}%`,
                        right: '5%',
                        filter: 'blur(60px)',
                        animation: 'float3d 10s ease-in-out infinite reverse'
                    }} />
                <div className="absolute w-[350px] h-[350px] rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.07), transparent 70%)',
                        bottom: '5%',
                        left: '35%',
                        filter: 'blur(70px)',
                        transform: `translate(${mousePos.x * 0.008}px, ${mousePos.y * 0.008}px)`
                    }} />
                <div className="absolute w-[250px] h-[250px] rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(244, 63, 94, 0.06), transparent 70%)',
                        top: '30%',
                        right: '25%',
                        filter: 'blur(50px)',
                        animation: 'float3d 12s ease-in-out infinite'
                    }} />
            </div>

            {/* Navbar */}
            <nav className="relative z-10 nav-3d" style={{ borderRadius: 0 }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center animate-neon"
                            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 20px rgba(99,102,241,0.3)' }}>
                            <span className="text-lg">💰</span>
                        </div>
                        <span className="text-xl font-extrabold glow-text">ExpenseAI</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link to="/login" className="btn-ghost">Sign In</Link>
                        <Link to="/signup" className="btn-primary">Get Started</Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative z-10 pt-24 pb-36 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-10 slide-up"
                        style={{
                            background: 'rgba(99, 102, 241, 0.06)',
                            border: '1px solid rgba(99, 102, 241, 0.15)',
                            boxShadow: '0 4px 16px rgba(99, 102, 241, 0.06)',
                            animationDelay: '0.1s'
                        }}>
                        <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
                        <span className="text-sm font-semibold" style={{ color: '#a78bfa' }}>AI-Powered Financial Intelligence</span>
                    </div>

                    {/* Title */}
                    <h1 className="text-5xl sm:text-7xl font-black leading-[1.1] mb-8 slide-up" style={{ animationDelay: '0.2s' }}>
                        <span style={{ color: '#e2e8f0' }}>Smart </span>
                        <span className="glow-text" style={{ filter: 'drop-shadow(0 0 20px rgba(99, 102, 241, 0.3))' }}>Expense</span>
                        <br />
                        <span style={{ color: '#e2e8f0' }}>Tracking with </span>
                        <span className="glow-text-green" style={{ filter: 'drop-shadow(0 0 20px rgba(16, 185, 129, 0.3))' }}>AI</span>
                    </h1>

                    <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-12 leading-relaxed slide-up" style={{ color: '#8888aa', animationDelay: '0.3s' }}>
                        Track expenses, visualize spending patterns, and get personalized AI insights — all in one beautiful dashboard.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center slide-up" style={{ animationDelay: '0.4s' }}>
                        <Link to="/signup" className="btn-primary text-lg px-10 py-4 inline-flex items-center justify-center gap-2"
                            style={{ borderRadius: '16px', fontSize: '1.1rem', boxShadow: '0 8px 32px rgba(99, 102, 241, 0.4)' }}>
                            Start Free
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </Link>
                        <a href="#features" className="btn-ghost text-lg px-10 py-4 inline-flex items-center justify-center gap-2"
                            style={{ borderRadius: '16px', fontSize: '1.1rem' }}>
                            Explore Features
                        </a>
                    </div>
                </div>

                {/* 3D Dashboard Preview */}
                <div className="max-w-5xl mx-auto mt-24 slide-up" style={{ animationDelay: '0.5s' }}>
                    <TiltCard className="card-3d p-1 sm:p-2" style={{
                        boxShadow: '0 50px 100px rgba(99, 102, 241, 0.12), 0 0 0 1px rgba(99, 102, 241, 0.1), 0 0 80px rgba(99, 102, 241, 0.05)'
                    }}>
                        <div className="rounded-xl overflow-hidden p-5 sm:p-8" style={{ background: 'rgba(5, 5, 16, 0.6)' }}>
                            {/* Mock Summary Cards */}
                            <div className="grid grid-cols-3 gap-4 mb-8">
                                {[
                                    { label: 'Income', value: '₹1,00,000', color: '#10b981', glow: 'rgba(16,185,129,0.06)' },
                                    { label: 'Expenses', value: '₹45,000', color: '#f43f5e', glow: 'rgba(244,63,94,0.06)' },
                                    { label: 'Savings', value: '₹55,000', color: '#6366f1', glow: 'rgba(99,102,241,0.06)' }
                                ].map(card => (
                                    <div key={card.label} className="p-4 rounded-xl" style={{
                                        background: card.glow,
                                        border: `1px solid ${card.color}18`,
                                        boxShadow: `0 4px 16px ${card.glow}`
                                    }}>
                                        <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#5a5a7e' }}>{card.label}</p>
                                        <p className="text-xl sm:text-2xl font-extrabold mt-1" style={{
                                            color: card.color,
                                            filter: `drop-shadow(0 0 6px ${card.glow})`
                                        }}>{card.value}</p>
                                    </div>
                                ))}
                            </div>
                            {/* Mock chart bars */}
                            <div className="flex items-end gap-2 h-28 sm:h-36 justify-center px-4">
                                {[40, 65, 55, 80, 45, 70, 90, 60, 75, 50, 85, 65].map((h, i) => (
                                    <div key={i} className="flex-1 rounded-t-md" style={{
                                        height: `${h}%`,
                                        background: i % 2 === 0
                                            ? 'linear-gradient(to top, rgba(16,185,129,0.2), rgba(16,185,129,0.6))'
                                            : 'linear-gradient(to top, rgba(244,63,94,0.2), rgba(244,63,94,0.6))',
                                        animation: `slideUp 0.5s ease-out ${i * 0.05}s both`,
                                        boxShadow: `0 -2px 8px ${i % 2 === 0 ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)'}`
                                    }} />
                                ))}
                            </div>
                        </div>
                    </TiltCard>
                </div>
            </section>

            {/* Stats */}
            <section className="relative z-10 py-20" style={{ borderTop: '1px solid rgba(99, 102, 241, 0.06)' }}>
                <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 px-4">
                    {[
                        { value: '10K+', label: 'Active Users' },
                        { value: '₹50Cr+', label: 'Tracked' },
                        { value: '99.9%', label: 'Uptime' },
                        { value: '4.9★', label: 'Rating' },
                    ].map((stat, idx) => (
                        <div key={stat.label} className="text-center slide-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                            <p className="text-4xl sm:text-5xl font-black glow-text">{stat.value}</p>
                            <p className="text-sm mt-2 font-medium" style={{ color: '#5a5a7e' }}>{stat.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features */}
            <section id="features" className="relative z-10 py-28 px-4" style={{ borderTop: '1px solid rgba(99, 102, 241, 0.06)' }}>
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl sm:text-5xl font-black mb-5 leading-tight">
                            <span style={{ color: '#e2e8f0' }}>Everything to </span>
                            <span className="glow-text">Master Your Finances</span>
                        </h2>
                        <p className="text-lg" style={{ color: '#5a5a7e' }}>Powerful features designed for smart financial management</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feat, idx) => (
                            <TiltCard key={feat.title} className="card-3d cursor-default slide-up p-6"
                                style={{ animationDelay: `${idx * 0.08}s` }}>
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-5"
                                    style={{
                                        background: `${feat.color}12`,
                                        boxShadow: `0 4px 16px ${feat.color}10, 0 0 0 1px ${feat.color}15`
                                    }}>
                                    {feat.icon}
                                </div>
                                <h3 className="text-lg font-bold mb-2" style={{ color: '#e2e8f0' }}>{feat.title}</h3>
                                <p className="text-sm leading-relaxed" style={{ color: '#5a5a7e' }}>{feat.desc}</p>
                            </TiltCard>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="relative z-10 py-28 px-4">
                <TiltCard className="max-w-3xl mx-auto card-3d text-center p-10 sm:p-14" style={{
                    boxShadow: '0 40px 80px rgba(99, 102, 241, 0.1), 0 0 60px rgba(99, 102, 241, 0.04)'
                }}>
                    <h2 className="text-3xl sm:text-5xl font-black mb-5">
                        <span className="glow-text">Ready to Take Control?</span>
                    </h2>
                    <p className="text-lg mb-10" style={{ color: '#5a5a7e' }}>
                        Join thousands who've transformed their financial habits with AI-powered insights.
                    </p>
                    <Link to="/signup" className="btn-primary text-lg px-12 py-5 inline-flex items-center gap-3"
                        style={{ borderRadius: '18px', fontSize: '1.15rem', boxShadow: '0 8px 40px rgba(99, 102, 241, 0.5)' }}>
                        Get Started — It's Free
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </Link>
                </TiltCard>
            </section>

            {/* Footer */}
            <footer className="relative z-10 py-10 text-center" style={{ borderTop: '1px solid rgba(99, 102, 241, 0.06)' }}>
                <p className="glow-text font-bold text-sm mb-1">ExpenseAI</p>
                <p className="text-xs" style={{ color: '#5a5a7e' }}>© 2026 Smart Financial Analytics Platform</p>
                <p className="text-xs mt-1" style={{ color: '#3a3a5e' }}>React • Node.js • MongoDB • OpenAI • Tailwind CSS</p>
            </footer>
        </div>
    );
};

export default Landing;
