import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Users, ClipboardList, FileText,
    Settings, LogOut, Bell, Search, Filter,
    ExternalLink, ChevronRight, Activity, Calendar
} from 'lucide-react';
import PageTransition from "../../components/layout/PageTransition.jsx";

export default function DoctorRecords() {
    const location = useLocation();
    const navigate = useNavigate();

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/doctor/dashboard' },
        { name: 'Client Queue', icon: Users, path: '/doctor/queue' },
        { name: 'Consultation', icon: ClipboardList, path: '/doctor/consultation' },
        { name: 'Client Record', icon: FileText, path: '/doctor/records' },
    ];

    const records = [
        { id: 'PAT-9021', name: 'Marcus Aurelius', lastVisit: 'Mar 18, 2026', diagnosis: 'Hypertension', status: 'Stable' },
        { id: 'PAT-9022', name: 'Elena Lamberti', lastVisit: 'Mar 15, 2026', diagnosis: 'Acute Bronchitis', status: 'Recovering' },
        { id: 'PAT-9023', name: 'Julius Caesar', lastVisit: 'Feb 12, 2026', diagnosis: 'Post-Op Recovery', status: 'Follow-up Req' },
        { id: 'PAT-9024', name: 'Livilla Drusilla', lastVisit: 'Jan 05, 2026', diagnosis: 'Annual Physical', status: 'Clear' },
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

                    {/* SETTINGS & LOGOUT SECTION */}
                    <div className="pt-6 border-t border-white/10 space-y-2 px-2">
                        <Link
                            to="/doctor/settings"
                            className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${location.pathname === '/doctor/settings' ? 'bg-white text-black font-bold shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <Settings size={20} className={location.pathname === '/doctor/settings' ? 'text-black' : 'text-slate-400'} />
                            <span className="text-sm">Settings</span>
                        </Link>

                        <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-slate-800 rounded-full flex items-center justify-center text-[10px] text-white font-bold">JD</div>
                                <div className="flex flex-col text-white">
                                    <span className="text-[11px] font-bold uppercase leading-none">Juan D.</span>
                                    <span className="text-slate-500 text-[8px] font-bold uppercase tracking-widest mt-1">Doctor Admin</span>
                                </div>
                            </div>
                            <button onClick={() => navigate('/login')} className="p-2 text-slate-500 hover:text-red-400 transition-all">
                                <LogOut size={18} />
                            </button>
                        </div>
                    </div>
                </aside>

                <main className="flex-1 p-12 space-y-10 overflow-y-auto">
                    {/* HEADER */}
                    <div className="flex justify-between items-center">
                        <div className="space-y-1">
                            <h1 className="text-5xl font-black text-slate-950 uppercase tracking-tighter">Medical Records</h1>
                            <p className="text-slate-500 font-medium uppercase text-[10px] tracking-[0.2em]">Patient health history & archives</p>
                        </div>
                        <div className="flex gap-3">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input type="text" placeholder="Search by name or ID..." className="pl-12 pr-6 py-4 bg-white border-2 border-slate-50 rounded-2xl focus:border-black outline-none w-64 text-sm font-bold shadow-sm transition-all" />
                            </div>
                            <button className="px-6 py-4 bg-white border-2 border-slate-50 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:border-black transition-all">
                                <Filter size={16} /> Filter
                            </button>
                        </div>
                    </div>

                    {/* RECORDS TABLE */}
                    <div className="bg-white border-2 border-slate-50 rounded-[2.5rem] shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-50">
                                    <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Patient ID</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Full Name</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Last Diagnosis</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Status</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">View History</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {records.map((record) => (
                                    <tr key={record.id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="px-10 py-7 font-black text-sm text-slate-400 uppercase tracking-tighter">{record.id}</td>
                                        <td className="px-10 py-7">
                                            <p className="font-black text-slate-950 uppercase tracking-tight">{record.name}</p>
                                            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                                                <Calendar size={10} /> {record.lastVisit}
                                            </div>
                                        </td>
                                        <td className="px-10 py-7 font-bold text-sm text-slate-900 uppercase italic">
                                            {record.diagnosis}
                                        </td>
                                        <td className="px-10 py-7">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${record.status === 'Clear' ? 'bg-emerald-50 text-emerald-600' :
                                                record.status === 'Stable' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'
                                                }`}>
                                                {record.status}
                                            </span>
                                        </td>
                                        <td className="px-10 py-7 text-right">
                                            <button className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-black hover:bg-white border border-transparent hover:border-slate-100 transition-all shadow-sm">
                                                <ExternalLink size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>
        </PageTransition>
    );
}