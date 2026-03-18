import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, UserCheck, Users, CalendarDays,
    CreditCard, FileText, Bell, LogOut, ChevronLeft,
    ChevronRight, Plus, Clock, Filter, MoreHorizontal,
    Settings, UserPlus
} from 'lucide-react';
import PageTransition from "../../components/layout/PageTransition.jsx";
import '../../styles/staff-portal.css';
import './StaffAppointments.css';

export default function StaffAppointments() {
    const location = useLocation();
    const navigate = useNavigate();
    const today = new Date();
    const [selectedDate, setSelectedDate] = useState(today.getDate());

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

    const appointments = [
        { id: 1, time: '08:00 AM', patient: 'Marcus Aurelius', service: 'General Checkup', status: 'Confirmed', type: 'Student' },
        { id: 2, time: '09:30 AM', patient: 'Elena Lamberti', service: 'Cardiology Scan', status: 'Pending', type: 'Professional' },
        { id: 3, time: '11:00 AM', patient: 'Julius Caesar', service: 'Physical Exam', status: 'Confirmed', type: 'Conversion' },
        { id: 4, time: '01:30 PM', patient: 'Livilla Drusilla', service: 'Blood Work', status: 'Arrived', type: 'Non-Professional' },
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

                    {/* HEADER */}
                    <div className="staff-header">
                        <div className="staff-header-info">
                            <h1 className="staff-page-title">Schedules</h1>
                            <p className="staff-page-subtitle">Manage daily clinical bookings</p>
                        </div>
                        <div className="flex gap-3">
                            <button className="staff-btn-filter">
                                <Filter size={16} /> Filter
                            </button>
                            <button className="staff-btn-primary">
                                <Plus size={16} /> New Appt
                            </button>
                        </div>
                    </div>

                    <div className="staff-grid-12-lg">

                        {/* LEFT: MINI CALENDAR */}
                        <div className="col-span-4 space-y-6">
                            <div className="appt-calendar-card">
                                <div className="flex justify-between items-center">
                                    <h3 className="appt-calendar-title">March 2026</h3>
                                    <div className="flex gap-2">
                                        <button className="appt-calendar-nav-btn"><ChevronLeft size={18} /></button>
                                        <button className="appt-calendar-nav-btn"><ChevronRight size={18} /></button>
                                    </div>
                                </div>
                                <div className="appt-calendar-day-labels">
                                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => <div key={day}>{day}</div>)}
                                </div>
                                <div className="appt-calendar-grid">
                                    {[...Array(31)].map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setSelectedDate(i + 1)}
                                            className={`appt-calendar-day ${selectedDate === i + 1 ? 'appt-calendar-day--active' : ''}`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="appt-insight">
                                <h4 className="appt-insight-label">Daily Insight</h4>
                                <p className="appt-insight-text">
                                    You have 14 appointments today. 8:00 AM is your busiest hour.
                                </p>
                            </div>
                        </div>

                        {/* RIGHT: DETAILED AGENDA */}
                        <div className="col-span-8 space-y-6">
                            <div className="flex justify-between items-center px-4">
                                <h3 className="staff-section-label">Wednesday, March {selectedDate}</h3>
                                <div className="appt-timezone">
                                    <Clock size={12} className="text-emerald-500" /> Time Zone: PST
                                </div>
                            </div>

                            <div className="space-y-4">
                                {appointments.map((appt) => (
                                    <div key={appt.id} className="appt-agenda-card group">
                                        <div className="flex items-center gap-8">
                                            <div className="text-center w-20">
                                                <p className="appt-time-value">{appt.time.split(' ')[0]}</p>
                                                <p className="appt-time-period">{appt.time.split(' ')[1]}</p>
                                            </div>
                                            <div className="appt-divider" />
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-3">
                                                    <h4 className="appt-patient-name">{appt.patient}</h4>
                                                    <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${appt.status === 'Arrived' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' :
                                                        appt.status === 'Pending' ? 'bg-orange-400 text-white shadow-lg shadow-orange-500/20' : 'bg-slate-100 text-slate-500'
                                                        }`}>
                                                        {appt.status}
                                                    </span>
                                                </div>
                                                <p className="appt-service-info">{appt.service} • <span className="text-slate-300 font-medium">{appt.type}</span></p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <button className="appt-checkin-btn">Check-in</button>
                                            <button className="staff-btn-icon"><MoreHorizontal size={18} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </main>
            </div>
        </PageTransition>
    );
}