import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, UserCheck, Users, CalendarDays,
    CreditCard, FileText, Camera, Search, Bell, LogOut,
    CheckCircle2, Settings, UserPlus, Loader2, AlertCircle,
    Calendar, Clock, X, Sparkles, ScanLine
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { supabase } from '../../lib/supabase.js';
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

    // --- QR SCANNER ---
    const scannerRef = useRef(null);
    const scannerContainerId = 'qr-scanner-container';
    const [scanStatus, setScanStatus] = useState('idle'); // idle | scanning | found | error
    const [scanMessage, setScanMessage] = useState('');
    const [scanLoading, setScanLoading] = useState(false);

    // --- DERIVED STATE ---
    const allProceduresDone = Object.values(procedures).every(Boolean);

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
                        .single();

                    setStaffName(profile?.full_name || "Staff Member");
                }
            } catch (err) {
                console.error("Staff info error:", err);
            } finally {
                setStaffLoading(false);
            }
        }

        fetchStaffInfo();
        return () => controller.abort();
    }, []);

    // --- QR SCANNER LIFECYCLE ---
    const stopScanner = useCallback(async () => {
        if (scannerRef.current) {
            try {
                await scannerRef.current.stop();
            } catch (_) { }
            try {
                scannerRef.current.clear();
            } catch (_) { }
            scannerRef.current = null;
        }
    }, []);

    const handleQrScanSuccess = useCallback(async (decodedText) => {
        await stopScanner();
        setScanLoading(false);
        setScanStatus('scanning');

        try {
            const appointmentId = decodedText.trim();

            const { data: appointment, error: aptError } = await supabase
                .from('appointments')
                .select('*')
                .eq('id', appointmentId)
                .single();

            if (aptError || !appointment) {
                setScanStatus('error');
                setScanMessage('Invalid QR code or appointment not found.');
                return;
            }

            if (appointment.status === 'CHECKED_IN') {
                setScanStatus('error');
                setScanMessage('Patient is already checked in.');
                return;
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('id, full_name')
                .eq('id', appointment.user_id)
                .single();

            const enrichedApt = {
                ...appointment,
                profiles: profile || { full_name: 'Unknown Patient' }
            };

            handleSelectAppointment(enrichedApt);
            setScanStatus('found');
            setScanMessage(`Found: ${enrichedApt.profiles.full_name}`);

            setTimeout(() => {
                setScanStatus('idle');
                setScanMessage('');
            }, 3000);
        } catch (err) {
            setScanStatus('error');
            setScanMessage('Error looking up appointment.');
        }
    }, [stopScanner]);

    useEffect(() => {
        if (activeTab === 'scan' && scanStatus === 'idle') {
            const timer = setTimeout(async () => {
                const containerEl = document.getElementById(scannerContainerId);
                if (!containerEl) return;

                setScanLoading(true);
                try {
                    const html5Qrcode = new Html5Qrcode(scannerContainerId);
                    scannerRef.current = html5Qrcode;
                    await html5Qrcode.start(
                        { facingMode: 'environment' },
                        { fps: 10, qrbox: { width: 250, height: 250 } },
                        handleQrScanSuccess,
                        () => { }
                    );
                    setScanLoading(false);
                } catch (err) {
                    setScanLoading(false);
                    setScanStatus('error');
                    setScanMessage('Camera access denied.');
                }
            }, 300);
            return () => clearTimeout(timer);
        }
        if (activeTab !== 'scan') {
            stopScanner();
        }
    }, [activeTab, scanStatus, handleQrScanSuccess, stopScanner]);

    // --- SEARCH LOGIC ---
    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setSearching(true);
        setHasSearched(true);
        setSelectedApt(null);
        resetProcedures();

        const q = searchQuery.trim().toLowerCase();

        try {
            // Step 1: Find profiles whose full_name matches the query
            const { data: matchedProfiles } = await supabase
                .from('profiles')
                .select('id, full_name')
                .ilike('full_name', `%${q}%`);

            const matchedUserIds = (matchedProfiles || []).map(p => p.id);

            // Step 2: Fetch CONFIRMED appointments for today that match by name OR purpose
            const now = new Date();
            const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

            let query = supabase
                .from('appointments')
                .select(`
                    *,
                    profiles:user_id (id, full_name)
                `)
                .eq('status', 'CONFIRMED')
                .eq('appointment_date', todayStr);

            if (matchedUserIds.length > 0) {
                // Match by patient name OR by purpose
                query = query.or(`user_id.in.(${matchedUserIds.join(',')}),purpose.ilike.%${q}%`);
            } else {
                // Fall back to purpose search only
                query = query.ilike('purpose', `%${q}%`);
            }

            const { data: appointments, error: aptError } = await query
                .order('appointment_time', { ascending: true });

            if (aptError) throw aptError;

            // Merge profile data for any appointments that came through purpose match
            const profileMap = Object.fromEntries((matchedProfiles || []).map(p => [p.id, p]));
            const enriched = (appointments || []).map(apt => ({
                ...apt,
                profiles: apt.profiles || profileMap[apt.user_id] || { full_name: 'Unknown Patient' }
            }));

            setSearchResults(enriched);
        } catch (err) {
            console.error("Search error:", err);
            setSearchResults([]);
        } finally {
            setSearching(false);
        }
    };

    // --- SELECTION & PROCEDURES ---
    const handleSelectAppointment = (apt) => {
        setSelectedApt(apt);
        resetProcedures();
        setCheckInSuccess(false);
    };

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

    // --- COMPLETE CHECK-IN (SYNCHRONIZED) ---
    const handleCompleteCheckIn = async () => {
        if (!selectedApt || !allProceduresDone) return;

        setIsCheckingIn(true);
        try {
            const { error } = await supabase
                .from('appointments')
                .update({
                    status: 'CHECKED_IN'
                    // Removed updated_at to prevent schema cache errors
                })
                .eq('id', selectedApt.id);

            if (error) throw error;

            setCheckInSuccess(true);
            setSearchResults(prev => prev.filter(a => a.id !== selectedApt.id));

            // Auto-reset UI after success
            setTimeout(() => {
                setSelectedApt(null);
                setCheckInSuccess(false);
                resetProcedures();
            }, 3000);

        } catch (err) {
            console.error("Check-in error:", err.message);
            alert("Check-in failed: " + err.message);
        } finally {
            setIsCheckingIn(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

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
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className={`staff-nav-link ${location.pathname === item.path ? 'staff-nav-link--active' : ''}`}
                                >
                                    <item.icon size={20} className={location.pathname === item.path ? 'staff-nav-icon--active' : 'staff-nav-icon'} />
                                    <span className="staff-nav-label">{item.name}</span>
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div className="staff-sidebar-bottom">
                        <div className="staff-user-section">
                            <div className="staff-user-info">
                                <div className="staff-user-avatar">{staffName ? staffName.charAt(0) : 'S'}</div>
                                <div className="flex flex-col overflow-hidden">
                                    <span className="staff-user-name truncate w-20">{staffLoading ? "..." : staffName}</span>
                                    <span className="staff-user-role">Staff</span>
                                </div>
                            </div>
                            <button onClick={handleLogout} className="staff-logout-btn"><LogOut size={18} /></button>
                        </div>
                    </div>
                </aside>

                {/* MAIN CONTENT */}
                <main className="staff-main-sm">
                    <div className="staff-header">
                        <div className="staff-header-info">
                            <h1 className="staff-page-title-sm">Client Check-in</h1>
                            <p className="staff-page-subtitle-plain">Verify and initiate patient journey</p>
                        </div>
                        <button className="staff-bell-btn"><Bell size={20} /></button>
                    </div>

                    <div className="staff-grid-12">
                        <div className="col-span-7 space-y-8">
                            <div className="checkin-scanner-card">
                                <div className="checkin-tab-bar">
                                    <button onClick={() => setActiveTab('scan')} className={`staff-tab ${activeTab === 'scan' ? 'staff-tab--active' : 'staff-tab--inactive'}`}>
                                        <Camera size={18} /> Scan QR
                                    </button>
                                    <button onClick={() => setActiveTab('manual')} className={`staff-tab ${activeTab === 'manual' ? 'staff-tab--active' : 'staff-tab--inactive'}`}>
                                        <Search size={18} /> Manual
                                    </button>
                                </div>

                                {activeTab === 'scan' && (
                                    <div className="checkin-scanner-body-live">
                                        {scanStatus === 'found' ? (
                                            <div className="checkin-scan-found text-center">
                                                <div className="checkin-scan-found-icon mx-auto bg-emerald-500 text-white p-4 rounded-full w-fit">
                                                    <CheckCircle2 size={32} />
                                                </div>
                                                <p className="checkin-scan-found-title mt-4 font-bold">QR Scanned!</p>
                                                <p className="text-slate-500">{scanMessage}</p>
                                            </div>
                                        ) : (
                                            <div className="checkin-qr-viewport relative">
                                                <div id={scannerContainerId} className="checkin-qr-reader" />
                                                {scanLoading && <div className="absolute inset-0 flex items-center justify-center bg-black/50"><Loader2 className="animate-spin text-white" /></div>}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'manual' && (
                                    <div className="checkin-manual-body p-6">
                                        <div className="checkin-search-bar flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Search patient name or purpose..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                                className="checkin-search-input flex-1 p-3 border rounded-xl"
                                            />
                                            <button
                                                onClick={handleSearch}
                                                disabled={searching || !searchQuery.trim()}
                                                className="bg-black text-white px-6 rounded-xl font-bold disabled:opacity-50 flex items-center gap-2"
                                            >
                                                {searching ? <Loader2 size={16} className="animate-spin" /> : 'Search'}
                                            </button>
                                        </div>
                                        <div className="checkin-results-area mt-6">
                                            {searching ? (
                                                <div className="flex items-center justify-center py-12">
                                                    <Loader2 size={32} className="animate-spin text-slate-300" />
                                                </div>
                                            ) : searchResults.length > 0 ? (
                                                searchResults.map((apt) => (
                                                    <button
                                                        key={apt.id}
                                                        onClick={() => handleSelectAppointment(apt)}
                                                        className={`w-full flex items-center justify-between p-4 border-2 rounded-2xl mb-3 transition-all ${
                                                            selectedApt?.id === apt.id
                                                                ? 'border-black bg-slate-50'
                                                                : 'border-slate-100 hover:border-slate-300'
                                                        }`}
                                                    >
                                                        <div className="text-left">
                                                            <p className="font-bold text-slate-900">{apt.profiles?.full_name}</p>
                                                            <p className="text-xs text-slate-400 mt-0.5">{apt.purpose} • {apt.appointment_time}</p>
                                                        </div>
                                                        <span className="text-[10px] font-black px-2 py-1 bg-emerald-100 text-emerald-600 rounded-full uppercase">Confirmed</span>
                                                    </button>
                                                ))
                                            ) : hasSearched ? (
                                                <div className="text-center py-12">
                                                    <AlertCircle size={32} className="text-slate-200 mx-auto mb-3" />
                                                    <p className="text-slate-400 text-sm font-bold uppercase">No confirmed appointments found</p>
                                                    <p className="text-slate-300 text-xs mt-1">Only today's CONFIRMED appointments appear here.</p>
                                                </div>
                                            ) : (
                                                <div className="text-center py-12">
                                                    <Search size={32} className="text-slate-200 mx-auto mb-3" />
                                                    <p className="text-slate-400 text-sm">Search for a patient to begin check-in</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="col-span-5 space-y-6">
                            {selectedApt && !checkInSuccess && (
                                <div className="checkin-patient-card bg-white p-6 rounded-[2rem] border-2 border-slate-50 shadow-sm">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex gap-4 items-center">
                                            <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-bold">
                                                {selectedApt.profiles?.full_name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-black uppercase tracking-tight">{selectedApt.profiles?.full_name}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase">#{selectedApt.id.slice(0, 8)}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => setSelectedApt(null)} className="text-slate-300 hover:text-black"><X size={20} /></button>
                                    </div>

                                    <div className="space-y-4">
                                        {procedureItems.map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => toggleProcedure(item.id)}
                                                className={`w-full flex items-center justify-between p-4 border-2 rounded-2xl transition-all ${procedures[item.id] ? 'border-black bg-slate-50' : 'border-slate-100'}`}
                                            >
                                                <span className={`text-xs font-bold uppercase ${procedures[item.id] ? 'text-black' : 'text-slate-400'}`}>{item.label}</span>
                                                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center ${procedures[item.id] ? 'bg-black border-black text-white' : 'border-slate-200'}`}>
                                                    {procedures[item.id] && <CheckCircle2 size={14} />}
                                                </div>
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        onClick={handleCompleteCheckIn}
                                        disabled={!allProceduresDone || isCheckingIn}
                                        className={`w-full mt-8 py-5 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest transition-all ${allProceduresDone ? 'bg-black text-white shadow-xl hover:bg-emerald-500' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
                                    >
                                        {isCheckingIn ? "Syncing..." : "Complete Check-in"}
                                    </button>
                                </div>
                            )}

                            {checkInSuccess && (
                                <div className="checkin-success-card bg-emerald-500 text-white p-10 rounded-[2.5rem] text-center shadow-2xl">
                                    <Sparkles size={48} className="mx-auto mb-4" />
                                    <h3 className="text-xl font-black uppercase italic">Checked In</h3>
                                    <p className="text-emerald-100 text-sm mt-2">Patient has been added to the live queue.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </PageTransition>
    );
}