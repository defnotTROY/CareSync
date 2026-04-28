import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, CalendarPlus, ClipboardList, Settings,
    LogOut, User, Search, Bell, Plus, Loader2, Calendar, X, Info
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import PageTransition from "../components/layout/PageTransition.jsx";
import ClientLayout from "../components/layout/ClientLayout.jsx";
import '../styles/client-portal.css';
import './MyAppointments.css';

export default function MyAppointments() {
    const location = useLocation();
    const navigate = useNavigate();

    // --- STATES ---
    const [userName, setUserName] = useState("User");
    const [isUserLoading, setIsUserLoading] = useState(true);
    const [appointments, setAppointments] = useState([]);
    const [loadingAppointments, setLoadingAppointments] = useState(true);
    const [activeTab, setActiveTab] = useState('Upcoming Visits');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedApt, setSelectedApt] = useState(null);
    const [actioningId, setActioningId] = useState(null);
    const [cancelModalApt, setCancelModalApt] = useState(null);

    // --- FETCH DATA ---
    const fetchData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/login');
                return;
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', user.id)
                .single();
            if (profile) setUserName(profile.full_name);
            setIsUserLoading(false);

            let { data: aptData, error: aptError } = await supabase
                .from('appointments')
                .select('*')
                .eq('user_id', user.id)
                .order('appointment_date', { ascending: true });

            if (aptError) throw aptError;

            // --- AUTO-EXPIRE stale PENDING appointments ---
            const now = new Date();
            const stale = (aptData || []).filter(apt => {
                if (apt.status !== 'PENDING') return false;
                const [time, meridiem] = apt.appointment_time.split(' ');
                let [h, m] = time.split(':').map(Number);
                if (meridiem === 'PM' && h !== 12) h += 12;
                if (meridiem === 'AM' && h === 12) h = 0;
                const aptDt = new Date(`${apt.appointment_date}T${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:00`);
                return aptDt < now;
            });

            if (stale.length > 0) {
                const staleIds = stale.map(a => a.id);
                await supabase
                    .from('appointments')
                    .update({ status: 'EXPIRED' })
                    .in('id', staleIds);
                aptData = aptData.map(a => staleIds.includes(a.id) ? { ...a, status: 'EXPIRED' } : a);
            }

            setAppointments(aptData || []);
        } catch (err) {
            console.error("Data fetch error:", err.message);
        } finally {
            setLoadingAppointments(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [navigate]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    // --- ACTION LOGIC ---
    const handleCancelVisit = async (id) => {
        setActioningId(id);
        setCancelModalApt(null);
        try {
            const { error } = await supabase
                .from('appointments')
                .update({ status: 'CANCELLED' })
                .eq('id', id);

            if (error) throw error;

            setAppointments(prev =>
                prev.map(apt => apt.id === id ? { ...apt, status: 'CANCELLED' } : apt)
            );
        } catch (err) {
            console.error("Error cancelling appointment:", err.message);
        } finally {
            setActioningId(null);
        }
    };

    const handleReschedule = (apt) => {
        navigate('/book', { state: { rescheduleData: apt } });
    };

    // --- FILTERING LOGIC ---
    const filteredAppointments = appointments.filter(apt => {
        const matchesSearch = apt.purpose.toLowerCase().includes(searchQuery.toLowerCase());
        const status = apt.status?.toUpperCase() || '';

        if (activeTab === 'Upcoming Visits') {
            return matchesSearch && (status === 'CONFIRMED' || status === 'PENDING');
        }
        if (activeTab === 'Past History') {
            return matchesSearch && (status === 'COMPLETED' || status === 'EXPIRED');
        }
        if (activeTab === 'Cancelled') {
            return matchesSearch && status === 'CANCELLED';
        }
        return matchesSearch;
    });

    const tabs = ['Upcoming Visits', 'Past History', 'Cancelled'];

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <PageTransition>
            <ClientLayout title="My Appointments">
                <div className="w-full max-w-7xl mx-auto space-y-6 md:space-y-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4 md:mb-8">
                        <div className="space-y-1 md:space-y-2">
                            <h1 className="page-title text-2xl md:text-3xl font-bold text-slate-900 leading-tight">Appointments</h1>
                            <p className="page-subtitle text-slate-500 text-sm md:text-base">Manage your medical consultations.</p>
                        </div>
                        <Link to="/book" className="w-full md:w-auto bg-black text-white px-5 py-3 md:py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all text-sm">
                            <Plus size={16} /> Book New
                        </Link>
                    </div>

                    <div className="appointments-content">
                        <div className="tab-container flex gap-4 md:gap-8 border-b border-slate-100 mb-6 md:mb-8 overflow-x-auto whitespace-nowrap scrollbar-hide pb-2">
                            {tabs.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`tab-item pb-4 text-sm font-medium transition-all relative ${activeTab === tab ? 'text-black' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    {tab}
                                    {activeTab === tab && <div className="tab-indicator absolute bottom-0 left-0 w-full h-0.5 bg-black rounded-full" />}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-6">
                            {loadingAppointments ? (
                                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                                    <Loader2 size={40} className="animate-spin mb-4" />
                                    <p>Loading your appointments...</p>
                                </div>
                            ) : filteredAppointments.length > 0 ? (
                                filteredAppointments.map((apt) => (
                                    <div key={apt.id} className="appointment-card bg-white border border-slate-100 rounded-2xl p-6 hover:shadow-xl hover:shadow-slate-200/50 transition-all">
                                        <div className="appointment-card-header flex justify-between items-start mb-6">
                                            <div className="space-y-1 flex-1">
                                                <span className={`info-chip px-3 py-1 rounded-full text-[10px] font-bold tracking-wider inline-block mb-2 md:mb-3 ${apt.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-600' :
                                                    apt.status === 'PENDING' ? 'bg-amber-50 text-amber-600' :
                                                        apt.status === 'CANCELLED' ? 'bg-red-50 text-red-600' :
                                                            apt.status === 'EXPIRED' ? 'bg-slate-100 text-slate-400' :
                                                                'bg-slate-100 text-slate-600'
                                                    }`}>
                                                    {apt.status}
                                                </span>
                                                <h3 className="appointment-card-doctor text-base md:text-lg font-bold text-slate-900 leading-tight">{apt.purpose}</h3>
                                                <p className="appointment-card-specialty text-slate-500 text-xs md:text-sm">MJY 88 Medical Clinic</p>
                                            </div>
                                            <div className="text-right mt-1 shrink-0">
                                                <p className="appointment-card-date font-bold text-slate-900 text-sm md:text-base">{formatDate(apt.appointment_date)}</p>
                                                <p className="appointment-card-time text-slate-500 text-xs md:text-sm">{apt.appointment_time}</p>
                                            </div>
                                        </div>

                                        <div className="divider h-px bg-slate-50 mb-6" />

                                        <div className="appointment-card-actions flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
                                            <div className="flex flex-wrap gap-2 md:gap-3 w-full sm:w-auto">
                                                <button
                                                    onClick={() => setSelectedApt(apt)}
                                                    className="btn-primary-sm bg-black text-white px-4 py-2.5 rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors flex-1 sm:flex-none text-center"
                                                >
                                                    View Details
                                                </button>
                                                {(apt.status === 'CONFIRMED' || apt.status === 'PENDING') && (
                                                    <button
                                                        onClick={() => handleReschedule(apt)}
                                                        className="btn-secondary-sm bg-white border border-slate-200 text-slate-600 px-4 py-2.5 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors flex-1 sm:flex-none text-center"
                                                    >
                                                        Reschedule
                                                    </button>
                                                )}
                                            </div>
                                            {(apt.status === 'CONFIRMED' || apt.status === 'PENDING') && (
                                                <button
                                                    disabled={actioningId === apt.id}
                                                    onClick={() => setCancelModalApt(apt)}
                                                    className="cancel-link text-xs text-red-400 font-medium hover:text-red-600 transition-colors disabled:opacity-50 cursor-pointer w-full sm:w-auto text-center sm:text-right py-2 sm:py-0"
                                                >
                                                    {actioningId === apt.id ? "Processing..." : "Cancel Visit"}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                                    <Calendar size={48} className="text-slate-300 mb-4" />
                                    <h3 className="text-lg font-bold text-slate-900">No appointments found</h3>
                                    <p className="text-slate-500 mb-6 text-center max-w-xs">You don't have any {activeTab.toLowerCase()} at the moment.</p>
                                    <Link to="/book" className="bg-black text-white px-6 py-2 rounded-xl font-semibold hover:bg-slate-800 transition-all">
                                        Book Now
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* APPOINTMENT DETAILS MODAL */}
                    {selectedApt && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                                <div className="p-6 border-b flex justify-between items-center bg-slate-50">
                                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                        <Info size={18} className="text-black" /> Appointment Details
                                    </h3>
                                    <button onClick={() => setSelectedApt(null)} className="text-slate-400 hover:text-black p-1">
                                        <X size={20} />
                                    </button>
                                </div>
                                <div className="p-8 space-y-6">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-slate-400 mb-1">Status</p>
                                            <p className={`font-bold uppercase tracking-wider ${selectedApt.status === 'CONFIRMED' ? 'text-emerald-600' :
                                                selectedApt.status === 'PENDING' ? 'text-amber-600' :
                                                    selectedApt.status === 'EXPIRED' ? 'text-slate-400' : 'text-red-500'
                                                }`}>
                                                {selectedApt.status}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-slate-400 mb-1">Purpose</p>
                                            <p className="font-bold text-slate-800">{selectedApt.purpose}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-400 mb-1">Date</p>
                                            <p className="font-bold text-slate-800">{formatDate(selectedApt.appointment_date)}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-400 mb-1">Time</p>
                                            <p className="font-bold text-slate-800">{selectedApt.appointment_time}</p>
                                        </div>
                                    </div>
                                    <div className="p-6 bg-slate-50 text-right">
                                        <button
                                            onClick={() => setSelectedApt(null)}
                                            className="bg-black text-white px-8 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition-colors"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* CANCEL CONFIRMATION MODAL */}
                    {cancelModalApt && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                            <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                                <div className="p-8 text-center space-y-6">
                                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <X size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">Cancel Appointment?</h3>
                                        <p className="text-slate-500 text-sm">Are you sure you want to cancel your visit for <span className="font-bold text-slate-800">{cancelModalApt.purpose}</span> on <span className="font-bold text-slate-800">{formatDate(cancelModalApt.appointment_date)}</span>?</p>
                                    </div>
                                    <div className="flex gap-3 pt-4">
                                        <button
                                            onClick={() => setCancelModalApt(null)}
                                            className="flex-1 py-3 border-2 border-slate-100 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-colors"
                                        >
                                            Keep It
                                        </button>
                                        <button
                                            onClick={() => handleCancelVisit(cancelModalApt.id)}
                                            className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30"
                                        >
                                            Yes, Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </ClientLayout>
        </PageTransition>
    );
}