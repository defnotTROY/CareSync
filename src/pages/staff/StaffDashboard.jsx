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
import StaffSidebar from "../../components/layout/StaffSidebar.jsx";
import StaffHeader from "../../components/layout/StaffHeader.jsx";
import '../../styles/staff-portal.css';
import './StaffDashboard.css';

export default function StaffDashboard() {
    const location = useLocation();
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    // --- STATES ---
    const [staffName, setStaffName] = useState("Staff");
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setSidebarOpen] = useState(false);
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

        let query = supabase
            .from('profiles')
            .select('id, first_name, last_name')
            .in('id', userIds);

        if (signal) query = query.abortSignal(signal);

        const { data: profiles, error } = await query;

        if (error) {
            console.error("DATABASE REJECTED PROFILE FETCH:", error.message);
            return [];
        }

        // Map to include a computed full_name for display
        return (profiles || []).map(p => ({
            ...p,
            full_name: `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Patient'
        }));
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
                const { data: profile } = await supabase.from('profiles').select('first_name, last_name').eq('id', user.id).single();
                setStaffName(profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Staff Member' : 'Staff Member');
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
            <div className="flex min-h-screen bg-[#F8FAFC]">
                {/* --- SIDEBAR --- */}
                <StaffSidebar
                    isOpen={isSidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />

                <div className="flex-1 flex flex-col min-w-0 md:ml-20 lg:ml-72">
                    <StaffHeader
                        title="Clinic Overview"
                        onMenuClick={() => setSidebarOpen(true)}
                    />

                <main className="staff-main">
                    <header className="staff-header">
                        <div className="staff-header-info">
                            <h1 className="staff-page-title">Clinic Overview</h1>
                            <p className="dashboard-date">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
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

                </div>
            </div>
        </PageTransition>
    );
}