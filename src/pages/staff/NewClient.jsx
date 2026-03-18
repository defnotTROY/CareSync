import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, UserCheck, Users, CalendarDays,
    CreditCard, FileText, Bell, LogOut, Settings,
    UserPlus, ArrowRight, Save, X, ChevronRight
} from 'lucide-react';
import PageTransition from "../../components/layout/PageTransition.jsx";

export default function NewClient() {
    const location = useLocation();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);

    const handleLogout = () => navigate('/login');

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/staff/dashboard' },
        { name: 'Client Check-in', icon: UserCheck, path: '/staff/check-in' },
        { name: 'Client Queue', icon: Users, path: '/staff/queue' },
        { name: 'Appointments', icon: CalendarDays, path: '/staff/appointments' },
        { name: 'Payment Record', icon: CreditCard, path: '/staff/payments' },
        { name: 'Client Record', icon: FileText, path: '/staff/records' },
        { name: 'New Client', icon: UserPlus, path: '/staff/new-client' },
    ];

    return (
        <PageTransition>
            <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">

                {/* SIDEBAR (Standardized) */}
                <aside className="w-72 bg-black flex flex-col justify-between py-10 px-6 shrink-0 h-screen sticky top-0">
                    <div className="space-y-10">
                        <div className="flex items-center gap-3 px-2">
                            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-emerald-500/20">M</div>
                            <div className="flex flex-col text-white font-black uppercase tracking-tight leading-none">
                                <span className="text-lg">CareSync</span>
                                <span className="text-slate-500 text-[10px] tracking-widest mt-1">Staff Terminal</span>
                            </div>
                        </div>

                        <nav className="space-y-1">
                            {navItems.map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link key={item.name} to={item.path} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${isActive ? 'bg-white text-black font-bold shadow-lg shadow-white/5' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                                        <item.icon size={20} className={isActive ? 'text-black' : 'text-slate-400'} />
                                        <span className="text-sm">{item.name}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="pt-6 border-t border-white/10 space-y-2 px-2">
                        <Link to="/staff/settings" className="flex items-center gap-4 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                            <Settings size={20} />
                            <span className="text-sm">Settings</span>
                        </Link>
                        <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-slate-800 rounded-full flex items-center justify-center text-[10px] text-white font-bold">JD</div>
                                <div className="flex flex-col">
                                    <span className="text-white text-[11px] font-bold uppercase leading-none">Juan D.</span>
                                    <span className="text-slate-500 text-[8px] font-bold uppercase tracking-widest mt-1">Admin</span>
                                </div>
                            </div>
                            <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-red-400 transition-all"><LogOut size={18} /></button>
                        </div>
                    </div>
                </aside>

                <main className="flex-1 p-12 space-y-10 overflow-y-auto">

                    {/* HEADER */}
                    <div className="flex justify-between items-center">
                        <div className="space-y-1">
                            <h1 className="text-5xl font-black text-slate-950 uppercase tracking-tighter">Registration</h1>
                            <p className="text-slate-500 font-medium uppercase text-[10px] tracking-[0.2em]">Onboard a new patient to the system</p>
                        </div>
                        <button onClick={() => navigate('/staff/records')} className="p-4 bg-white border-2 border-slate-50 rounded-2xl text-slate-400 hover:text-black hover:border-black transition-all shadow-sm">
                            <X size={24} />
                        </button>
                    </div>

                    {/* PROGRESS TRACKER */}
                    <div className="flex gap-4 max-w-2xl">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className={`h-2 flex-1 rounded-full transition-all duration-500 ${step >= s ? 'bg-black' : 'bg-slate-200'}`} />
                        ))}
                    </div>

                    <div className="grid grid-cols-12 gap-10">
                        <div className="col-span-8 bg-white border-2 border-slate-50 rounded-[2.5rem] p-12 shadow-sm space-y-10">

                            {/* STEP 1: PERSONAL INFO */}
                            {step === 1 && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <h3 className="text-2xl font-black uppercase tracking-tight">Personal Details</h3>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">First Name</label>
                                            <input type="text" placeholder="e.g. Juan" className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-black rounded-2xl outline-none font-bold transition-all" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Last Name</label>
                                            <input type="text" placeholder="e.g. Dela Cruz" className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-black rounded-2xl outline-none font-bold transition-all" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Date of Birth</label>
                                            <input type="date" className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-black rounded-2xl outline-none font-bold transition-all text-slate-500" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Gender</label>
                                            <select className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-black rounded-2xl outline-none font-bold transition-all appearance-none">
                                                <option>Male</option>
                                                <option>Female</option>
                                                <option>Other</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 2: CONTACT & ACCOUNT */}
                            {step === 2 && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <h3 className="text-2xl font-black uppercase tracking-tight">Account & Contact</h3>
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Email Address</label>
                                            <input type="email" placeholder="client@email.com" className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-black rounded-2xl outline-none font-bold transition-all" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Phone Number</label>
                                            <input type="tel" placeholder="+63 900 000 0000" className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-black rounded-2xl outline-none font-bold transition-all" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: TYPE & CONFIRMATION */}
                            {step === 3 && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <h3 className="text-2xl font-black uppercase tracking-tight">Categorization</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {['Student', 'Professional', 'Non-Professional', 'Senior'].map((type) => (
                                            <button key={type} className="p-6 border-2 border-slate-50 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:border-black transition-all text-center">
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* NAVIGATION BUTTONS */}
                            <div className="pt-10 border-t border-slate-50 flex justify-between items-center">
                                <button
                                    onClick={() => setStep(s => Math.max(1, s - 1))}
                                    className={`text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-black ${step === 1 ? 'invisible' : ''}`}
                                >
                                    Back
                                </button>
                                {step < 3 ? (
                                    <button
                                        onClick={() => setStep(s => Math.min(3, s + 1))}
                                        className="px-10 py-5 bg-black text-white rounded-3xl font-black uppercase text-[10px] tracking-[0.2em] flex items-center gap-3 shadow-xl shadow-black/10 transition-transform active:scale-95"
                                    >
                                        Next Step <ChevronRight size={16} />
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => navigate('/staff/records')}
                                        className="px-10 py-5 bg-emerald-500 text-white rounded-3xl font-black uppercase text-[10px] tracking-[0.2em] flex items-center gap-3 shadow-xl shadow-emerald-500/20 transition-transform active:scale-95"
                                    >
                                        Register Client <Save size={16} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* SIDE INFO */}
                        <div className="col-span-4 space-y-6">
                            <div className="bg-black text-white p-10 rounded-[2.5rem] space-y-6 shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl -mr-16 -mt-16" />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">Quick Note</h3>
                                <p className="text-lg font-bold leading-tight uppercase tracking-tight">Ensure the patient's ID matches the entered details for clinical records.</p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </PageTransition>
    );
}