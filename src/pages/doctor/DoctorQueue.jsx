import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Users, ClipboardList, FileText,
    Settings, LogOut, Bell, Search, Filter,
    UserCheck, Clock, ArrowRight, Activity, UserPlus
} from 'lucide-react';
import PageTransition from "../../components/layout/PageTransition.jsx";

export default function DoctorQueue() {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => navigate('/login');

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/doctor/dashboard' },
        { name: 'Client Queue', icon: Users, path: '/doctor/queue' },
        { name: 'Consultation', icon: ClipboardList, path: '/doctor/consultation' },
        { name: 'Client Record', icon: FileText, path: '/doctor/records' },
    ];

    const queue = [
        { id: 'Q-001', name: 'John Doe', type: 'Follow-up', status: 'Ready', time: '10 mins ago', priority: 'High' },
        { id: 'Q-002', name: 'Jane Smith', type: 'General', status: 'Vitals Taken', time: '25 mins ago', priority: 'Normal' },
        { id: 'Q-003', name: 'Robert Brown', type: 'Consultation', status: 'Waiting', time: '40 mins ago', priority: 'Normal' },
        { id: 'Q-004', name: 'Emily Davis', type: 'Laboratory', status: 'Ready', time: '5 mins ago', priority: 'Normal' },
    ];

    return (
        <PageTransition>
            <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">

                {/* SIDEBAR (Standardized) */}
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

                <main className="flex-1 p-12 space-y-10 overflow-y-auto">
                    {/* HEADER */}
                    <div className="flex justify-between items-center">
                        <div className="space-y-1">
                            <h1 className="text-5xl font-black text-slate-950 uppercase tracking-tighter">Live Queue</h1>
                            <p className="text-slate-500 font-medium uppercase text-[10px] tracking-[0.2em]">Patient hallway management</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="bg-white border-2 border-slate-50 px-6 py-4 rounded-2xl flex items-center gap-4 shadow-sm">
                                <Activity className="text-emerald-500" size={20} />
                                <div>
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Efficiency</p>
                                    <p className="text-sm font-black">94% OPTIMAL</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* QUEUE GRID */}
                    <div className="grid grid-cols-12 gap-8">
                        <div className="col-span-12 space-y-4">
                            {queue.map((patient, i) => (
                                <div key={patient.id} className="bg-white border-2 border-slate-50 rounded-[2rem] p-6 flex items-center justify-between hover:border-black transition-all group shadow-sm">
                                    <div className="flex items-center gap-8">
                                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex flex-col items-center justify-center border border-slate-100">
                                            <span className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Rank</span>
                                            <span className="text-xl font-black">{i + 1}</span>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3">
                                                <h4 className="text-xl font-black uppercase tracking-tight">{patient.name}</h4>
                                                <span className={`text-[8px] font-black px-2 py-0.5 rounded border ${patient.priority === 'High' ? 'border-red-200 text-red-500 bg-red-50' : 'border-slate-200 text-slate-400 bg-slate-50'}`}>
                                                    {patient.priority}
                                                </span>
                                            </div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {patient.id} • {patient.type}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-12">
                                        <div className="text-right">
                                            <div className="flex items-center gap-2 justify-end text-emerald-500 mb-1">
                                                <UserCheck size={14} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">{patient.status}</span>
                                            </div>
                                            <div className="flex items-center gap-2 justify-end text-slate-300">
                                                <Clock size={12} />
                                                <span className="text-[10px] font-bold uppercase tracking-tighter">Waiting: {patient.time}</span>
                                            </div>
                                        </div>
                                        <button className="px-8 py-4 bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 shadow-lg group-hover:bg-emerald-500 transition-all">
                                            Call Patient <ArrowRight size={16} />
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