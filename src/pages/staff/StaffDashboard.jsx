import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, UserCheck, Users, CalendarDays,
    CreditCard, FileText, Bell, LogOut, TrendingUp,
    Clock, CheckCircle2, AlertCircle, Settings, UserPlus
} from 'lucide-react';
import PageTransition from "../../components/layout/PageTransition.jsx";
import '../../styles/staff-portal.css';
import './StaffDashboard.css';

export default function StaffDashboard() {
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

    const stats = [
        { label: 'Total Checked-in', value: '42', change: '+12%', icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Avg. Wait Time', value: '14m', change: '-2m', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Pending Payments', value: '₱3,200', change: '5 Cases', icon: CreditCard, color: 'text-orange-600', bg: 'bg-orange-50' },
        { label: 'Today\'s Target', value: '84%', change: 'High Load', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
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
                                    <Link
                                        key={item.name}
                                        to={item.path}
                                        className={`staff-nav-link ${isActive ? 'staff-nav-link--active' : ''}`}
                                    >
                                        <item.icon size={20} className={isActive ? 'staff-nav-icon--active' : 'staff-nav-icon'} />
                                        <span className="staff-nav-label">{item.name}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="staff-sidebar-bottom">
                        <Link
                            to="/staff/settings"
                            className={`staff-settings-link ${location.pathname === '/staff/settings' ? 'staff-settings-link--active' : ''}`}
                        >
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
                            <button
                                onClick={handleLogout}
                                className="staff-logout-btn"
                                title="Logout"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    </div>
                </aside>

                <main className="staff-main">
                    <header className="staff-header">
                        <div className="staff-header-info">
                            <h1 className="staff-page-title-sm">Clinic Overview</h1>
                            <p className="dashboard-date">Wednesday, March 18, 2026</p>
                        </div>
                        <button className="staff-bell-btn">
                            <Bell size={20} />
                            <div className="staff-bell-dot" />
                        </button>
                    </header>

                    <div className="dashboard-stat-grid">
                        {stats.map((stat, idx) => (
                            <div key={idx} className="staff-stat-card">
                                <div className={`staff-stat-icon ${stat.bg} ${stat.color}`}>
                                    <stat.icon size={24} />
                                </div>
                                <div>
                                    <p className="staff-stat-label">{stat.label}</p>
                                    <div className="staff-stat-row">
                                        <h3 className="staff-stat-value">{stat.value}</h3>
                                        <span className={`dashboard-stat-change ${stat.change.startsWith('+') ? 'text-emerald-500' : 'text-slate-400'}`}>
                                            {stat.change}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="staff-grid-12">
                        <div className="dashboard-flow-card">
                            <div className="staff-section-border">
                                <h3 className="staff-section-title">Live Flow Tracking</h3>
                                <button className="staff-btn-subtle">View Full Logs</button>
                            </div>

                            <div className="space-y-4">
                                {[
                                    { name: 'Alex Johnson', action: 'Checked-in', time: 'Just now', icon: CheckCircle2, color: 'text-emerald-500' },
                                    { name: 'Maria Santos', action: 'Payment Verified', time: '12m ago', icon: CreditCard, color: 'text-blue-500' },
                                    { name: 'Julius Caesar', action: 'Emergency Entry', time: '25m ago', icon: AlertCircle, color: 'text-red-500' },
                                ].map((item, i) => (
                                    <div key={i} className="dashboard-flow-item group">
                                        <div className="flex items-center gap-4">
                                            <div className={`dashboard-flow-icon ${item.color}`}>
                                                <item.icon size={22} />
                                            </div>
                                            <div>
                                                <p className="dashboard-flow-name">{item.name}</p>
                                                <p className="dashboard-flow-action">{item.action}</p>
                                            </div>
                                        </div>
                                        <span className="dashboard-flow-time">{item.time}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="col-span-4 space-y-6">
                            <div className="dashboard-notice">
                                <div className="dashboard-notice-glow" />
                                <h3 className="dashboard-notice-label">System Notice</h3>
                                <p className="dashboard-notice-text">Daily Maintenance scheduled at 10:00 PM PST today.</p>
                                <div className="dashboard-notice-footer">
                                    <div className="staff-pulse-dot" />
                                    <span className="dashboard-notice-status">Backups Secure</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </PageTransition>
    );
}