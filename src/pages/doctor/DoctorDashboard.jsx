import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Users, ClipboardList, FileText,
    Settings, LogOut, Bell, ArrowRight, CheckCircle2,
    User, Loader2
} from 'lucide-react';
import { supabase } from '../../lib/supabase.js';
import { useAuth } from '../../lib/AuthContext.jsx';
import PageTransition from "../../components/layout/PageTransition.jsx";

export default function DoctorDashboard() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

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
        }
    }, [user]);

    async function loadDashboardData() {
        try {
            setLoading(true);

            // Fetch doctor profile
            const { data: profile } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', user.id)
                .single();

            if (profile?.full_name) {
                setDoctorName(profile.full_name.split(' ')[0]);
            }

            // Get today's date range
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayStr = today.toISOString().split('T')[0];

            // Fetch today's appointments
            const { data: appts } = await supabase
                .from('appointments')
                .select(`
                    *,
                    profiles:user_id (full_name)
                `)
                .gte('appointment_date', todayStr)
                .lt('appointment_date', new Date(today.getTime() + 86400000).toISOString().split('T')[0])
                .order('appointment_time', { ascending: true });

            if (appts) {
                setAppointments(appts);
                setTodayStats({
                    appointments: appts.length,
                    queue: appts.filter(a => a.status === 'CHECKED_IN' || a.status === 'PENDING').length
                });

                // Find current patient (checked in and waiting)
                const checkedIn = appts.find(a => a.status === 'CHECKED_IN');
                if (checkedIn) {
                    setCurrentPatient(checkedIn);
                }
            }
        } catch (err) {
            console.error('Dashboard load error:', err.message);
        } finally {
            setLoading(false);
        }
    }

    const handleLogout = () => navigate('/login');

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return '--:--';
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    const getStatusColor = (status) => {
        switch (status?.toUpperCase()) {
            case 'CHECKED_IN': return 'bg-black text-white';
            case 'PENDING': return 'bg-amber-100 text-amber-700';
            case 'COMPLETED': return 'bg-emerald-100 text-emerald-700';
            case 'CANCELLED': return 'bg-red-100 text-red-700';
            default: return 'bg-slate-100 text-slate-400';
        }
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
                                <div className="w-9 h-9 bg-slate-800 rounded-full flex items-center justify-center text-[10px] text-white font-bold">{doctorName[0]}</div>
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
                            <h1 className="text-4xl font-black text-slate-950 uppercase tracking-tighter leading-none">Welcome back, Dr. {doctorName}</h1>
                            <p className="text-slate-500 font-medium text-xs uppercase tracking-widest">{formatDate(new Date())}</p>
                        </div>
                        <button className="p-3 bg-white border border-slate-200 rounded-full text-slate-400 shadow-sm">
                            <Bell size={20} />
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="animate-spin text-slate-300" size={48} />
                        </div>
                    ) : (
                        <>
                            {/* TOP STATS */}
                            <div className="grid grid-cols-2 gap-8">
                                <div className="bg-white border-2 border-slate-50 rounded-[2rem] p-8 flex justify-between items-center shadow-sm">
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Today's Appointments</p>
                                        <h2 className="text-6xl font-black">{todayStats.appointments}</h2>
                                    </div>
                                </div>
                                <div className="bg-white border-2 border-slate-50 rounded-[2rem] p-8 flex justify-between items-center shadow-sm">
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Patients in Queue</p>
                                        <h2 className="text-6xl font-black">{todayStats.queue}</h2>
                                    </div>
                                    <span className="text-slate-400 font-black text-sm">
                                        {todayStats.queue === 0 ? 'Empty' : `${todayStats.queue} waiting`}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-12 gap-10">
                                {/* SCHEDULE */}
                                <div className="col-span-7 space-y-6">
                                    <h3 className="font-black uppercase text-sm tracking-widest px-4">Today's Schedule</h3>
                                    <div className="bg-white border-2 border-slate-50 rounded-[2.5rem] overflow-hidden shadow-sm">
                                        {appointments.length === 0 ? (
                                            <div className="p-12 text-center text-slate-400">
                                                <p className="text-sm font-bold uppercase tracking-widest">No appointments today</p>
                                            </div>
                                        ) : (
                                            appointments.map((appt, i) => (
                                                <div key={appt.id} className={`p-8 flex items-center justify-between border-b border-slate-50 last:border-0 ${currentPatient?.id === appt.id ? 'bg-slate-50/50' : ''}`}>
                                                    <div className="flex items-center gap-8">
                                                        <div className="text-center w-16">
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{currentPatient?.id === appt.id ? 'CURRENT' : 'WAIT'}</p>
                                                            <p className="text-xl font-black">{formatTime(appt.appointment_time)}</p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <h4 className="font-black text-xl uppercase tracking-tight">{appt.profiles?.full_name || 'Unknown'}</h4>
                                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{appt.appointment_type || 'General'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${getStatusColor(appt.status)}`}>
                                                            {appt.status || 'SCHEDULED'}
                                                        </span>
                                                        {currentPatient?.id === appt.id && (
                                                            <button
                                                                onClick={() => navigate('/doctor/consultation', { state: { appointment: appt } })}
                                                                className="p-3 bg-black text-white rounded-xl shadow-lg hover:bg-emerald-500 transition-all"
                                                            >
                                                                <ArrowRight size={18} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* CURRENT PATIENT */}
                                <div className="col-span-5 space-y-6">
                                    <h3 className="font-black uppercase text-sm tracking-widest px-4">Current Patient</h3>
                                    <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-10 space-y-10 shadow-sm">
                                        {currentPatient ? (
                                            <>
                                                <div className="flex items-center gap-6">
                                                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
                                                        <User size={32} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-2xl font-black uppercase tracking-tighter">{currentPatient.profiles?.full_name || 'Unknown'}</h4>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                            {currentPatient.appointment_type || 'General Consultation'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex items-start gap-4">
                                                    <Bell className="text-amber-500 mt-1" size={20} />
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase text-amber-600 tracking-widest mb-1">CHECKED IN</p>
                                                        <p className="text-[11px] font-medium text-amber-950 leading-tight">
                                                            Patient is waiting for consultation.
                                                        </p>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => navigate('/doctor/consultation', { state: { appointment: currentPatient } })}
                                                    className="w-full py-5 bg-black text-white rounded-[1.5rem] font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-emerald-500 transition-all"
                                                >
                                                    Start Consultation
                                                </button>
                                            </>
                                        ) : (
                                            <div className="text-center py-12">
                                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <User className="text-slate-300" size={40} />
                                                </div>
                                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No current patient</p>
                                                <p className="text-xs text-slate-300 mt-2">Waiting for checked-in appointments</p>
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
