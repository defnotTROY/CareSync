import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, UserCheck, Users, CalendarDays,
    CreditCard, FileText, Camera, Search, Bell, LogOut,
    CheckCircle2, Settings, UserPlus, Loader2, AlertCircle,
    Calendar, Clock, X, Sparkles
} from 'lucide-react';
import { supabase } from '../../supabaseClient';
import PageTransition from "../../components/layout/PageTransition.jsx";
import '../../styles/staff-portal.css';
import './ClientCheckIn.css';

export default function ClientCheckIn() {
    const location = useLocation();
    const navigate = useNavigate();

    // --- STAFF IDENTITY ---
    const [staffName, setStaffName] = useState("Staff");
    const [staffLoading, setStaffLoading] = useState(true);

    // --- TABS & SEARCH ---
    const [activeTab, setActiveTab] = useState('manual');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    // --- SELECTED APPOINTMENT ---
    const [selectedApt, setSelectedApt] = useState(null);

    // --- PROCEDURE CHECKLIST ---
    const [procedures, setProcedures] = useState({
        verifyIdentity: false,
        updateContact: false,
        consentSigned: false,
        collectPayment: false
    });

    // --- CHECK-IN ACTION ---
    const [isCheckingIn, setIsCheckingIn] = useState(false);
    const [checkInSuccess, setCheckInSuccess] = useState(false);

    // --- FETCH STAFF IDENTITY ON MOUNT ---
    useEffect(() => {
        const controller = new AbortController();

        async function fetchStaffInfo() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('full_name')
                        .eq('id', user.id)
                        .single()
                        .abortSignal(controller.signal);
                    setStaffName(profile?.full_name || "Staff Member");
                }
            } catch (err) {
                if (err.name !== 'AbortError') console.error("Staff info error:", err);
            } finally {
                setStaffLoading(false);
            }
        }

        fetchStaffInfo();
        return () => controller.abort();
    }, []);

    // --- SEARCH FOR CONFIRMED APPOINTMENTS ---
    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setSearching(true);
        setHasSearched(true);
        setSelectedApt(null);
        resetProcedures();

        try {
            // First fetch all CONFIRMED appointments
            const { data: appointments, error: aptError } = await supabase
                .from('appointments')
                .select('*')
                .eq('status', 'CONFIRMED')
                .order('appointment_date', { ascending: true });

            if (aptError) throw aptError;

            if (!appointments || appointments.length === 0) {
                setSearchResults([]);
                return;
            }

            // Fetch profiles for these appointments
            const userIds = [...new Set(appointments.map(a => a.user_id).filter(Boolean))];
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, full_name')
                .in('id', userIds);

            // Merge and filter by search query
            const query = searchQuery.toLowerCase().trim();
            const merged = appointments.map(apt => ({
                ...apt,
                profiles: (profiles || []).find(p => String(p.id) === String(apt.user_id)) || { full_name: "Unknown Patient" }
            }));

            const filtered = merged.filter(apt => {
                const nameMatch = apt.profiles.full_name.toLowerCase().includes(query);
                const idMatch = apt.id.toLowerCase().includes(query);
                const purposeMatch = apt.purpose.toLowerCase().includes(query);
                return nameMatch || idMatch || purposeMatch;
            });

            setSearchResults(filtered);
        } catch (err) {
            console.error("Search error:", err.message);
            setSearchResults([]);
        } finally {
            setSearching(false);
        }
    };

    // Trigger search on Enter key
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSearch();
    };

    // --- SELECT AN APPOINTMENT ---
    const handleSelectAppointment = (apt) => {
        setSelectedApt(apt);
        resetProcedures();
        setCheckInSuccess(false);
    };

    // --- PROCEDURE TOGGLES ---
    const toggleProcedure = (key) => {
        setProcedures(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const resetProcedures = () => {
        setProcedures({
            verifyIdentity: false,
            updateContact: false,
            consentSigned: false,
            collectPayment: false
        });
    };

    const allProceduresDone = Object.values(procedures).every(Boolean);

    // --- COMPLETE CHECK-IN ---
    const handleCompleteCheckIn = async () => {
        if (!selectedApt || !allProceduresDone) return;

        setIsCheckingIn(true);
        try {
            const { error } = await supabase
                .from('appointments')
                .update({ status: 'CHECKED_IN' })
                .eq('id', selectedApt.id);

            if (error) throw error;

            setCheckInSuccess(true);

            // Remove checked-in appointment from results
            setSearchResults(prev => prev.filter(a => a.id !== selectedApt.id));

            // Auto-reset after 3 seconds
            setTimeout(() => {
                setSelectedApt(null);
                setCheckInSuccess(false);
                resetProcedures();
            }, 3000);
        } catch (err) {
            console.error("Check-in error:", err.message);
            alert("Error checking in patient: " + err.message);
        } finally {
            setIsCheckingIn(false);
        }
    };

    // --- LOGOUT ---
    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    // --- HELPERS ---
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString(undefined, {
            month: 'short', day: 'numeric', year: 'numeric'
        });
    };

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/staff/dashboard' },
        { name: 'Client Check-in', icon: UserCheck, path: '/staff/check-in' },
        { name: 'Client Queue', icon: Users, path: '/staff/queue' },
        { name: 'Appointments', icon: CalendarDays, path: '/staff/appointments' },
        { name: 'Payment Record', icon: CreditCard, path: '/staff/payments' },
        { name: 'Client Record', icon: FileText, path: '/staff/records' },
        { name: 'New Client', icon: UserPlus, path: '/staff/new-client' },
    ];

    const procedureItems = [
        { id: 'verifyIdentity', label: 'Verify Identity' },
        { id: 'updateContact', label: 'Update Contact Info' },
        { id: 'consentSigned', label: 'Consent Form Signed' },
        { id: 'collectPayment', label: 'Collect Co-payment' }
    ];

    return (
        <PageTransition>
            <div className="staff-layout">

                {/* SIDEBAR */}
                <aside className="staff-sidebar">
                    <div className="staff-sidebar-top">
                        <div className="staff-brand">
                            <div className="staff-brand-icon">M</div>
                            <div className="staff-brand-text">
                                <span className="staff-brand-name">CareSync</span>
                                <span className="staff-brand-sub">Staff Terminal</span>
                            </div>
                        </div>

                        <nav className="staff-nav">
                            {navItems.map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.path}
                                        className={`staff-nav-link ${isActive ? 'staff-nav-link--active' : ''}`}
                                    >
                                        <item.icon size={20} className={isActive ? 'staff-nav-icon--active' : 'staff-nav-icon'} />
                                        <span className="staff-nav-label">{item.name}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="staff-sidebar-bottom">
                        <Link
                            to="/staff/settings"
                            className={`staff-settings-link ${location.pathname === '/staff/settings' ? 'staff-settings-link--active' : ''}`}
                        >
                            <Settings size={20} className={location.pathname === '/staff/settings' ? 'staff-nav-icon--active' : 'staff-nav-icon'} />
                            <span className="staff-nav-label">Settings</span>
                        </Link>

                        <div className="staff-user-section">
                            <div className="staff-user-info">
                                <div className="staff-user-avatar">{staffName ? staffName.charAt(0) : 'S'}</div>
                                <div className="flex flex-col overflow-hidden">
                                    <span className="staff-user-name truncate w-20">{staffLoading ? "..." : staffName}</span>
                                    <span className="staff-user-role">Staff</span>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="staff-logout-btn"
                                title="Logout"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    </div>
                </aside>

                {/* MAIN CONTENT */}
                <main className="staff-main-sm">
                    {/* Header */}
                    <div className="staff-header">
                        <div className="staff-header-info">
                            <h1 className="staff-page-title-sm">Client Check-in</h1>
                            <p className="staff-page-subtitle-plain">Verify and initiate patient clinical journey</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="staff-active-indicator">
                                <div className="staff-pulse-dot" />
                                <span className="staff-active-label">Terminal Active</span>
                            </div>
                            <button className="staff-bell-btn">
                                <Bell size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="staff-grid-12">
                        {/* LEFT: Scanner / Manual Search */}
                        <div className="col-span-7 space-y-8">
                            <div className="checkin-scanner-card">
                                <div className="checkin-tab-bar">
                                    <button onClick={() => setActiveTab('scan')} className={`staff-tab ${activeTab === 'scan' ? 'staff-tab--active' : 'staff-tab--inactive'}`}>
                                        <Camera size={18} /> Scan QR Code
                                    </button>
                                    <button onClick={() => setActiveTab('manual')} className={`staff-tab ${activeTab === 'manual' ? 'staff-tab--active' : 'staff-tab--inactive'}`}>
                                        <Search size={18} /> Manual Entry
                                    </button>
                                </div>

                                {/* SCAN TAB — Placeholder */}
                                {activeTab === 'scan' && (
                                    <div className="checkin-scanner-body">
                                        <div className="checkin-scanner-frame group">
                                            <div className="checkin-scanner-hover" />
                                            <Camera size={64} className="text-slate-200" />
                                        </div>
                                        <div className="text-center space-y-2">
                                            <p className="checkin-scanner-title">QR Scanner</p>
                                            <p className="checkin-scanner-desc">QR scanning is coming soon. Use Manual Entry to search for patients.</p>
                                        </div>
                                        <button
                                            onClick={() => setActiveTab('manual')}
                                            className="staff-btn-activate"
                                        >
                                            Switch to Manual Entry
                                        </button>
                                    </div>
                                )}

                                {/* MANUAL ENTRY TAB */}
                                {activeTab === 'manual' && (
                                    <div className="checkin-manual-body">
                                        <div className="checkin-search-bar">
                                            <Search size={18} className="text-slate-400" />
                                            <input
                                                type="text"
                                                placeholder="Search by patient name, appointment ID, or purpose..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                onKeyDown={handleKeyDown}
                                                className="checkin-search-input"
                                            />
                                            <button
                                                onClick={handleSearch}
                                                disabled={searching || !searchQuery.trim()}
                                                className="checkin-search-btn"
                                            >
                                                {searching ? <Loader2 size={16} className="animate-spin" /> : "Search"}
                                            </button>
                                        </div>

                                        {/* Search Results */}
                                        <div className="checkin-results-area">
                                            {searching ? (
                                                <div className="checkin-empty-state">
                                                    <Loader2 size={32} className="animate-spin text-slate-300" />
                                                    <p className="text-slate-400 text-sm mt-3">Searching appointments...</p>
                                                </div>
                                            ) : searchResults.length > 0 ? (
                                                <div className="checkin-results-list">
                                                    <p className="checkin-results-count">{searchResults.length} confirmed appointment{searchResults.length > 1 ? 's' : ''} found</p>
                                                    {searchResults.map((apt) => (
                                                        <button
                                                            key={apt.id}
                                                            onClick={() => handleSelectAppointment(apt)}
                                                            className={`checkin-result-card ${selectedApt?.id === apt.id ? 'checkin-result-card--active' : ''}`}
                                                        >
                                                            <div className="checkin-result-avatar">
                                                                {apt.profiles.full_name.charAt(0)}
                                                            </div>
                                                            <div className="checkin-result-info">
                                                                <p className="checkin-result-name">{apt.profiles.full_name}</p>
                                                                <p className="checkin-result-detail">{apt.purpose} • {formatDate(apt.appointment_date)}</p>
                                                            </div>
                                                            <div className="checkin-result-meta">
                                                                <span className="checkin-result-time">{apt.appointment_time}</span>
                                                                <span className="checkin-result-id">#{apt.id.slice(0, 8)}</span>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : hasSearched ? (
                                                <div className="checkin-empty-state">
                                                    <AlertCircle size={32} className="text-slate-300" />
                                                    <p className="text-slate-500 font-bold mt-3">No confirmed appointments found</p>
                                                    <p className="text-slate-400 text-xs mt-1">Only CONFIRMED appointments can be checked in.</p>
                                                </div>
                                            ) : (
                                                <div className="checkin-empty-state">
                                                    <Search size={32} className="text-slate-200" />
                                                    <p className="text-slate-400 text-sm mt-3">Search for a patient to begin check-in</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT: Patient Info + Procedures */}
                        <div className="col-span-5 space-y-6">

                            {/* Patient Info Card */}
                            {selectedApt && !checkInSuccess && (
                                <div className="checkin-patient-card">
                                    <div className="checkin-patient-header">
                                        <div className="checkin-patient-avatar-lg">
                                            {selectedApt.profiles.full_name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="checkin-patient-name">{selectedApt.profiles.full_name}</p>
                                            <p className="checkin-patient-id">ID: #{selectedApt.id.slice(0, 8).toUpperCase()}</p>
                                        </div>
                                        <button onClick={() => { setSelectedApt(null); resetProcedures(); }} className="checkin-patient-close">
                                            <X size={16} />
                                        </button>
                                    </div>
                                    <div className="checkin-patient-details">
                                        <div className="checkin-detail-row">
                                            <Calendar size={14} className="text-slate-400" />
                                            <span>{formatDate(selectedApt.appointment_date)}</span>
                                        </div>
                                        <div className="checkin-detail-row">
                                            <Clock size={14} className="text-slate-400" />
                                            <span>{selectedApt.appointment_time}</span>
                                        </div>
                                        <div className="checkin-detail-row">
                                            <FileText size={14} className="text-slate-400" />
                                            <span>{selectedApt.purpose}</span>
                                        </div>
                                        <div className="checkin-detail-row">
                                            <CreditCard size={14} className="text-slate-400" />
                                            <span>₱{selectedApt.amount || 0} — {selectedApt.payment_method || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Success State */}
                            {checkInSuccess && (
                                <div className="checkin-success-card">
                                    <div className="checkin-success-icon">
                                        <Sparkles size={32} />
                                    </div>
                                    <h3 className="checkin-success-title">Check-in Complete!</h3>
                                    <p className="checkin-success-text">
                                        {selectedApt?.profiles?.full_name} has been checked in successfully.
                                    </p>
                                </div>
                            )}

                            {/* Procedure Checklist */}
                            {!checkInSuccess && (
                                <div className="staff-card">
                                    <h3 className="staff-section-title"><FileText size={18} /> Standard Procedure</h3>

                                    {!selectedApt && (
                                        <p className="checkin-procedure-hint">Select a patient to begin the check-in procedure.</p>
                                    )}

                                    <div className="space-y-4">
                                        {procedureItems.map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => toggleProcedure(item.id)}
                                                disabled={!selectedApt}
                                                className={`checkin-procedure-btn ${procedures[item.id] ? 'border-black' : 'border-slate-100'} ${!selectedApt ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <div className={`checkin-procedure-check ${procedures[item.id] ? 'bg-black border-black text-white' : 'border-slate-200'}`}>
                                                    {procedures[item.id] && <CheckCircle2 size={14} />}
                                                </div>
                                                <p className={`checkin-procedure-label ${procedures[item.id] ? 'text-black' : 'text-slate-400'}`}>
                                                    {item.label}
                                                </p>
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        onClick={handleCompleteCheckIn}
                                        disabled={!selectedApt || !allProceduresDone || isCheckingIn}
                                        className="staff-btn-primary-full"
                                    >
                                        {isCheckingIn ? (
                                            <><Loader2 size={18} className="animate-spin" /> Processing...</>
                                        ) : (
                                            <><UserCheck size={18} /> Complete Check-in</>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </PageTransition>
    );
}