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
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed
    const [selectedDate, setSelectedDate] = useState(today.getDate());
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [staffName, setStaffName] = useState("");

    // --- CALENDAR HELPERS ---
    const MONTH_NAMES = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0=Sun

    const goToPrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(y => y - 1);
        } else {
            setCurrentMonth(m => m - 1);
        }
        setSelectedDate(1);
    };

    const goToNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(y => y + 1);
        } else {
            setCurrentMonth(m => m + 1);
        }
        setSelectedDate(1);
    };

    useEffect(() => {
        const controller = new AbortController();

        const init = async () => {
            await fetchStaffInfo(controller.signal);
            await fetchRealAppointments(controller.signal);
        };

        init();
        return () => controller.abort();
    }, [selectedDate, currentMonth, currentYear]); // Re-fetch when user clicks a different day or navigates months

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


    // 2. Fetch Real Appointments for Selected Day
    async function fetchRealAppointments(signal) {
        try {
            setLoading(true);

            // Construct the date string for filtering (YYYY-MM-DD)
            const month = String(currentMonth + 1).padStart(2, '0');
            const dayString = `${currentYear}-${month}-${String(selectedDate).padStart(2, '0')}`;

            const { data: apts, error } = await supabase
                .from('appointments')
                .select('*, profiles:user_id (id, first_name, last_name)')
                .eq('appointment_date', dayString)
                .order('appointment_time', { ascending: true })
                .abortSignal(signal);

            if (error) throw error;

            setAppointments(apts || []);
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
                            <div className="staff-brand-icon"><img src="/mjylogo.png" alt="CareSync Logo" className="w-10 h-10 object-contain" /></div>
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
                            <h1 className="staff-page-title">Appointments</h1>
                            <p className="staff-page-subtitle">Review Your Clinical Bookings</p>
                        </div>
                        <div className="flex gap-3">

                            <button className="staff-btn-primary"><Plus size={0} /> New Appt</button>
                        </div>
                    </div>

                    <div className="staff-grid-12-lg">
                        {/* LEFT: MINI CALENDAR */}
                        <div className="col-span-4 space-y-6">
                            <div className="appt-calendar-card">
                                <div className="flex justify-between items-center">
                                    <h3 className="appt-calendar-title">{MONTH_NAMES[currentMonth]} {currentYear}</h3>
                                    <div className="flex gap-2">
                                        <button className="appt-calendar-nav-btn" onClick={goToPrevMonth}><ChevronLeft size={18} /></button>
                                        <button className="appt-calendar-nav-btn" onClick={goToNextMonth}><ChevronRight size={18} /></button>
                                    </div>
                                </div>
                                <div className="appt-calendar-day-labels">
                                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => <div key={day}>{day}</div>)}
                                </div>
                                <div className="appt-calendar-grid">
                                    {/* Empty cells for days before the 1st */}
                                    {[...Array(firstDayOfMonth)].map((_, i) => (
                                        <div key={`empty-${i}`} />
                                    ))}
                                    {[...Array(daysInCurrentMonth)].map((_, i) => (
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
                                <h3 className="staff-section-label">{MONTH_NAMES[currentMonth]} {selectedDate}, {currentYear}</h3>
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
                                                    <p className="appt-time-value">
                                                        {appt.appointment_time?.split(' ')[0] ?? '--:--'}
                                                    </p>
                                                    <p className="appt-time-period">
                                                        {appt.appointment_time?.split(' ')[1] ?? ''}
                                                    </p>
                                                </div>
                                                <div className="appt-divider" />
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-3">
                                                        <h4 className="appt-patient-name">
                                                            {appt.profiles
                                                                ? `${appt.profiles.first_name || ''} ${appt.profiles.last_name || ''}`.trim() || 'Unknown'
                                                                : 'Unknown'}
                                                        </h4>
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
                                                <button className="appt-checkin-btn" onClick={() => navigate('/staff/check-in')}>Check-in</button>
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