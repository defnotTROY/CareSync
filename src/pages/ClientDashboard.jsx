import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    CalendarPlus,
    ClipboardList,
    Settings,
    LogOut,
    ShieldCheck,
    User,
    Loader2,
    Calendar
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import PageTransition from "../components/layout/PageTransition.jsx";
import '../styles/client-portal.css';
import './ClientDashboard.css';

export default function ClientDashboard() {
    const location = useLocation();
    const navigate = useNavigate();

    // States
    const [userName, setUserName] = useState("User");
    const [loading, setLoading] = useState(true);
    const [upcomingApt, setUpcomingApt] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    async function fetchDashboardData() {
        try {
            setLoading(true);

            // 1. Get the current logged-in user
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                navigate('/login');
                return;
            }

            // 2. Fetch the Profile Name
            const { data: profile } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', user.id)
                .single();
            if (profile) setUserName(profile.full_name);

            // 3. Fetch the nearest upcoming appointment
            // We look for PENDING or CONFIRMED and grab the one with the closest date
            const { data: appointments, error: aptError } = await supabase
                .from('appointments')
                .select('*')
                .eq('user_id', user.id)
                .in('status', ['PENDING', 'CONFIRMED'])
                .gte('appointment_date', new Date().toISOString().split('T')[0]) // Only today or future
                .order('appointment_date', { ascending: true })
                .limit(1);

            if (aptError) throw aptError;
            if (appointments && appointments.length > 0) {
                setUpcomingApt(appointments[0]);
            }

        } catch (error) {
            console.error('Dashboard Load Error:', error.message);
        } finally {
            setLoading(false);
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    // Helper: Calculate Days Left
    const getDaysLeft = (dateString) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const target = new Date(dateString);
        const diffTime = target - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "Tomorrow";
        return `In ${diffDays} days`;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString(undefined, {
            month: 'short', day: 'numeric', year: 'numeric'
        });
    };

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { name: 'Book Appointment', icon: CalendarPlus, path: '/book' },
        { name: 'My Appointments', icon: ClipboardList, path: '/appointments' },
    ];

    return (
        <PageTransition>
            <div className="client-layout">
                {/* SIDE NAVIGATION BAR */}
                <aside className="client-sidebar">
                    <div className="space-y-10">
                        <Link to="/" className="flex items-center gap-3 px-2 group">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg overflow-hidden shrink-0">
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
                        <Link to="/settings" className="sidebar-settings-link"><Settings size={20} /> <span className="text-sm font-medium">Settings</span></Link>
                        <div className="sidebar-user-section">
                            <div className="flex items-center gap-3">
                                <div className="sidebar-avatar bg-slate-800 flex items-center justify-center rounded-full w-10 h-10">
                                    {loading ? <Loader2 size={16} className="animate-spin text-slate-500" /> : <User className="text-slate-400" size={20} />}
                                </div>
                                <div className="flex flex-col">
                                    <span className="sidebar-user-name text-white truncate max-w-[100px]">{loading ? "..." : userName}</span>
                                    <span className="sidebar-user-role text-slate-500 text-xs">Client Account</span>
                                </div>
                            </div>
                            <button onClick={handleLogout} className="sidebar-logout-btn bg-transparent border-none text-slate-400 hover:text-red-400 cursor-pointer p-1"><LogOut size={18} /></button>
                        </div>
                    </div>
                </aside>

                {/* MAIN DASHBOARD AREA */}
                <main className="main-content">
                    <header className="dashboard-header">
                        <h1 className="page-title text-3xl font-bold text-slate-900">
                            Welcome, {loading ? <span className="animate-pulse">...</span> : userName.split(' ')[0]}
                        </h1>
                        <p className="dashboard-welcome text-slate-500">Manage your health and appointments at a glance.</p>
                    </header>

                    {loading ? (
                        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-slate-300" size={48} /></div>
                    ) : upcomingApt ? (
                        <section className="relative group cursor-pointer">
                            <div className="card-shadow-offset" />
                            <div className="card-shadow bg-white p-8 rounded-3xl border border-slate-100 shadow-xl">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-3">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${upcomingApt.status === 'PENDING' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                            Upcoming {upcomingApt.status}
                                        </span>
                                        <h2 className="appointment-title text-2xl font-bold text-slate-900">{upcomingApt.purpose}</h2>
                                        <p className="appointment-doctor text-slate-500">Routine medical evaluation at MJY 88</p>
                                    </div>
                                    <p className="appointment-days-left font-bold text-slate-900">{getDaysLeft(upcomingApt.appointment_date)}</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                                    <div className="info-detail-row flex items-center gap-4">
                                        <div className="info-detail-icon p-3 bg-slate-50 rounded-xl text-slate-600"><CalendarPlus size={20} /></div>
                                        <div><p className="text-xs text-slate-400">Date</p><p className="font-bold text-slate-900">{formatDate(upcomingApt.appointment_date)}</p></div>
                                    </div>
                                    <div className="info-detail-row flex items-center gap-4">
                                        <div className="info-detail-icon p-3 bg-slate-50 rounded-xl text-slate-600"><ClipboardList size={20} /></div>
                                        <div><p className="text-xs text-slate-400">Time</p><p className="font-bold text-slate-900">{upcomingApt.appointment_time}</p></div>
                                    </div>
                                    <div className="info-detail-row flex items-center gap-4">
                                        <div className="info-detail-icon p-3 bg-slate-50 rounded-xl text-slate-600"><ShieldCheck size={20} /></div>
                                        <div><p className="text-xs text-slate-400">Location</p><p className="font-bold text-slate-900">Main Branch</p></div>
                                    </div>
                                </div>

                                <div className="appointment-actions flex gap-3 mt-8">
                                    <button onClick={() => navigate('/appointments')} className="bg-black text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors">Manage</button>
                                    <button onClick={() => navigate('/book', { state: { rescheduleData: upcomingApt } })} className="bg-white border border-slate-200 text-slate-600 px-6 py-2 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors">Reschedule</button>
                                </div>
                            </div>
                        </section>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                            <Calendar size={48} className="text-slate-300 mb-4" />
                            <h3 className="text-lg font-bold text-slate-900">No Upcoming Appointments</h3>
                            <p className="text-slate-500 mb-6">You don't have any evaluations scheduled at the moment.</p>
                            <Link to="/book" className="bg-black text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-black/10 hover:bg-slate-800 transition-all">Book Now</Link>
                        </div>
                    )}
                </main>
            </div>
        </PageTransition>
    );
}