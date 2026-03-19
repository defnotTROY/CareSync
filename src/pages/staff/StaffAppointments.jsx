import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, UserCheck, Users, CalendarDays,
    CreditCard, FileText, Bell, LogOut, ChevronLeft,
    ChevronRight, Plus, Clock, Filter, MoreHorizontal,
    Settings, UserPlus, Loader2
} from 'lucide-react';
import { supabase } from '../../supabaseClient';
import PageTransition from "../../components/layout/PageTransition.jsx";
import '../../styles/staff-portal.css';
import './StaffAppointments.css';

export default function StaffAppointments() {
    const location = useLocation();
    const navigate = useNavigate();
    const today = new Date();

    // --- STATES ---
    const [selectedDate, setSelectedDate] = useState(today.getDate());
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [staffName, setStaffName] = useState("");

    useEffect(() => {
        const controller = new AbortController();

        const init = async () => {
            await fetchStaffInfo(controller.signal);
            await fetchRealAppointments(controller.signal);
        };

        init();
        return () => controller.abort();
    }, [selectedDate]); // Re-fetch when user clicks a different day

    // 1. Fetch Staff Identity
    async function fetchStaffInfo(signal) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', user.id)
                .single()
                .abortSignal(signal);
            setStaffName(profile?.full_name || "Staff Member");
        }
    }

    // 2. Fetch Helper for Names
    async function getProfilesForAppointments(apts, signal) {
        if (!apts || apts.length === 0) return [];
        const userIds = [...new Set(apts.map(a => a.user_id).filter(id => !!id))];
        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name')
            .in('id', userIds)
            .abortSignal(signal);
        return profiles || [];
    }

    // 3. Fetch Real Appointments for Selected Day
    async function fetchRealAppointments(signal) {
        try {
            setLoading(true);

            // Construct the date string for filtering (YYYY-MM-DD)
            // Note: Update '2026-03' if you want a dynamic month/year picker later
            const dayString = `2026-03-${String(selectedDate).padStart(2, '0')}`;

            const { data: apts, error } = await supabase
                .from('appointments')
                .select('*')
                .eq('appointment_date', dayString)
                .order('created_at', { ascending: true }) // You can add a 'time' column later
                .abortSignal(signal);

            if (error) throw error;

            const profiles = await getProfilesForAppointments(apts, signal);

            const merged = (apts || []).map(apt => ({
                ...apt,
                profiles: profiles.find(p => String(p.id) === String(apt.user_id)) || { full_name: "Patient" }
            }));

            setAppointments(merged);
        } catch (err) {
            if (err.name !== 'AbortError') console.error("Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut();
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
                            <div className="staff-brand-icon">M</div>
                            <div className="staff-brand-text">
                                <span className="staff-brand-name">CareSync</span>
                                <span className="staff-brand-sub">Staff Terminal</span>
                            </div>
                        </div>

                        <nav className="staff-nav">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className={`staff-nav-link ${location.pathname === item.path ? 'staff-nav-link--active' : ''}`}
                                >
                                    <item.icon size={20} className={location.pathname === item.path ? 'staff-nav-icon--active' : 'staff-nav-icon'} />
                                    <span className="staff-nav-label">{item.name}</span>
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div className="staff-sidebar-bottom">
                        <div className="staff-user-section">
                            <div className="staff-user-info">
                                <div className="staff-user-avatar">{staffName ? staffName.charAt(0) : 'S'}</div>
                                <div className="flex flex-col">
                                    <span className="staff-user-name truncate w-24">{staffName || "Loading..."}</span>
                                    <span className="staff-user-role">Admin</span>
                                </div>
                            </div>
                            <button onClick={handleLogout} className="staff-logout-btn"><LogOut size={18} /></button>
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
                            <button className="staff-btn-filter"><Filter size={16} /> Filter</button>
                            <button className="staff-btn-primary"><Plus size={16} /> New Appt</button>
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
                                    You have {appointments.length} appointments scheduled for this date.
                                </p>
                            </div>
                        </div>

                        {/* RIGHT: DETAILED AGENDA */}
                        <div className="col-span-8 space-y-6">
                            <div className="flex justify-between items-center px-4">
                                <h3 className="staff-section-label">March {selectedDate}, 2026</h3>
                                <div className="appt-timezone">
                                    <Clock size={12} className="text-emerald-500" /> Time Zone: PST
                                </div>
                            </div>

                            <div className="space-y-4">
                                {loading ? (
                                    <div className="flex flex-col items-center py-20 text-slate-400">
                                        <Loader2 className="animate-spin mb-2" />
                                        <p>Fetching schedules...</p>
                                    </div>
                                ) : appointments.length > 0 ? (
                                    appointments.map((appt) => (
                                        <div key={appt.id} className="appt-agenda-card group">
                                            <div className="flex items-center gap-8">
                                                <div className="text-center w-20">
                                                    {/* Using created_at as a fallback for time if no time column exists */}
                                                    <p className="appt-time-value">
                                                        {new Date(appt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).split(' ')[0]}
                                                    </p>
                                                    <p className="appt-time-period">
                                                        {new Date(appt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).split(' ')[1]}
                                                    </p>
                                                </div>
                                                <div className="appt-divider" />
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-3">
                                                        <h4 className="appt-patient-name">{appt.profiles?.full_name}</h4>
                                                        <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${appt.status === 'CONFIRMED' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' :
                                                                appt.status === 'PENDING' ? 'bg-orange-400 text-white shadow-lg shadow-orange-500/20' : 'bg-slate-100 text-slate-500'
                                                            }`}>
                                                            {appt.status}
                                                        </span>
                                                    </div>
                                                    <p className="appt-service-info">{appt.purpose} • <span className="text-slate-400 font-medium">#{appt.id.slice(0, 8)}</span></p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <button className="appt-checkin-btn">Check-in</button>
                                                <button className="staff-btn-icon"><MoreHorizontal size={18} /></button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                                        <CalendarDays size={48} className="mx-auto text-slate-200 mb-4" />
                                        <p className="text-slate-400 font-medium">No appointments for this date.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </PageTransition>
    );
}