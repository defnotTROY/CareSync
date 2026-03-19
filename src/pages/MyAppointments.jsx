import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, CalendarPlus, ClipboardList, Settings,
    LogOut, ShieldCheck, User, Search, Bell, Plus
} from 'lucide-react';
import PageTransition from "../components/layout/PageTransition.jsx";
import '../styles/client-portal.css';
import './MyAppointments.css';

export default function MyAppointments() {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('Upcoming Visits (1)');

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { name: 'Book Appointment', icon: CalendarPlus, path: '/book' },
        { name: 'My Appointments', icon: ClipboardList, path: '/appointments' },
    ];

    const tabs = ['Upcoming Visits (1)', 'Past History', 'Cancelled'];

    const appointments = [
        {
            doctor: "Dr. Maria Santos, MD",
            specialty: "General Physician",
            date: "Oct 24, 2026",
            time: "10:00 AM - 11:30 AM",
            status: "CONFIRMED"
        }
    ];

    return (
        <PageTransition>
            <div className="client-layout">

                {/* SIDE NAVIGATION */}
                <aside className="client-sidebar">
                    <div className="space-y-10">
                        <Link to="/" className="flex items-center gap-3 px-2 group">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 overflow-hidden shrink-0">
                                <img
                                    src="/mjylogo.png"
                                    alt="M"
                                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                />
                            </div>

                            <div className="flex flex-col text-white font-black uppercase tracking-tight leading-none">
                                <span className="text-lg tracking-tighter">CareSync</span>
                                <span className="text-slate-500 text-[9px] tracking-[0.2em] mt-1 font-black">
                                    Client Portal
                                </span>
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
                            <Link to="/login" className="sidebar-logout-btn inline-flex items-center justify-center transition-all hover:text-red-400">
                                <LogOut size={18} />
                            </Link>
                        </div>
                    </div>
                </aside>

                {/* MAIN CONTENT AREA */}
                <main className="flex-1 bg-white">
                    {/* Top Bar with Search */}
                    <div className="top-bar">
                        <h2 className="top-bar-title">My Appointments</h2>
                        <div className="flex items-center gap-4">
                            <div className="appointments-topbar-search">
                                <Search className="appointments-search-icon" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search appointments..."
                                    className="search-input"
                                />
                            </div>
                            <button className="btn-icon">
                                <Bell size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="appointments-content">
                        {/* Section Title & Action */}
                        <div className="appointments-header">
                            <div className="space-y-2">
                                <h1 className="page-title">Appointments</h1>
                                <p className="page-subtitle">Manage your upcoming and past medical consultations.</p>
                            </div>
                            <Link to="/book" className="appointments-new-btn">
                                <Plus size={16} /> Book New Appointment
                            </Link>
                        </div>

                        {/* Tabs Navigation */}
                        <div className="tab-container">
                            {tabs.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`tab-item ${activeTab === tab ? 'tab-item--active' : ''}`}
                                >
                                    {tab}
                                    {activeTab === tab && (
                                        <div className="tab-indicator" />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Appointments List */}
                        <div className="space-y-6">
                            {appointments.map((apt, idx) => (
                                <div key={idx} className="appointment-card">
                                    <div className="appointment-card-header">
                                        <div className="space-y-1">
                                            <span className="info-chip mb-2">
                                                {apt.status}
                                            </span>
                                            <h3 className="appointment-card-doctor">{apt.doctor}</h3>
                                            <p className="appointment-card-specialty">{apt.specialty}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="appointment-card-date">{apt.date}</p>
                                            <p className="appointment-card-time">{apt.time}</p>
                                        </div>
                                    </div>

                                    <div className="divider" />

                                    <div className="appointment-card-actions">
                                        <div className="flex gap-3">
                                            <button className="btn-primary-sm">
                                                View Details
                                            </button>
                                            <button className="btn-secondary-sm">
                                                Reschedule
                                            </button>
                                        </div>
                                        <button className="cancel-link">
                                            Cancel Visit
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </PageTransition>
    );
}