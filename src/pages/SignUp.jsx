import { useState } from 'react';
import { Eye, EyeOff, ShieldCheck, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageTransition from "../components/layout/PageTransition.jsx";
import '../styles/client-portal.css';
import './SignUp.css';

export default function SignUp() {
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState("");

    const requirements = [
        { label: "At least 8 characters", met: password.length >= 8 },
        { label: "Contains a number", met: /[0-9]/.test(password) },
        { label: "Contains a capital letter", met: /[A-Z]/.test(password) },
        { label: "Contains a special character", met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
    ];

    const strength = requirements.filter(req => req.met).length + (password.length > 0 ? 1 : 0);

    const getStrengthColor = () => {
        if (strength <= 2) return "bg-red-500";
        if (strength === 3) return "bg-orange-500";
        if (strength === 4) return "bg-yellow-500";
        if (strength === 5) return "bg-green-500";
        return "bg-slate-100";
    };

    return (
        <PageTransition>
            <div className="auth-layout">
                {/* LEFT SIDE: SignUp Form */}
                <div className="signup-form-panel">
                    <div className="signup-form-container">
                        <div className="signup-header">
                            <h2 className="signup-title">Create Account</h2>
                            <p className="signup-subtitle">Enter your details to start your medical evaluation</p>
                        </div>

                        <form className="signup-form">
                            <div className="auth-form-field">
                                <label className="form-label-sm">Full Name</label>
                                <input type="text" placeholder="John Doe" className="form-input-light" />
                            </div>

                            <div className="auth-form-field">
                                <label className="form-label-sm">Email Address</label>
                                <input type="email" placeholder="name@example.com" className="form-input-light" />
                            </div>

                            <div className="auth-form-field">
                                <label className="form-label-sm">Phone Number</label>
                                <div className="flex gap-2">
                                    <span className="phone-prefix">+63</span>
                                    <input type="tel" placeholder="912 345 6789" className="form-input-light" />
                                </div>
                            </div>

                            <div className="auth-form-field">
                                <label className="form-label-sm">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="form-input-light"
                                    />
                                    <div
                                        className="absolute right-4 top-3.5 text-slate-300 cursor-pointer hover:text-black transition-colors"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </div>
                                </div>

                                {/* Strength Meter & Checklist */}
                                {password.length > 0 && (
                                    <div className="pt-2 space-y-3">
                                        <div className="strength-meter">
                                            {[1, 2, 3, 4, 5].map((level) => (
                                                <div
                                                    key={level}
                                                    className={`strength-bar ${level <= strength ? getStrengthColor() : "strength-bar--inactive"}`}
                                                />
                                            ))}
                                        </div>

                                        <div className="space-y-1.5">
                                            {requirements.map((req, index) => (
                                                <div key={index} className="requirement-row">
                                                    <div className={`requirement-icon ${req.met ? 'requirement-icon--met' : 'requirement-icon--unmet'}`}>
                                                        <Check size={10} strokeWidth={4} />
                                                    </div>
                                                    <span className={`requirement-label ${req.met ? 'requirement-label--met' : 'requirement-label--unmet'}`}>
                                                        {req.label}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="terms-row">
                                <input type="checkbox" id="terms" className="terms-checkbox" />
                                <label htmlFor="terms" className="terms-label">
                                    I agree to the <a href="#" className="terms-link">Terms</a> and <a href="#" className="terms-link">Privacy</a>.
                                </label>
                            </div>

                            <button
                                className="signup-submit-btn"
                                disabled={strength < 5}
                            >
                                Create Account
                            </button>
                        </form>

                        <p className="signup-footer">
                            Already have an account? <Link to="/login" className="signup-footer-link">Log In</Link>
                        </p>
                    </div>
                </div>

                {/* RIGHT SIDE: Branding */}
                <div className="auth-brand-panel">
                    <ShieldCheck className="auth-brand-watermark -left-20 -top-20 -rotate-12" />
                    <Link to="/" className="auth-brand-logo hover:opacity-90 transition-opacity">
                        {/* This container keeps the white/black box shape from your CSS */}
                        <div className="auth-brand-logo-icon overflow-hidden flex items-center justify-center">
                            <img
                                src="/mjylogo.png"
                                alt="MJY 88 Logo"
                                className="w-5 h-5 object-contain"
                            />
                        </div>

                        {/* Your brand name text */}
                        <span className="auth-brand-logo-text">CareSync</span>
                    </Link>
                    <div className="auth-brand-content">
                        <h1 className="auth-brand-heading">Start your <br /> license journey <br /> with MJY 88.</h1>
                        <p className="text-slate-400 max-w-md leading-relaxed">Fast-track your LTO medical requirements with our digitized queue system.</p>
                        <div className="auth-brand-stats">
                            <div><p className="signup-brand-stat-value">Fast</p><p className="signup-brand-stat-label">Processing</p></div>
                            <div><p className="signup-brand-stat-value">LTO</p><p className="signup-brand-stat-label">Integrated</p></div>
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
}