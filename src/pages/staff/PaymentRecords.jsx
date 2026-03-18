import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, UserCheck, Users, CalendarDays,
    CreditCard, FileText, Bell, LogOut, Settings,
    Search, Download, CheckCircle2, Clock, AlertCircle,
    ExternalLink, UserPlus
} from 'lucide-react';
import PageTransition from "../../components/layout/PageTransition.jsx";
import '../../styles/staff-portal.css';
import './PaymentRecords.css';

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
                                <div className="staff-user-avatar">JD</div>
                                <div className="flex flex-col">
                                    <span className="staff-user-name">Juan D.</span>
                                    <span className="staff-user-role">Admin</span>
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
                                <input type="text" placeholder="Ref No. or Patient..." className="staff-search-input-sm" />
                            </div>
                            <button className="staff-btn-primary">
                                <Download size={16} /> Export CSV
                            </button>
                        </div>
                    </div>

                    {/* RECENT TRANSACTIONS TABLE */}
                    <div className="staff-table-wrapper">
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
                                {transactions.map((txn) => (
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
                                        <td className="staff-td-sm payment-amount">{txn.amount}</td>
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
                                            <button className="payment-action-btn">
                                                <ExternalLink size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* SUMMARY CARDS */}
                    <div className="payment-revenue-grid">
                        <div className="payment-revenue-primary">
                            <p className="payment-revenue-label">Total Daily Revenue</p>
                            <h3 className="payment-revenue-value">₱12,450.00</h3>
                            <div className="payment-revenue-footer">
                                <span>24 Successful TXNs</span>
                                <span className="text-emerald-200">+15% vs Yesterday</span>
                            </div>
                        </div>
                        <div className="payment-volume-card">
                            <p className="payment-volume-label">GCash Volume</p>
                            <h3 className="payment-volume-value">₱8,200</h3>
                            <div className="payment-volume-bar">
                                <div className="bg-blue-500 h-full w-[65%]" />
                            </div>
                        </div>
                        <div className="payment-volume-card">
                            <p className="payment-volume-label">Maya Volume</p>
                            <h3 className="payment-volume-value">₱4,250</h3>
                            <div className="payment-volume-bar">
                                <div className="bg-emerald-400 h-full w-[35%]" />
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </PageTransition>
    );
}