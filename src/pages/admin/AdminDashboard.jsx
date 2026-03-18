import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Users, BadgeDollarSign, Warehouse,
    Wrench, Settings, LogOut, Bell, Search,
    MoreVertical, ChevronLeft, ChevronRight, Activity, TrendingUp
} from 'lucide-react';
import PageTransition from "../../components/layout/PageTransition.jsx";

export default function AdminDashboard() {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => navigate('/login');

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
        { name: 'Staff Management', icon: Users, path: '/admin/staff' },
        { name: 'Revenue', icon: BadgeDollarSign, path: '/admin/revenue' },
        { name: 'Inventory', icon: Warehouse, path: '/admin/inventory' },
        { name: 'Maintenance', icon: Wrench, path: '/admin/maintenance' },
    ];

    const staffOnDuty = [
        { name: 'Dr. Robert Miller', role: 'Chief Surgeon', dept: 'Surgical Wing', shift: '08:00 - 20:00', status: 'ACTIVE', initial: 'RM' },
        { name: 'Nurse Alice Wong', role: 'Head Nurse', dept: 'ICU', shift: '19:00 - 07:00', status: 'ON-CALL', initial: 'AW' },
        { name: 'James Sterling', role: 'ER Technician', dept: 'Emergency', shift: '08:00 - 16:00', status: 'BREAK', initial: 'JS' },
        { name: 'Dr. Elena Chen', role: 'Pediatrician', dept: 'Pediatrics', shift: '09:00 - 17:00', status: 'ACTIVE', initial: 'EC' },
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

                    <div className="pt-6 border-t border-white/10 space-y-2 px-2">
                        <Link to="/admin/settings" className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${location.pathname === '/admin/settings' ? 'bg-white text-black font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                            <Settings size={20} />
                            <span className="text-sm">Settings</span>
                        </Link>
                        <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-slate-800 rounded-full flex items-center justify-center text-[10px] text-white font-bold">JD</div>
                                <div className="flex flex-col">
                                    <span className="text-white text-[11px] font-bold uppercase leading-none">Juan D.</span>
                                    <span className="text-slate-500 text-[8px] font-bold uppercase tracking-widest mt-1">Super Admin</span>
                                </div>
                            </div>
                            <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-red-400 transition-all"><LogOut size={18} /></button>
                        </div>
                    </div>
                </aside>

                {/* MAIN CONTENT */}
                <main className="flex-1 p-12 space-y-10 overflow-y-auto">
                    <header className="flex justify-between items-center">
                        <div className="space-y-1">
                            <h1 className="text-5xl font-black text-slate-950 uppercase tracking-tighter leading-none">Dashboard Overview</h1>
                            <p className="text-slate-500 font-medium uppercase text-[10px] tracking-[0.2em]">Facility operations and metrics • June 12, 2024</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input type="text" placeholder="SEARCH RECORDS..." className="pl-12 pr-6 py-3 bg-white border-2 border-slate-50 rounded-xl focus:border-black outline-none w-72 text-xs font-bold shadow-sm uppercase" />
                            </div>
                            <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 shadow-sm"><Bell size={20} /></button>
                        </div>
                    </header>

                    <div className="grid grid-cols-2 gap-8">
                        <div className="bg-white border-2 border-slate-50 rounded-[2rem] p-10 flex justify-between items-center shadow-sm relative overflow-hidden">
                            <div className="space-y-4">
                                <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                                    <Users size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Active Staff</p>
                                    <h2 className="text-6xl font-black text-slate-950">142</h2>
                                </div>
                            </div>
                            <div className="absolute top-10 right-10 px-3 py-1 border-2 border-slate-100 rounded-lg text-[10px] font-black text-slate-950">+2.4%</div>
                        </div>

                        <div className="bg-white border-2 border-slate-50 rounded-[2rem] p-10 flex justify-between items-center shadow-sm relative overflow-hidden">
                            <div className="space-y-4">
                                <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                                    <BadgeDollarSign size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Daily Revenue</p>
                                    <h2 className="text-6xl font-black text-slate-950">$12,450</h2>
                                </div>
                            </div>
                            <div className="absolute top-10 right-10 px-3 py-1 border-2 border-slate-100 rounded-lg text-[10px] font-black text-slate-950">+8.1%</div>
                        </div>
                    </div>

                    <section className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="font-black uppercase text-lg tracking-tighter">Staff On-Duty</h3>
                            <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-widest hover:border-black transition-all">All Departments</button>
                        </div>

                        <div className="bg-white border-2 border-slate-50 rounded-[2.5rem] shadow-sm overflow-hidden text-sm font-bold">
                            <table className="w-full text-left">
                                <thead className="bg-black text-white">
                                    <tr>
                                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em]">Staff Member</th>
                                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em]">Department</th>
                                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em]">Shift</th>
                                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em]">Status</th>
                                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 uppercase text-xs">
                                    {staffOnDuty.map((staff, i) => (
                                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-8 py-6 flex items-center gap-4">
                                                <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center font-black">{staff.initial}</div>
                                                <div>
                                                    <p className="font-black">{staff.name}</p>
                                                    <p className="text-[9px] text-slate-400">{staff.role}</p>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-slate-500">{staff.dept}</td>
                                            <td className="px-8 py-6">{staff.shift}</td>
                                            <td className="px-8 py-6">
                                                <span className="px-2 py-1 bg-slate-100 rounded text-[9px] font-black">{staff.status}</span>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <button className="text-slate-400 hover:text-black"><MoreVertical size={16} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </main>
            </div>
        </PageTransition>
    );
}