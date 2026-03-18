import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, UserCheck, Users, CalendarDays,
    CreditCard, FileText, Search, Bell, LogOut, MoreVertical,
    Clock, Play, CheckCircle2, AlertCircle, ArrowRight,
    Settings, UserPlus // Added these
} from 'lucide-react';
import PageTransition from "../../components/layout/PageTransition.jsx";

export default function ClientQueue() {
    const location = useLocation();
    const navigate = useNavigate();

    // Logic for Logout Redirect
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

    const [queueData, setQueueData] = useState([
        { id: 'Q-102', name: 'Marcus Aurelius', service: 'General Checkup', wait: '12m', status: 'waiting', priority: 'Standard' },
        { id: 'Q-103', name: 'Elena Lamberti', service: 'Cardiology', wait: '5m', status: 'waiting', priority: 'Urgent' },
        { id: 'Q-101', name: 'Julius Caesar', service: 'Physical Exam', wait: '45m', status: 'in-progress', room: 'Exam Room 1' },
    ]);

    return (
        <PageTransition>
            <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">

                {/* SIDEBAR (Standardized) */}
                <aside className="w-72 bg-black flex flex-col justify-between py-10 px-6 shrink-0 h-screen sticky top-0">
                    <div className="space-y-10">
                        {/* Branding */}
                        <div className="flex items-center gap-3 px-2">
                            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-emerald-500/20">M</div>
                            <div className="flex flex-col text-white font-black uppercase tracking-tight leading-none">
                                <span className="text-lg">CareSync</span>
                                <span className="text-slate-500 text-[10px] tracking-widest mt-1">Staff Terminal</span>
                            </div>
                        </div>

                        {/* Navigation Links */}
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

                    {/* Bottom Sidebar Actions */}
                    <div className="pt-6 border-t border-white/10 space-y-2 px-2">
                        {/* Settings Button */}
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

                        {/* Profile & Logout */}
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
                    {/* Header */}
                    <div className="flex justify-between items-end">
                        <div className="space-y-2">
                            <h1 className="text-5xl font-black text-slate-950 uppercase tracking-tighter">Live Queue</h1>
                            <div className="flex items-center gap-4 text-slate-500 font-bold text-xs uppercase tracking-widest">
                                <span className="flex items-center gap-2 text-emerald-600">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                    {queueData.length} Active
                                </span>
                                <span>•</span>
                                <span>Avg. Wait: 18 Mins</span>
                            </div>
                        </div>
                        <button className="p-3 bg-white border border-slate-200 rounded-full text-slate-400 hover:text-black shadow-sm relative">
                            <Bell size={20} />
                            <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full" />
                        </button>
                    </div>

                    <div className="grid grid-cols-12 gap-8">
                        {/* Waiting List */}
                        <div className="col-span-8 space-y-6">
                            <h3 className="font-black uppercase text-xs tracking-[0.2em] text-slate-400 px-4">Waiting Area</h3>
                            <div className="space-y-3">
                                {queueData.filter(p => p.status === 'waiting').map((patient) => (
                                    <div key={patient.id} className="bg-white border-2 border-slate-100 rounded-3xl p-6 flex items-center justify-between hover:border-black transition-all group">
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-slate-300">QR</div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] font-black px-1.5 py-0.5 bg-black text-white rounded uppercase">{patient.id}</span>
                                                    <h4 className="font-black text-lg uppercase tracking-tight">{patient.name}</h4>
                                                    {patient.priority === 'Urgent' && <AlertCircle size={16} className="text-red-500" />}
                                                </div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{patient.service}</p>
                                            </div>
                                        </div>
                                        <button className="flex items-center gap-2 bg-slate-100 hover:bg-black hover:text-white px-6 py-3 rounded-xl transition-all font-black uppercase text-[10px] tracking-widest">
                                            Call Patient
                                            <ArrowRight size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Serving Now */}
                        <div className="col-span-4 space-y-6">
                            <h3 className="font-black uppercase text-xs tracking-[0.2em] text-slate-400 px-4">Serving Now</h3>
                            {queueData.filter(p => p.status === 'in-progress').map((patient) => (
                                <div key={patient.id} className="bg-black text-white rounded-[2.5rem] p-8 space-y-6 shadow-xl relative overflow-hidden">
                                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
                                    <div className="flex justify-between items-center">
                                        <span className="bg-emerald-500 text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-widest">In Progress</span>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{patient.room}</span>
                                    </div>
                                    <h4 className="text-2xl font-black uppercase tracking-tighter">{patient.name}</h4>
                                    <button className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-500 hover:text-white transition-all shadow-lg">
                                        Mark as Finished
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </PageTransition>
    );
}