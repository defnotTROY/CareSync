import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Users, ClipboardList, FileText,
    Settings, LogOut, Bell, ArrowRight, Activity,
    Heart, Thermometer, User, CheckCircle2 // Essential Imports
} from 'lucide-react';
import PageTransition from "../../components/layout/PageTransition.jsx";

export default function DoctorDashboard() {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => navigate('/login');

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/doctor/dashboard' },
        { name: 'Client Queue', icon: Users, path: '/doctor/queue' },
        { name: 'Consultation', icon: ClipboardList, path: '/doctor/consultation' },
        { name: 'Client Record', icon: FileText, path: '/doctor/records' },
    ];

    const appointments = [
        { time: '09:00', patient: 'John Doe', type: 'General Check-up • Room 302', status: 'CHECKED IN', current: true },
        { time: '10:30', patient: 'Jane Smith', type: 'Follow-up • Telehealth', status: 'ARRIVING', current: false },
        { time: '11:15', patient: 'Robert Brown', type: 'Consultation • Room 105', status: 'SCHEDULED', current: false },
        { time: '12:00', patient: 'Emily Davis', type: 'Blood Work • Lab A', status: 'SCHEDULED', current: false },
    ];

    return (
        <PageTransition>
            <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">

                {/* SIDEBAR */}
                <aside className="w-72 bg-black flex flex-col justify-between py-10 px-6 shrink-0 h-screen sticky top-0">
                    <div className="space-y-10">
                        <div className="flex items-center gap-3 px-2">
                            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center font-bold text-white text-xl">M</div>
                            <div className="flex flex-col text-white font-black uppercase tracking-tight leading-none">
                                <span className="text-lg">CareSync</span>
                                <span className="text-slate-500 text-[10px] tracking-widest mt-1">Doctor Terminal</span>
                            </div>
                        </div>

                        <nav className="space-y-1">
                            {navItems.map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link key={item.name} to={item.path} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${isActive ? 'bg-white text-black font-bold shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                                        <item.icon size={20} className={isActive ? 'text-black' : 'text-slate-400'} />
                                        <span className="text-sm">{item.name}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="pt-6 border-t border-white/10 space-y-2 px-2">
                        <Link to="/doctor/settings" className="flex items-center gap-4 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                            <Settings size={20} />
                            <span className="text-sm">Settings</span>
                        </Link>
                        <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-slate-800 rounded-full flex items-center justify-center text-[10px] text-white font-bold">JD</div>
                                <div className="flex flex-col">
                                    <span className="text-white text-[11px] font-bold uppercase leading-none">Juan D.</span>
                                    <span className="text-slate-500 text-[8px] font-bold uppercase tracking-widest mt-1">Doctor Admin</span>
                                </div>
                            </div>
                            <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-red-400 transition-all"><LogOut size={18} /></button>
                        </div>
                    </div>
                </aside>

                {/* MAIN CONTENT */}
                <main className="flex-1 p-12 space-y-10 overflow-y-auto">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <h1 className="text-4xl font-black text-slate-950 uppercase tracking-tighter leading-none">Welcome back, Dr. Santos</h1>
                            <p className="text-slate-500 font-medium text-xs uppercase tracking-widest">Monday, October 23, 2023</p>
                        </div>
                        <button className="p-3 bg-white border border-slate-200 rounded-full text-slate-400 shadow-sm"><Bell size={20} /></button>
                    </div>

                    {/* TOP STATS */}
                    <div className="grid grid-cols-2 gap-8">
                        <div className="bg-white border-2 border-slate-50 rounded-[2rem] p-8 flex justify-between items-center shadow-sm">
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Today's Appointments</p>
                                <h2 className="text-6xl font-black">12</h2>
                            </div>
                            <span className="text-emerald-500 font-black text-sm">+2%~</span>
                        </div>
                        <div className="bg-white border-2 border-slate-50 rounded-[2rem] p-8 flex justify-between items-center shadow-sm">
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Patients in Queue</p>
                                <h2 className="text-6xl font-black">04</h2>
                            </div>
                            <span className="text-slate-400 font-black text-sm">Stable</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-12 gap-10">
                        {/* SCHEDULE */}
                        <div className="col-span-7 space-y-6">
                            <h3 className="font-black uppercase text-sm tracking-widest px-4">Today's Schedule</h3>
                            <div className="bg-white border-2 border-slate-50 rounded-[2.5rem] overflow-hidden shadow-sm">
                                {appointments.map((appt, i) => (
                                    <div key={i} className={`p-8 flex items-center justify-between border-b border-slate-50 last:border-0 ${appt.current ? 'bg-slate-50/50' : ''}`}>
                                        <div className="flex items-center gap-8">
                                            <div className="text-center w-16">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{appt.current ? 'CURRENT' : 'WAIT'}</p>
                                                <p className="text-xl font-black">{appt.time}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="font-black text-xl uppercase tracking-tight">{appt.patient}</h4>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{appt.type}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${appt.current ? 'bg-black text-white' : 'bg-slate-100 text-slate-400'}`}>
                                                {appt.status}
                                            </span>
                                            {appt.current && (
                                                <button className="p-3 bg-black text-white rounded-xl shadow-lg"><ArrowRight size={18} /></button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* VITALS */}
                        <div className="col-span-5 space-y-6">
                            <h3 className="font-black uppercase text-sm tracking-widest px-4">Active Patient Vitals</h3>
                            <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-10 space-y-10 shadow-sm">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300"><User size={32} /></div>
                                    <div>
                                        <h4 className="text-2xl font-black uppercase tracking-tighter">John Doe</h4>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">MALE, 42 YEARS</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { label: 'HEIGHT', value: '182', unit: 'cm' },
                                        { label: 'WEIGHT', value: '78', unit: 'kg' },
                                        { label: 'BP', value: '120/80', unit: 'mmHg' },
                                        { label: 'HEART RATE', value: '72', unit: 'bpm' }
                                    ].map((stat) => (
                                        <div key={stat.label} className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-2xl font-black">{stat.value}</span>
                                                <span className="text-[10px] font-bold text-slate-400">{stat.unit}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 flex items-start gap-4">
                                    <CheckCircle2 className="text-emerald-500 mt-1" size={20} />
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest mb-1">ALL CLEAR</p>
                                        <p className="text-[11px] font-medium text-emerald-950 leading-tight">Vitals are within normal range.</p>
                                    </div>
                                </div>

                                <button className="w-full py-5 bg-black text-white rounded-[1.5rem] font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-emerald-500 transition-all">
                                    Start Consultation
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </PageTransition>
    );
}