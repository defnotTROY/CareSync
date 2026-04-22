import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Users, ClipboardList, FileText,
    Settings, LogOut, Bell, UserCheck, Clock,
    ArrowRight, Activity, Loader2
} from 'lucide-react';
import { supabase } from '../../lib/supabase.js';
import { useAuth } from '../../lib/AuthContext.jsx';
import PageTransition from "../../components/layout/PageTransition.jsx";

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

            // Broad listener to update the hallway instantly when staff checks someone in
            const channel = supabase
                .channel('doctor-hallway-final')
                .on('postgres_changes',
                    { event: '*', schema: 'public', table: 'appointments' },
                    () => fetchQueue()
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
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
            // Only show the spinner on first load
            if (!initialLoadDone.current) setLoading(true);

            // CORRECT DATE LOGIC: Force the local date (YYYY-MM-DD)
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const todayStr = `${year}-${month}-${day}`;

            console.log("Searching for date:", todayStr); // Check this in your F12 console!

            const { data, error } = await supabase
                .from('appointments')
                .select(`
                    *,
                    profiles:user_id (full_name, age, gender)
                `)
                .eq('appointment_date', todayStr)
                // The doctor sees everyone scheduled for today who isn't COMPLETED or CANCELLED
                .in('status', ['CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS'])
                .order('appointment_time', { ascending: true });

            if (error) throw error;

            console.log("Patients Found:", data?.length);
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
            await supabase.from('appointments').update({ status: 'IN_PROGRESS' }).eq('id', appointment.id);
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

    return (
        <PageTransition>
            <div className="flex min-h-screen bg-[#F8FAFC]">
                <aside className="w-72 bg-black flex flex-col justify-between py-10 px-6 shrink-0 h-screen sticky top-0">
                    <div className="space-y-10">
                        <div className="flex items-center gap-3 px-2">
                            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center font-bold text-white text-xl">M</div>
                            <div className="text-white font-black uppercase tracking-tight leading-none">
                                <span className="text-lg">CareSync</span>
                                <span className="block text-slate-500 text-[10px] tracking-widest mt-1">Doctor Terminal</span>
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
                    <div className="pt-6 border-t border-white/10 flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-slate-800 rounded-full flex items-center justify-center text-white font-bold">{doctorName[0]}</div>
                            <div className="flex flex-col">
                                <span className="text-white text-[11px] font-bold uppercase leading-none">{doctorName}</span>
                                <span className="text-slate-500 text-[8px] font-bold uppercase mt-1">Medical Staff</span>
                            </div>
                        </div>
                        <button onClick={handleLogout} className="text-slate-500 hover:text-red-400"><LogOut size={18} /></button>
                    </div>
                </aside>

                <main className="flex-1 p-12 space-y-10 overflow-y-auto">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-5xl font-black text-slate-950 uppercase tracking-tighter">Hallway Queue</h1>
                            <p className="text-slate-500 font-medium uppercase text-[10px] tracking-[0.2em]">Real-time patient hallway management</p>
                        </div>
                        <div className="bg-white border-2 border-slate-50 px-6 py-4 rounded-2xl flex items-center gap-4 shadow-sm">
                            <Activity className="text-emerald-500" size={20} />
                            <p className="text-sm font-black uppercase tracking-widest">{queue.length} Total Patients</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-64"><Loader2 className="animate-spin text-emerald-500" size={48} /></div>
                        ) : queue.length === 0 ? (
                            <div className="bg-white border-2 border-slate-50 rounded-[2rem] p-20 text-center shadow-sm">
                                <p className="text-lg font-black text-slate-400 uppercase tracking-widest">Hallway is Empty</p>
                                <p className="text-sm text-slate-300 mt-2">No patients scheduled for today ({new Date().toLocaleDateString()}).</p>
                            </div>
                        ) : (
                            queue.map((patient, i) => {
                                const isCheckedIn = patient.status === 'CHECKED_IN';
                                const isWithDoctor = patient.status === 'IN_PROGRESS';

                                return (
                                    <div key={patient.id} className={`bg-white border-2 rounded-[2rem] p-6 flex items-center justify-between hover:border-black transition-all group shadow-sm ${isCheckedIn || isWithDoctor ? 'border-emerald-100 bg-emerald-50/20' : 'border-slate-50'}`}>
                                        <div className="flex items-center gap-8">
                                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black ${isCheckedIn || isWithDoctor ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>{i + 1}</div>
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <h4 className="text-xl font-black uppercase tracking-tight">{patient.profiles?.full_name}</h4>
                                                    {isCheckedIn && <span className="text-[8px] font-black px-2 py-0.5 rounded border border-emerald-200 text-emerald-600 bg-emerald-100 uppercase">Present</span>}
                                                    {isWithDoctor && <span className="text-[8px] font-black px-2 py-0.5 rounded border border-blue-200 text-blue-600 bg-blue-50 uppercase">Active</span>}
                                                </div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{patient.appointment_type} • {formatTime(patient.appointment_time)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-12">
                                            <div className="text-right">
                                                <div className="flex items-center gap-2 justify-end mb-1 text-slate-400">
                                                    <UserCheck size={14} className={isCheckedIn ? 'text-emerald-500' : ''} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">{patient.status.replace('_', ' ')}</span>
                                                </div>
                                                <div className="flex items-center gap-2 justify-end text-slate-300">
                                                    <Clock size={12} />
                                                    <span className="text-[10px] font-bold uppercase">Today • {formatTime(patient.appointment_time)}</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleCallPatient(patient)}
                                                disabled={callingPatientId === patient.id}
                                                className="px-8 py-4 bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 hover:bg-emerald-500 transition-all disabled:opacity-50"
                                            >
                                                {callingPatientId === patient.id ? 'Calling...' : 'Begin Session'}
                                                <ArrowRight size={16} />
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