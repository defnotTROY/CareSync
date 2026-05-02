import { useState, useEffect, useRef } from 'react';
import {
    Search, Bell, Menu, FileSearch, CheckCircle2,
    X, Calendar, AlertCircle, FileText, Loader2, Check
} from 'lucide-react';
import { supabase } from '../../supabaseClient';

export default function StaffHeader({ onMenuClick, title }) {
    const dropdownRef = useRef(null);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // --- Fetch pending appointments as notifications ---
    useEffect(() => {
        const controller = new AbortController();
        fetchNotifications(controller.signal);

        // Real-time: listen for new pending appointments
        const channel = supabase
            .channel('header-notifications')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'appointments' },
                () => {
                    setTimeout(() => fetchNotifications(), 500);
                }
            )
            .subscribe();

        return () => {
            controller.abort();
            supabase.removeChannel(channel);
        };
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        if (!showNotifications) return;
        function handleClickOutside(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowNotifications(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showNotifications]);

    async function fetchNotifications(signal) {
        try {
            let query = supabase
                .from('appointments')
                .select('*')
                .eq('status', 'PENDING')
                .order('created_at', { ascending: false });

            if (signal) query = query.abortSignal(signal);

            const { data: appointments, error } = await query;

            if (error) throw error;

            // Fetch profiles for the appointments
            const userIds = [...new Set((appointments || []).map(a => a.user_id).filter(Boolean))];
            let profiles = [];
            if (userIds.length > 0) {
                let profileQuery = supabase
                    .from('profiles')
                    .select('id, first_name, last_name')
                    .in('id', userIds);

                if (signal) profileQuery = profileQuery.abortSignal(signal);

                const { data } = await profileQuery;
                profiles = (data || []).map(p => ({
                    ...p,
                    full_name: `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Patient'
                }));
            }

            const merged = (appointments || []).map(apt => ({
                ...apt,
                profiles: profiles.find(p => String(p.id).toLowerCase() === String(apt.user_id).toLowerCase()) || { full_name: "Unregistered Patient" }
            }));

            setNotifications(merged);
        } catch (err) {
            if (err.name !== 'AbortError') console.error("Header notification error:", err.message);
        }
    }

    async function handleConfirm(id) {
        try {
            setIsProcessing(true);
            const { error } = await supabase
                .from('appointments')
                .update({ status: 'CONFIRMED' })
                .eq('id', id);

            if (!error) {
                setSelectedAppointment(null);
                await fetchNotifications();
            }
        } finally {
            setIsProcessing(false);
        }
    }

    return (
        <>
            <header className="top-bar p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-30">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onMenuClick}
                        className="md:hidden p-2 text-slate-400 hover:text-black hover:bg-slate-50 rounded-lg transition-colors"
                        aria-label="Open menu"
                    >
                        <Menu size={24} />
                    </button>

                    {title && (
                        <h2 className="top-bar-title font-black uppercase italic tracking-tighter text-slate-950 md:block hidden lg:block">
                            {title}
                        </h2>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    <div className="staff-topbar-search relative hidden sm:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="search-input pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-1 focus:ring-black outline-none w-48 md:w-64 font-bold"
                        />
                    </div>

                    {/* Notification Bell */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            className={`btn-icon p-2 hover:bg-slate-100 rounded-full transition-colors relative ${showNotifications ? 'bg-slate-100' : ''}`}
                            onClick={() => setShowNotifications(!showNotifications)}
                        >
                            <Bell size={20} className="text-slate-600" />
                            {notifications.length > 0 && (
                                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" style={{ animation: 'bell-pulse 2s infinite' }}></span>
                            )}
                        </button>

                        {showNotifications && (
                            <div className="notification-dropdown">
                                <div className="notification-header">
                                    <h3 className="font-bold text-sm text-slate-400 uppercase tracking-widest">Notifications</h3>
                                    <span className="notification-badge">{notifications.length} New</span>
                                </div>
                                <div className="notification-scroll">
                                    {notifications.length > 0 ? (
                                        notifications.map((notif) => (
                                            <div key={notif.id} className="notification-item">
                                                <div className="flex justify-between items-start mb-1">
                                                    <p className="notification-user-name">{notif.profiles?.full_name || "Patient"}</p>
                                                    <p className="text-[10px] text-slate-400">{notif.appointment_date}</p>
                                                </div>
                                                <p className="notification-purpose mb-3">Requested: {notif.purpose}</p>
                                                <button
                                                    onClick={() => {
                                                        setSelectedAppointment(notif);
                                                        setShowNotifications(false);
                                                    }}
                                                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] py-2 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <FileSearch size={14} />
                                                    View Details
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center">
                                            <div className="notif-empty-icon">
                                                <CheckCircle2 size={24} className="text-slate-300" />
                                            </div>
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">All caught up!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* --- APPOINTMENT DETAIL MODAL (works on any page) --- */}
            {selectedAppointment && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-900">Appointment Details</h2>
                            <button
                                onClick={() => setSelectedAppointment(null)}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <X size={20} className="text-slate-400" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Patient Summary */}
                            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <div className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center text-xl font-bold">
                                    {selectedAppointment.profiles?.full_name?.charAt(0) || 'P'}
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-0.5">Patient Name</p>
                                    <p className="font-bold text-lg text-slate-900 leading-tight">
                                        {selectedAppointment.profiles?.full_name || "Patient Name Not Found"}
                                    </p>
                                    <p className="text-[10px] text-slate-400 mt-1 font-mono">
                                        UID: {selectedAppointment.user_id?.slice(0, 12)}...
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1">
                                        <Calendar size={12} /> Date
                                    </p>
                                    <p className="text-sm font-medium text-slate-700">{selectedAppointment.appointment_date}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1">
                                        <AlertCircle size={12} /> Status
                                    </p>
                                    <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] rounded-md font-bold uppercase">
                                        {selectedAppointment.status}
                                    </span>
                                </div>
                                <div className="col-span-2 space-y-1">
                                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1">
                                        <FileText size={12} /> Purpose
                                    </p>
                                    <p className="text-sm font-medium text-slate-700 bg-slate-50 p-3 rounded-xl">
                                        {selectedAppointment.purpose}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-slate-50 flex gap-3">
                            <button
                                onClick={() => setSelectedAppointment(null)}
                                className="flex-1 bg-white border border-slate-200 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-100 transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => handleConfirm(selectedAppointment.id)}
                                disabled={isProcessing}
                                className="flex-1 bg-black text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isProcessing ? (
                                    <Loader2 size={20} className="animate-spin" />
                                ) : (
                                    <>
                                        <Check size={16} />
                                        Confirm Appointment
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
