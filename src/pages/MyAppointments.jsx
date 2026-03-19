import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, CalendarPlus, ClipboardList, Settings,
    LogOut, ShieldCheck, User, Search, Bell, Plus, Loader2, Calendar, X, Info
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import PageTransition from "../components/layout/PageTransition.jsx";
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

    // UI States for Actions
    const [selectedApt, setSelectedApt] = useState(null); // State for View Details Modal
    const [isActionLoading, setIsActionLoading] = useState(false);

    // --- FETCH DATA ---
    const fetchData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/login');
                return;
            }

            // 1. Fetch Profile
            const { data: profile } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', user.id)
                .single();
            if (profile) setUserName(profile.full_name);
            setIsUserLoading(false);

            // 2. Fetch Appointments
            const { data: aptData, error: aptError } = await supabase
                .from('appointments')
                .select('*')
                .eq('user_id', user.id)
                .order('appointment_date', { ascending: true });

            if (aptError) throw aptError;
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
        const confirmCancel = window.confirm("Are you sure you want to cancel this appointment?");
        if (!confirmCancel) return;

        setIsActionLoading(true);
        try {
            const { data, error } = await supabase
                .from('appointments')
                .update({ status: 'CANCELLED' })
                .eq('id', id)
                .select(); // .select() ensures the policy allows the update and returns data

            if (error) throw error;

            if (data && data.length > 0) {
                // Manually update local state for instant UI feedback
                setAppointments(prev =>
                    prev.map(apt => apt.id === id ? { ...apt, status: 'CANCELLED' } : apt)
                );
                alert("Appointment cancelled successfully.");
            } else {
                alert("Update failed. Please check your database Row Level Security (RLS) policies.");
            }
        } catch (err) {
            alert("Error cancelling appointment: " + err.message);
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleReschedule = (apt) => {
        // Redirect to booking page and pass the appointment data via state
        navigate('/book', { state: { rescheduleData: apt } });
    };

    // --- FILTERING LOGIC ---
    const filteredAppointments = appointments.filter(apt => {
        const matchesSearch = apt.purpose.toLowerCase().includes(searchQuery.toLowerCase());

        if (activeTab === 'Upcoming Visits') {
            return matchesSearch && (apt.status === 'CONFIRMED' || apt.status === 'PENDING');
        }
        if (activeTab === 'Past History') {
            return matchesSearch && apt.status === 'COMPLETED';
        }
        if (activeTab === 'Cancelled') {
            return matchesSearch && apt.status === 'CANCELLED';
        }
        return matchesSearch;
    });

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { name: 'Book Appointment', icon: CalendarPlus, path: '/book' },
        { name: 'My Appointments', icon: ClipboardList, path: '/appointments' },
    ];

    const tabs = ['Upcoming Visits', 'Past History', 'Cancelled'];

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <PageTransition>
            <div className="client-layout">
                {/* SIDE NAVIGATION */}
                <aside className="client-sidebar">
                    <div className="space-y-10">
                        <Link to="/" className="flex items-center gap-3 px-2 group">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 overflow-hidden shrink-0 bg-white">
                                <img src="/mjylogo.png" alt="M" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex flex-col text-white font-black uppercase tracking-tight leading-none">
                                <span className="text-lg tracking-tighter">CareSync</span>
                                <span className="text-slate-500 text-[9px] tracking-[0.2em] mt-1 font-black">Client Portal</span>
                            </div>
                        </Link>

                        <nav className="sidebar-nav">
                            {navItems.map((item) => (
                                <Link key={item.name} to={item.path} className={`sidebar-nav-link ${location.pathname === item.path ? 'sidebar-nav-link--active' : ''}`}>
                                    <item.icon size={20} className={location.pathname === item.path ? 'sidebar-nav-icon--active' : 'sidebar-nav-icon'} />
                                    <span className="sidebar-nav-label">{item.name}</span>
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div className="sidebar-bottom">
                        <Link to="/settings" className="sidebar-settings-link">
                            <Settings size={20} />
                            <span className="text-sm font-medium">Settings</span>
                        </Link>

                        <div className="sidebar-user-section">
                            <div className="flex items-center gap-3">
                                <div className="sidebar-avatar bg-slate-800 flex items-center justify-center rounded-full w-10 h-10">
                                    {isUserLoading ? <Loader2 size={16} className="animate-spin text-slate-500" /> : <User className="text-slate-400" size={20} />}
                                </div>
                                <div className="flex flex-col overflow-hidden">
                                    <span className="sidebar-user-name text-white truncate w-24">{isUserLoading ? "..." : userName}</span>
                                    <span className="sidebar-user-role text-slate-500 text-[10px]">Patient Account</span>
                                </div>
                            </div>
                            <button onClick={handleLogout} className="sidebar-logout-btn bg-transparent border-none text-slate-400 hover:text-red-400 cursor-pointer p-1 transition-colors">
                                <LogOut size={18} />
                            </button>
                        </div>
                    </div>
                </aside>

                {/* MAIN CONTENT AREA */}
                <main className="flex-1 bg-white relative">
                    {/* Top Bar with Search */}
                    <div className="top-bar p-6 border-b border-slate-100 flex justify-between items-center">
                        <h2 className="top-bar-title font-bold text-slate-800">My Appointments</h2>
                        <div className="flex items-center gap-4">
                            <div className="appointments-topbar-search relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search by purpose..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="search-input pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-black outline-none"
                                />
                            </div>
                            <button className="btn-icon p-2 hover:bg-slate-100 rounded-full transition-colors relative">
                                <Bell size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="appointments-content p-8">
                        <div className="appointments-header flex justify-between items-end mb-8">
                            <div className="space-y-2">
                                <h1 className="page-title text-3xl font-bold text-slate-900">Appointments</h1>
                                <p className="page-subtitle text-slate-500">Manage your medical consultations.</p>
                            </div>
                            <Link to="/book" className="appointments-new-btn bg-black text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-slate-800 transition-all">
                                <Plus size={16} /> Book New Appointment
                            </Link>
                        </div>

                        {/* Tabs Navigation */}
                        <div className="tab-container flex gap-8 border-b border-slate-100 mb-8">
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

                        {/* Appointments List */}
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
                                            <div className="space-y-1">
                                                <span className={`info-chip px-3 py-1 rounded-full text-[10px] font-bold tracking-wider inline-block mb-3 ${apt.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-600' :
                                                    apt.status === 'PENDING' ? 'bg-amber-50 text-amber-600' :
                                                        apt.status === 'CANCELLED' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'
                                                    }`}>
                                                    {apt.status}
                                                </span>
                                                <h3 className="appointment-card-doctor text-lg font-bold text-slate-900">{apt.purpose}</h3>
                                                <p className="appointment-card-specialty text-slate-500 text-sm">MJY 88 Medical Clinic</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="appointment-card-date font-bold text-slate-900">{formatDate(apt.appointment_date)}</p>
                                                <p className="appointment-card-time text-slate-500 text-sm">{apt.appointment_time}</p>
                                            </div>
                                        </div>

                                        <div className="divider h-px bg-slate-50 mb-6" />

                                        <div className="appointment-card-actions flex justify-between items-center">
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => setSelectedApt(apt)}
                                                    className="btn-primary-sm bg-black text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors"
                                                >
                                                    View Details
                                                </button>
                                                {(apt.status === 'CONFIRMED' || apt.status === 'PENDING') && (
                                                    <button
                                                        onClick={() => handleReschedule(apt)}
                                                        className="btn-secondary-sm bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors"
                                                    >
                                                        Reschedule
                                                    </button>
                                                )}
                                            </div>
                                            {(apt.status === 'CONFIRMED' || apt.status === 'PENDING') && (
                                                <button
                                                    disabled={isActionLoading}
                                                    onClick={() => handleCancelVisit(apt.id)}
                                                    className="cancel-link text-xs text-red-400 font-medium hover:text-red-600 transition-colors disabled:opacity-50"
                                                >
                                                    Cancel Visit
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

                    {/* VIEW DETAILS MODAL */}
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
                                                    selectedApt.status === 'CANCELLED' ? 'text-red-500' : 'text-slate-900'
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
                                        <div>
                                            <p className="text-slate-400 mb-1">Payment Method</p>
                                            <p className="font-bold text-slate-800 uppercase">{selectedApt.payment_method}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-400 mb-1">Fee</p>
                                            <p className="font-bold text-slate-800">₱{selectedApt.amount}.00</p>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                            Please arrive 15 minutes before your scheduled time. Present your digital receipt at the counter.
                                        </p>
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
                    )}
                </main>
            </div>
        </PageTransition>
    );
}