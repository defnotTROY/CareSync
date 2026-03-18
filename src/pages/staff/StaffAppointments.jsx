import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, UserCheck, Users, CalendarDays,
    CreditCard, FileText, Bell, LogOut, ChevronLeft,
    ChevronRight, Plus, Clock, Filter, MoreHorizontal,
    Settings, UserPlus // Added these
} from 'lucide-react';
import PageTransition from "../../components/layout/PageTransition.jsx";

export default function StaffAppointments() {
    const location = useLocation();
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState(18);

    // Standardized Logout Logic
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

    const appointments = [
        { id: 1, time: '08:00 AM', patient: 'Marcus Aurelius', service: 'General Checkup', status: 'Confirmed', type: 'Student' },
        { id: 2, time: '09:30 AM', patient: 'Elena Lamberti', service: 'Cardiology Scan', status: 'Pending', type: 'Professional' },
        { id: 3, time: '11:00 AM', patient: 'Julius Caesar', service: 'Physical Exam', status: 'Confirmed', type: 'Conversion' },
        { id: 4, time: '01:30 PM', patient: 'Livilla Drusilla', service: 'Blood Work', status: 'Arrived', type: 'Non-Professional' },
    ];

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

                    {/* HEADER */}
                    <div className="flex justify-between items-center">
                        <div className="space-y-1">
                            <h1 className="text-5xl font-black text-slate-950 uppercase tracking-tighter">Schedules</h1>
                            <p className="text-slate-500 font-medium uppercase text-[10px] tracking-[0.2em]">Manage daily clinical bookings</p>
                        </div>
                        <div className="flex gap-3">
                            <button className="px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:border-black transition-all">
                                <Filter size={16} /> Filter
                            </button>
                            <button className="px-8 py-4 bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg text-xs">
                                <Plus size={16} /> New Appt
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-12 gap-10">

                        {/* LEFT: MINI CALENDAR NAVIGATION */}
                        <div className="col-span-4 space-y-6">
                            <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 space-y-8 shadow-sm">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-black uppercase text-sm tracking-tight text-slate-950 underline underline-offset-8 decoration-emerald-500">March 2026</h3>
                                    <div className="flex gap-2">
                                        <button className="p-2 hover:bg-slate-50 rounded-lg transition-colors"><ChevronLeft size={18} /></button>
                                        <button className="p-2 hover:bg-slate-50 rounded-lg transition-colors"><ChevronRight size={18} /></button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-black uppercase text-slate-400 tracking-widest mb-2">
                                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => <div key={day}>{day}</div>)}
                                </div>
                                <div className="grid grid-cols-7 gap-2">
                                    {[...Array(31)].map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setSelectedDate(i + 1)}
                                            className={`p-2 rounded-xl text-xs font-bold transition-all ${selectedDate === i + 1
                                                ? 'bg-black text-white shadow-lg scale-110'
                                                : 'text-slate-900 hover:bg-slate-50'
                                                }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-emerald-50 rounded-3xl p-8 border border-emerald-100 shadow-sm">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-2">Daily Insight</h4>
                                <p className="text-sm font-bold text-emerald-950 leading-relaxed italic underline decoration-emerald-200">
                                    You have 14 appointments today. 8:00 AM is your busiest hour.
                                </p>
                            </div>
                        </div>

                        {/* RIGHT: DETAILED AGENDA */}
                        <div className="col-span-8 space-y-6">
                            <div className="flex justify-between items-center px-4">
                                <h3 className="font-black uppercase text-xs tracking-[0.2em] text-slate-400">Wednesday, March {selectedDate}</h3>
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
                                    <Clock size={12} className="text-emerald-500" /> Time Zone: PST
                                </div>
                            </div>

                            <div className="space-y-4">
                                {appointments.map((appt) => (
                                    <div key={appt.id} className="group bg-white border-2 border-slate-100 rounded-[2rem] p-6 flex items-center justify-between hover:border-black transition-all shadow-sm">
                                        <div className="flex items-center gap-8">
                                            <div className="text-center w-20">
                                                <p className="text-lg font-black text-slate-950 leading-none">{appt.time.split(' ')[0]}</p>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{appt.time.split(' ')[1]}</p>
                                            </div>
                                            <div className="h-10 w-[2px] bg-slate-100 group-hover:bg-black transition-colors" />
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-3">
                                                    <h4 className="font-black text-lg uppercase tracking-tight">{appt.patient}</h4>
                                                    <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${appt.status === 'Arrived' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' :
                                                        appt.status === 'Pending' ? 'bg-orange-400 text-white shadow-lg shadow-orange-500/20' : 'bg-slate-100 text-slate-500'
                                                        }`}>
                                                        {appt.status}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{appt.service} • <span className="text-slate-300 font-medium">{appt.type}</span></p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <button className="px-5 py-3 border-2 border-slate-50 rounded-xl font-black uppercase text-[9px] tracking-widest hover:border-black transition-all">Check-in</button>
                                            <button className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-black transition-all"><MoreHorizontal size={18} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </main>
            </div>
        </PageTransition>
    );
}