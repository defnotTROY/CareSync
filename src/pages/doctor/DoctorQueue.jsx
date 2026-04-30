import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Users, ClipboardList, FileText,
    Settings, LogOut, Bell, UserCheck, Clock,
    ArrowRight, Activity, Loader2, Calendar as CalendarIcon,
    Wallet
} from 'lucide-react';
import { supabase } from '../../lib/supabase.js';
import { useAuth } from '../../lib/AuthContext.jsx';
import PageTransition from "../../components/layout/PageTransition.jsx";
import '../../styles/staff-portal.css';

export default function DoctorQueue() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, signOut } = useAuth();

    const [loading, setLoading] = useState(true);
    const [doctorName, setDoctorName] = useState('Doctor');
    const [queue, setQueue] = useState([]);
    const [callingPatientId, setCallingPatientId] = useState(null);
    const initialLoadDone = useRef(false);

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/doctor/dashboard' },
        { name: 'Client Queue', icon: Users, path: '/doctor/queue' },
        { name: 'Consultation', icon: ClipboardList, path: '/doctor/consultation' },
        { name: 'Client Record', icon: FileText, path: '/doctor/records' },
    ];

    useEffect(() => {
        if (user) {
            fetchDoctorInfo();
            fetchQueue();

            // REALTIME SUBSCRIPTION - Optimized for status changes
            const channel = supabase
                .channel('doctor-hallway-v8')
                .on('postgres_changes',
                    { event: '*', schema: 'public', table: 'appointments' },
                    (payload) => {
                        console.log("Queue Update Received:", payload.new?.status);

                        // IF patient is marked COMPLETED, remove them from local state immediately
                        if (payload.new && payload.new.status === 'COMPLETED') {
                            setQueue(prev => prev.filter(apt => apt.id !== payload.new.id));
                        }
                        // IF a new patient is checked in or status changes to something we track, refresh
                        else {
                            fetchQueue();
                        }
                    }
                )
                .subscribe();

            return () => supabase.removeChannel(channel);
        }
    }, [user]);

    async function fetchDoctorInfo() {
        try {
            const { data } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
            if (data?.full_name) setDoctorName(data.full_name.split(' ')[0]);
        } catch (err) { console.error(err); }
    }

    async function fetchQueue() {
        try {
            if (!initialLoadDone.current) setLoading(true);

            const now = new Date();
            const todayStr = new Date(now.getTime() - (now.getTimezoneOffset() * 60000))
                .toISOString()
                .split('T')[0];

            const nextWeek = new Date();
            nextWeek.setDate(now.getDate() + 7);
            const endStr = new Date(nextWeek.getTime() - (nextWeek.getTimezoneOffset() * 60000))
                .toISOString()
                .split('T')[0];

            const { data, error } = await supabase
                .from('appointments')
                .select(`*, profiles!user_id (id, full_name)`)
                .gte('appointment_date', todayStr)
                .lte('appointment_date', endStr)
                // STATED STATUS FILTER: COMPLETED is excluded to remove them from the UI
                .in('status', ['CONFIRMED', 'ON_CASHIER', 'CHECKED_IN', 'ON_DOCTOR', 'IN_PROGRESS'])
                .order('appointment_date', { ascending: true })
                .order('appointment_time', { ascending: true });

            if (error) throw error;

            setQueue(data || []);
        } catch (err) {
            console.error('Queue fetch error:', err.message);
        } finally {
            setLoading(false);
            initialLoadDone.current = true;
        }
    }

    const handleCallPatient = async (appointment) => {
        try {
            setCallingPatientId(appointment.id);
            await supabase.from('appointments').update({ status: 'ON_DOCTOR' }).eq('id', appointment.id);
            navigate('/doctor/consultation', { state: { appointment } });
        } catch (err) {
            console.error(err);
            setCallingPatientId(null);
        }
    };

    const handleLogout = async () => {
        if (signOut) await signOut();
        navigate('/login');
    };

    const formatTime = (t) => {
        if (!t) return '--:--';
        const [h, m] = t.split(':');
        const hour = parseInt(h);
        return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
    };

    const formatDateShort = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    };

    return (
        <PageTransition>
            <div className="flex min-h-screen bg-[#F8FAFC]">
                <aside className="w-72 bg-black flex flex-col justify-between py-10 px-6 shrink-0 h-screen sticky top-0">
                    <div className="space-y-10">
                        <div className="flex items-center gap-3 px-2">
                            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center font-bold text-white text-xl shadow-lg">M</div>
                            <div className="text-white font-black uppercase tracking-tight">
                                <span className="text-lg block text-emerald-500">CareSync</span>
                                <span className="text-slate-500 text-[10px] tracking-widest mt-1 uppercase">Doctor Terminal</span>
                            </div>
                        </div>
                        <nav className="space-y-1">
                            {navItems.map((item) => (
                                <Link key={item.name} to={item.path} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${location.pathname === item.path ? 'bg-white text-black font-bold shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                                    <item.icon size={20} />
                                    <span className="text-sm">{item.name}</span>
                                </Link>
                            ))}
                        </nav>
                    </div>
                    <div className="pt-6 border-t border-white/10 flex items-center justify-between px-2 text-white">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-slate-800 rounded-full flex items-center justify-center font-bold text-xs shrink-0">{doctorName[0]}</div>
                            <span className="text-[11px] font-bold uppercase truncate w-24">Dr. {doctorName}</span>
                        </div>
                        <button onClick={handleLogout} className="text-slate-500 hover:text-red-400 transition-colors"><LogOut size={18} /></button>
                    </div>
                </aside>

                <main className="flex-1 p-12 space-y-10 overflow-y-auto">
                    <header className="flex justify-between items-center">
                        <div className="space-y-1">
                            <h1 className="staff-page-title">Weekly Queue</h1>
                            <p className="text-slate-500 font-medium uppercase text-[10px] tracking-[0.2em]">Active Patient Flow Management</p>
                        </div>
                        <div className="bg-white border-2 border-slate-50 px-6 py-4 rounded-2xl flex items-center gap-4 shadow-sm">
                            <Activity className="text-emerald-500" size={20} />
                            <p className="text-sm font-black uppercase">{queue.length} Total in Hallway</p>
                        </div>
                    </header>

                    <div className="space-y-4">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-64"><Loader2 className="animate-spin text-emerald-500" size={48} /></div>
                        ) : queue.length === 0 ? (
                            <div className="bg-white border-2 border-slate-50 rounded-[3rem] p-24 text-center shadow-sm border-dashed">
                                <Users size={48} className="mx-auto text-slate-100 mb-4" />
                                <p className="text-lg font-black text-slate-400 uppercase tracking-widest leading-none">Hallway Clear</p>
                                <p className="text-xs font-bold text-slate-300 mt-3 uppercase tracking-tighter">All patient consultations are complete for now.</p>
                            </div>
                        ) : (
                            queue.map((patient, i) => {
                                const isOnCashier = patient.status === 'ON_CASHIER';
                                const isHere = patient.status === 'CHECKED_IN';
                                const isWithDoctor = patient.status === 'ON_DOCTOR' || patient.status === 'IN_PROGRESS';

                                return (
                                    <div key={patient.id} className={`bg-white border-2 rounded-[2rem] p-6 flex items-center justify-between hover:border-black transition-all group shadow-sm ${isOnCashier ? 'border-amber-100 bg-amber-50/5' : isHere || isWithDoctor ? 'border-emerald-100 bg-emerald-50/10' : 'border-slate-50'}`}>
                                        <div className="flex items-center gap-8">
                                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black shadow-lg ${isOnCashier ? 'bg-amber-400 text-white' : isHere || isWithDoctor ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>{i + 1}</div>
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <h4 className="text-xl font-black uppercase tracking-tight text-slate-900">{patient.profiles?.full_name || 'Patient'}</h4>
                                                    {isOnCashier && <span className="text-[8px] font-black px-2 py-0.5 rounded border border-amber-200 text-amber-600 bg-amber-50 uppercase tracking-widest">At Cashier</span>}
                                                    {isHere && <span className="text-[8px] font-black px-2 py-0.5 rounded border border-emerald-200 text-emerald-600 bg-emerald-100 uppercase tracking-widest">Ready</span>}
                                                    {isWithDoctor && <span className="text-[8px] font-black px-2 py-0.5 rounded border border-slate-200 text-slate-600 bg-slate-100 uppercase tracking-widest">In Room</span>}
                                                </div>
                                                <div className="flex items-center gap-3 mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                    <span className="flex items-center gap-1"><CalendarIcon size={12} /> {formatDateShort(patient.appointment_date)}</span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1"><Clock size={12} /> {formatTime(patient.appointment_time)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-12">
                                            <div className="text-right">
                                                <div className="flex items-center gap-2 justify-end mb-1 text-slate-400 font-black uppercase text-[10px] tracking-widest">
                                                    {isOnCashier ? <Wallet size={14} className="text-amber-500" /> : <UserCheck size={14} className={isHere || isWithDoctor ? 'text-emerald-500' : 'text-slate-200'} />}
                                                    {patient.status.replace('_', ' ')}
                                                </div>
                                                <p className="text-[10px] font-bold text-slate-300 uppercase italic">Ref: #{patient.id.slice(0, 8)}</p>
                                            </div>
                                            <button
                                                onClick={() => handleCallPatient(patient)}
                                                disabled={callingPatientId === patient.id || isOnCashier}
                                                className={`px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 transition-all shadow-xl ${isOnCashier ? 'bg-slate-50 text-slate-300 cursor-not-allowed shadow-none border border-slate-100' : 'bg-black text-white hover:bg-emerald-500 disabled:opacity-50'}`}
                                            >
                                                {isOnCashier ? 'Paying' : isWithDoctor ? 'Start Consultation' : 'Call Patient'} <ArrowRight size={16} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </main>
            </div>
        </PageTransition>
    );
}