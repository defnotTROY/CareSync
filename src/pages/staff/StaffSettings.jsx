import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, UserCheck, Users, CalendarDays,
    CreditCard, FileText, Settings, Bell, LogOut,
    User, Shield, BellRing, Monitor, UserPlus
} from 'lucide-react';
import PageTransition from "../../components/layout/PageTransition.jsx";
import '../../styles/staff-portal.css';
import './StaffSettings.css';

export default function StaffSettings() {
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

    return (
        <PageTransition>
            <div className="staff-layout">

                {/* SIDEBAR */}
                <aside className="staff-sidebar">
                    <div className="staff-sidebar-top">
                        <div className="staff-brand">
                            <div className="staff-brand-icon"><img src="/mjylogo.png" alt="CareSync Logo" className="w-10 h-10 object-contain" /></div>
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
                            <button onClick={handleLogout} className="staff-logout-btn">
                                <LogOut size={18} />
                            </button>
                        </div>
                    </div>
                </aside>

                <main className="staff-main">
                    <header className="staff-header-info">
                        <h1 className="staff-page-title">Settings</h1>
                        <p className="staff-page-subtitle">System & Terminal Configuration</p>
                    </header>

                    <div className="staff-grid-12">
                        <div className="col-span-8 space-y-6">
                            {/* Profile Section */}
                            <div className="staff-card">
                                <h3 className="staff-section-title"><User size={20} /> Staff Profile</h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="staff-form-label-tracking">Full Name</label>
                                        <input type="text" defaultValue="Juan Dela Cruz" className="staff-input-sm" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="staff-form-label-tracking">Terminal Role</label>
                                        <input type="text" defaultValue="Front Desk Admin" disabled className="settings-input-disabled" />
                                    </div>
                                </div>
                            </div>

                            {/* Security Section */}
                            <div className="staff-card">
                                <h3 className="staff-section-title"><Shield size={20} /> Security & Access</h3>
                                <div className="settings-toggle-row">
                                    <div>
                                        <p className="settings-toggle-title">Two-Factor Authentication</p>
                                        <p className="settings-toggle-desc">Requirement for Admin accounts</p>
                                    </div>
                                    <div className="staff-toggle-on">
                                        <div className="staff-toggle-dot" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Side Panel Info */}
                        <div className="col-span-4 space-y-6">
                            <div className="staff-dark-panel">
                                <div className="staff-dark-panel-glow" />
                                <h3 className="settings-terminal-label">Terminal Info</h3>
                                <div className="space-y-4">
                                    <div className="settings-info-row">
                                        <span className="settings-info-label">Version</span>
                                        <span className="settings-info-value">v2.4.0-PRO</span>
                                    </div>
                                    <div className="settings-info-row">
                                        <span className="settings-info-label">Last Sync</span>
                                        <span className="settings-info-value">Today, 10:30 PM</span>
                                    </div>
                                </div>
                                <button className="settings-update-btn">Check for Updates</button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </PageTransition>
    );
}