import { useState } from 'react'; // 1. Import useState
import { Eye, EyeOff, ShieldCheck } from 'lucide-react'; // 2. Import EyeOff
import { Link } from 'react-router-dom';
import PageTransition from "../components/layout/PageTransition.jsx";

export default function Login() {
    // 3. Create the visibility state
    const [showPassword, setShowPassword] = useState(false);

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
                        <span className="text-white font-bold text-xl tracking-tight uppercase">MJY 88</span>
                    </Link>

                    <div className="relative z-10 space-y-6">
                        <h1 className="text-5xl font-black text-white leading-tight uppercase">
                            Faster licensing <br /> starts with better <br /> access.
                        </h1>
                        <p className="text-slate-400 max-w-md leading-relaxed">
                            Manage your LTO medical requirements, schedule your physical exam,
                            and track your certification status in real-time.
                        </p>
                        <div className="flex gap-12 pt-8 border-t border-white/10">
                            <div>
                                <p className="text-2xl font-bold text-white">24/7</p>
                                <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">Support</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">100%</p>
                                <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">Secure</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE: Login Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                    <div className="w-full max-w-md space-y-10">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-black tracking-tight uppercase">Welcome Back</h2>
                            <p className="text-slate-500 text-sm font-medium">Please enter your details to access your portal</p>
                        </div>

                        <form className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Email Address</label>
                                <input
                                    type="email"
                                    placeholder="name@example.com"
                                    className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-xl focus:border-black focus:outline-none transition-all placeholder:text-slate-300"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Password</label>
                                    <a href="#" className="text-xs font-bold hover:underline">Forgot password?</a>
                                </div>
                                <div className="relative">
                                    <input
                                        /* 4. Dynamic type based on state */
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-xl focus:border-black focus:outline-none transition-all placeholder:text-slate-300"
                                    />
                                    {/* 5. Clickable toggle icon */}
                                    <div
                                        className="absolute right-4 top-3.5 text-slate-300 cursor-pointer hover:text-black transition-colors"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </div>
                                </div>
                            </div>

                            <button className="w-full py-4 bg-black text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 uppercase tracking-widest">
                                Log In
                            </button>
                        </form>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100"></span></div>
                            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-4 text-slate-400 font-bold tracking-widest">Or continue with</span></div>
                        </div>

                        <button className="w-full py-3 border-2 border-slate-100 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-slate-50 transition-all">
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5 grayscale" alt="google" />
                            GOOGLE
                        </button>

                        <p className="text-center text-sm text-slate-500 mt-8">
                            Don't have an account? {' '}
                            <Link to="/signup" className="text-black font-bold hover:underline">
                                Create Account
                            </Link>
                        </p>

                        <div className="flex justify-center gap-6 text-[10px] uppercase tracking-widest font-bold text-slate-300 pt-8">
                            <a href="#" className="hover:text-black">Privacy Policy</a>
                            <a href="#" className="hover:text-black">Terms of Service</a>
                            <a href="#" className="hover:text-black">Contact Support</a>
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
}