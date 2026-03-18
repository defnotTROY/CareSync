import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, UserCheck, Users, CalendarDays,
    CreditCard, FileText, Bell, LogOut, Settings,
    Search, Filter, MoreVertical, UserPlus, FileEdit, Trash2
} from 'lucide-react';
import PageTransition from "../../components/layout/PageTransition.jsx";

export default function ClientRecords() {
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

    const patients = [
        { id: 'PAT-2026-001', name: 'Marcus Aurelius', email: 'marcus@rome.gov', type: 'Student', lastVisit: 'Mar 18, 2026', status: 'Active' },
        { id: 'PAT-2026-002', name: 'Elena Lamberti', email: 'elena.l@mail.com', type: 'Professional', lastVisit: 'Mar 15, 2026', status: 'Active' },
        { id: 'PAT-2026-003', name: 'Julius Caesar', email: 'julius@senate.it', type: 'Professional', lastVisit: 'Feb 12, 2026', status: 'Inactive' },
        { id: 'PAT-2026-004', name: 'Livilla Drusilla', email: 'liv@empire.com', type: 'Student', lastVisit: 'Jan 05, 2026', status: 'Active' },
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
                        <Link to="/staff/settings" className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${location.pathname === '/staff/settings' ? 'bg-white text-black font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
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
                            <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-red-400 transition-all shadow-sm">
                                <LogOut size={18} />
                            </button>
                        </div>
                    </div>
                </aside>

                <main className="flex-1 p-12 space-y-10 overflow-y-auto">

                    {/* HEADER */}
                    <div className="flex justify-between items-center">
                        <div className="space-y-1">
                            <h1 className="text-5xl font-black text-slate-950 uppercase tracking-tighter">Client Records</h1>
                            <p className="text-slate-500 font-medium uppercase text-[10px] tracking-[0.2em]">Patient health database archive</p>
                        </div>
                        <button className="px-8 py-4 bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg">
                            <UserPlus size={16} /> Add New Patient
                        </button>
                    </div>

                    {/* SEARCH & FILTER BAR */}
                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input type="text" placeholder="Search by name, ID, or email address..." className="w-full pl-16 pr-8 py-5 bg-white border-2 border-slate-50 rounded-3xl outline-none focus:border-black font-bold text-sm shadow-sm transition-all" />
                        </div>
                        <button className="px-8 bg-white border-2 border-slate-50 rounded-3xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:border-black transition-all shadow-sm">
                            <Filter size={18} /> Filter By Type
                        </button>
                    </div>

                    {/* RECORDS TABLE */}
                    <div className="bg-white border-2 border-slate-50 rounded-[2.5rem] shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-50">
                                    <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Patient ID</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Full Name</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Patient Type</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Last Visit</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Status</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {patients.map((patient) => (
                                    <tr key={patient.id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="px-10 py-7">
                                            <span className="text-[10px] font-black px-2 py-1 bg-slate-100 rounded text-slate-500 uppercase tracking-widest">{patient.id}</span>
                                        </td>
                                        <td className="px-10 py-7">
                                            <p className="font-black text-slate-950 uppercase tracking-tight">{patient.name}</p>
                                            <p className="text-[10px] font-medium text-slate-400 lowercase">{patient.email}</p>
                                        </td>
                                        <td className="px-10 py-7">
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${patient.type === 'Student' ? 'text-blue-500' : 'text-purple-500'}`}>
                                                {patient.type}
                                            </span>
                                        </td>
                                        <td className="px-10 py-7 font-bold text-sm text-slate-600 italic">
                                            {patient.lastVisit}
                                        </td>
                                        <td className="px-10 py-7">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${patient.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">{patient.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-7 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button className="p-3 hover:bg-white hover:shadow-md rounded-xl text-slate-400 hover:text-black transition-all border border-transparent hover:border-slate-100">
                                                    <FileEdit size={16} />
                                                </button>
                                                <button className="p-3 hover:bg-white hover:shadow-md rounded-xl text-slate-400 hover:text-red-500 transition-all border border-transparent hover:border-slate-100">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="p-8 border-t border-slate-50 flex justify-between items-center bg-slate-50/30">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Showing 4 of 1,240 records</p>
                            <div className="flex gap-2">
                                <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-widest hover:border-black transition-all shadow-sm">Prev</button>
                                <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-widest hover:border-black transition-all shadow-sm">Next</button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </PageTransition>
    );
}