import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, UserCheck, Users, CalendarDays,
    CreditCard, FileText, Settings, Bell, LogOut,
    User, Shield, BellRing, Monitor, UserPlus
} from 'lucide-react';
import PageTransition from "../../components/layout/PageTransition.jsx";
import StaffSidebar from "../../components/layout/StaffSidebar.jsx";
import StaffHeader from "../../components/layout/StaffHeader.jsx";
import '../../styles/staff-portal.css';
import './StaffSettings.css';

export default function StaffSettings() {
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarOpen, setSidebarOpen] = useState(false);

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
            <div className="flex min-h-screen bg-[#F8FAFC]">
                <StaffSidebar
                    isOpen={isSidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />

                <div className="flex-1 flex flex-col min-w-0 md:ml-20 lg:ml-72">
                    <StaffHeader
                        title="Settings"
                        onMenuClick={() => setSidebarOpen(true)}
                    />

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
            </div>
        </PageTransition>
    );
}