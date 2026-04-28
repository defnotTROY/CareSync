import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, UserCheck, Users, CalendarDays,
    CreditCard, FileText, Bell, LogOut, TrendingUp,
    Clock, CheckCircle2, AlertCircle, Settings, UserPlus, Loader2, X,
    Calendar, User, FileSearch, Check
} from 'lucide-react';
import { supabase } from '../../supabaseClient';
import PageTransition from "../../components/layout/PageTransition.jsx";
import '../../styles/staff-portal.css';
import './StaffDashboard.css';

export default function StaffDashboard() {
    const location = useLocation();
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    // --- STATES ---
    const [staffName, setStaffName] = useState("Staff");
    const [loading, setLoading] = useState(true);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [statsData, setStatsData] = useState({ checkedIn: 0, pendingPayments: 0, pendingCount: 0 });
    const [recentActivity, setRecentActivity] = useState([]);

    // Modal State
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const controller = new AbortController();
        const loadInitialData = async () => {
            try {
                await fetchStaffData(controller.signal);
                await fetchNotifications(controller.signal);
            } catch (err) {
                if (err.name !== 'AbortError') console.error("Load Error:", err);
            }
        };

        loadInitialData();

        const channel = supabase
            .channel('staff-notifications')
            .on('postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'appointments' },
                (payload) => {
                    const status = payload.new.status?.toUpperCase();
                    if (status === 'PENDING') {
                        setTimeout(() => {
                            fetchNotifications();
                            fetchStaffData();
                        }, 500);
                    }
                }
            )
            .subscribe();

        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            controller.abort();
            supabase.removeChannel(channel);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // --- LOGIC FUNCTIONS ---

    async function getProfilesForAppointments(appointments, signal) {
        if (!appointments || appointments.length === 0) return [];
        const userIds = [...new Set(appointments.map(a => a.user_id).filter(id => !!id))];

        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('id, full_name')
            .in('id', userIds)
            .abortSignal(signal);

        if (error) {
            console.error("DATABASE REJECTED PROFILE FETCH:", error.message);
            return [];
        }

        // THIS IS THE SMOKING GUN:
        console.log("DATA RETURNED FROM PROFILES TABLE:", profiles);
        return profiles || [];
    }

    async function fetchNotifications(signal) {
        try {
            const { data: appointments, error } = await supabase
                .from('appointments')
                .select('*')
                .eq('status', 'PENDING')
                .order('created_at', { ascending: false })
                .abortSignal(signal);

            if (error) throw error;

            const profiles = await getProfilesForAppointments(appointments, signal);

            const merged = (appointments || []).map(apt => {
                // FORCE TO STRING TO ENSURE MATCH
                const matchedProfile = profiles.find(p =>
                    String(p.id).toLowerCase() === String(apt.user_id).toLowerCase()
                );
                return {
                    ...apt,
                    profiles: matchedProfile || { full_name: "Unregistered Patient" }
                };
            });

            setNotifications(merged);
        } catch (err) {
            if (err.name !== 'AbortError') console.error("Notification Error:", err.message);
        }
    }

    async function handleConfirm(id) {
        try {
            setIsProcessing(true);
            const { error } = await supabase
                .from('appointments')
                .update({ status: 'CONFIRMED' })
                .eq('id', id);

            if (!error) {
                setSelectedAppointment(null);
                await fetchNotifications();
                await fetchStaffData();
            }
        } finally {
            setIsProcessing(false);
        }
    }

    async function fetchStaffData(signal) {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single().abortSignal(signal);
                setStaffName(profile?.full_name || "Staff Member");
            }

            const { data: allApts } = await supabase.from('appointments').select('status, amount').abortSignal(signal);
            if (allApts) {
                const confirmed = allApts.filter(a => a.status === 'CONFIRMED').length;
                const pendingApts = allApts.filter(a => a.status === 'PENDING');
                const pendingSum = pendingApts.reduce((sum, item) => sum + (item.amount || 0), 0);
                setStatsData({ checkedIn: confirmed, pendingPayments: pendingSum, pendingCount: pendingApts.length });
            }

            const { data: latestApts } = await supabase.from('appointments').select('*').order('created_at', { ascending: false }).limit(4).abortSignal(signal);
            const latestProfiles = await getProfilesForAppointments(latestApts, signal);

            const mergedActivity = (latestApts || []).map(apt => {
                const matchedProfile = latestProfiles.find(p =>
                    String(p.id).toLowerCase() === String(apt.user_id).toLowerCase()
                );
                return {
                    ...apt,
                    profiles: matchedProfile || { full_name: "Patient" }
                };
            });
            setRecentActivity(mergedActivity);
        } catch (err) {
            if (err.name !== 'AbortError') console.error("Dashboard Error:", err);
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

    const stats = [
        { label: 'Confirmed Today', value: statsData.checkedIn, change: 'Live', icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Avg. Wait Time', value: '14m', change: '-2m', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Pending Revenue', value: `₱${statsData.pendingPayments.toLocaleString()}`, change: `${statsData.pendingCount} Cases`, icon: CreditCard, color: 'text-orange-600', bg: 'bg-orange-50' },
        { label: 'System Load', value: '84%', change: 'High Load', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
    ];

    return (
        <PageTransition>
            <div className="staff-layout">
                {/* --- SIDEBAR --- */}
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
                                <Link key={item.name} to={item.path} className={`staff-nav-link ${location.pathname === item.path ? 'staff-nav-link--active' : ''}`}>
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
                                <div className="flex flex-col overflow-hidden">
                                    <span className="staff-user-name truncate w-20">{loading ? "..." : staffName}</span>
                                    <span className="staff-user-role">Admin</span>
                                </div>
                            </div>
                            <button onClick={handleLogout} className="staff-logout-btn"><LogOut size={18} /></button>
                        </div>
                    </div>
                </aside>

                <main className="staff-main">
                    <header className="staff-header relative">
                        <div className="staff-header-info">
                            <h1 className="staff-page-title-sm">Clinic Overview</h1>
                            <p className="dashboard-date">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                        </div>

                        <div className="relative" ref={dropdownRef}>
                            <button
                                className={`staff-bell-btn ${showNotifications ? 'bg-slate-100' : ''}`}
                                onClick={() => setShowNotifications(!showNotifications)}
                            >
                                <Bell size={20} />
                                {notifications.length > 0 && <div className="staff-bell-dot" />}
                            </button>

                            {showNotifications && (
                                <div className="notification-dropdown">
                                    <div className="notification-header">
                                        <h3 className="font-bold text-sm text-slate-400 uppercase tracking-widest">Notifications</h3>
                                        <span className="notification-badge">{notifications.length} New</span>
                                    </div>
                                    <div className="notification-scroll">
                                        {notifications.length > 0 ? (
                                            notifications.map((notif) => (
                                                <div key={notif.id} className="notification-item">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <p className="notification-user-name">{notif.profiles?.full_name || "Patient"}</p>
                                                        <p className="text-[10px] text-slate-400">{notif.appointment_date}</p>
                                                    </div>
                                                    <p className="notification-purpose mb-3">Requested: {notif.purpose}</p>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedAppointment(notif);
                                                            setShowNotifications(false);
                                                        }}
                                                        className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] py-2 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        <FileSearch size={14} />
                                                        View Details
                                                    </button>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center">
                                                <div className="notif-empty-icon">
                                                    <CheckCircle2 size={24} className="text-slate-300" />
                                                </div>
                                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">All caught up!</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </header>

                    <div className="dashboard-stat-grid">
                        {stats.map((stat, idx) => (
                            <div key={idx} className="staff-stat-card">
                                <div className={`staff-stat-icon ${stat.bg} ${stat.color}`}><stat.icon size={24} /></div>
                                <div>
                                    <p className="staff-stat-label">{stat.label}</p>
                                    <div className="staff-stat-row">
                                        <h3 className="staff-stat-value">{loading ? "..." : stat.value}</h3>
                                        <span className="dashboard-stat-change text-slate-400">{stat.change}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="staff-grid-12">
                        <div className="dashboard-flow-card">
                            <div className="staff-section-border">
                                <h3 className="staff-section-title">Live Flow Tracking</h3>
                                <button className="staff-btn-subtle" onClick={fetchStaffData}>Refresh Flow</button>
                            </div>
                            <div className="space-y-4">
                                {loading ? (
                                    <div className="flex justify-center py-10"><Loader2 className="animate-spin text-slate-300" /></div>
                                ) : (
                                    recentActivity.map((item, i) => (
                                        <div key={i} className="dashboard-flow-item group">
                                            <div className="flex items-center gap-4">
                                                <div className={`dashboard-flow-icon ${item.status === 'PENDING' ? 'text-amber-500' : 'text-emerald-500'}`}>
                                                    {item.status === 'PENDING' ? <AlertCircle size={22} /> : <CheckCircle2 size={22} />}
                                                </div>
                                                <div>
                                                    <p className="dashboard-flow-name">{item.profiles?.full_name || "Patient"}</p>
                                                    <p className="dashboard-flow-action">{item.purpose} - <span className="font-bold">{item.status}</span></p>
                                                </div>
                                            </div>
                                            <span className="dashboard-flow-time text-xs text-slate-400">{new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </main>

                {/* --- APPOINTMENT DETAIL MODAL --- */}
                {selectedAppointment && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-slate-900">Appointment Details</h2>
                                <button
                                    onClick={() => setSelectedAppointment(null)}
                                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                                >
                                    <X size={20} className="text-slate-400" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Patient Summary */}
                                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <div className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center text-xl font-bold">
                                        {selectedAppointment.profiles?.full_name?.charAt(0) || 'P'}
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-0.5">Patient Name</p>
                                        <p className="font-bold text-lg text-slate-900 leading-tight">
                                            {selectedAppointment.profiles?.full_name || "Patient Name Not Found"}
                                        </p>
                                        <p className="text-[10px] text-slate-400 mt-1 font-mono">
                                            UID: {selectedAppointment.user_id?.slice(0, 12)}...
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1">
                                            <Calendar size={12} /> Date
                                        </p>
                                        <p className="text-sm font-medium text-slate-700">{selectedAppointment.appointment_date}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1">
                                            <AlertCircle size={12} /> Status
                                        </p>
                                        <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] rounded-md font-bold uppercase">
                                            {selectedAppointment.status}
                                        </span>
                                    </div>
                                    <div className="col-span-2 space-y-1">
                                        <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1">
                                            <FileText size={12} /> Purpose
                                        </p>
                                        <p className="text-sm font-medium text-slate-700 bg-slate-50 p-3 rounded-xl">
                                            {selectedAppointment.purpose}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-slate-50 flex gap-3">
                                <button
                                    onClick={() => setSelectedAppointment(null)}
                                    className="flex-1 bg-white border border-slate-200 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-100 transition-colors"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => handleConfirm(selectedAppointment.id)}
                                    disabled={isProcessing}
                                    className="flex-1 bg-black text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isProcessing ? (
                                        <Loader2 size={20} className="animate-spin" />
                                    ) : (
                                        <>
                                            <Check size={0} />
                                            Confirm Appointment
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </PageTransition>
    );
}