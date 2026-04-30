import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Users, ClipboardList, FileText,
    Settings, LogOut, Bell, ArrowRight,
    User, Loader2
} from 'lucide-react';
import { supabase } from '../../lib/supabase.js';
import { useAuth } from '../../lib/AuthContext.jsx';
import PageTransition from "../../components/layout/PageTransition.jsx";
import '../../styles/staff-portal.css';

export default function DoctorDashboard() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, signOut } = useAuth(); // Assuming signOut is available in your AuthContext

    const [loading, setLoading] = useState(true);
    const [doctorName, setDoctorName] = useState('Doctor');
    const [todayStats, setTodayStats] = useState({ appointments: 0, queue: 0 });
    const [appointments, setAppointments] = useState([]);
    const [currentPatient, setCurrentPatient] = useState(null);

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/doctor/dashboard' },
        { name: 'Client Queue', icon: Users, path: '/doctor/queue' },
        { name: 'Consultation', icon: ClipboardList, path: '/doctor/consultation' },
        { name: 'Client Record', icon: FileText, path: '/doctor/records' },
    ];

    useEffect(() => {
        if (user) {
            loadDashboardData();
        } else {
            setLoading(false);
        }
    }, [user]);

    async function loadDashboardData() {
        try {
            setLoading(true);

            // 1. Fetch doctor profile
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', user.id)
                .single();

            if (profileError) throw profileError;
            if (profile?.full_name) {
                setDoctorName(profile.full_name.split(' ')[0]);
            }

            // 2. Setup Date Range (Strictly Today)
            const now = new Date();
            const todayStart = new Date(now.setHours(0, 0, 0, 0)).toISOString();
            const todayEnd = new Date(now.setHours(23, 59, 59, 999)).toISOString();

            // 3. Fetch today's appointments with profile join
            const { data: appts, error: apptError } = await supabase
                .from('appointments')
                .select(`
                    *,
                    profiles:user_id (full_name)
                `)
                .gte('appointment_date', todayStart)
                .lte('appointment_date', todayEnd)
                .order('appointment_time', { ascending: true });

            if (apptError) throw apptError;

            if (appts) {
                setAppointments(appts);

                // Filter logic
                const waiting = appts.filter(a => a.status === 'CHECKED_IN' || a.status === 'PENDING');
                setTodayStats({
                    appointments: appts.length,
                    queue: waiting.length
                });

                // Find the first patient who is actually checked in
                const checkedIn = appts.find(a => a.status === 'CHECKED_IN');
                setCurrentPatient(checkedIn || null);
            }
        } catch (err) {
            console.error('Dashboard load error:', err.message);
        } finally {
            setLoading(false);
        }
    }

    const handleLogout = async () => {
        try {
            if (signOut) {
                await signOut();
            }
            navigate('/login');
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    // Helper functions (remain same but added safety checks)
    const formatDate = (date) => {
        return new Intl.DateTimeFormat('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        }).format(date);
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return '--:--';
        const [hours, minutes] = timeStr.split(':');
        const date = new Date();
        date.setHours(parseInt(hours), parseInt(minutes));
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    const getStatusColor = (status) => {
        const s = status?.toUpperCase();
        if (s === 'CHECKED_IN') return 'bg-emerald-500 text-white'; // High visibility for checked in
        if (s === 'PENDING') return 'bg-amber-100 text-amber-700';
        if (s === 'COMPLETED') return 'bg-slate-100 text-slate-500';
        return 'bg-slate-100 text-slate-400';
    };

    return (
        <PageTransition>
            <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
                {/* SIDEBAR */}
                <aside className="w-72 bg-black flex flex-col justify-between py-10 px-6 shrink-0 h-screen sticky top-0">
                    <div className="space-y-10">
                        <div className="flex items-center gap-3 px-2">
                            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center font-bold text-white text-xl">M</div>
                            <div className="flex flex-col text-white font-black uppercase tracking-tight leading-none">
                                <span className="text-lg">CareSync</span>
                                <span className="text-slate-500 text-[10px] tracking-widest mt-1">Doctor Terminal</span>
                            </div>
                        </div>

                        <nav className="space-y-1">
                            {navItems.map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link key={item.name} to={item.path} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${isActive ? 'bg-white text-black font-bold shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                                        <item.icon size={20} className={isActive ? 'text-black' : 'text-slate-400'} />
                                        <span className="text-sm">{item.name}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="pt-6 border-t border-white/10 space-y-2 px-2">
                        <Link to="/doctor/settings" className="flex items-center gap-4 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                            <Settings size={20} />
                            <span className="text-sm">Settings</span>
                        </Link>
                        <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-slate-800 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                                    {doctorName ? doctorName[0].toUpperCase() : 'D'}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-white text-[11px] font-bold uppercase leading-none">{doctorName}</span>
                                    <span className="text-slate-500 text-[8px] font-bold uppercase tracking-widest mt-1">Doctor</span>
                                </div>
                            </div>
                            <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-red-400 transition-all">
                                <LogOut size={18} />
                            </button>
                        </div>
                    </div>
                </aside>

                {/* MAIN CONTENT */}
                <main className="flex-1 p-12 space-y-10 overflow-y-auto">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <h1 className="staff-page-title">Welcome, Dr. {doctorName}</h1>
                            <p className="text-slate-500 font-medium text-xs uppercase tracking-widest">{formatDate(new Date())}</p>
                        </div>
                        <button className="p-3 bg-white border border-slate-200 rounded-full text-slate-400 shadow-sm hover:bg-slate-50 transition-colors">
                            <Bell size={20} />
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-4">
                            <Loader2 className="animate-spin text-emerald-500" size={48} />
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Syncing Data...</p>
                        </div>
                    ) : (
                        <>
                            {/* TOP STATS */}
                            <div className="grid grid-cols-2 gap-8">
                                <div className="bg-white border border-slate-100 rounded-[2rem] p-8 flex justify-between items-center shadow-sm">
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Today's Total</p>
                                        <h2 className="text-6xl font-black">{todayStats.appointments}</h2>
                                    </div>
                                </div>
                                <div className="bg-white border border-slate-100 rounded-[2rem] p-8 flex justify-between items-center shadow-sm">
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">In Queue</p>
                                        <h2 className="text-6xl font-black text-emerald-600">{todayStats.queue}</h2>
                                    </div>
                                    <span className="text-slate-400 font-black text-sm">
                                        {todayStats.queue === 0 ? 'Clear' : 'Waiting'}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-12 gap-10">
                                {/* SCHEDULE */}
                                <div className="col-span-7 space-y-6">
                                    <h3 className="font-black uppercase text-sm tracking-widest px-4">Today's Schedule</h3>
                                    <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
                                        {appointments.length === 0 ? (
                                            <div className="p-12 text-center text-slate-400">
                                                <p className="text-sm font-bold uppercase tracking-widest">No appointments today</p>
                                            </div>
                                        ) : (
                                            appointments.map((appt) => (
                                                <div key={appt.id} className={`p-8 flex items-center justify-between border-b border-slate-50 last:border-0 ${currentPatient?.id === appt.id ? 'bg-emerald-50/30' : ''}`}>
                                                    <div className="flex items-center gap-8">
                                                        <div className="text-center w-16">
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{currentPatient?.id === appt.id ? 'ACTIVE' : 'TIME'}</p>
                                                            <p className="text-xl font-black">{formatTime(appt.appointment_time)}</p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <h4 className="font-black text-xl uppercase tracking-tight">{appt.profiles?.full_name || 'Patient'}</h4>
                                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{appt.appointment_type || 'General'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${getStatusColor(appt.status)}`}>
                                                            {appt.status?.replace('_', ' ') || 'SCHEDULED'}
                                                        </span>
                                                        <button
                                                            onClick={() => navigate('/doctor/consultation', { state: { appointment: appt } })}
                                                            className="p-3 bg-slate-900 text-white rounded-xl shadow-md hover:bg-emerald-500 transition-all"
                                                        >
                                                            <ArrowRight size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* CURRENT PATIENT PANEL */}
                                <div className="col-span-5 space-y-6">
                                    <h3 className="font-black uppercase text-sm tracking-widest px-4">Active Session</h3>
                                    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 space-y-10 shadow-sm relative overflow-hidden">
                                        {currentPatient ? (
                                            <>
                                                <div className="flex items-center gap-6">
                                                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                                                        <User size={32} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-2xl font-black uppercase tracking-tighter">{currentPatient.profiles?.full_name}</h4>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                            {currentPatient.appointment_type || 'General Consultation'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex items-start gap-4">
                                                    <Bell className="text-amber-500 mt-1" size={20} />
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase text-amber-600 tracking-widest mb-1">Status: Checked In</p>
                                                        <p className="text-[11px] font-medium text-amber-950 leading-tight">
                                                            This patient is present in the clinic and ready for their session.
                                                        </p>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => navigate('/doctor/consultation', { state: { appointment: currentPatient } })}
                                                    className="w-full py-5 bg-black text-white rounded-[1.5rem] font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-emerald-600 transition-all active:scale-[0.98]"
                                                >
                                                    Start Consultation
                                                </button>
                                            </>
                                        ) : (
                                            <div className="text-center py-12">
                                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-slate-200">
                                                    <User className="text-slate-200" size={40} />
                                                </div>
                                                <p className="text-sm font-bold text-slate-300 uppercase tracking-widest">No patient waiting</p>
                                                <p className="text-[10px] text-slate-400 mt-2 max-w-[200px] mx-auto uppercase font-medium">Next checked-in patient will appear here automatically.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </main>
            </div>
        </PageTransition>
    );
}