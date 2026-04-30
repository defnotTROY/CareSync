import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Bell, ArrowRight, User, Loader2, Menu
} from 'lucide-react';
import { supabase } from '../../lib/supabase.js';
import { useAuth } from '../../lib/AuthContext.jsx';
import PageTransition from "../../components/layout/PageTransition.jsx";
import DoctorSidebar from "../../components/layout/DoctorSidebar.jsx";
import '../../styles/staff-portal.css';

export default function DoctorDashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();

    // Layout State
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    // Data States
    const [loading, setLoading] = useState(true);
    const [doctorName, setDoctorName] = useState('Doctor');
    const [todayStats, setTodayStats] = useState({ appointments: 0, queue: 0 });
    const [appointments, setAppointments] = useState([]);
    const [currentPatient, setCurrentPatient] = useState(null);

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

            // 1. Fetch doctor profile for the welcome message
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

    // Helper functions
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
        if (s === 'CHECKED_IN') return 'bg-emerald-500 text-white';
        if (s === 'PENDING') return 'bg-amber-100 text-amber-700';
        if (s === 'COMPLETED') return 'bg-slate-100 text-slate-500';
        return 'bg-slate-100 text-slate-400';
    };

    return (
        <PageTransition>
            <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">

                {/* INTEGRATED SIDEBAR */}
                <DoctorSidebar
                    isOpen={isSidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />

                {/* MAIN CONTENT CONTAINER (Added margin to push it past the fixed sidebar) */}
                <div className="flex-1 flex flex-col min-w-0 md:ml-20 lg:ml-72">
                    <main className="flex-1 p-6 lg:p-12 space-y-10 overflow-y-auto w-full min-w-0">

                        {/* Header */}
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-4">
                                {/* Mobile Sidebar Toggle */}
                                <button
                                    onClick={() => setSidebarOpen(true)}
                                    className="md:hidden p-2 -ml-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-black hover:border-black transition-colors"
                                >
                                    <Menu size={24} />
                                </button>

                                <div className="space-y-1">
                                    <h1 className="text-3xl lg:text-4xl font-black uppercase tracking-tighter leading-none italic">
                                        Welcome, Dr. {doctorName}
                                    </h1>
                                    <p className="text-slate-500 font-black text-[10px] uppercase tracking-widest mt-1">
                                        {formatDate(new Date())}
                                    </p>
                                </div>
                            </div>

                            <button className="p-3 bg-white border-2 border-slate-100 rounded-full text-slate-400 shadow-sm hover:bg-slate-50 hover:text-black hover:border-slate-200 transition-all">
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
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                                    <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 flex justify-between items-center shadow-sm">
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Today's Total</p>
                                            <h2 className="text-6xl font-black tracking-tighter">{todayStats.appointments}</h2>
                                        </div>
                                    </div>
                                    <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 flex justify-between items-center shadow-sm">
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">In Queue</p>
                                            <h2 className="text-6xl font-black tracking-tighter text-emerald-600">{todayStats.queue}</h2>
                                        </div>
                                        <span className="text-slate-400 font-black uppercase text-[10px] tracking-widest border-2 border-slate-100 px-4 py-2 rounded-xl">
                                            {todayStats.queue === 0 ? 'Clear' : 'Waiting'}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                                    {/* SCHEDULE */}
                                    <div className="xl:col-span-7 space-y-6">
                                        <h3 className="font-black uppercase text-[10px] tracking-widest text-slate-400 px-4">Today's Schedule</h3>
                                        <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
                                            {appointments.length === 0 ? (
                                                <div className="p-12 text-center text-slate-400">
                                                    <p className="text-[10px] font-black uppercase tracking-widest">No appointments today</p>
                                                </div>
                                            ) : (
                                                appointments.map((appt) => (
                                                    <div key={appt.id} className={`p-6 lg:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between border-b-2 border-slate-50 last:border-0 gap-4 ${currentPatient?.id === appt.id ? 'bg-emerald-50/30' : ''}`}>
                                                        <div className="flex items-center gap-6">
                                                            <div className="text-center w-16 shrink-0">
                                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{currentPatient?.id === appt.id ? 'ACTIVE' : 'TIME'}</p>
                                                                <p className="text-xl font-black tracking-tighter">{formatTime(appt.appointment_time)}</p>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <h4 className="font-black text-lg lg:text-xl uppercase tracking-tight leading-none">{appt.profiles?.full_name || 'Patient'}</h4>
                                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{appt.appointment_type || 'General'}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                                                            <span className={`text-[9px] font-black px-4 py-2 rounded-xl uppercase tracking-widest border-2 border-transparent ${getStatusColor(appt.status)}`}>
                                                                {appt.status?.replace('_', ' ') || 'SCHEDULED'}
                                                            </span>
                                                            <button
                                                                onClick={() => navigate('/doctor/consultation', { state: { appointment: appt } })}
                                                                className="p-3 bg-slate-900 text-white rounded-xl shadow-md hover:bg-emerald-500 transition-all shrink-0"
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
                                    <div className="xl:col-span-5 space-y-6">
                                        <h3 className="font-black uppercase text-[10px] tracking-widest text-slate-400 px-4">Active Session</h3>
                                        <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 lg:p-10 space-y-10 shadow-sm relative overflow-hidden">
                                            {currentPatient ? (
                                                <>
                                                    <div className="flex items-center gap-6">
                                                        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0 border-2 border-emerald-100">
                                                            <User size={32} />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-2xl font-black uppercase tracking-tighter leading-none">{currentPatient.profiles?.full_name}</h4>
                                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">
                                                                {currentPatient.appointment_type || 'General Consultation'}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="p-6 bg-amber-50 rounded-2xl border-2 border-amber-100 flex items-start gap-4">
                                                        <Bell className="text-amber-500 shrink-0 mt-0.5" size={18} />
                                                        <div>
                                                            <p className="text-[9px] font-black uppercase text-amber-600 tracking-widest mb-1">Status: Checked In</p>
                                                            <p className="text-[10px] font-bold text-amber-900/60 leading-tight uppercase tracking-wide">
                                                                This patient is present in the clinic and ready for their session.
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => navigate('/doctor/consultation', { state: { appointment: currentPatient } })}
                                                        className="w-full py-5 bg-black text-white rounded-[1.5rem] font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:bg-emerald-600 transition-all active:scale-[0.98]"
                                                    >
                                                        Start Consultation
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="text-center py-16">
                                                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-dashed border-slate-200">
                                                        <User className="text-slate-300" size={32} />
                                                    </div>
                                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">No patient waiting</p>
                                                    <p className="text-[9px] text-slate-400 mt-2 max-w-[200px] mx-auto uppercase font-bold tracking-widest">Next checked-in patient will appear here automatically.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </main>
                </div>
            </div>
        </PageTransition>
    );
}