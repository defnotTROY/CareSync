import { useState } from 'react';
import { Eye, EyeOff, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import PageTransition from "../components/layout/PageTransition.jsx";
import { supabase } from '../lib/supabase';
import '../styles/client-portal.css';
import './Login.css';

export default function Login() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const { data, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (signInError) {
            setError(signInError.message);
            setIsLoading(false);
            return;
        }

        // Successfully authenticated, now fetch role to navigate correctly
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single();

        setIsLoading(false);

        if (profileError || !profileData) {
            // Default edge case fallback
            navigate('/dashboard');
            return;
        }

        const role = profileData.role;
        if (role === 'admin') {
            navigate('/admin/dashboard');
        } else if (role === 'doctor') {
            navigate('/doctor/dashboard');
        } else if (role === 'staff') {
            navigate('/staff/dashboard');
        } else {
            navigate('/dashboard');
        }
    };

    return (
        <PageTransition>
            <div className="auth-layout">
                {/* LEFT SIDE: Branding */}
                <div className="auth-brand-panel">
                    <ShieldCheck className="auth-brand-watermark -right-20 -bottom-20" />

                    <Link to="/" className="auth-brand-logo">
                        <div className="auth-brand-logo-icon">
                            <span className="text-black font-bold">M</span>
                        </div>
                        <span className="auth-brand-logo-text">CareSync</span>
                    </Link>

                    <div className="auth-brand-content">
                        <h1 className="auth-brand-heading">
                            Faster licensing <br /> starts with better <br /> access.
                        </h1>
                        <p className="auth-brand-description">
                            Manage your LTO medical requirements, schedule your physical exam,
                            and track your certification status in real-time.
                        </p>
                        <div className="auth-brand-stats">
                            <div>
                                <p className="auth-brand-stat-value">24/7</p>
                                <p className="auth-brand-stat-label">Support</p>
                            </div>
                            <div>
                                <p className="auth-brand-stat-value">100%</p>
                                <p className="auth-brand-stat-label">Secure</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE: Login Form */}
                <div className="auth-form-panel">
                    <div className="auth-form-container">
                        <div className="auth-form-header">
                            <h2 className="auth-form-title">Welcome Back</h2>
                            <p className="auth-form-subtitle">Please enter your credentials</p>
                        </div>

                        {error && (
                            <div className="error-alert">
                                <AlertCircle size={18} className="shrink-0" />
                                <p>{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="auth-form">
                            <div className="auth-form-field">
                                <label className="form-label">Email Address</label>
                                <input
                                    required
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="e.g. admin@caresync.com"
                                    className="form-input"
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="auth-form-field">
                                <div className="flex justify-between items-center">
                                    <label className="form-label">Password</label>
                                    <a href="#" className="auth-forgot-link">Forgot?</a>
                                </div>
                                <div className="relative">
                                    <input
                                        required
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="form-input"
                                        disabled={isLoading}
                                    />
                                    <div
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn-primary-full"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Authenticating...
                                    </>
                                ) : (
                                    "Enter Terminal"
                                )}
                            </button>
                        </form>

                        <div className="divider-section">
                            <div className="divider-line"><span className="w-full border-t border-slate-100"></span></div>
                            <div className="divider-text"><span className="auth-divider-text">Identity Provider</span></div>
                        </div>

                        <button type="button" className="btn-google">
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="google-icon" alt="google" />
                            Continue with Google
                        </button>

                        <p className="auth-footer-text">
                            New user? {' '}
                            <Link to="/signup" className="auth-footer-link">
                                Create Account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
}