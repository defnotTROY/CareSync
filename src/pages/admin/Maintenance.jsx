import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Users, BadgeDollarSign, Warehouse,
    Wrench, Settings, LogOut, Bell, Search,
    Activity, Calendar, AlertTriangle, MoreVertical
} from 'lucide-react';
import PageTransition from "../../components/layout/PageTransition.jsx";

export default function Maintenance() {
    const location = useLocation();
    const navigate = useNavigate();

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
        { name: 'Staff Management', icon: Users, path: '/admin/staff' },
        { name: 'Revenue', icon: BadgeDollarSign, path: '/admin/revenue' },
        { name: 'Inventory', icon: Warehouse, path: '/admin/inventory' },
        { name: 'Maintenance', icon: Wrench, path: '/admin/maintenance' },
    ];

    const equipment = [
        { id: 'EQ-401', name: 'X-Ray Machine', zone: 'Radiology', lastService: 'JAN 2026', status: 'OPERATIONAL', health: 92 },
        { id: 'EQ-402', name: 'Dental Chair Alpha', zone: 'Dental Wing', lastService: 'OCT 2025', status: 'NEEDS SERVICE', health: 45 },
        { id: 'EQ-403', name: 'Autoclave Sterilizer', zone: 'Surgery', lastService: 'FEB 2026', status: 'OPERATIONAL', health: 88 },
        { id: 'EQ-404', name: 'Main HVAC Unit', zone: 'Facility-wide', lastService: 'AUG 2025', status: 'REPAIR IN PROGRESS', health: 12 },
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
                                <span className="text-slate-500 text-[10px] tracking-widest mt-1">Admin Portal</span>
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

                    {/* SETTINGS & PROFILE SECTION */}
                    <div className="pt-6 border-t border-white/10 space-y-2 px-2">
                        <Link to="/admin/settings" className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${location.pathname === '/admin/settings' ? 'bg-white text-black font-bold shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                            <Settings size={20} className={location.pathname === '/admin/settings' ? 'text-black' : 'text-slate-400'} />
                            <span className="text-sm">Settings</span>
                        </Link>
                        <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-slate-800 rounded-full flex items-center justify-center text-[10px] text-white font-bold">JD</div>
                                <div className="flex flex-col text-white">
                                    <span className="text-[11px] font-bold uppercase leading-none">Juan D.</span>
                                    <span className="text-slate-500 text-[8px] font-bold uppercase tracking-widest mt-1">Super Admin</span>
                                </div>
                            </div>
                            <button onClick={() => navigate('/login')} className="p-2 text-slate-500 hover:text-red-400 transition-all"><LogOut size={18} /></button>
                        </div>
                    </div>
                </aside>

                <main className="flex-1 p-12 space-y-10 overflow-y-auto">
                    <header className="flex justify-between items-center">
                        <div className="space-y-1">
                            <h1 className="text-5xl font-black text-slate-950 uppercase tracking-tighter leading-none">Maintenance</h1>
                            <p className="text-slate-500 font-medium uppercase text-[10px] tracking-[0.2em]">Asset Health & Service Schedules</p>
                        </div>
                        <button className="px-8 py-4 bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:bg-emerald-500 transition-all shadow-xl">
                            <Wrench size={18} /> Schedule Service
                        </button>
                    </header>

                    <div className="grid grid-cols-12 gap-8">
                        <div className="col-span-8 bg-white border-2 border-slate-50 rounded-[2.5rem] shadow-sm p-10 space-y-8">
                            <div className="flex justify-between items-center">
                                <h3 className="font-black uppercase text-lg tracking-tighter">Equipment Inventory</h3>
                                <div className="flex gap-2">
                                    <button className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-black transition-all"><Search size={18} /></button>
                                    <button className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-black transition-all"><Activity size={18} /></button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {equipment.map((item) => (
                                    <div key={item.id} className="group border-2 border-slate-50 hover:border-black rounded-[2rem] p-6 transition-all flex items-center justify-between">
                                        <div className="flex items-center gap-6">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black ${item.health > 80 ? 'bg-emerald-50 text-emerald-600' : item.health > 40 ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'}`}>
                                                {item.health}%
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-950 uppercase tracking-tight">{item.name}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.zone} • {item.id}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-10">
                                            <div className="text-right">
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                                                <p className="text-[10px] font-black uppercase tracking-tight">{item.status}</p>
                                            </div>
                                            <button className="p-3 bg-slate-50 rounded-xl text-slate-400 group-hover:text-black transition-all"><MoreVertical size={18} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="col-span-4 space-y-6">
                            <div className="bg-red-50 border-2 border-red-100 p-8 rounded-[2.5rem] space-y-4">
                                <div className="flex items-center gap-3 text-red-600">
                                    <AlertTriangle size={24} />
                                    <h4 className="font-black uppercase text-xs tracking-widest">Critical Alert</h4>
                                </div>
                                <p className="text-xs font-bold text-red-900 leading-relaxed uppercase tracking-tight">HVAC System Failure in Pharmacy Storage. Immediate repair required.</p>
                            </div>

                            <div className="bg-black text-white p-8 rounded-[2.5rem] shadow-xl space-y-6">
                                <h4 className="font-black uppercase text-xs tracking-widest text-emerald-500 italic">Up Next</h4>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 shadow-[0_0_10px_#10b981]"></div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-white/40">MAR 20, 2026</p>
                                            <p className="text-xs font-bold uppercase tracking-tight">Fire Extinguisher Recertification</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </PageTransition>
    );
}