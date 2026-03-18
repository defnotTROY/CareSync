import { useState } from 'react';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom'; // Added useNavigate
import PageTransition from "../components/layout/PageTransition.jsx";

export default function Login() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

    // 1. Add states for input
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // 2. Handle the Role-Based Redirect
    const handleLogin = (e) => {
        e.preventDefault();

        const lowerEmail = email.toLowerCase();

        if (lowerEmail.includes('admin')) {
            navigate('/admin/dashboard');
        } else if (lowerEmail.includes('doctor')) {
            navigate('/doctor/dashboard');
        } else if (lowerEmail.includes('staff')) {
            navigate('/staff/dashboard');
        } else {
            // Default role is Client/Patient
            navigate('/dashboard');
        }
    };

    return (
        <PageTransition>
            <div className="flex min-h-screen bg-white text-black">
                {/* LEFT SIDE: Branding */}
                <div className="hidden lg:flex w-1/2 bg-black p-16 flex-col justify-between relative overflow-hidden">
                    <ShieldCheck className="absolute -right-20 -bottom-20 text-white/5 w-96 h-96" />

                    <Link to="/" className="relative z-10 flex items-center gap-2">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                            <span className="text-black font-bold">M</span>
                        </div>
                        <span className="text-white font-bold text-xl tracking-tight uppercase">CareSync</span>
                    </Link>

                    <div className="relative z-10 space-y-6">
                        <h1 className="text-5xl font-black text-white leading-tight uppercase">
                            Faster licensing <br /> starts with better <br /> access.
                        </h1>
                        <p className="text-slate-400 max-w-md leading-relaxed font-medium">
                            Manage your LTO medical requirements, schedule your physical exam,
                            and track your certification status in real-time.
                        </p>
                        <div className="flex gap-12 pt-8 border-t border-white/10">
                            <div>
                                <p className="text-2xl font-bold text-white tracking-tighter">24/7</p>
                                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black">Support</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white tracking-tighter">100%</p>
                                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black">Secure</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE: Login Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                    <div className="w-full max-w-md space-y-10">
                        <div className="space-y-2">
                            <h2 className="text-4xl font-black tracking-tight uppercase italic">Welcome Back</h2>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Please enter your credentials</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address</label>
                                <input
                                    required
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="e.g. admin@caresync.com"
                                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-black focus:bg-white focus:outline-none transition-all font-bold text-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Password</label>
                                    <a href="#" className="text-[10px] font-black uppercase tracking-widest hover:underline">Forgot?</a>
                                </div>
                                <div className="relative">
                                    <input
                                        required
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-black focus:bg-white focus:outline-none transition-all font-bold text-sm"
                                    />
                                    <div
                                        className="absolute right-5 top-4 text-slate-300 cursor-pointer hover:text-black transition-colors"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className="w-full py-5 bg-black text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
                                Enter Terminal
                            </button>
                        </form>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100"></span></div>
                            <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.3em]"><span className="bg-white px-4 text-slate-300">Identity Provider</span></div>
                        </div>

                        <button className="w-full py-4 border-2 border-slate-100 rounded-2xl font-black text-[10px] tracking-widest flex items-center justify-center gap-3 hover:bg-slate-50 transition-all uppercase">
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4 grayscale opacity-50" alt="google" />
                            Continue with Google
                        </button>

                        <p className="text-center text-xs text-slate-400 font-bold uppercase tracking-widest">
                            New user? {' '}
                            <Link to="/signup" className="text-black font-black hover:underline">
                                Create Account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
}