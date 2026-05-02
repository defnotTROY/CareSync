import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, UserCheck, Users, CalendarDays,
    CreditCard, FileText, Bell, LogOut, ArrowRight,
    Loader2, Clock, RefreshCw, Wallet, Check
} from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { useLiveQueue } from '../../hooks/useLiveQueue.js';
import PageTransition from "../../components/layout/PageTransition.jsx";
import StaffSidebar from "../../components/layout/StaffSidebar.jsx";
import StaffHeader from "../../components/layout/StaffHeader.jsx";
import '../../styles/staff-portal.css';
import './ClientQueue.css';

export default function ClientQueue() {
    const location = useLocation();
    const navigate = useNavigate();

    const [staffName, setStaffName] = useState("Staff");
    const [staffLoading, setStaffLoading] = useState(true);
    const [actioningId, setActioningId] = useState(null);
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const { waitingQueue, servingNow, loading, refresh } = useLiveQueue();

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/staff/dashboard' },
        { name: 'Client Check-in', icon: UserCheck, path: '/staff/check-in' },
        { name: 'Client Queue', icon: Users, path: '/staff/queue' },
        { name: 'Appointments', icon: CalendarDays, path: '/staff/appointments' },
        { name: 'Payment Record', icon: CreditCard, path: '/staff/payments' },
        { name: 'Client Record', icon: FileText, path: '/staff/records' },
        { name: 'New Client', icon: UserPlus, path: '/staff/new-client' },
    ];

    useEffect(() => {
        fetchStaffInfo();
    }, []);

    async function fetchStaffInfo() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // FIXED: Fetching first_name and last_name instead of full_name
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('first_name, last_name')
                    .eq('id', user.id)
                    .single();

                const formattedName = profile
                    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
                    : "Staff Member";

                setStaffName(formattedName || "Staff Member");
            }
        } catch (err) { console.error(err); }
        finally { setStaffLoading(false); }
    }

    const handleMoveToDoctor = async (id) => {
        setActioningId(id);
        try {
            await supabase
                .from('appointments')
                .update({
                    status: 'ON_DOCTOR',
                    updated_at: new Date().toISOString()
                })
                .eq('id', id);

            refresh();
        } catch (err) { console.error(err); }
        finally { setActioningId(null); }
    };

    const handleFinish = async (id) => {
        setActioningId(id);
        try {
            await supabase.from('appointments').update({ status: 'COMPLETED' }).eq('id', id);
            refresh();
        } catch (err) { console.error(err); }
        finally { setActioningId(null); }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    const getWaitTime = (createdAt) => {
        if (!createdAt) return "---";
        const diffMins = Math.floor((new Date() - new Date(createdAt)) / 60000);
        return diffMins < 1 ? "Just now" : `${diffMins}m`;
    };

    return (
        <PageTransition>
            <div className="flex min-h-screen bg-[#F8FAFC]">
                <StaffSidebar
                    isOpen={isSidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />

                <div className="flex-1 flex flex-col min-w-0 md:ml-20 lg:ml-72">
                    <StaffHeader
                        title="Client Queue"
                        onMenuClick={() => setSidebarOpen(true)}
                    />

                <main className="staff-main p-6 lg:p-12 space-y-10 overflow-y-auto bg-[#F8FAFC]">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="staff-page-title">Client Queue</h1>
                            <p className="staff-page-subtitle">Live Center Management</p>
                        </div>
                        <button onClick={refresh} className="px-6 py-3 bg-white border-2 border-slate-50 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:border-black shadow-sm transition-all">
                            <RefreshCw size={14} /> Refresh
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32">
                            <Loader2 size={40} className="animate-spin text-emerald-500 mb-4" />
                            <p className="text-[10px] font-black uppercase text-slate-300">Syncing Hallway...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-12 gap-8">
                            {/* CASHIER COLUMN */}
                            <div className="col-span-7 space-y-6">
                                <h3 className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-slate-400">
                                    <Wallet size={16} className="text-amber-500" /> Pending Payment
                                    <span className="px-2 py-0.5 bg-amber-100 text-amber-600 rounded text-[9px]">{waitingQueue.length}</span>
                                </h3>
                                <div className="space-y-3">
                                    {waitingQueue.length > 0 ? (
                                        waitingQueue.map((patient) => {
                                            // Format patient name safely
                                            const patientName = patient.profiles
                                                ? `${patient.profiles.first_name || ''} ${patient.profiles.last_name || ''}`.trim()
                                                : 'Patient';

                                            return (
                                                <div key={patient.id} className="p-6 bg-white border-2 border-slate-50 border-l-amber-400 border-l-4 rounded-3xl flex items-center justify-between shadow-sm group hover:border-black transition-all">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center font-black">
                                                            {patient.profiles?.first_name?.charAt(0) || 'P'}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-black uppercase text-slate-900">{patientName}</h4>
                                                            <p className="text-[9px] font-bold text-slate-400 uppercase">{patient.purpose || 'Check-up'}</p>
                                                        </div>
                                                    </div>
                                                    <button onClick={() => handleMoveToDoctor(patient.id)} disabled={actioningId === patient.id} className="px-6 py-3 bg-amber-500 text-white rounded-xl text-[9px] font-black uppercase hover:bg-black transition-all">
                                                        Confirm Payment
                                                    </button>
                                                </div>
                                            )
                                        })
                                    ) : (
                                        <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[2.5rem] font-black uppercase text-[10px] text-slate-300">Cashier is empty</div>
                                    )}
                                </div>
                            </div>

                            {/* DOCTOR COLUMN */}
                            <div className="col-span-5 space-y-6">
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Hallway</h3>
                                <div className="space-y-4">
                                    {servingNow.length > 0 ? (
                                        servingNow.map((patient) => {
                                            const inRoom = patient.status === 'ON_DOCTOR' || patient.status === 'IN_PROGRESS';

                                            // Format patient name safely
                                            const patientName = patient.profiles
                                                ? `${patient.profiles.first_name || ''} ${patient.profiles.last_name || ''}`.trim()
                                                : 'Patient';

                                            return (
                                                <div key={patient.id} className={`p-6 rounded-[2.5rem] border-2 transition-all ${inRoom ? 'border-emerald-500 bg-emerald-50/10' : 'border-slate-50 bg-white'}`}>
                                                    <div className="flex justify-between items-start mb-4">
                                                        <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest ${inRoom ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-blue-500 text-white'}`}>
                                                            {inRoom ? 'With Doctor' : 'Waiting'}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-slate-300 uppercase">{patient.appointment_time}</span>
                                                    </div>
                                                    <h4 className="font-black uppercase text-slate-900">{patientName}</h4>
                                                    {inRoom && (
                                                        <button onClick={() => handleFinish(patient.id)} className="w-full mt-4 py-3 bg-slate-900 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all">
                                                            {actioningId === patient.id ? "..." : "Complete Session"}
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[2.5rem] font-black uppercase text-[10px] text-slate-300">Hallway is clear</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </main>
                </div>
            </div>
        </PageTransition>
    );
}

function UserPlus(props) { return <Users {...props} />; }