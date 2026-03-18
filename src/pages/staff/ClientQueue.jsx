import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, UserCheck, Users, CalendarDays,
    CreditCard, FileText, Search, Bell, LogOut, MoreVertical,
    Clock, Play, CheckCircle2, AlertCircle, ArrowRight,
    Settings, UserPlus
} from 'lucide-react';
import PageTransition from "../../components/layout/PageTransition.jsx";
import '../../styles/staff-portal.css';
import './ClientQueue.css';

export default function ClientQueue() {
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

    const [queueData, setQueueData] = useState([
        { id: 'Q-102', name: 'Marcus Aurelius', service: 'General Checkup', wait: '12m', status: 'waiting', priority: 'Standard' },
        { id: 'Q-103', name: 'Elena Lamberti', service: 'Cardiology', wait: '5m', status: 'waiting', priority: 'Urgent' },
        { id: 'Q-101', name: 'Julius Caesar', service: 'Physical Exam', wait: '45m', status: 'in-progress', room: 'Exam Room 1' },
    ]);

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
                    {/* Header */}
                    <div className="staff-header-end">
                        <div className="space-y-2">
                            <h1 className="staff-page-title">Live Queue</h1>
                            <div className="queue-header-stats">
                                <span className="queue-active-count">
                                    <div className="staff-pulse-dot" />
                                    {queueData.length} Active
                                </span>
                                <span>•</span>
                                <span>Avg. Wait: 18 Mins</span>
                            </div>
                        </div>
                        <button className="staff-bell-btn">
                            <Bell size={20} />
                            <div className="staff-bell-dot" />
                        </button>
                    </div>

                    <div className="staff-grid-12">
                        {/* Waiting List */}
                        <div className="col-span-8 space-y-6">
                            <h3 className="staff-section-label-px">Waiting Area</h3>
                            <div className="space-y-3">
                                {queueData.filter(p => p.status === 'waiting').map((patient) => (
                                    <div key={patient.id} className="queue-patient-card group">
                                        <div className="flex items-center gap-6">
                                            <div className="queue-patient-avatar">QR</div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="queue-patient-id">{patient.id}</span>
                                                    <h4 className="queue-patient-name">{patient.name}</h4>
                                                    {patient.priority === 'Urgent' && <AlertCircle size={16} className="text-red-500" />}
                                                </div>
                                                <p className="queue-patient-service">{patient.service}</p>
                                            </div>
                                        </div>
                                        <button className="queue-call-btn">
                                            Call Patient
                                            <ArrowRight size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Serving Now */}
                        <div className="col-span-4 space-y-6">
                            <h3 className="staff-section-label-px">Serving Now</h3>
                            {queueData.filter(p => p.status === 'in-progress').map((patient) => (
                                <div key={patient.id} className="queue-serving-card">
                                    <div className="staff-dark-panel-glow-emerald" />
                                    <div className="flex justify-between items-center">
                                        <span className="queue-serving-badge">In Progress</span>
                                        <span className="queue-serving-room">{patient.room}</span>
                                    </div>
                                    <h4 className="queue-serving-name">{patient.name}</h4>
                                    <button className="queue-finish-btn">
                                        Mark as Finished
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </PageTransition>
    );
}