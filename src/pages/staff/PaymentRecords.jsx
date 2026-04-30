import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, UserCheck, Users, CalendarDays,
    CreditCard, FileText, Bell, LogOut, Settings,
    Search, Download, CheckCircle2, Clock, AlertCircle,
    ExternalLink, UserPlus, Loader2
} from 'lucide-react';
import { supabase } from '../../supabaseClient';
import PageTransition from "../../components/layout/PageTransition.jsx";
import '../../styles/staff-portal.css';
import './PaymentRecords.css';

export default function PaymentRecords() {
    const location = useLocation();
    const navigate = useNavigate();

    // --- STAFF IDENTITY ---
    const [staffName, setStaffName] = useState("Staff");
    const [staffLoading, setStaffLoading] = useState(true);

    // --- DATA STATE ---
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        async function fetchInitialData() {
            try {
                // 1. Fetch Staff Identity
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('full_name')
                        .eq('id', user.id)
                        .single();
                    setStaffName(profile?.full_name || "Staff Member");
                }
                setStaffLoading(false);

                // 2. Fetch Appointments for Payment Data
                // Since payments are tied to appointments, we use the appointments table as the ledger
                const { data: apts, error } = await supabase
                    .from('appointments')
                    .select('*, profiles(full_name)')
                    .order('created_at', { ascending: false });

                if (error) throw error;

                // 3. Map to Transaction UI Structure
                const mappedTxns = (apts || []).map(apt => {
                    const isSuccess = ['CHECKED_IN', 'IN_PROGRESS', 'COMPLETED'].includes(apt.status);
                    
                    let methodDisplay = 'Cash / Clinic';
                    if (apt.payment_method === 'gcash') methodDisplay = 'GCash';
                    else if (apt.payment_method === 'maya') methodDisplay = 'Maya';

                    return {
                        id: `TXN-${apt.id.slice(0, 4).toUpperCase()}`,
                        ref: apt.id.slice(0, 8).toUpperCase(),
                        patient: apt.profiles?.full_name || 'Unknown Patient',
                        method: methodDisplay,
                        amount: apt.amount || 600,
                        status: isSuccess ? 'Success' : 'Pending',
                        date: new Date(apt.created_at).toLocaleDateString(undefined, { 
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                        }),
                        rawDate: new Date(apt.created_at)
                    };
                });

                setTransactions(mappedTxns);

            } catch (err) {
                console.error("Error fetching transactions:", err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchInitialData();
    }, []);

    // --- FILTERING ---
    const filteredTxns = useMemo(() => {
        if (!searchQuery.trim()) return transactions;
        const query = searchQuery.toLowerCase();
        return transactions.filter(t => 
            t.ref.toLowerCase().includes(query) ||
            t.patient.toLowerCase().includes(query) ||
            t.id.toLowerCase().includes(query)
        );
    }, [transactions, searchQuery]);

    // --- SUMMARY CALCULATIONS (Based on Today's Successful Transactions) ---
    const summary = useMemo(() => {
        const todayStr = new Date().toDateString();
        
        // Filter for transactions created TODAY that are SUCCESSFUL
        const todaySuccessTxns = transactions.filter(t => 
            t.status === 'Success' && t.rawDate.toDateString() === todayStr
        );

        const totalRevenue = todaySuccessTxns.reduce((sum, t) => sum + t.amount, 0);
        const totalTxns = todaySuccessTxns.length;

        const gcashVolume = todaySuccessTxns.filter(t => t.method === 'GCash').reduce((sum, t) => sum + t.amount, 0);
        const mayaVolume = todaySuccessTxns.filter(t => t.method === 'Maya').reduce((sum, t) => sum + t.amount, 0);

        // Calculate bar percentages (avoid division by zero)
        const gcashPct = totalRevenue > 0 ? (gcashVolume / totalRevenue) * 100 : 0;
        const mayaPct = totalRevenue > 0 ? (mayaVolume / totalRevenue) * 100 : 0;

        return {
            totalRevenue,
            totalTxns,
            gcashVolume,
            mayaVolume,
            gcashPct,
            mayaPct
        };
    }, [transactions]);

    // --- HELPERS ---
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
    };

    const handleExportCSV = () => {
        if (!filteredTxns || filteredTxns.length === 0) {
            alert("No data to export.");
            return;
        }

        const headers = ['Transaction ID', 'Reference', 'Patient', 'Method', 'Amount', 'Status', 'Date'];
        const csvRows = [headers.join(',')];

        filteredTxns.forEach(txn => {
            const row = [
                txn.id,
                txn.ref,
                `"${txn.patient}"`, // Escape commas
                txn.method,
                txn.amount,
                txn.status,
                `"${txn.date}"` // Escape commas
            ];
            csvRows.push(row.join(','));
        });

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `payment_records_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
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

    return (
        <PageTransition>
            <div className="staff-layout">

                {/* SIDEBAR */}
                <aside className="staff-sidebar">
                    <div className="staff-sidebar-top">
                        <div className="staff-brand">
                            <div className="staff-brand-icon">M</div>
                            <div className="staff-brand-text">
                                <span className="staff-brand-name">CareSync</span>
                                <span className="staff-brand-sub">Staff Terminal</span>
                            </div>
                        </div>

                        <nav className="staff-nav">
                            {navItems.map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link key={item.name} to={item.path} className={`staff-nav-link ${isActive ? 'staff-nav-link--active' : ''}`}>
                                        <item.icon size={20} className={isActive ? 'staff-nav-icon--active' : 'staff-nav-icon'} />
                                        <span className="staff-nav-label">{item.name}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="staff-sidebar-bottom">
                        <Link to="/staff/settings" className={`staff-settings-link ${location.pathname === '/staff/settings' ? 'staff-settings-link--active' : ''}`}>
                            <Settings size={20} className={location.pathname === '/staff/settings' ? 'staff-nav-icon--active' : 'staff-nav-icon'} />
                            <span className="staff-nav-label">Settings</span>
                        </Link>

                        <div className="staff-user-section">
                            <div className="staff-user-info">
                                <div className="staff-user-avatar">{staffName ? staffName.charAt(0) : 'S'}</div>
                                <div className="flex flex-col overflow-hidden">
                                    <span className="staff-user-name truncate w-20">{staffLoading ? "..." : staffName}</span>
                                    <span className="staff-user-role">Staff</span>
                                </div>
                            </div>
                            <button onClick={handleLogout} className="staff-logout-btn" title="Logout">
                                <LogOut size={18} />
                            </button>
                        </div>
                    </div>
                </aside>

                <main className="staff-main">

                    {/* HEADER */}
                    <div className="staff-header">
                        <div className="staff-header-info">
                            <h1 className="staff-page-title">Payments</h1>
                            <p className="staff-page-subtitle">Transaction history & settlement</p>
                        </div>
                        <div className="flex gap-3">
                            <div className="relative">
                                <Search className="staff-search-icon-sm" size={18} />
                                <input 
                                    type="text" 
                                    placeholder="Ref No. or Patient..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="staff-search-input-sm" 
                                />
                            </div>
                            <button className="staff-btn-primary" onClick={handleExportCSV}>
                                <Download size={16} /> Export CSV
                            </button>
                        </div>
                    </div>

                    {/* RECENT TRANSACTIONS TABLE */}
                    <div className="staff-table-wrapper">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                                <Loader2 size={32} className="animate-spin mb-4" />
                                <p className="text-sm font-medium">Reconciling transaction data...</p>
                            </div>
                        ) : filteredTxns.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-400 text-center">
                                <AlertCircle size={48} className="text-slate-200 mb-4" />
                                <p className="text-lg font-bold text-slate-500">No transactions found</p>
                                <p className="text-sm mt-1 max-w-sm">
                                    {searchQuery ? "No records match your search query." : "There are currently no transactions in the ledger."}
                                </p>
                            </div>
                        ) : (
                            <table className="staff-table">
                                <thead>
                                    <tr className="staff-table-head-row">
                                        <th className="staff-th-sm">Transaction / Ref</th>
                                        <th className="staff-th-sm">Patient</th>
                                        <th className="staff-th-sm">Method</th>
                                        <th className="staff-th-sm">Amount</th>
                                        <th className="staff-th-sm">Status</th>
                                        <th className="staff-th-sm text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="staff-table-body">
                                    {filteredTxns.map((txn) => (
                                        <tr key={txn.id} className="staff-table-row">
                                            <td className="staff-td-sm">
                                                <p className="payment-txn-id">{txn.id}</p>
                                                <p className="payment-txn-ref">{txn.ref}</p>
                                            </td>
                                            <td className="staff-td-sm">
                                                <p className="payment-patient-name">{txn.patient}</p>
                                                <p className="payment-patient-date">{txn.date}</p>
                                            </td>
                                            <td className="staff-td-sm">
                                                <span className={`payment-method-badge ${txn.method === 'GCash' ? 'bg-blue-50 text-blue-600' :
                                                    txn.method === 'Maya' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'
                                                    }`}>
                                                    {txn.method}
                                                </span>
                                            </td>
                                            <td className="staff-td-sm payment-amount">{formatCurrency(txn.amount)}</td>
                                            <td className="staff-td-sm">
                                                <div className="flex items-center gap-2">
                                                    {txn.status === 'Success' ? (
                                                        <CheckCircle2 size={16} className="text-emerald-500" />
                                                    ) : (
                                                        <Clock size={16} className="text-orange-400" />
                                                    )}
                                                    <span className={`staff-status-badge ${txn.status === 'Success' ? 'text-emerald-500' : 'text-orange-400'}`}>
                                                        {txn.status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="staff-td-sm text-right">
                                                <button className="payment-action-btn" title="View Receipt">
                                                    <ExternalLink size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* SUMMARY CARDS */}
                    <div className="payment-revenue-grid">
                        <div className="payment-revenue-primary">
                            <p className="payment-revenue-label">Total Daily Revenue (Today)</p>
                            <h3 className="payment-revenue-value">{formatCurrency(summary.totalRevenue)}</h3>
                            <div className="payment-revenue-footer">
                                <span>{summary.totalTxns} Successful TXN{summary.totalTxns === 1 ? '' : 's'}</span>
                                <span className={summary.totalTxns > 0 ? "text-emerald-200" : "opacity-50"}>
                                    {summary.totalTxns > 0 ? "Live" : "No Activity"}
                                </span>
                            </div>
                        </div>
                        <div className="payment-volume-card">
                            <div className="flex justify-between items-start">
                                <p className="payment-volume-label">GCash Volume</p>
                                <span className="text-xs font-black text-slate-300">{summary.gcashPct.toFixed(0)}%</span>
                            </div>
                            <h3 className="payment-volume-value">{formatCurrency(summary.gcashVolume)}</h3>
                            <div className="payment-volume-bar">
                                <div className="bg-blue-500 h-full transition-all duration-1000" style={{ width: `${summary.gcashPct}%` }} />
                            </div>
                        </div>
                        <div className="payment-volume-card">
                            <div className="flex justify-between items-start">
                                <p className="payment-volume-label">Maya Volume</p>
                                <span className="text-xs font-black text-slate-300">{summary.mayaPct.toFixed(0)}%</span>
                            </div>
                            <h3 className="payment-volume-value">{formatCurrency(summary.mayaVolume)}</h3>
                            <div className="payment-volume-bar">
                                <div className="bg-emerald-400 h-full transition-all duration-1000" style={{ width: `${summary.mayaPct}%` }} />
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </PageTransition>
    );
}