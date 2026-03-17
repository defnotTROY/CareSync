import { useState } from 'react';
import { Eye, EyeOff, ShieldCheck, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageTransition from "../components/layout/PageTransition.jsx";

export default function SignUp() {
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState("");

    // 1. Updated requirements to include Special Characters
    const requirements = [
        { label: "At least 8 characters", met: password.length >= 8 },
        { label: "Contains a number", met: /[0-9]/.test(password) },
        { label: "Contains a capital letter", met: /[A-Z]/.test(password) },
        { label: "Contains a special character", met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
    ];

    // 2. Calculate strength (now out of 5 total points)
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
            <div className="flex min-h-screen bg-white text-black">
                {/* LEFT SIDE: SignUp Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-8 py-12 border-r border-slate-50">
                    <div className="w-full max-w-md space-y-8">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-black tracking-tight uppercase">Create Account</h2>
                            <p className="text-slate-500 text-sm font-medium">Enter your details to start your medical evaluation</p>
                        </div>

                        <form className="space-y-5">
                            {/* ... (Full Name, Email, Phone inputs stay the same) ... */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Full Name</label>
                                <input type="text" placeholder="John Doe" className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-xl focus:border-black focus:outline-none transition-all" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Email Address</label>
                                <input type="email" placeholder="name@example.com" className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-xl focus:border-black focus:outline-none transition-all" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Phone Number</label>
                                <div className="flex gap-2">
                                    <span className="flex items-center justify-center px-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-500">+63</span>
                                    <input type="tel" placeholder="912 345 6789" className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-xl focus:border-black focus:outline-none transition-all" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-xl focus:border-black focus:outline-none transition-all"
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
                                        {/* 5 bars for 5 points of strength */}
                                        <div className="flex gap-1 h-1">
                                            {[1, 2, 3, 4, 5].map((level) => (
                                                <div
                                                    key={level}
                                                    className={`h-full flex-1 rounded-full transition-all duration-300 ${level <= strength ? getStrengthColor() : "bg-slate-100"}`}
                                                />
                                            ))}
                                        </div>

                                        <div className="space-y-1.5">
                                            {requirements.map((req, index) => (
                                                <div key={index} className="flex items-center gap-2">
                                                    <div className={`flex items-center justify-center w-3.5 h-3.5 rounded-full border ${req.met ? 'bg-green-500 border-green-500 text-white' : 'border-slate-200 text-transparent'}`}>
                                                        <Check size={10} strokeWidth={4} />
                                                    </div>
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${req.met ? 'text-slate-900' : 'text-slate-400'}`}>
                                                        {req.label}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-start gap-3 pt-2">
                                <input type="checkbox" id="terms" className="mt-1 w-4 h-4 accent-black cursor-pointer" />
                                <label htmlFor="terms" className="text-xs text-slate-500 leading-relaxed cursor-pointer">
                                    I agree to the <a href="#" className="text-black font-bold hover:underline">Terms</a> and <a href="#" className="text-black font-bold hover:underline">Privacy</a>.
                                </label>
                            </div>

                            <button
                                className="w-full py-4 bg-black text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg uppercase tracking-widest text-sm disabled:opacity-20 disabled:cursor-not-allowed"
                                disabled={strength < 5} // Must meet ALL requirements (4 rules + content)
                            >
                                Create Account
                            </button>
                        </form>

                        <p className="text-center text-sm text-slate-500 mt-8">
                            Already have an account? <Link to="/login" className="text-black font-bold hover:underline">Log In</Link>
                        </p>
                    </div>
                </div>

                {/* RIGHT SIDE: Branding */}
                <div className="hidden lg:flex w-1/2 bg-black p-16 flex-col justify-between relative overflow-hidden">
                    <ShieldCheck className="absolute -left-20 -top-20 text-white/5 w-96 h-96 -rotate-12" />
                    <Link to="/" className="relative z-10 flex items-center gap-2">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                            <span className="text-black font-bold">M</span>
                        </div>
                        <span className="text-white font-bold text-xl tracking-tight uppercase">MJY 88</span>
                    </Link>
                    <div className="relative z-10 space-y-6">
                        <h1 className="text-5xl font-black text-white leading-tight uppercase">Start your <br /> license journey <br /> with MJY 88.</h1>
                        <p className="text-slate-400 max-w-md leading-relaxed">Fast-track your LTO medical requirements with our digitized queue system.</p>
                        <div className="flex gap-12 pt-8 border-t border-white/10">
                            <div><p className="text-2xl font-bold text-white uppercase">Fast</p><p className="text-xs uppercase tracking-widest text-slate-500">Processing</p></div>
                            <div><p className="text-2xl font-bold text-white uppercase">LTO</p><p className="text-xs uppercase tracking-widest text-slate-500">Integrated</p></div>
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
}