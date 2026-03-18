import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    CalendarPlus,
    ClipboardList,
    Settings,
    LogOut,
    ShieldCheck,
    User
} from 'lucide-react';
import PageTransition from "../components/layout/PageTransition.jsx";

export default function ClientDashboard() {
    const location = useLocation();
    const userName = "Alex";

    // Mock Data for the Queue/Appointment
    const upcomingTask = {
        title: "Medical Evaluation",
        doctor: "Dr. Sarah Jenkins",
        date: "Oct 24, 2023",
        time: "10:30 AM",
        location: "MJY 88 Main Branch",
        status: "UPCOMING APPOINTMENT",
        daysLeft: "In 3 days"
    };

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { name: 'Book Appointment', icon: CalendarPlus, path: '/book' },
        { name: 'My Appointments', icon: ClipboardList, path: '/appointments' },
    ];

    return (
        <PageTransition>
            <div className="flex min-h-screen bg-white text-slate-900 font-sans">

                {/* SIDE NAVIGATION BAR (Dark Sidebar) */}
                <aside className="w-72 bg-black flex flex-col justify-between py-10 px-6 shrink-0">
                    <div className="space-y-10">
                        {/* Brand Logo */}
                        <Link to="/" className="flex items-center gap-3 px-2">
                            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                <ShieldCheck className="text-white" size={22} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-white font-black text-lg leading-tight tracking-tight uppercase">MJY 88</span>
                                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Medical Clinic</span>
                            </div>
                        </Link>

                        {/* Main Nav */}
                        <nav className="space-y-2">
                            {navItems.map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.path}
                                        className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group ${isActive
                                                ? 'bg-white text-black font-bold shadow-lg shadow-white/5'
                                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        <item.icon size={20} className={isActive ? 'text-black' : 'text-slate-400 group-hover:text-white'} />
                                        <span className="text-sm tracking-tight">{item.name}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Bottom Section: Settings & User */}
                    <div className="space-y-6">
                        <Link to="/settings" className="flex items-center gap-4 px-4 py-3 text-slate-400 hover:text-white transition-colors group">
                            <Settings size={20} />
                            <span className="text-sm font-medium">Settings</span>
                        </Link>

                        <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center overflow-hidden border border-white/10">
                                    <User className="text-slate-400" size={20} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-white text-sm font-bold">Juan Dela Cruz</span>
                                    <span className="text-slate-500 text-[10px] font-bold uppercase tracking-tighter">Patient Account</span>
                                </div>
                            </div>
                            <button className="text-slate-500 hover:text-red-400 transition-colors">
                                <LogOut size={18} />
                            </button>
                        </div>
                    </div>
                </aside>

                {/* MAIN DASHBOARD AREA */}
                <main className="flex-1 p-16 overflow-y-auto">
                    <header className="mb-12">
                        <h1 className="text-5xl font-black text-slate-950 tracking-tighter uppercase">Welcome, {userName}</h1>
                        <p className="text-slate-500 mt-2 font-medium">Manage your health and appointments at a glance.</p>
                    </header>

                    {/* Upcoming Appointment Card (Styled after your reference image) */}
                    <section className="relative group cursor-pointer">
                        {/* Black Shadow Offset Effect */}
                        <div className="absolute inset-0 bg-black rounded-[2rem] translate-x-1.5 translate-y-1.5" />

                        <div className="relative bg-white border-2 border-black rounded-[2rem] p-10 space-y-8">
                            <div className="flex justify-between items-start">
                                <div className="space-y-3">
                                    <span className="inline-block px-3 py-1 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-md">
                                        {upcomingTask.status}
                                    </span>
                                    <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase">{upcomingTask.title}</h2>
                                    <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">Routine check-up with {upcomingTask.doctor}</p>
                                </div>
                                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">{upcomingTask.daysLeft}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-900 border border-slate-200">
                                        <CalendarPlus size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Date</p>
                                        <p className="text-sm font-bold">{upcomingTask.date}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-900 border border-slate-200">
                                        <ClipboardList size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Time</p>
                                        <p className="text-sm font-bold">{upcomingTask.time}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-900 border border-slate-200">
                                        <ShieldCheck size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Location</p>
                                        <p className="text-sm font-bold">{upcomingTask.location}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-slate-100">
                                <button className="px-8 py-3.5 bg-black text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-slate-800 transition-all">
                                    Manage
                                </button>
                                <button className="px-8 py-3.5 border-2 border-slate-200 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-slate-50 transition-all text-slate-600">
                                    Reschedule
                                </button>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </PageTransition>
    );
}