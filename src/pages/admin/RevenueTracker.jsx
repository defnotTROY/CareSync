import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    BadgeDollarSign, Search, FileText, Loader2, RefreshCw, TrendingUp, CreditCard, X
} from 'lucide-react';
import { supabase } from '../../lib/supabase.js';
import PageTransition from "../../components/layout/PageTransition.jsx";
import AdminSidebar from "../../components/layout/AdminSidebar.jsx";
import AdminHeader from "../../components/layout/AdminHeader.jsx";

// PDF IMPORTS
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function RevenueTracker() {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRange, setFilterRange] = useState('all');

    const [appointments, setAppointments] = useState([]);
    const [stats, setStats] = useState({ gross: 0, net: 0, count: 0 });

    useEffect(() => {
        fetchRevenueData();
    }, []);

    async function fetchRevenueData() {
        try {
            setLoading(true);

            // STEP 1: Fetch only COMPLETED appointments with an amount
            const { data: aptData, error: aptError } = await supabase
                .from('appointments')
                .select('*')
                .eq('status', 'COMPLETED')
                .not('amount', 'is', null)
                .order('appointment_date', { ascending: false });

            if (aptError) throw aptError;

            if (aptData && aptData.length > 0) {
                // STEP 2: Collect all unique user IDs to fetch profiles
                const userIds = [...new Set(aptData.map(a => a.user_id))];

                const { data: profData, error: profError } = await supabase
                    .from('profiles')
                    .select('id, first_name, last_name')
                    .in('id', userIds);

                if (profError) throw profError;

                // STEP 3: Manually merge profiles into appointments
                const mergedData = aptData.map(apt => ({
                    ...apt,
                    profiles: profData.find(p => p.id === apt.user_id) || null
                }));

                setAppointments(mergedData);
                calculateRevenue(mergedData);
            } else {
                setAppointments([]);
                setStats({ gross: 0, net: 0, count: 0 });
            }
        } catch (err) {
            console.error("Audit Fetch Error:", err.message);
        } finally {
            setLoading(false);
        }
    }

    const calculateRevenue = (data) => {
        const gross = data.reduce((sum, item) => sum + Number(item.amount || 0), 0);
        const net = gross * 0.85;
        setStats({ gross, net, count: data.length });
    };

    const getFilteredData = () => {
        const now = new Date();
        return appointments.filter(apt => {
            const aptDate = new Date(apt.appointment_date);
            const patientName = `${apt.profiles?.first_name || ''} ${apt.profiles?.last_name || ''}`.trim();

            const matchesSearch = (
                (patientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
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

    const exportToPDF = () => {
        try {
            const doc = new jsPDF();
            doc.setFont("helvetica", "bold");
            doc.setFontSize(22);
            doc.text("CARESYNC COMPLETED REVENUE AUDIT", 14, 22);

            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(120);
            doc.text(`Audit Filter: COMPLETED TRANSACTIONS`, 14, 32);
            doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 37);

            doc.setDrawColor(240);
            doc.line(14, 42, 196, 42);

            const tableColumn = ["Patient", "Purpose", "Payment", "Date", "Amount"];
            const tableRows = filteredData.map(apt => [
                `${apt.profiles?.first_name || 'Guest'} ${apt.profiles?.last_name || ''}`,
                (apt.purpose || "Service").toUpperCase(),
                (apt.payment_method || "CASH").toUpperCase(),
                new Date(apt.appointment_date).toLocaleDateString(),
                `PHP ${Number(apt.amount || 0).toLocaleString()}`
            ]);

            autoTable(doc, {
                startY: 50,
                head: [tableColumn],
                body: tableRows,
                styles: { fontSize: 8, font: "helvetica" },
                headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
                alternateRowStyles: { fillColor: [250, 250, 250] },
            });

            doc.save(`CareSync_Audit_${Date.now()}.pdf`);
        } catch (error) {
            console.error("PDF Failed:", error);
        }
    };

    return (
        <PageTransition>
            <div className="flex min-h-screen bg-[#F8FAFC]">
                <AdminSidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

                <div className="flex-1 flex flex-col min-w-0 md:ml-20 lg:ml-72">
                    <AdminHeader title="Revenue Terminal" onMenuClick={() => setSidebarOpen(true)} />

                    <main className="p-6 lg:p-12 space-y-12">
                        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
                            <div className="space-y-1">
                                <h1 className="text-4xl lg:text-6xl font-black text-slate-950 uppercase tracking-tighter leading-none italic">Revenue</h1>
                                <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.3em]">Verified Completed Audits</p>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={fetchRevenueData} className="p-4 bg-white border-2 border-slate-100 rounded-2xl text-slate-400 hover:text-black hover:border-black transition-all">
                                    <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                                </button>
                                <button
                                    onClick={exportToPDF}
                                    className="px-8 py-4 bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:bg-emerald-600 transition-all shadow-xl"
                                >
                                    <FileText size={16} /> Export PDF
                                </button>
                            </div>
                        </header>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-sm space-y-4 hover:border-black transition-all group">
                                <TrendingUp className="text-slate-300 group-hover:text-emerald-500 transition-colors" size={24} />
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Gross Revenue</p>
                                    <h3 className="text-4xl font-black text-slate-950 italic tracking-tighter">
                                        ₱{stats.gross.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </h3>
                                </div>
                            </div>
                            <div className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-sm space-y-4 hover:border-black transition-all group">
                                <CreditCard className="text-slate-300 group-hover:text-emerald-500 transition-colors" size={24} />
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Net Collection</p>
                                    <h3 className="text-4xl font-black text-slate-950 italic tracking-tighter">
                                        ₱{stats.net.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </h3>
                                </div>
                            </div>
                            <div className="bg-black p-10 rounded-[3rem] shadow-2xl space-y-4">
                                <BadgeDollarSign className="text-emerald-500" size={24} />
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Verified Files</p>
                                    <h3 className="text-4xl font-black text-white italic tracking-tighter">
                                        {stats.count} <span className="text-[12px] text-slate-500 not-italic tracking-normal font-bold">Total</span>
                                    </h3>
                                </div>
                            </div>
                        </div>

                        <section className="space-y-6">
                            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                                <div className="flex flex-wrap gap-2">
                                    {['all', 'daily', 'weekly', 'monthly', 'yearly'].map((range) => (
                                        <button
                                            key={range}
                                            onClick={() => setFilterRange(range)}
                                            className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border-2 ${filterRange === range
                                                ? 'bg-black text-white border-black shadow-lg'
                                                : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'
                                                }`}
                                        >
                                            {range}
                                        </button>
                                    ))}
                                </div>
                                <div className="relative w-full xl:w-96">
                                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="SEARCH COMPLETED AUDITS..."
                                        className="w-full pl-14 pr-8 py-4 bg-white border-2 border-slate-100 rounded-2xl text-[10px] font-black uppercase outline-none focus:border-black shadow-sm"
                                    />
                                </div>
                            </div>

                            <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    {loading ? (
                                        <div className="flex justify-center py-24"><Loader2 className="animate-spin text-black" size={48} /></div>
                                    ) : (
                                        <table className="w-full text-left min-w-[800px]">
                                            <thead className="bg-black text-white text-[9px] font-black uppercase tracking-[0.2em]">
                                                <tr>
                                                    <th className="px-10 py-6">Patient Entity</th>
                                                    <th className="px-10 py-6">Purpose</th>
                                                    <th className="px-10 py-6">Method</th>
                                                    <th className="px-10 py-6 text-center">Date</th>
                                                    <th className="px-10 py-6 text-right">Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50 text-[10px] font-black uppercase tracking-tight">
                                                {filteredData.length > 0 ? filteredData.map((apt) => (
                                                    <tr key={apt.id} className="hover:bg-slate-50 transition-colors group">
                                                        <td className="px-10 py-7 text-slate-900 font-bold capitalize">
                                                            {apt.profiles?.first_name} {apt.profiles?.last_name}
                                                        </td>
                                                        <td className="px-10 py-7 text-slate-400 tracking-widest">{apt.purpose || "N/A"}</td>
                                                        <td className="px-10 py-7">
                                                            <span className="px-3 py-1 bg-slate-100 rounded-lg text-[8px] border border-slate-200 uppercase">
                                                                {apt.payment_method || 'CASH'}
                                                            </span>
                                                        </td>
                                                        <td className="px-10 py-7 text-slate-400 text-center">
                                                            {new Date(apt.appointment_date).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-10 py-7 text-right font-black text-slate-950 text-sm italic group-hover:text-emerald-600 transition-colors">
                                                            ₱{Number(apt.amount).toLocaleString()}
                                                        </td>
                                                    </tr>
                                                )) : (
                                                    <tr>
                                                        <td colSpan="5" className="text-center py-24 text-slate-300 italic tracking-[0.3em] font-black">No Verified Completed Transactions</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>
                        </section>
                    </main>
                </div>
            </div>
        </PageTransition>
    );
}