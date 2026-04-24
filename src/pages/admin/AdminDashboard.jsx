import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Users, BadgeDollarSign, Warehouse,
    Wrench, Settings, LogOut, Bell, Search,
    MoreVertical, ChevronLeft, ChevronRight, Activity, TrendingUp,
    Loader2, RefreshCw
} from 'lucide-react';
import { supabase } from '../../lib/supabase.js';
import PageTransition from "../../components/layout/PageTransition.jsx";

export default function AdminDashboard() {
    const location = useLocation();
    const navigate = useNavigate();

    // --- FUNCTIONAL STATES ---
    const [totalStaff, setTotalStaff] = useState(0);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [revenueChange, setRevenueChange] = useState(0);
    const [activeStaffList, setActiveStaffList] = useState([]); // Real staff data
    const [loading, setLoading] = useState(true);

    const handleLogout = () => navigate('/login');

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
        { name: 'Staff Management', icon: Users, path: '/admin/staff' },
        { name: 'Revenue', icon: BadgeDollarSign, path: '/admin/revenue' },
        { name: 'Inventory', icon: Warehouse, path: '/admin/inventory' },
        { name: 'Maintenance', icon: Wrench, path: '/admin/maintenance' },
    ];

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    async function fetchDashboardStats() {
        try {
            setLoading(true);

            // 1. Fetch Total Staff Count & Full List
            const { data: staffData, count, error: staffError } = await supabase
                .from('profiles')
                .select('*', { count: 'exact' })
                .in('role', ['staff', 'doctor', 'admin', 'STAFF', 'DOCTOR', 'ADMIN']);

            if (staffError) throw staffError;

            setTotalStaff(count || 0);
            setActiveStaffList(staffData || []);

            // 2. Fetch Live Revenue
            const { data: revenueData, error: revError } = await supabase
                .from('appointments')
                .select('amount')
                .eq('status', 'COMPLETED');

            if (revError) throw revError;

            if (revenueData) {
                const currentTotal = revenueData.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
                const previousTotal = parseFloat(localStorage.getItem('last_session_revenue')) || 0;

                if (previousTotal > 0) {
                    const change = ((currentTotal - previousTotal) / previousTotal) * 100;
                    setRevenueChange(change.toFixed(1));
                }
                setTotalRevenue(currentTotal);
                localStorage.setItem('last_session_revenue', currentTotal.toString());
            }

        } catch (err) {
            console.error("Dashboard Fetch Error:", err.message);
        } finally {
            setLoading(false);
        }
    }

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
                                <span className="text-slate-500 text-[10px] tracking-widest mt-1 uppercase">Admin Portal</span>
                            </div>
                        </div>
                        <nav className="space-y-1">
                            {navItems.map((item) => (
                                <Link key={item.name} to={item.path} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${location.pathname === item.path ? 'bg-white text-black font-bold shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                                    <item.icon size={20} />
                                    <span className="text-sm">{item.name}</span>
                                </Link>
                            ))}
                        </nav>
                    </div>
                    <div className="pt-6 border-t border-white/10 space-y-2 px-2">
                        <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-slate-800 rounded-full flex items-center justify-center text-[10px] text-white font-bold uppercase">AD</div>
                                <div className="flex flex-col">
                                    <span className="text-white text-[11px] font-bold uppercase leading-none">Super Admin</span>
                                </div>
                            </div>
                            <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-red-400 transition-all"><LogOut size={18} /></button>
                        </div>
                    </div>
                </aside>

                <main className="flex-1 p-12 space-y-10 overflow-y-auto">
                    <header className="flex justify-between items-center">
                        <div className="space-y-1">
                            <h1 className="text-5xl font-black text-slate-950 uppercase tracking-tighter leading-none italic">Dashboard Overview</h1>
                            <p className="text-slate-500 font-medium uppercase text-[10px] tracking-[0.2em]">Real-time Team Management</p>
                        </div>
                        <button onClick={fetchDashboardStats} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-black shadow-sm transition-all">
                            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </header>

                    <div className="grid grid-cols-2 gap-8">
                        <div className="bg-white border-2 border-slate-50 rounded-[2.5rem] p-10 flex justify-between items-center shadow-sm relative overflow-hidden group hover:border-black transition-all">
                            <div className="space-y-4">
                                <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white group-hover:bg-emerald-500 transition-colors shadow-lg">
                                    <Users size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Internal Personnel</p>
                                    <h2 className="text-6xl font-black text-slate-950">{loading ? "..." : totalStaff}</h2>
                                </div>
                            </div>
                            <Activity className="text-slate-50 absolute -right-8 -bottom-8" size={180} />
                        </div>

                        <div className="bg-white border-2 border-slate-50 rounded-[2.5rem] p-10 flex justify-between items-center shadow-sm relative overflow-hidden group hover:border-black transition-all">
                            <div className="space-y-4">
                                <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white group-hover:bg-emerald-500 transition-colors shadow-lg">
                                    <BadgeDollarSign size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Gross Revenue</p>
                                    <h2 className="text-6xl font-black text-slate-950 italic">₱{totalRevenue.toLocaleString()}</h2>
                                </div>
                            </div>
                            <div className={`absolute top-10 right-10 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter shadow-sm border ${revenueChange >= 0 ? 'bg-emerald-50 text-emerald-500 border-emerald-100' : 'bg-red-50 text-red-500 border-red-100'}`}>
                                {revenueChange >= 0 ? '+' : ''}{revenueChange}%
                            </div>
                        </div>
                    </div>

                    {/* DYNAMIC ACTIVE STAFF SECTION */}
                    <section className="space-y-6">
                        <h3 className="font-black uppercase text-lg tracking-tighter italic flex items-center gap-3">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            Active Staff Personnel
                        </h3>
                        <div className="bg-white border-2 border-slate-50 rounded-[2.5rem] shadow-sm overflow-hidden text-sm font-bold">
                            <table className="w-full text-left">
                                <thead className="bg-black text-white text-[10px] font-black uppercase tracking-widest">
                                    <tr>
                                        <th className="px-8 py-5">Staff Member</th>
                                        <th className="px-8 py-5">Role / Position</th>
                                        <th className="px-8 py-5">ID Reference</th>
                                        <th className="px-8 py-5">Status</th>
                                        <th className="px-8 py-5 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 text-xs font-bold uppercase">
                                    {loading ? (
                                        <tr><td colSpan="5" className="p-10 text-center text-slate-300">Loading staff directory...</td></tr>
                                    ) : activeStaffList.length === 0 ? (
                                        <tr><td colSpan="5" className="p-10 text-center text-slate-300">No staff personnel found</td></tr>
                                    ) : (
                                        activeStaffList.map((staff) => (
                                            <tr key={staff.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-8 py-6 flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black">
                                                        {staff.full_name?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-900">{staff.full_name}</p>
                                                        <p className="text-[9px] text-slate-400 tracking-tight">Access Level: {staff.role}</p>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-slate-500">{staff.role}</td>
                                                <td className="px-8 py-6 text-slate-400 italic">#{staff.id.slice(0, 8)}</td>
                                                <td className="px-8 py-6">
                                                    <span className="px-2 py-1 rounded text-[9px] font-black bg-emerald-100 text-emerald-600">
                                                        ACTIVE
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <button className="text-slate-300 hover:text-black transition-all"><MoreVertical size={16} /></button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </main>
            </div>
        </PageTransition>
    );
}