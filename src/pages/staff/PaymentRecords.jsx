import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, UserCheck, Users, CalendarDays,
    CreditCard, FileText, Bell, LogOut, Settings,
    Search, Download, CheckCircle2, Clock, AlertCircle,
    ExternalLink, UserPlus // Added these
} from 'lucide-react';
import PageTransition from "../../components/layout/PageTransition.jsx";

export default function PaymentRecords() {
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

    const transactions = [
        { id: 'TXN-9021', patient: 'Marcus Aurelius', method: 'GCash', amount: '₱500.00', status: 'Success', date: 'Mar 18, 10:30 AM', ref: '901 223 445' },
        { id: 'TXN-9022', patient: 'Elena Lamberti', method: 'Maya', amount: '₱1,200.00', status: 'Success', date: 'Mar 18, 09:15 AM', ref: 'MX-882-110' },
        { id: 'TXN-9023', patient: 'Julius Caesar', method: 'Cash', amount: '₱350.00', status: 'Pending', date: 'Mar 18, 08:45 AM', ref: '---' },
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
                        <Link to="/staff/settings" className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${location.pathname === '/staff/settings' ? 'bg-white text-black font-bold shadow-lg shadow-white/5' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
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
                            <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all" title="Logout">
                                <LogOut size={18} />
                            </button>
                        </div>
                    </div>
                </aside>

                <main className="flex-1 p-12 space-y-10 overflow-y-auto">

                    {/* HEADER */}
                    <div className="flex justify-between items-center">
                        <div className="space-y-1">
                            <h1 className="text-5xl font-black text-slate-950 uppercase tracking-tighter">Payments</h1>
                            <p className="text-slate-500 font-medium uppercase text-[10px] tracking-[0.2em]">Transaction history & settlement</p>
                        </div>
                        <div className="flex gap-3">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input type="text" placeholder="Ref No. or Patient..." className="pl-12 pr-6 py-4 bg-white border-2 border-slate-50 rounded-2xl focus:border-black outline-none w-64 text-sm font-bold shadow-sm transition-all" />
                            </div>
                            <button className="px-6 py-4 bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg">
                                <Download size={16} /> Export CSV
                            </button>
                        </div>
                    </div>

                    {/* RECENT TRANSACTIONS TABLE */}
                    <div className="bg-white border-2 border-slate-50 rounded-[2.5rem] shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-50">
                                    <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Transaction / Ref</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Patient</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Method</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Amount</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Status</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {transactions.map((txn) => (
                                    <tr key={txn.id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-6">
                                            <p className="font-black text-sm text-slate-950 uppercase">{txn.id}</p>
                                            <p className="text-[10px] font-bold text-slate-400 tracking-tighter uppercase">{txn.ref}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="font-bold text-sm text-slate-950">{txn.patient}</p>
                                            <p className="text-[10px] font-medium text-slate-400">{txn.date}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${txn.method === 'GCash' ? 'bg-blue-50 text-blue-600' :
                                                txn.method === 'Maya' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                {txn.method}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 font-black text-slate-950">{txn.amount}</td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                {txn.status === 'Success' ? (
                                                    <CheckCircle2 size={16} className="text-emerald-500" />
                                                ) : (
                                                    <Clock size={16} className="text-orange-400" />
                                                )}
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${txn.status === 'Success' ? 'text-emerald-500' : 'text-orange-400'}`}>
                                                    {txn.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-black hover:bg-white border border-transparent hover:border-slate-100 transition-all shadow-sm">
                                                <ExternalLink size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* SUMMARY CARDS */}
                    <div className="grid grid-cols-3 gap-8">
                        <div className="bg-emerald-500 p-10 rounded-[2.5rem] text-white space-y-4 shadow-xl shadow-emerald-500/20">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Total Daily Revenue</p>
                            <h3 className="text-4xl font-black italic">₱12,450.00</h3>
                            <div className="pt-4 border-t border-white/10 text-[10px] font-bold uppercase tracking-widest flex justify-between">
                                <span>24 Successful TXNs</span>
                                <span className="text-emerald-200">+15% vs Yesterday</span>
                            </div>
                        </div>
                        <div className="bg-white border-2 border-slate-50 p-10 rounded-[2.5rem] space-y-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">GCash Volume</p>
                            <h3 className="text-4xl font-black text-slate-950 italic">₱8,200</h3>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div className="bg-blue-500 h-full w-[65%]" />
                            </div>
                        </div>
                        <div className="bg-white border-2 border-slate-50 p-10 rounded-[2.5rem] space-y-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Maya Volume</p>
                            <h3 className="text-4xl font-black text-slate-950 italic">₱4,250</h3>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div className="bg-emerald-400 h-full w-[35%]" />
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </PageTransition>
    );
}