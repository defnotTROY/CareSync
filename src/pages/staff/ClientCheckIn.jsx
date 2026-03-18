import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, UserCheck, Users, CalendarDays,
    CreditCard, FileText, Camera, Search, Bell, LogOut,
    CheckCircle2, Settings, UserPlus
} from 'lucide-react';
import PageTransition from "../../components/layout/PageTransition.jsx";
import '../../styles/staff-portal.css';
import './ClientCheckIn.css';

export default function ClientCheckIn() {
    const [activeTab, setActiveTab] = useState('scan');
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate('/login');
    };

    const [procedures, setProcedures] = useState({
        verifyIdentity: true,
        updateContact: false,
        consentSigned: false,
        collectPayment: false
    });

    const toggleProcedure = (key) => {
        setProcedures(prev => ({ ...prev, [key]: !prev[key] }));
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

                {/* MAIN CONTENT */}
                <main className="staff-main-sm">
                    {/* Header */}
                    <div className="staff-header">
                        <div className="staff-header-info">
                            <h1 className="staff-page-title-sm">Client Check-in</h1>
                            <p className="staff-page-subtitle-plain">Verify and initiate patient clinical journey</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="staff-active-indicator">
                                <div className="staff-pulse-dot" />
                                <span className="staff-active-label">Terminal Active</span>
                            </div>
                            <button className="staff-bell-btn">
                                <Bell size={20} />
                                <div className="staff-bell-dot" />
                            </button>
                        </div>
                    </div>

                    <div className="staff-grid-12">
                        {/* Scanner / Manual Search */}
                        <div className="col-span-7 space-y-8">
                            <div className="checkin-scanner-card">
                                <div className="checkin-tab-bar">
                                    <button onClick={() => setActiveTab('scan')} className={`staff-tab ${activeTab === 'scan' ? 'staff-tab--active' : 'staff-tab--inactive'}`}>
                                        <Camera size={18} /> Scan QR Code
                                    </button>
                                    <button onClick={() => setActiveTab('manual')} className={`staff-tab ${activeTab === 'manual' ? 'staff-tab--active' : 'staff-tab--inactive'}`}>
                                        <Search size={18} /> Manual Entry
                                    </button>
                                </div>
                                <div className="checkin-scanner-body">
                                    <div className="checkin-scanner-frame group">
                                        <div className="checkin-scanner-hover" />
                                        <Camera size={64} className="text-slate-200" />
                                    </div>
                                    <div className="text-center space-y-2">
                                        <p className="checkin-scanner-title">Ready to Scan</p>
                                        <p className="checkin-scanner-desc">Position the patient's QR code within the frame.</p>
                                    </div>
                                    <button className="staff-btn-activate">Activate Camera</button>
                                </div>
                            </div>
                        </div>

                        {/* Right Sidebar Procedures */}
                        <div className="col-span-5 space-y-8">
                            <div className="staff-card">
                                <h3 className="staff-section-title"><FileText size={18} /> Standard Procedure</h3>
                                <div className="space-y-4">
                                    {[
                                        { id: 'verifyIdentity', label: 'Verify Identity' },
                                        { id: 'updateContact', label: 'Update Contact Info' },
                                        { id: 'consentSigned', label: 'Consent Form Signed' },
                                        { id: 'collectPayment', label: 'Collect Co-payment' }
                                    ].map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => toggleProcedure(item.id)}
                                            className={`checkin-procedure-btn ${procedures[item.id] ? 'border-black' : 'border-slate-100'}`}
                                        >
                                            <div className={`checkin-procedure-check ${procedures[item.id] ? 'bg-black border-black text-white' : 'border-slate-200'}`}>
                                                {procedures[item.id] && <CheckCircle2 size={14} />}
                                            </div>
                                            <p className={`checkin-procedure-label ${procedures[item.id] ? 'text-black' : 'text-slate-400'}`}>
                                                {item.label}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                                <button className="staff-btn-primary-full">
                                    Complete Check-in
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </PageTransition>
    );
}