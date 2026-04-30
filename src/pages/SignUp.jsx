import { useState } from 'react';
import { Eye, EyeOff, ShieldCheck, Check, Loader2, Mail, ArrowRight, AlertTriangle, X } from 'lucide-react';
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
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [isSent, setIsSent] = useState(false);
    const [showTerms, setShowTerms] = useState(false);

    // Form States - Updated to split Full Name
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [agreed, setAgreed] = useState(false);

    const requirements = [
        { label: "At least 8 characters", met: password.length >= 8 },
        { label: "Contains a number", met: /[0-9]/.test(password) },
        { label: "Contains a capital letter", met: /[A-Z]/.test(password) },
        { label: "Contains a special character", met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
    ];

    const strength = requirements.filter(req => req.met).length + (password.length > 0 ? 1 : 0);
    const passwordsMatch = password === confirmPassword && confirmPassword !== "";

    const handleSignUp = async (e) => {
        e.preventDefault();
        if (strength < 5 || !passwordsMatch) return;

        setLoading(true);
        setErrorMsg("");

        try {
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        // Updated metadata keys for Supabase Auth
                        first_name: firstName,
                        last_name: lastName,
                        email: email,
                        phone: `+63${phone}`,
                        role: 'client'
                    },
                },
            });

            if (error) {
                if (error.message.includes("Database error saving new user")) {
                    setErrorMsg("Registration failed: Database synchronization error. Please contact the administrator.");
                } else {
                    setErrorMsg(error.message);
                }
            } else {
                if (data.user) {
                    setIsSent(true);
                    toast.success("Account created! Please verify your email.");
                }
            }
        } catch (err) {
            setErrorMsg("A system error occurred. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageTransition>
            <div className="auth-layout">
                <div className="signup-form-panel">
                    <div className="signup-form-container">

                        {isSent ? (
                            <div className="text-center py-10 animate-in fade-in zoom-in duration-300">
                                <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                                    <Mail size={40} />
                                </div>
                                <h2 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900 mb-2 leading-none">Check your inbox</h2>
                                <p className="text-slate-500 text-xs mb-8 uppercase font-bold tracking-widest">
                                    A verification link was sent to <br />
                                    <span className="text-blue-600 underline">{email}</span>
                                </p>
                                <div className="space-y-4">
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="w-full py-4 bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-emerald-500 transition-all shadow-xl"
                                    >
                                        Return to Login <ArrowRight size={18} />
                                    </button>
                                    <button
                                        onClick={() => setIsSent(false)}
                                        className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] hover:text-black transition-all"
                                    >
                                        Change Email Address
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="signup-header">
                                    <h2 className="signup-title italic uppercase tracking-tighter font-black text-3xl">Create Account</h2>
                                    <p className="signup-subtitle font-bold text-slate-400 text-[10px] uppercase tracking-widest">MJY 88 Medical Clinic Registration</p>
                                </div>

                                {errorMsg && (
                                    <div className="bg-red-50 border-2 border-red-100 text-red-600 px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest mb-6 flex items-center gap-3">
                                        <AlertTriangle size={18} /> {errorMsg}
                                    </div>
                                )}

                                <form className="signup-form space-y-5" onSubmit={handleSignUp}>

                                    {/* Updated Name Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="auth-form-field">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">First Name</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="Juan"
                                                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold text-sm focus:border-black transition-all"
                                                value={firstName}
                                                onChange={(e) => setFirstName(e.target.value)}
                                            />
                                        </div>
                                        <div className="auth-form-field">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Last Name</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="Dela Cruz"
                                                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold text-sm focus:border-black transition-all"
                                                value={lastName}
                                                onChange={(e) => setLastName(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="auth-form-field">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                                        <input
                                            type="email"
                                            required
                                            placeholder="client@example.com"
                                            className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold text-sm focus:border-black transition-all"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>

                                    <div className="auth-form-field">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Phone Number</label>
                                        <div className="flex gap-2">
                                            <span className="flex items-center justify-center px-4 bg-slate-100 rounded-2xl font-black text-xs text-slate-500 border-2 border-slate-100">+63</span>
                                            <input
                                                type="tel"
                                                required
                                                maxLength="10"
                                                placeholder="912 345 6789"
                                                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold text-sm focus:border-black transition-all"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                                            />
                                        </div>
                                    </div>

                                    <div className="auth-form-field">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Security Password</label>
                                        <div className="relative">
                                            <input
                                                required
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="••••••••"
                                                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold text-sm focus:border-black transition-all"
                                            />
                                            <div
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 cursor-pointer hover:text-black"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </div>
                                        </div>

                                        {password.length > 0 && (
                                            <div className="pt-3 space-y-3">
                                                <div className="flex gap-1">
                                                    {[1, 2, 3, 4, 5].map((level) => (
                                                        <div key={level} className={`h-1 w-full rounded-full transition-all duration-500 ${level <= strength ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-slate-100"}`} />
                                                    ))}
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {requirements.map((req, index) => (
                                                        <div key={index} className="flex items-center gap-2">
                                                            <div className={`p-0.5 rounded-full ${req.met ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-300'}`}>
                                                                <Check size={8} strokeWidth={5} />
                                                            </div>
                                                            <span className={`text-[8px] font-black uppercase tracking-tight ${req.met ? 'text-slate-900' : 'text-slate-400'}`}>{req.label}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="auth-form-field">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Confirm Password</label>
                                        <div className="relative">
                                            <input
                                                required
                                                type={showConfirmPassword ? "text" : "password"}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="••••••••"
                                                className={`w-full p-4 bg-slate-50 border-2 rounded-2xl outline-none font-bold text-sm transition-all focus:border-black ${confirmPassword.length > 0 ? (passwordsMatch ? "border-emerald-200 bg-emerald-50/30" : "border-red-100") : "border-slate-100"}`}
                                            />
                                            <div
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 cursor-pointer hover:text-black"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            >
                                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </div>
                                        </div>
                                        {confirmPassword.length > 0 && !passwordsMatch && (
                                            <p className="text-[8px] font-black uppercase text-red-500 mt-2 ml-1 tracking-widest">Passwords do not match</p>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-3 px-1">
                                        <input
                                            type="checkbox"
                                            id="terms"
                                            className="w-4 h-4 rounded border-2 border-slate-200 checked:bg-black transition-all cursor-pointer"
                                            required
                                            checked={agreed}
                                            onChange={(e) => setAgreed(e.target.checked)}
                                        />
                                        <label htmlFor="terms" className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">
                                            I agree to the
                                            <button
                                                type="button"
                                                onClick={() => setShowTerms(true)}
                                                className="text-black font-black underline ml-1 hover:text-emerald-600 transition-colors"
                                            >
                                                Terms
                                            </button> and
                                            <button
                                                type="button"
                                                onClick={() => setShowTerms(true)}
                                                className="text-black font-black underline ml-1 hover:text-emerald-600 transition-colors"
                                            >
                                                Privacy Policy
                                            </button>.
                                        </label>
                                    </div>

                                    <button
                                        type="submit"
                                        className={`w-full py-5 rounded-[2rem] font-black uppercase text-[11px] tracking-[0.25em] transition-all flex items-center justify-center gap-3 shadow-xl ${strength === 5 && agreed && passwordsMatch ? 'bg-black text-white hover:bg-emerald-600' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
                                        disabled={strength < 5 || !agreed || !passwordsMatch || loading}
                                    >
                                        {loading ? <Loader2 size={18} className="animate-spin" /> : "CREATE ACCOUNT"}
                                    </button>
                                </form>

                                <p className="text-center mt-8 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                    Joined us before? <Link to="/login" className="text-black underline decoration-2 underline-offset-4">Log In Here</Link>
                                </p>
                            </>
                        )}
                    </div>
                </div>

                <div className="auth-brand-panel hidden lg:flex relative bg-black overflow-hidden p-20 flex-col justify-between">
                    <ShieldCheck className="absolute -left-20 -top-20 -rotate-12 opacity-5 text-white" size={400} />
                    <Link to="/" className="relative flex items-center gap-3">
                        <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center font-black text-white text-2xl italic shadow-lg">C</div>
                        <span className="text-white font-black text-2xl tracking-tighter italic">CareSync</span>
                    </Link>
                    <div className="relative space-y-6">
                        <h1 className="text-6xl font-black text-white leading-none uppercase tracking-tighter italic">Digitalize <br /> Your License <br /> Process.</h1>
                        <p className="text-slate-500 font-bold uppercase text-xs tracking-widest max-w-sm leading-relaxed">Medical clinic automation for LTO Licensing. Skip the line, save your time.</p>
                    </div>
                    <div className="relative pt-10 border-t border-white/10 flex items-center gap-4">
                        <div className="flex -space-x-3">
                            {[1, 2, 3].map(i => <div key={i} className="w-10 h-10 rounded-full border-4 border-black bg-slate-800" />)}
                        </div>
                        <p className="text-[10px] font-black text-white uppercase tracking-widest">Join 2,000+ Verified Applicants</p>
                    </div>
                </div>

                {/* --- TERMS & PRIVACY MODAL --- */}
                {showTerms && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                        <div
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                            onClick={() => setShowTerms(false)}
                        />

                        <div className="relative bg-white w-full max-w-lg max-h-[85vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white">
                                <div>
                                    <h3 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900">Legal Terms</h3>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">MJY 88 Medical Clinic & CareSync</p>
                                </div>
                                <button
                                    onClick={() => setShowTerms(false)}
                                    className="p-3 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-black"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="p-8 overflow-y-auto custom-scrollbar text-slate-600 space-y-6">
                                <section>
                                    <h4 className="text-[11px] font-black uppercase tracking-widest text-black mb-2">1. Information Collection</h4>
                                    <p className="text-xs leading-relaxed font-medium">
                                        We collect personal data including your first name, last name, contact information, and medical history exclusively for the purpose of LTO medical certification.
                                    </p>
                                </section>
                                <section>
                                    <h4 className="text-[11px] font-black uppercase tracking-widest text-black mb-2">2. Data Security</h4>
                                    <p className="text-xs leading-relaxed font-medium">
                                        Your data is encrypted and stored securely. We comply with the Data Privacy Act to ensure your sensitive medical information is never shared with third parties without consent.
                                    </p>
                                </section>
                                <section>
                                    <h4 className="text-[11px] font-black uppercase tracking-widest text-black mb-2">3. Accuracy of Data</h4>
                                    <p className="text-xs leading-relaxed font-medium">
                                        By registering, you certify that all provided details are true. Providing false medical information is a violation of LTO policies and may result in legal action.
                                    </p>
                                </section>
                                <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
                                    <p className="text-[10px] font-bold text-emerald-700 leading-normal uppercase tracking-wider">
                                        Verification required: You must verify your email address to complete the registration process.
                                    </p>
                                </div>
                            </div>

                            <div className="p-6 bg-slate-50 flex justify-end">
                                <button
                                    onClick={() => setShowTerms(false)}
                                    className="px-10 py-4 bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-600 transition-all shadow-lg"
                                >
                                    I Understand
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </PageTransition>
    );
}