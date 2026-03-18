import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    CalendarPlus,
    ClipboardList,
    Settings,
    LogOut,
    ShieldCheck,
    User
} from 'lucide-react';
import PageTransition from "../components/layout/PageTransition.jsx";
import '../styles/client-portal.css';
import './ClientDashboard.css';

export default function ClientDashboard() {
    const location = useLocation();
    const userName = "Alex";

    const upcomingTask = {
        title: "Medical Evaluation",
        doctor: "Dr. Sarah Jenkins",
        date: "Oct 24, 2023",
        time: "10:30 AM",
        location: "MJY 88 Main Branch",
        status: "UPCOMING APPOINTMENT",
        daysLeft: "In 3 days"
    };

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { name: 'Book Appointment', icon: CalendarPlus, path: '/book' },
        { name: 'My Appointments', icon: ClipboardList, path: '/appointments' },
    ];

    return (
        <PageTransition>
            <div className="client-layout">

                {/* SIDE NAVIGATION BAR */}
                <aside className="client-sidebar">
                    <div className="space-y-10">
                        <Link to="/" className="sidebar-brand">
                            <div className="sidebar-brand-icon">
                                <ShieldCheck className="text-white" size={22} />
                            </div>
                            <div className="flex flex-col">
                                <span className="sidebar-brand-name">MJY 88</span>
                                <span className="sidebar-brand-sub">Medical Clinic</span>
                            </div>
                        </Link>

                        <nav className="sidebar-nav">
                            {navItems.map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.path}
                                        className={`sidebar-nav-link ${isActive ? 'sidebar-nav-link--active' : ''}`}
                                    >
                                        <item.icon size={20} className={isActive ? 'sidebar-nav-icon--active' : 'sidebar-nav-icon'} />
                                        <span className="sidebar-nav-label">{item.name}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="sidebar-bottom">
                        <Link to="/settings" className="sidebar-settings-link">
                            <Settings size={20} />
                            <span className="text-sm font-medium">Settings</span>
                        </Link>

                        <div className="sidebar-user-section">
                            <div className="flex items-center gap-3">
                                <div className="sidebar-avatar">
                                    <User className="text-slate-400" size={20} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="sidebar-user-name">Juan Dela Cruz</span>
                                    <span className="sidebar-user-role">Patient Account</span>
                                </div>
                            </div>
                            <button className="sidebar-logout-btn">
                                <LogOut size={18} />
                            </button>
                        </div>
                    </div>
                </aside>

                {/* MAIN DASHBOARD AREA */}
                <main className="main-content">
                    <header className="dashboard-header">
                        <h1 className="page-title">Welcome, {userName}</h1>
                        <p className="dashboard-welcome">Manage your health and appointments at a glance.</p>
                    </header>

                    <section className="relative group cursor-pointer">
                        <div className="card-shadow-offset" />

                        <div className="card-shadow">
                            <div className="flex justify-between items-start">
                                <div className="space-y-3">
                                    <span className="appointment-status-badge">
                                        {upcomingTask.status}
                                    </span>
                                    <h2 className="appointment-title">{upcomingTask.title}</h2>
                                    <p className="appointment-doctor">Routine check-up with {upcomingTask.doctor}</p>
                                </div>
                                <p className="appointment-days-left">{upcomingTask.daysLeft}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="info-detail-row">
                                    <div className="info-detail-icon">
                                        <CalendarPlus size={20} />
                                    </div>
                                    <div>
                                        <p className="info-detail-label">Date</p>
                                        <p className="info-detail-value">{upcomingTask.date}</p>
                                    </div>
                                </div>

                                <div className="info-detail-row">
                                    <div className="info-detail-icon">
                                        <ClipboardList size={20} />
                                    </div>
                                    <div>
                                        <p className="info-detail-label">Time</p>
                                        <p className="info-detail-value">{upcomingTask.time}</p>
                                    </div>
                                </div>

                                <div className="info-detail-row">
                                    <div className="info-detail-icon">
                                        <ShieldCheck size={20} />
                                    </div>
                                    <div>
                                        <p className="info-detail-label">Location</p>
                                        <p className="info-detail-value">{upcomingTask.location}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="appointment-actions">
                                <button className="btn-primary-sm">
                                    Manage
                                </button>
                                <button className="btn-secondary">
                                    Reschedule
                                </button>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </PageTransition>
    );
}