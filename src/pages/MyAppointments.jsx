import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, CalendarPlus, ClipboardList, Settings,
    LogOut, ShieldCheck, User, Search, Bell, Plus
} from 'lucide-react';
import PageTransition from "../components/layout/PageTransition.jsx";

export default function MyAppointments() {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('Upcoming Visits (1)');

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { name: 'Book Appointment', icon: CalendarPlus, path: '/book' },
        { name: 'My Appointments', icon: ClipboardList, path: '/appointments' },
    ];

    const tabs = ['Upcoming Visits (1)', 'Past History', 'Cancelled'];

    // Mock data for the appointment card
    const appointments = [
        {
            doctor: "Dr. Maria Santos, MD",
            specialty: "General Physician",
            date: "Oct 24, 2026",
            time: "10:00 AM - 11:30 AM",
            status: "CONFIRMED"
        }
    ];

    return (
        <PageTransition>
            <div className="flex min-h-screen bg-white text-slate-900 font-sans">

                {/* SIDE NAVIGATION */}
                <aside className="w-72 bg-black flex flex-col justify-between py-10 px-6 shrink-0 h-screen sticky top-0">
                    <div className="space-y-10">
                        <Link to="/" className="flex items-center gap-3 px-2">
                            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                                <ShieldCheck className="text-white" size={22} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-white font-black text-lg leading-tight uppercase tracking-tight">MJY 88</span>
                                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Medical Clinic</span>
                            </div>
                        </Link>

                        <nav className="space-y-2">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${location.pathname === item.path ? 'bg-white text-black font-bold' : 'text-slate-400 hover:text-white'
                                        }`}
                                >
                                    <item.icon size={20} />
                                    <span className="text-sm">{item.name}</span>
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div className="space-y-6 pt-6 border-t border-white/10 text-slate-400">
                        <div className="flex items-center gap-3 px-4">
                            <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-xs">JD</div>
                            <div className="flex flex-col">
                                <span className="text-white text-xs font-bold">Juan Dela Cruz</span>
                                <span className="text-[9px] font-bold uppercase">Patient Account</span>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* MAIN CONTENT AREA */}
                <main className="flex-1 bg-white">
                    {/* Top Bar with Search */}
                    <div className="flex justify-between items-center p-8 border-b border-slate-100">
                        <h2 className="text-xl font-black uppercase tracking-tight">My Appointments</h2>
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search appointments..."
                                    className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-sm focus:outline-none focus:border-black w-64"
                                />
                            </div>
                            <button className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-black transition-colors">
                                <Bell size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="p-16 space-y-12">
                        {/* Section Title & Action */}
                        <div className="flex justify-between items-end">
                            <div className="space-y-2">
                                <h1 className="text-5xl font-black text-slate-950 uppercase tracking-tighter">Appointments</h1>
                                <p className="text-slate-500 font-medium">Manage your upcoming and past medical consultations.</p>
                            </div>
                            <Link to="/book" className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-slate-800 transition-all">
                                <Plus size={16} /> Book New Appointment
                            </Link>
                        </div>

                        {/* Tabs Navigation */}
                        <div className="flex gap-8 border-b border-slate-100">
                            {tabs.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === tab ? 'text-black' : 'text-slate-400 hover:text-slate-600'
                                        }`}
                                >
                                    {tab}
                                    {activeTab === tab && (
                                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black" />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Appointments List */}
                        <div className="space-y-6">
                            {appointments.map((apt, idx) => (
                                <div key={idx} className="p-10 border-2 border-slate-100 rounded-[2rem] space-y-8">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <span className="inline-block px-3 py-1 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-md mb-2">
                                                {apt.status}
                                            </span>
                                            <h3 className="text-2xl font-black text-slate-900 uppercase">{apt.doctor}</h3>
                                            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">{apt.specialty}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-black text-slate-900">{apt.date}</p>
                                            <p className="text-xs font-bold text-slate-400">{apt.time}</p>
                                        </div>
                                    </div>

                                    <div className="w-full h-px bg-slate-100" />

                                    <div className="flex justify-between items-center">
                                        <div className="flex gap-3">
                                            <button className="px-8 py-3 bg-black text-white rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-all">
                                                View Details
                                            </button>
                                            <button className="px-8 py-3 border-2 border-slate-100 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all">
                                                Reschedule
                                            </button>
                                        </div>
                                        <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors">
                                            Cancel Visit
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </PageTransition>
    );
}