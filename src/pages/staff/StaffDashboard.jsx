import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, UserCheck, Users, CalendarDays,
    CreditCard, FileText, Bell, LogOut, TrendingUp,
    Clock, CheckCircle2, AlertCircle, Settings, UserPlus // Added UserPlus here
} from 'lucide-react';

// Added a try-catch style safety for the PageTransition import
import PageTransition from "../../components/layout/PageTransition.jsx";

export default function StaffDashboard() {
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

    const stats = [
        { label: 'Total Checked-in', value: '42', change: '+12%', icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Avg. Wait Time', value: '14m', change: '-2m', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Pending Payments', value: '₱3,200', change: '5 Cases', icon: CreditCard, color: 'text-orange-600', bg: 'bg-orange-50' },
        { label: 'Today\'s Target', value: '84%', change: 'High Load', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
    ];

    return (
        <PageTransition>
            <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">

                {/* SIDEBAR */}
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
                                    <Link
                                        key={item.name}
                                        to={item.path}
                                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${isActive
                                            ? 'bg-white text-black font-bold shadow-lg shadow-white/5'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        <item.icon size={20} className={isActive ? 'text-black' : 'text-slate-400'} />
                                        <span className="text-sm">{item.name}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="pt-6 border-t border-white/10 space-y-2 px-2">
                        <Link
                            to="/staff/settings"
                            className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${location.pathname === '/staff/settings'
                                ? 'bg-white text-black font-bold shadow-lg shadow-white/5'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <Settings size={20} className={location.pathname === '/staff/settings' ? 'text-black' : 'text-slate-400'} />
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
                            <button
                                onClick={handleLogout}
                                className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                                title="Logout"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    </div>
                </aside>

                <main className="flex-1 p-12 space-y-10 overflow-y-auto">
                    <header className="flex justify-between items-center">
                        <div className="space-y-1">
                            <h1 className="text-4xl font-black text-slate-950 uppercase tracking-tighter leading-none">Clinic Overview</h1>
                            <p className="text-slate-500 font-medium uppercase text-[10px] tracking-[0.2em]">Wednesday, March 18, 2026</p>
                        </div>
                        <button className="p-3 bg-white border border-slate-200 rounded-full text-slate-400 hover:text-black shadow-sm relative">
                            <Bell size={20} />
                            <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full" />
                        </button>
                    </header>

                    <div className="grid grid-cols-4 gap-6">
                        {stats.map((stat, idx) => (
                            <div key={idx} className="bg-white p-8 rounded-[2rem] border-2 border-slate-50 shadow-sm space-y-4 hover:border-slate-200 transition-all">
                                <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center`}>
                                    <stat.icon size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                                    <div className="flex items-end gap-3">
                                        <h3 className="text-3xl font-black text-slate-950">{stat.value}</h3>
                                        <span className={`text-[10px] font-bold pb-1 ${stat.change.startsWith('+') ? 'text-emerald-500' : 'text-slate-400'}`}>
                                            {stat.change}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-12 gap-8">
                        <div className="col-span-8 bg-white border-2 border-slate-50 rounded-[2.5rem] p-10 space-y-8 shadow-sm">
                            <div className="flex justify-between items-center border-b border-slate-50 pb-6">
                                <h3 className="font-black uppercase text-sm tracking-widest">Live Flow Tracking</h3>
                                <button className="text-[10px] font-black uppercase text-slate-400 hover:text-black transition-colors">View Full Logs</button>
                            </div>

                            <div className="space-y-4">
                                {[
                                    { name: 'Alex Johnson', action: 'Checked-in', time: 'Just now', icon: CheckCircle2, color: 'text-emerald-500' },
                                    { name: 'Maria Santos', action: 'Payment Verified', time: '12m ago', icon: CreditCard, color: 'text-blue-500' },
                                    { name: 'Julius Caesar', action: 'Emergency Entry', time: '25m ago', icon: AlertCircle, color: 'text-red-500' },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between p-5 border border-slate-50 rounded-2xl hover:bg-slate-50 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center bg-white border border-slate-100 shadow-sm ${item.color}`}>
                                                <item.icon size={22} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-slate-950 group-hover:text-black">{item.name}</p>
                                                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">{item.action}</p>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{item.time}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="col-span-4 space-y-6">
                            <div className="bg-black rounded-[2.5rem] p-10 text-white space-y-6 shadow-xl relative overflow-hidden">
                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
                                <h3 className="font-black uppercase text-xs tracking-[0.2em] text-white/40">System Notice</h3>
                                <p className="text-lg font-bold leading-tight uppercase tracking-tight">Daily Maintenance scheduled at 10:00 PM PST today.</p>
                                <div className="pt-6 border-t border-white/10 flex items-center gap-3">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Backups Secure</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </PageTransition>
    );
}