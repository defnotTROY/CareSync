import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, UserCheck, Users, CalendarDays,
    CreditCard, FileText, Bell, LogOut, Settings,
    Search, Filter, MoreVertical, UserPlus, FileEdit, Trash2
} from 'lucide-react';
import PageTransition from "../../components/layout/PageTransition.jsx";
import '../../styles/staff-portal.css';
import './ClientRecords.css';

export default function ClientRecords() {
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

    const patients = [
        { id: 'PAT-2026-001', name: 'Marcus Aurelius', email: 'marcus@rome.gov', type: 'Student', lastVisit: 'Mar 18, 2026', status: 'Active' },
        { id: 'PAT-2026-002', name: 'Elena Lamberti', email: 'elena.l@mail.com', type: 'Professional', lastVisit: 'Mar 15, 2026', status: 'Active' },
        { id: 'PAT-2026-003', name: 'Julius Caesar', email: 'julius@senate.it', type: 'Professional', lastVisit: 'Feb 12, 2026', status: 'Inactive' },
        { id: 'PAT-2026-004', name: 'Livilla Drusilla', email: 'liv@empire.com', type: 'Student', lastVisit: 'Jan 05, 2026', status: 'Active' },
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
                            <h1 className="staff-page-title">Client Records</h1>
                            <p className="staff-page-subtitle">Patient health database archive</p>
                        </div>
                        <button className="staff-btn-primary">
                            <UserPlus size={16} /> Add New Patient
                        </button>
                    </div>

                    {/* SEARCH & FILTER BAR */}
                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="staff-search-icon" size={20} />
                            <input type="text" placeholder="Search by name, ID, or email address..." className="staff-search-input" />
                        </div>
                        <button className="staff-btn-filter-rounded">
                            <Filter size={18} /> Filter By Type
                        </button>
                    </div>

                    {/* RECORDS TABLE */}
                    <div className="staff-table-wrapper">
                        <table className="staff-table">
                            <thead>
                                <tr className="staff-table-head-row">
                                    <th className="staff-th">Patient ID</th>
                                    <th className="staff-th">Full Name</th>
                                    <th className="staff-th">Patient Type</th>
                                    <th className="staff-th">Last Visit</th>
                                    <th className="staff-th">Status</th>
                                    <th className="staff-th text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="staff-table-body">
                                {patients.map((patient) => (
                                    <tr key={patient.id} className="staff-table-row">
                                        <td className="staff-td">
                                            <span className="records-patient-id">{patient.id}</span>
                                        </td>
                                        <td className="staff-td">
                                            <p className="records-patient-name">{patient.name}</p>
                                            <p className="records-patient-email">{patient.email}</p>
                                        </td>
                                        <td className="staff-td">
                                            <span className={`staff-status-badge ${patient.type === 'Student' ? 'text-blue-500' : 'text-purple-500'}`}>
                                                {patient.type}
                                            </span>
                                        </td>
                                        <td className="staff-td font-bold text-sm text-slate-600 italic">
                                            {patient.lastVisit}
                                        </td>
                                        <td className="staff-td">
                                            <div className="flex items-center gap-2">
                                                <div className={`records-status-dot ${patient.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                                                <span className="staff-status-badge text-slate-900">{patient.status}</span>
                                            </div>
                                        </td>
                                        <td className="staff-td text-right">
                                            <div className="flex justify-end gap-2">
                                                <button className="records-action-edit">
                                                    <FileEdit size={16} />
                                                </button>
                                                <button className="records-action-delete">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="staff-table-footer">
                            <p className="records-footer-text">Showing 4 of 1,240 records</p>
                            <div className="flex gap-2">
                                <button className="staff-pagination-btn">Prev</button>
                                <button className="staff-pagination-btn">Next</button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </PageTransition>
    );
}