import { useState } from 'react';
import { Eye, EyeOff, ShieldCheck, Check, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useToast } from '../lib/ToastContext.jsx';
import PageTransition from "../components/layout/PageTransition.jsx";
import '../styles/client-portal.css';
import './SignUp.css';

export default function SignUp() {
    const navigate = useNavigate();
    const toast = useToast();

    // UI States
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    // Form States
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [agreed, setAgreed] = useState(false);

    const requirements = [
        { label: "At least 8 characters", met: password.length >= 8 },
        { label: "Contains a number", met: /[0-9]/.test(password) },
        { label: "Contains a capital letter", met: /[A-Z]/.test(password) },
        { label: "Contains a special character", met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
    ];

    const strength = requirements.filter(req => req.met).length + (password.length > 0 ? 1 : 0);

    const handleSignUp = async (e) => {
        e.preventDefault();
        if (strength < 5) return;

        setLoading(true);
        setErrorMsg("");

        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                // This 'data' object maps to 'raw_user_meta_data' in your SQL
                data: {
                    full_name: fullName,
                    phone: `+63${phone}`,
                },
            },
        });

        if (error) {
            setErrorMsg(error.message);
            setLoading(false);
        } else {
            // Success!
            toast.success("Registration successful! Please check your email for a confirmation link.");
            navigate('/login');
        }
    };

    return (
        <PageTransition>
            <div className="auth-layout">
                <div className="signup-form-panel">
                    <div className="signup-form-container">
                        <div className="signup-header">
                            <h2 className="signup-title">Create Account</h2>
                            <p className="signup-subtitle">Enter your details to start your medical evaluation</p>
                        </div>

                        {errorMsg && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
                                {errorMsg}
                            </div>
                        )}

                        <form className="signup-form" onSubmit={handleSignUp}>
                            <div className="auth-form-field">
                                <label className="form-label-sm">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="John Doe"
                                    className="form-input-light"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                />
                            </div>

                            <div className="auth-form-field">
                                <label className="form-label-sm">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    placeholder="name@example.com"
                                    className="form-input-light"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div className="auth-form-field">
                                <label className="form-label-sm">Phone Number</label>
                                <div className="flex gap-2">
                                    <span className="phone-prefix">+63</span>
                                    <input
                                        type="tel"
                                        required
                                        maxLength="10"
                                        placeholder="912 345 6789"
                                        className="form-input-light w-full"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                                    />
                                </div>
                            </div>

                            <div className="auth-form-field">
                                <label className="form-label-sm">Password</label>
                                <div className="relative">
                                    <input
                                        required
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="form-input-light"
                                    />
                                    <div
                                        className="absolute right-4 top-3.5 text-slate-300 cursor-pointer hover:text-black"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </div>
                                </div>

                                {password.length > 0 && (
                                    <div className="pt-2 space-y-3">
                                        <div className="strength-meter flex gap-1">
                                            {[1, 2, 3, 4, 5].map((level) => (
                                                <div
                                                    key={level}
                                                    className={`h-1 w-full rounded-full transition-colors ${level <= strength ? "bg-green-500" : "bg-slate-200"
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <div className="space-y-1">
                                            {requirements.map((req, index) => (
                                                <div key={index} className="flex items-center gap-2 text-xs">
                                                    <div className={`p-0.5 rounded-full ${req.met ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                                                        <Check size={10} strokeWidth={4} />
                                                    </div>
                                                    <span className={req.met ? 'text-slate-700' : 'text-slate-400'}>{req.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="terms-row">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    className="terms-checkbox"
                                    required
                                    checked={agreed}
                                    onChange={(e) => setAgreed(e.target.checked)}
                                />
                                <label htmlFor="terms" className="terms-label">
                                    I agree to the <a href="#" className="terms-link text-blue-600">Terms</a> and <a href="#" className="terms-link text-blue-600">Privacy</a>.
                                </label>
                            </div>

                            <button
                                type="submit"
                                className={`signup-submit-btn flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold transition-all ${strength === 5 && agreed ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                    }`}
                                disabled={strength < 5 || !agreed || loading}
                            >
                                {loading ? <Loader2 size={18} className="animate-spin" /> : "Create Account"}
                            </button>
                        </form>

                        <p className="signup-footer text-center mt-6 text-slate-500">
                            Already have an account? <Link to="/login" className="text-blue-600 font-medium">Log In</Link>
                        </p>
                    </div>
                </div>

                <div className="auth-brand-panel hidden lg:flex">
                    {/* Your Branding UI remains the same */}
                    <ShieldCheck className="auth-brand-watermark -left-20 -top-20 -rotate-12 opacity-10" size={300} />
                    <Link to="/" className="auth-brand-logo flex items-center gap-2">
                        <div className="bg-white p-2 rounded-lg shadow-sm">
                            <img src="/mjylogo.png" alt="Logo" className="w-6 h-6" />
                        </div>
                        <span className="text-white font-bold text-xl">CareSync</span>
                    </Link>
                    <div className="mt-20">
                        <h1 className="text-4xl font-bold text-white leading-tight">Start your <br /> license journey <br /> with MJY 88.</h1>
                        <p className="text-blue-100 mt-4 max-w-sm">Fast-track your LTO medical requirements with our digitized queue system.</p>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
}