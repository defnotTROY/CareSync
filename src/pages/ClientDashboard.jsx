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
import ClientLayout from '../components/layout/ClientLayout.jsx';
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

    return (
        <PageTransition>
            <ClientLayout title="Overview">
                <div className="flex flex-col h-full w-full max-w-7xl mx-auto">
                    <header className="dashboard-header mb-8 md:mb-12">
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
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div className="space-y-2 md:space-y-3">
                                        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${upcomingApt.status === 'PENDING' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                            Upcoming {upcomingApt.status}
                                        </span>
                                        <h2 className="appointment-title text-xl md:text-2xl font-bold text-slate-900 leading-tight">{upcomingApt.purpose}</h2>
                                        <p className="appointment-doctor text-slate-500 text-sm">Routine medical evaluation at MJY 88</p>
                                    </div>
                                    <p className="appointment-days-left font-bold text-slate-900 bg-slate-50 px-4 py-2 rounded-xl text-center self-stretch md:self-auto flex items-center justify-center">{getDaysLeft(upcomingApt.appointment_date)}</p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mt-6 md:mt-8">
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

                                <div className="appointment-actions flex flex-col sm:flex-row gap-3 mt-6 md:mt-8 pt-6 border-t border-slate-100">
                                    <button onClick={() => navigate('/appointments')} className="w-full sm:w-auto bg-black text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors">Manage</button>
                                    <button onClick={() => navigate('/book', { state: { rescheduleData: upcomingApt } })} className="w-full sm:w-auto bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors">Reschedule</button>
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
                </div>
            </ClientLayout>
        </PageTransition>
    );
}