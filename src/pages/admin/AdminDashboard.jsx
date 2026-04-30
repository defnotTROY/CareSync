import { useState, useEffect } from 'react';
import {
    Users, BadgeDollarSign, Activity, Loader2, RefreshCw, MoreVertical
} from 'lucide-react';
import { supabase } from '../../lib/supabase.js';
import PageTransition from "../../components/layout/PageTransition.jsx";
import AdminSidebar from "../../components/layout/AdminSidebar.jsx"; //
import AdminHeader from "../../components/layout/AdminHeader.jsx"; //

export default function AdminDashboard() {
    // --- UI STATES ---
    const [isSidebarOpen, setSidebarOpen] = useState(false); //
    const [loading, setLoading] = useState(true);

    // --- FUNCTIONAL STATES ---
    const [totalStaff, setTotalStaff] = useState(0);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [revenueChange, setRevenueChange] = useState(0);
    const [activeStaffList, setActiveStaffList] = useState([]);

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    async function fetchDashboardStats() {
        try {
            setLoading(true);
            const { data: staffData, count, error: staffError } = await supabase
                .from('profiles')
                .select('*', { count: 'exact' })
                .in('role', ['staff', 'doctor', 'admin', 'STAFF', 'DOCTOR', 'ADMIN']);

            if (staffError) throw staffError;
            setTotalStaff(count || 0);
            setActiveStaffList(staffData || []);

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
            <div className="flex min-h-screen bg-[#F8FAFC]">
                {/* 1. INTEGRATED RESPONSIVE SIDEBAR */}
                <AdminSidebar
                    isOpen={isSidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />

                <div className="flex-1 flex flex-col min-w-0 md:ml-20 lg:ml-72">
                    {/* 2. INTEGRATED SHARED HEADER */}
                    <AdminHeader
                        title="Dashboard Overview"
                        onMenuClick={() => setSidebarOpen(true)}
                    />

                    <main className="p-6 lg:p-12 space-y-10">
                        {/* Header Actions */}
                        <div className="flex justify-between items-end">
                            <div className="space-y-1">
                                <h1 className="text-4xl lg:text-6xl font-black text-slate-950 uppercase tracking-tighter italic">Overview</h1>
                                <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.3em]">System Statistics</p>
                            </div>
                            <button onClick={fetchDashboardStats} className="p-4 bg-white border-2 border-slate-100 rounded-2xl text-slate-400 hover:text-black hover:border-black transition-all shadow-sm">
                                <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                            </button>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white border-2 border-slate-100 rounded-[3rem] p-10 flex justify-between items-center relative overflow-hidden group hover:border-black transition-all shadow-sm">
                                <div className="space-y-4 relative z-10">
                                    <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white"><Users size={24} /></div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Personnel</p>
                                        <h2 className="text-7xl font-black text-slate-950 tracking-tighter">{loading ? "..." : totalStaff}</h2>
                                    </div>
                                </div>
                                <Activity className="text-slate-50 absolute -right-10 -bottom-10" size={220} />
                            </div>

                            <div className="bg-white border-2 border-slate-100 rounded-[3rem] p-10 flex justify-between items-center relative overflow-hidden group hover:border-black transition-all shadow-sm">
                                <div className="space-y-4 relative z-10">
                                    <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white"><BadgeDollarSign size={24} /></div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Gross Revenue</p>
                                        <h2 className="text-7xl font-black text-slate-950 italic tracking-tighter">₱{totalRevenue.toLocaleString()}</h2>
                                    </div>
                                </div>
                                <div className={`absolute top-10 right-10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm border ${revenueChange >= 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                    {revenueChange >= 0 ? '+' : ''}{revenueChange}%
                                </div>
                            </div>
                        </div>

                        {/* Directory Section */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-4">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                <h3 className="font-black uppercase text-sm tracking-widest italic text-slate-900">Personnel Directory</h3>
                            </div>
                            <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] shadow-sm overflow-x-auto">
                                <table className="w-full text-left min-w-[800px]">
                                    <thead className="bg-black text-white text-[9px] font-black uppercase tracking-[0.2em]">
                                        <tr>
                                            <th className="px-10 py-6 text-center w-20">#</th>
                                            <th className="px-6 py-6">Personnel</th>
                                            <th className="px-6 py-6">Designation</th>
                                            <th className="px-6 py-6">ID Reference</th>
                                            <th className="px-10 py-6 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 text-[10px] font-black uppercase tracking-tight">
                                        {loading ? (
                                            <tr><td colSpan="5" className="p-20 text-center text-slate-300 italic">Syncing Data...</td></tr>
                                        ) : activeStaffList.map((staff, index) => (
                                            <tr key={staff.id} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-10 py-6 text-center text-slate-300 font-mono">{(index + 1).toString().padStart(2, '0')}</td>
                                                <td className="px-6 py-6 flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black group-hover:bg-emerald-500 transition-all">
                                                        {staff.full_name?.charAt(0) || staff.first_name?.charAt(0)}
                                                    </div>
                                                    <span className="text-slate-900 font-bold">{staff.full_name || `${staff.first_name} ${staff.last_name}`}</span>
                                                </td>
                                                <td className="px-6 py-6 text-slate-500 tracking-widest font-bold">{staff.role}</td>
                                                <td className="px-6 py-6 text-slate-400 font-mono italic">#{staff.id.slice(0, 8)}</td>
                                                <td className="px-10 py-6 text-right">
                                                    <button className="p-2 hover:bg-black hover:text-white rounded-lg transition-all"><MoreVertical size={16} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </main>
                </div>
            </div>
        </PageTransition>
    );
}