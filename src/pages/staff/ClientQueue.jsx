import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, UserCheck, Users, CalendarDays,
    CreditCard, FileText, Bell, LogOut, ArrowRight,
    CheckCircle2, AlertCircle, Settings, UserPlus, Loader2,
    Clock, RefreshCw, Wallet
} from 'lucide-react';
import { supabase } from '../../supabaseClient';
import PageTransition from "../../components/layout/PageTransition.jsx";
import '../../styles/staff-portal.css';
import './ClientQueue.css';

export default function ClientQueue() {
    const location = useLocation();
    const navigate = useNavigate();

    // --- STAFF IDENTITY ---
    const [staffName, setStaffName] = useState("Staff");
    const [staffLoading, setStaffLoading] = useState(true);

    // --- QUEUE DATA ---
    const [waitingQueue, setWaitingQueue] = useState([]); // ON_CASHIER
    const [servingNow, setServingNow] = useState([]);   // CHECKED_IN / IN_PROGRESS
    const [loading, setLoading] = useState(true);
    const [actioningId, setActioningId] = useState(null);

    // --- FETCH STAFF IDENTITY ---
    useEffect(() => {
        async function fetchStaffInfo() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('full_name')
                        .eq('id', user.id)
                        .single();
                    setStaffName(profile?.full_name || "Staff Member");
                }
            } catch (err) {
                console.error("Staff info error:", err);
            } finally {
                setStaffLoading(false);
            }
        }
        fetchStaffInfo();
    }, []);

    // --- FETCH QUEUE DATA (UPDATED FOR ON_CASHIER) ---
    async function fetchQueueData() {
        try {
            setLoading(true);

            // Fetch ON_CASHIER, CHECKED_IN, and IN_PROGRESS appointments
            const { data: appointments, error } = await supabase
                .from('appointments')
                .select('*')
                .in('status', ['ON_CASHIER', 'CHECKED_IN', 'IN_PROGRESS'])
                .order('created_at', { ascending: true });

            if (error) throw error;

            if (!appointments || appointments.length === 0) {
                setWaitingQueue([]);
                setServingNow([]);
                return;
            }

            const userIds = [...new Set(appointments.map(a => a.user_id).filter(Boolean))];
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, full_name')
                .in('id', userIds);

            const merged = appointments.map(apt => ({
                ...apt,
                profiles: (profiles || []).find(p => String(p.id) === String(apt.user_id)) || { full_name: "Unknown Patient" }
            }));

            // Logic: WaitingQueue are those paying (On Cashier)
            setWaitingQueue(merged.filter(a => a.status === 'ON_CASHIER'));
            // Serving/Active are those ready for doctor or currently with doctor
            setServingNow(merged.filter(a => a.status === 'CHECKED_IN' || a.status === 'IN_PROGRESS'));
        } catch (err) {
            console.error("Queue fetch error:", err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchQueueData();
        const channel = supabase
            .channel('queue-updates')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'appointments' },
                () => {
                    setTimeout(() => fetchQueueData(), 300);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    // --- MOVE TO DOCTOR (ON_CASHIER → CHECKED_IN) ---
    const handleMoveToDoctor = async (id) => {
        setActioningId(id);
        try {
            const { error } = await supabase
                .from('appointments')
                .update({ status: 'CHECKED_IN' })
                .eq('id', id);

            if (error) throw error;
            fetchQueueData(); // Refresh list
        } catch (err) {
            console.error("Movement error:", err.message);
        } finally {
            setActioningId(null);
        }
    };

    // --- MARK AS FINISHED (IN_PROGRESS → COMPLETED) ---
    const handleFinish = async (id) => {
        setActioningId(id);
        try {
            const { error } = await supabase
                .from('appointments')
                .update({ status: 'COMPLETED' })
                .eq('id', id);

            if (error) throw error;
            fetchQueueData();
        } catch (err) {
            console.error("Finish error:", err.message);
        } finally {
            setActioningId(null);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    const getWaitTime = (createdAt) => {
        const now = new Date();
        const created = new Date(createdAt);
        const diffMs = now - created;
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m`;
        return `${Math.floor(diffMins / 60)}h ${diffMins % 60}m`;
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
                        <div className="staff-user-section">
                            <div className="staff-user-info">
                                <div className="staff-user-avatar">{staffName ? staffName.charAt(0) : 'S'}</div>
                                <div className="flex flex-col overflow-hidden">
                                    <span className="staff-user-name truncate w-20">{staffLoading ? "..." : staffName}</span>
                                    <span className="staff-user-role">Staff</span>
                                </div>
                            </div>
                            <button onClick={handleLogout} className="staff-logout-btn" title="Logout"><LogOut size={18} /></button>
                        </div>
                    </div>
                </aside>

                <main className="staff-main">
                    <div className="staff-header-end">
                        <div className="space-y-2">
                            <h1 className="staff-page-title">Live Queue</h1>
                            <div className="queue-header-stats">
                                <span className="queue-active-count">
                                    <div className="staff-pulse-dot" />
                                    {loading ? "..." : waitingQueue.length + servingNow.length} Active
                                </span>
                                <span>•</span>
                                <span className="text-amber-500 font-bold">{waitingQueue.length} On Cashier</span>
                            </div>
                        </div>
                        <button onClick={fetchQueueData} className="staff-btn-filter"><RefreshCw size={16} /> Refresh</button>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32 text-slate-400">
                            <Loader2 size={40} className="animate-spin mb-4" />
                            <p className="text-sm font-medium">Loading queue...</p>
                        </div>
                    ) : (
                        <div className="staff-grid-12">
                            {/* ON CASHIER SECTION */}
                            <div className="col-span-8 space-y-6">
                                <h3 className="staff-section-label-px flex items-center gap-2">
                                    <Wallet size={16} className="text-amber-500" />
                                    On Cashier (Pending Payment)
                                    <span className="queue-section-count bg-amber-100 text-amber-600">{waitingQueue.length}</span>
                                </h3>
                                <div className="space-y-3">
                                    {waitingQueue.length > 0 ? (
                                        waitingQueue.map((patient) => (
                                            <div key={patient.id} className="queue-patient-card border-l-4 border-amber-400">
                                                <div className="flex items-center gap-6">
                                                    <div className="queue-patient-avatar bg-amber-100 text-amber-600">{patient.profiles.full_name.charAt(0)}</div>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="queue-patient-id">#{patient.id.slice(0, 8)}</span>
                                                            <h4 className="queue-patient-name">{patient.profiles.full_name}</h4>
                                                        </div>
                                                        <p className="queue-patient-service">Awaiting Settlement • {patient.purpose}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="queue-wait-badge"><Clock size={12} /> {getWaitTime(patient.created_at)}</div>
                                                    <button
                                                        onClick={() => handleMoveToDoctor(patient.id)}
                                                        disabled={actioningId === patient.id}
                                                        className="queue-call-btn bg-amber-500 hover:bg-amber-600 border-amber-600"
                                                    >
                                                        {actioningId === patient.id ? <Loader2 size={14} className="animate-spin" /> : <>Move to Doctor <ArrowRight size={14} /></>}
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="queue-empty-state">
                                            <p className="text-slate-400 font-bold">Cashier area is clear</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* DOCTOR HALLWAY / SERVING NOW */}
                            <div className="col-span-4 space-y-6">
                                <h3 className="staff-section-label-px">
                                    Doctor's Hallway
                                    <span className="queue-section-count">{servingNow.length}</span>
                                </h3>
                                {servingNow.length > 0 ? (
                                    servingNow.map((patient) => (
                                        <div key={patient.id} className={`queue-serving-card ${patient.status === 'IN_PROGRESS' ? 'border-emerald-500' : 'border-slate-200'}`}>
                                            <div className="flex justify-between items-center">
                                                <span className={`queue-serving-badge ${patient.status === 'IN_PROGRESS' ? 'bg-emerald-500' : 'bg-blue-500'}`}>
                                                    {patient.status === 'IN_PROGRESS' ? 'With Doctor' : 'Ready'}
                                                </span>
                                                <span className="queue-serving-room">{patient.appointment_time}</span>
                                            </div>
                                            <div>
                                                <h4 className="queue-serving-name">{patient.profiles.full_name}</h4>
                                                <p className="text-slate-500 text-[10px] font-bold uppercase">{patient.purpose}</p>
                                            </div>
                                            {patient.status === 'IN_PROGRESS' && (
                                                <button
                                                    onClick={() => handleFinish(patient.id)}
                                                    className="queue-finish-btn"
                                                >
                                                    {actioningId === patient.id ? <Loader2 size={14} className="animate-spin mx-auto" /> : "Mark as Finished"}
                                                </button>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="queue-serving-empty">
                                        <p className="text-slate-400 font-bold text-sm">Hallway is empty</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </PageTransition>
    );
}