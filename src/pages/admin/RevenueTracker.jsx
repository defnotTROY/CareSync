import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Users, BadgeDollarSign, Warehouse,
    Wrench, Settings, LogOut, Bell, Search,
    ArrowUpRight, ArrowDownRight, Download, Calendar, Filter, TrendingUp, CreditCard
} from 'lucide-react';
import PageTransition from "../../components/layout/PageTransition.jsx";

export default function RevenueTracker() {
    const location = useLocation();
    const navigate = useNavigate();

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
        { name: 'Staff Management', icon: Users, path: '/admin/staff' },
        { name: 'Revenue', icon: BadgeDollarSign, path: '/admin/revenue' },
        { name: 'Inventory', icon: Warehouse, path: '/admin/inventory' },
        { name: 'Maintenance', icon: Wrench, path: '/admin/maintenance' },
    ];

    const transactions = [
        { id: 'TXN-9901', patient: 'Elena Gilbert', service: 'Cardiology Consult', amount: 1500.00, method: 'CASH', date: 'JUN 12, 09:45 AM' },
        { id: 'TXN-9902', patient: 'Stefan Salvatore', service: 'Laboratory Tests', amount: 2850.50, method: 'GCASH', date: 'JUN 12, 10:20 AM' },
        { id: 'TXN-9903', patient: 'Bonnie Bennett', service: 'General Checkup', amount: 800.00, method: 'CARD', date: 'JUN 12, 11:15 AM' },
        { id: 'TXN-9904', patient: 'Damon Salvatore', service: 'Pharmacy Purchase', amount: 420.75, method: 'CASH', date: 'JUN 12, 01:30 PM' },
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

                    {/* SETTINGS & PROFILE SECTION (Restored) */}
                    <div className="pt-6 border-t border-white/10 space-y-2 px-2">
                        <Link
                            to="/admin/settings"
                            className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${location.pathname === '/admin/settings' ? 'bg-white text-black font-bold shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                        >
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
                            <button onClick={() => navigate('/login')} className="p-2 text-slate-500 hover:text-red-400 transition-all">
                                <LogOut size={18} />
                            </button>
                        </div>
                    </div>
                </aside>

                {/* MAIN CONTENT */}
                <main className="flex-1 p-12 space-y-10 overflow-y-auto">
                    <header className="flex justify-between items-end">
                        <div className="space-y-1">
                            <h1 className="text-5xl font-black text-slate-950 uppercase tracking-tighter">Financials</h1>
                            <p className="text-slate-500 font-medium uppercase text-[10px] tracking-[0.2em]">Revenue Streams & Transaction History</p>
                        </div>
                        <div className="flex gap-3">
                            <button className="px-6 py-3 bg-white border border-slate-200 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:border-black transition-all">
                                <Calendar size={16} /> Last 30 Days
                            </button>
                            <button className="px-6 py-3 bg-black text-white rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:bg-emerald-600 transition-all">
                                <Download size={16} /> Export CSV
                            </button>
                        </div>
                    </header>

                    {/* TOP STATS */}
                    <div className="grid grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-[2rem] border-2 border-slate-50 shadow-sm space-y-4">
                            <div className="flex justify-between items-start">
                                <div className="p-3 bg-slate-950 text-white rounded-xl"><TrendingUp size={20} /></div>
                                <span className="text-[10px] font-black text-emerald-500 flex items-center"><ArrowUpRight size={14} /> +12.5%</span>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Gross Revenue</p>
                                <h3 className="text-4xl font-black text-slate-950">₱245,800</h3>
                            </div>
                        </div>
                        <div className="bg-white p-8 rounded-[2rem] border-2 border-slate-50 shadow-sm space-y-4">
                            <div className="flex justify-between items-start">
                                <div className="p-3 bg-slate-100 text-slate-950 rounded-xl"><CreditCard size={20} /></div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target: 85%</span>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Net Earnings</p>
                                <h3 className="text-4xl font-black text-slate-950">₱184,250</h3>
                            </div>
                        </div>
                        <div className="bg-white p-8 rounded-[2rem] border-2 border-slate-50 shadow-sm space-y-4">
                            <div className="flex justify-between items-start">
                                <div className="p-3 bg-slate-100 text-slate-950 rounded-xl"><Users size={20} /></div>
                                <span className="text-[10px] font-black text-rose-500 flex items-center"><ArrowDownRight size={14} /> -2.1%</span>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Avg. Ticket Size</p>
                                <h3 className="text-4xl font-black text-slate-950">₱1,250</h3>
                            </div>
                        </div>
                    </div>

                    {/* RECENT TRANSACTIONS */}
                    <section className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="font-black uppercase text-lg tracking-tighter">Live Transactions</h3>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input type="text" placeholder="FIND TXN ID..." className="pl-10 pr-6 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase outline-none focus:border-black w-48" />
                            </div>
                        </div>

                        <div className="bg-white border-2 border-slate-50 rounded-[2.5rem] shadow-sm overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-black text-white">
                                    <tr>
                                        <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">ID</th>
                                        <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Patient / Customer</th>
                                        <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Service</th>
                                        <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Amount</th>
                                        <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Date/Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {transactions.map((txn) => (
                                        <tr key={txn.id} className="hover:bg-slate-50/50 transition-all font-bold text-xs">
                                            <td className="px-10 py-6 text-slate-400">{txn.id}</td>
                                            <td className="px-10 py-6 text-slate-950 uppercase tracking-tight">{txn.patient}</td>
                                            <td className="px-10 py-6">
                                                <span className="px-3 py-1 bg-slate-100 rounded text-[9px] font-black uppercase tracking-widest">{txn.service}</span>
                                            </td>
                                            <td className="px-10 py-6 font-black text-slate-950">₱{txn.amount.toLocaleString()}</td>
                                            <td className="px-10 py-6 text-slate-400 uppercase text-[10px] tracking-widest">{txn.date}</td>
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