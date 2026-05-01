import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Users, Activity, Loader2, Calendar as CalendarIcon,
    Wallet, UserCheck, Clock, ArrowRight, Menu
} from 'lucide-react';
import { supabase } from '../../lib/supabase.js';
import { useAuth } from '../../lib/AuthContext.jsx';
import PageTransition from "../../components/layout/PageTransition.jsx";
import DoctorSidebar from "../../components/layout/DoctorSidebar.jsx";
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

    // Sidebar state
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (user) {
            fetchDoctorInfo();
            fetchQueue();

            // REALTIME SUBSCRIPTION
            const channel = supabase
                .channel('doctor-hallway-v8')
                .on('postgres_changes',
                    { event: '*', schema: 'public', table: 'appointments' },
                    (payload) => {
                        console.log("Queue Update Received:", payload.new?.status);

                        // Remove from queue if COMPLETED
                        if (payload.new && payload.new.status === 'COMPLETED') {
                            setQueue(prev => prev.filter(apt => apt.id !== payload.new.id));
                        } else {
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
            // FIXED: Fetching first_name instead of full_name
            const { data, error } = await supabase
                .from('profiles')
                .select('first_name')
                .eq('id', user.id)
                .single();

            if (error) throw error;
            if (data?.first_name) setDoctorName(data.first_name);
        } catch (err) {
            console.error(err);
        }
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

            // FIXED: Fetching first_name and last_name instead of full_name
            const { data, error } = await supabase
                .from('appointments')
                .select(`*, profiles!user_id (id, first_name, last_name)`)
                .gte('appointment_date', todayStr)
                .lte('appointment_date', endStr)
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

                {/* DOCTOR SIDEBAR */}
                <DoctorSidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

                {/* MAIN CONTENT */}
                <div className="flex-1 flex flex-col min-w-0 md:ml-20 lg:ml-72">
                    <main className="flex-1 p-6 lg:p-12 space-y-10 overflow-y-auto w-full min-w-0">

                        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div className="flex items-center gap-4">
                                {/* Mobile Sidebar Toggle */}
                                <button
                                    onClick={() => setSidebarOpen(true)}
                                    className="md:hidden p-2 -ml-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-black hover:border-black transition-colors"
                                >
                                    <Menu size={24} />
                                </button>

                                <div className="space-y-1">
                                    <h1 className="staff-page-title text-3xl lg:text-4xl font-black uppercase tracking-tighter leading-none italic">Weekly Queue</h1>
                                    <p className="text-slate-500 font-medium uppercase text-[10px] tracking-[0.2em] mt-1">Active Patient Flow Management</p>
                                </div>
                            </div>
                            <div className="bg-white border-2 border-slate-50 px-6 py-4 rounded-2xl flex items-center gap-4 shadow-sm w-full md:w-auto">
                                <Activity className="text-emerald-500 shrink-0" size={20} />
                                <p className="text-sm font-black uppercase">{queue.length} Total in Hallway</p>
                            </div>
                        </header>

                        <div className="space-y-4">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center h-64"><Loader2 className="animate-spin text-emerald-500" size={48} /></div>
                            ) : queue.length === 0 ? (
                                <div className="bg-white border-2 border-slate-50 rounded-[3rem] p-12 lg:p-24 text-center shadow-sm border-dashed">
                                    <Users size={48} className="mx-auto text-slate-100 mb-4" />
                                    <p className="text-lg font-black text-slate-400 uppercase tracking-widest leading-none">Hallway Clear</p>
                                    <p className="text-[10px] md:text-xs font-bold text-slate-300 mt-3 uppercase tracking-tighter">All patient consultations are complete for now.</p>
                                </div>
                            ) : (
                                queue.map((patient, i) => {
                                    const isOnCashier = patient.status === 'ON_CASHIER';
                                    const isHere = patient.status === 'CHECKED_IN';
                                    const isWithDoctor = patient.status === 'ON_DOCTOR' || patient.status === 'IN_PROGRESS';

                                    // Safely format the patient's name
                                    const patientName = patient.profiles
                                        ? `${patient.profiles.first_name || ''} ${patient.profiles.last_name || ''}`.trim()
                                        : 'Patient';

                                    return (
                                        <div key={patient.id} className={`bg-white border-2 rounded-[2rem] p-6 flex flex-col xl:flex-row items-start xl:items-center justify-between hover:border-black transition-all group shadow-sm gap-6 ${isOnCashier ? 'border-amber-100 bg-amber-50/5' : isHere || isWithDoctor ? 'border-emerald-100 bg-emerald-50/10' : 'border-slate-50'}`}>
                                            <div className="flex items-center gap-6 w-full xl:w-auto">
                                                <div className={`w-14 h-14 lg:w-16 lg:h-16 rounded-2xl flex items-center justify-center text-lg lg:text-xl font-black shadow-lg shrink-0 ${isOnCashier ? 'bg-amber-400 text-white' : isHere || isWithDoctor ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>{i + 1}</div>
                                                <div>
                                                    <div className="flex flex-wrap items-center gap-3">
                                                        <h4 className="text-lg lg:text-xl font-black uppercase tracking-tight text-slate-900">{patientName}</h4>
                                                        {isOnCashier && <span className="text-[8px] font-black px-2 py-0.5 rounded border border-amber-200 text-amber-600 bg-amber-50 uppercase tracking-widest whitespace-nowrap">At Cashier</span>}
                                                        {isHere && <span className="text-[8px] font-black px-2 py-0.5 rounded border border-emerald-200 text-emerald-600 bg-emerald-100 uppercase tracking-widest whitespace-nowrap">Ready</span>}
                                                        {isWithDoctor && <span className="text-[8px] font-black px-2 py-0.5 rounded border border-slate-200 text-slate-600 bg-slate-100 uppercase tracking-widest whitespace-nowrap">In Room</span>}
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-2 text-[9px] lg:text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                        <span className="flex items-center gap-1"><CalendarIcon size={12} /> {formatDateShort(patient.appointment_date)}</span>
                                                        <span>•</span>
                                                        <span className="flex items-center gap-1"><Clock size={12} /> {formatTime(patient.appointment_time)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 w-full xl:w-auto justify-between xl:justify-end border-t-2 xl:border-t-0 border-slate-50 pt-4 xl:pt-0 mt-2 xl:mt-0">
                                                <div className="text-left sm:text-right">
                                                    <div className="flex items-center gap-2 sm:justify-end mb-1 text-slate-400 font-black uppercase text-[10px] tracking-widest">
                                                        {isOnCashier ? <Wallet size={14} className="text-amber-500" /> : <UserCheck size={14} className={isHere || isWithDoctor ? 'text-emerald-500' : 'text-slate-200'} />}
                                                        {patient.status.replace('_', ' ')}
                                                    </div>
                                                    <p className="text-[9px] lg:text-[10px] font-bold text-slate-300 uppercase italic">Ref: #{patient.id.slice(0, 8)}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleCallPatient(patient)}
                                                    disabled={callingPatientId === patient.id || isOnCashier}
                                                    className={`w-full sm:w-auto px-6 lg:px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl shrink-0 ${isOnCashier ? 'bg-slate-50 text-slate-300 cursor-not-allowed shadow-none border border-slate-100' : 'bg-black text-white hover:bg-emerald-500 disabled:opacity-50'}`}
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
            </div>
        </PageTransition>
    );
}