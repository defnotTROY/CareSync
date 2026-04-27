import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Users, BadgeDollarSign, Warehouse,
    Wrench, Settings, LogOut, Search,
    ArrowUpRight, FileText, Calendar, TrendingUp, CreditCard,
    Loader2
} from 'lucide-react';
import { supabase } from '../../lib/supabase.js';
import PageTransition from "../../components/layout/PageTransition.jsx";

// --- IMPORTANT: PDF IMPORTS ---
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function RevenueTracker() {
    const location = useLocation();
    const navigate = useNavigate();

    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRange, setFilterRange] = useState('all');
    const [stats, setStats] = useState({ gross: 0, net: 0 });

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
        { name: 'Staff Management', icon: Users, path: '/admin/staff' },
        { name: 'Revenue', icon: BadgeDollarSign, path: '/admin/revenue' },
        { name: 'Inventory', icon: Warehouse, path: '/admin/inventory' },
        { name: 'Maintenance', icon: Wrench, path: '/admin/maintenance' },
    ];

    useEffect(() => {
        fetchRevenueData();
    }, []);

    async function fetchRevenueData() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('appointments')
                .select(`*, profiles:user_id (full_name)`)
                .not('amount', 'is', null)
                .order('appointment_date', { ascending: false });

            if (error) throw error;
            setAppointments(data || []);
            calculateRevenue(data || []);
        } catch (err) {
            console.error("Fetch error:", err.message);
        } finally {
            setLoading(false);
        }
    }

    const calculateRevenue = (data) => {
        const gross = data.reduce((sum, item) => sum + Number(item.amount || 0), 0);
        const net = gross * 0.85;
        setStats({ gross, net });
    };

    const getFilteredData = () => {
        const now = new Date();
        return appointments.filter(apt => {
            const aptDate = new Date(apt.appointment_date);
            const matchesSearch = (
                (apt.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (apt.purpose?.toLowerCase().includes(searchQuery.toLowerCase()))
            );

            if (!matchesSearch) return false;
            if (filterRange === 'all') return true;

            const diffTime = Math.abs(now - aptDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (filterRange === 'daily') return diffDays <= 1;
            if (filterRange === 'weekly') return diffDays <= 7;
            if (filterRange === 'monthly') return aptDate.getMonth() === now.getMonth() && aptDate.getFullYear() === now.getFullYear();
            if (filterRange === 'yearly') return aptDate.getFullYear() === now.getFullYear();

            return true;
        });
    };

    const filteredData = getFilteredData();

    // --- UPDATED PDF EXPORT FUNCTION ---
    const exportToPDF = () => {
        try {
            const doc = new jsPDF();

            // 1. Setup Header
            doc.setFontSize(20);
            doc.setTextColor(0, 0, 0);
            doc.text("CARESYNC REVENUE AUDIT", 14, 22);

            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`Report Period: ${filterRange.toUpperCase()}`, 14, 30);
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 35);
            doc.text(`Total Gross Revenue: PHP ${stats.gross.toLocaleString()}`, 14, 40);

            // 2. Prepare Table Data with Null Checks
            const tableColumn = ["Patient Name", "Purpose of Visit", "Method", "Date", "Amount"];
            const tableRows = filteredData.map(apt => [
                apt.profiles?.full_name || "Guest/Unknown",
                apt.purpose || "N/A",
                (apt.payment_method || "CASH").toUpperCase(),
                new Date(apt.appointment_date).toLocaleDateString(),
                `P${Number(apt.amount || 0).toLocaleString()}`
            ]);

            // 3. Generate Table
            autoTable(doc, {
                startY: 50,
                head: [tableColumn],
                body: tableRows,
                headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255], fontStyle: 'bold' },
                alternateRowStyles: { fillColor: [245, 245, 245] },
                margin: { top: 50 },
            });

            // 4. Save the file
            doc.save(`CareSync_Revenue_${filterRange}_${Date.now()}.pdf`);

        } catch (error) {
            console.error("PDF Generation Error:", error);
            alert("Could not generate PDF. Check console for details.");
        }
    };

    return (
        <PageTransition>
            <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900 font-sans relative">

                {/* SIDEBAR */}
                <aside className="w-72 bg-black flex flex-col justify-between py-10 px-6 shrink-0 h-screen sticky top-0">
                    <div className="space-y-10">
                        <div className="flex items-center gap-3 px-2">
                            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center font-bold text-white text-xl italic shadow-lg">C</div>
                            <div className="flex flex-col text-white font-black uppercase tracking-tight leading-none">
                                <span className="text-lg italic tracking-tighter">CareSync</span>
                                <span className="text-slate-500 text-[10px] tracking-widest mt-1 uppercase">Admin Portal</span>
                            </div>
                        </div>
                        <nav className="space-y-1">
                            {navItems.map((item) => (
                                <Link key={item.name} to={item.path} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${location.pathname === item.path ? 'bg-white text-black font-bold shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                                    <item.icon size={20} className={location.pathname === item.path ? 'text-black' : 'text-slate-400'} />
                                    <span className="text-sm uppercase tracking-wide">{item.name}</span>
                                </Link>
                            ))}
                        </nav>
                    </div>
                </aside>

                <main className="flex-1 p-12 space-y-10 overflow-y-auto">
                    <header className="flex justify-between items-end">
                        <div className="space-y-1">
                            <h1 className="text-5xl font-black text-slate-950 uppercase tracking-tighter italic">Revenue</h1>
                            <p className="text-slate-500 font-medium uppercase text-[10px] tracking-[0.2em]">Financial Tracking & PDF Reporting</p>
                        </div>
                        <button
                            onClick={exportToPDF}
                            className="px-8 py-4 bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:bg-red-600 transition-all shadow-xl"
                        >
                            <FileText size={16} /> Export PDF Report
                        </button>
                    </header>

                    {/* TOP STATS */}
                    <div className="grid grid-cols-2 gap-8">
                        <div className="bg-white p-10 rounded-[3rem] border-2 border-slate-50 shadow-sm space-y-6">
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Gross Revenue</p>
                            <h3 className="text-4xl font-black text-slate-950 italic">₱{stats.gross.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                        </div>
                        <div className="bg-white p-10 rounded-[3rem] border-2 border-slate-50 shadow-sm space-y-6">
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Net Collection (Est.)</p>
                            <h3 className="text-4xl font-black text-slate-950 italic">₱{stats.net.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                        </div>
                    </div>

                    {/* FILTERS & SEARCH */}
                    <section className="space-y-6">
                        <div className="flex justify-between items-center px-2">
                            <div className="flex gap-2">
                                {['all', 'daily', 'weekly', 'monthly', 'yearly'].map((range) => (
                                    <button
                                        key={range}
                                        onClick={() => setFilterRange(range)}
                                        className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterRange === range ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white border border-slate-100 text-slate-400 hover:border-slate-300'}`}
                                    >
                                        {range}
                                    </button>
                                ))}
                            </div>
                            <div className="relative">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="SEARCH TRANSACTION..."
                                    className="pl-14 pr-8 py-4 bg-white border-2 border-slate-100 rounded-2xl text-[10px] font-black uppercase outline-none focus:border-black w-80 shadow-sm"
                                />
                            </div>
                        </div>

                        {/* TABLE */}
                        <div className="bg-white border-2 border-slate-50 rounded-[3rem] shadow-sm overflow-hidden">
                            {loading ? (
                                <div className="flex justify-center py-24"><Loader2 className="animate-spin text-emerald-500" size={48} /></div>
                            ) : (
                                <table className="w-full text-left">
                                    <thead className="bg-black text-white">
                                        <tr>
                                            <th className="px-10 py-7 text-[10px] font-black uppercase tracking-widest text-slate-400">Patient</th>
                                            <th className="px-10 py-7 text-[10px] font-black uppercase tracking-widest text-slate-400">Purpose</th>
                                            <th className="px-10 py-7 text-[10px] font-black uppercase tracking-widest text-slate-400">Amount</th>
                                            <th className="px-10 py-7 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 font-bold">
                                        {filteredData.length > 0 ? filteredData.map((apt) => (
                                            <tr key={apt.id} className="hover:bg-slate-50/80 transition-all">
                                                <td className="px-10 py-7 font-black text-slate-900 uppercase text-xs">
                                                    {apt.profiles?.full_name || 'Guest User'}
                                                </td>
                                                <td className="px-10 py-7 uppercase text-[10px] text-slate-400 tracking-tight">{apt.purpose}</td>
                                                <td className="px-10 py-7 font-black text-slate-950 text-base italic">₱{Number(apt.amount).toLocaleString()}</td>
                                                <td className="px-10 py-7 text-slate-400 text-[10px]">
                                                    {new Date(apt.appointment_date).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="4" className="text-center py-20 text-slate-300 font-black uppercase tracking-widest">No matching records</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </section>
                </main>
            </div>
        </PageTransition>
    );
}