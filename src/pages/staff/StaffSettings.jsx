import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, UserCheck, Users, CalendarDays,
    CreditCard, FileText, Settings, Bell, LogOut,
    User, Shield, BellRing, Monitor
} from 'lucide-react';
import PageTransition from "../../components/layout/PageTransition.jsx";

export default function StaffSettings() {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate('/login');
    };

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
                                    <Link key={item.name} to={item.path} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${isActive ? 'bg-white text-black font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                                        <item.icon size={20} className={isActive ? 'text-black' : 'text-slate-400'} />
                                        <span className="text-sm">{item.name}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="pt-6 border-t border-white/10 space-y-2 px-2">
                        <Link to="/staff/settings" className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${location.pathname === '/staff/settings' ? 'bg-white text-black font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                            <Settings size={20} className={location.pathname === '/staff/settings' ? 'text-black' : 'text-slate-400'} />
                            <span className="text-sm">Settings</span>
                        </Link>

                        <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-slate-800 rounded-full flex items-center justify-center text-[10px] text-white font-bold">JD</div>
                                <div className="flex flex-col text-white">
                                    <span className="text-[11px] font-bold uppercase leading-none">Juan D.</span>
                                    <span className="text-slate-500 text-[8px] font-bold uppercase tracking-widest mt-1">Admin</span>
                                </div>
                            </div>
                            <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-red-400 transition-all">
                                <LogOut size={18} />
                            </button>
                        </div>
                    </div>
                </aside>

                <main className="flex-1 p-12 space-y-10 overflow-y-auto">
                    <header className="space-y-1">
                        <h1 className="text-5xl font-black text-slate-950 uppercase tracking-tighter leading-none">Settings</h1>
                        <p className="text-slate-500 font-medium uppercase text-[10px] tracking-[0.2em]">System & Terminal Configuration</p>
                    </header>

                    <div className="grid grid-cols-12 gap-8">
                        <div className="col-span-8 space-y-6">
                            {/* Profile Section */}
                            <div className="bg-white border-2 border-slate-50 rounded-[2.5rem] p-10 space-y-8 shadow-sm">
                                <h3 className="font-black uppercase text-sm tracking-widest flex items-center gap-2"><User size={20} /> Staff Profile</h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Full Name</label>
                                        <input type="text" defaultValue="Juan Dela Cruz" className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-black rounded-2xl outline-none font-bold text-sm transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Terminal Role</label>
                                        <input type="text" defaultValue="Front Desk Admin" disabled className="w-full p-4 bg-slate-100 border-2 border-transparent rounded-2xl font-bold text-sm text-slate-400 italic" />
                                    </div>
                                </div>
                            </div>

                            {/* Security Section */}
                            <div className="bg-white border-2 border-slate-50 rounded-[2.5rem] p-10 space-y-8 shadow-sm">
                                <h3 className="font-black uppercase text-sm tracking-widest flex items-center gap-2"><Shield size={20} /> Security & Access</h3>
                                <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                    <div>
                                        <p className="font-bold text-sm">Two-Factor Authentication</p>
                                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">Requirement for Admin accounts</p>
                                    </div>
                                    <div className="w-12 h-6 bg-emerald-500 rounded-full relative p-1 cursor-pointer">
                                        <div className="w-4 h-4 bg-white rounded-full ml-auto" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Side Panel Info */}
                        <div className="col-span-4 space-y-6">
                            <div className="bg-black text-white p-10 rounded-[2.5rem] space-y-6 shadow-xl relative overflow-hidden">
                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl" />
                                <h3 className="font-black uppercase text-xs tracking-widest text-emerald-500">Terminal Info</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-[10px] font-black uppercase text-slate-500">Version</span>
                                        <span className="text-[10px] font-black">v2.4.0-PRO</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[10px] font-black uppercase text-slate-500">Last Sync</span>
                                        <span className="text-[10px] font-black">Today, 10:30 PM</span>
                                    </div>
                                </div>
                                <button className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all">Check for Updates</button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </PageTransition>
    );
}