import { useState } from 'react';
import { Eye, EyeOff, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import PageTransition from "../components/layout/PageTransition.jsx";
import { supabase } from '../supabaseClient';
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

        try {
            // 1. Authenticate with Supabase Auth
            const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (signInError) {
                setError(signInError.message === "Invalid login credentials"
                    ? "Invalid email or password. Please try again."
                    : signInError.message);
                setIsLoading(false);
                return;
            }

            // 2. Fetch the user's role from the 'profiles' table
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', authData.user.id)
                .single();

            if (profileError || !profileData) {
                console.error("Profile fetch error:", profileError);
                navigate('/dashboard'); // Fallback for standard clients if profile missing
                return;
            }

            // 3. Precise Role-Based Redirection
            const role = profileData.role?.toLowerCase(); // Normalize casing

            if (role === 'admin') {
                navigate('/admin/dashboard');
            } else if (role === 'staff') {
                navigate('/staff/dashboard');
            } else if (role === 'doctor') {
                navigate('/doctor/dashboard');
            } else {
                navigate('/dashboard'); // Standard client path
            }

        } catch (err) {
            console.error("Unexpected login error:", err);
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <PageTransition>
            <div className="auth-layout">
                {/* LEFT SIDE: Branding */}
                <div className="auth-brand-panel">
                    <ShieldCheck className="auth-brand-watermark -right-20 -bottom-20" size={300} />

                    <Link to="/" className="auth-brand-logo flex items-center gap-2">
                        <div className="auth-brand-logo-icon bg-white p-1.5 rounded-lg">
                            <img
                                src="/mjylogo.png"
                                alt="CareSync Logo"
                                className="w-5 h-5 object-contain"
                            />
                        </div>
                        <span className="auth-brand-logo-text uppercase font-bold text-white">CareSync</span>
                    </Link>

                    <div className="auth-brand-content">
                        <h1 className="auth-brand-heading text-4xl font-bold text-white leading-tight">
                            Faster licensing <br /> starts with better <br /> access.
                        </h1>
                        <p className="auth-brand-description text-blue-100 mt-4 max-w-sm">
                            Manage your LTO medical requirements, schedule your physical exam,
                            and track your certification status in real-time.
                        </p>
                        <div className="auth-brand-stats flex gap-8 mt-10">
                            <div>
                                <p className="auth-brand-stat-value text-2xl font-bold text-white">24/7</p>
                                <p className="auth-brand-stat-label text-blue-200 text-sm">Support</p>
                            </div>
                            <div>
                                <p className="auth-brand-stat-value text-2xl font-bold text-white">100%</p>
                                <p className="auth-brand-stat-label text-blue-200 text-sm">Secure</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE: Login Form */}
                <div className="auth-form-panel flex items-center justify-center p-8">
                    <div className="auth-form-container w-full max-w-md">
                        <div className="auth-form-header mb-8">
                            <h2 className="auth-form-title text-2xl font-bold text-slate-900">Welcome</h2>
                            <p className="auth-form-subtitle text-slate-500">Please enter your credentials</p>
                        </div>

                        {error && (
                            <div className="error-alert flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mb-6 text-sm">
                                <AlertCircle size={18} className="shrink-0" />
                                <p>{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="auth-form space-y-5">
                            <div className="auth-form-field">
                                <label className="form-label block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                                <input
                                    required
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="e.g. admin@caresync.com"
                                    className="form-input w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="auth-form-field">
                                <div className="flex justify-between items-center mb-1.5">
                                    <label className="form-label block text-sm font-medium text-slate-700">Password</label>
                                    <a href="#" className="auth-forgot-link text-xs text-blue-600 hover:underline">Forgot?</a>
                                </div>
                                <div className="relative">
                                    <input
                                        required
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="form-input w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        disabled={isLoading}
                                    />
                                    <div
                                        className="absolute right-4 top-3.5 text-slate-400 cursor-pointer hover:text-slate-600"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Authenticating...
                                    </>
                                ) : (
                                    "Login"
                                )}
                            </button>
                        </form>

                        <div className="divider-section flex items-center gap-4 my-8">
                            <div className="h-px bg-slate-100 flex-1"></div>
                            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Identity Provider</span>
                            <div className="h-px bg-slate-100 flex-1"></div>
                        </div>

                        <button type="button" className="w-full border border-slate-200 py-3 rounded-xl flex items-center justify-center gap-3 hover:bg-slate-50 transition-colors font-medium text-slate-700">
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="google" />
                            Continue with Google
                        </button>

                        <p className="auth-footer-text text-center mt-8 text-slate-500 text-sm">
                            New user? {' '}
                            <Link to="/signup" className="text-blue-600 font-semibold hover:underline">
                                Create Account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
}