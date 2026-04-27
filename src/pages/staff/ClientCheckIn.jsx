import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, UserCheck, Users, CalendarDays,
    CreditCard, FileText, Camera, Search, Bell, LogOut,
    CheckCircle2, AlertCircle, Settings, UserPlus, Loader2,
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
    const [scanStatus, setScanStatus] = useState('idle');
    const [scanMessage, setScanMessage] = useState('');
    const [scanLoading, setScanLoading] = useState(false);

    const allProceduresDone = Object.values(procedures).every(Boolean);

    // --- FETCH STAFF IDENTITY ---
    useEffect(() => {
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
            } catch (err) { console.error(err); }
            finally { setStaffLoading(false); }
        }
        fetchStaffInfo();
    }, []);

    // --- QR SCANNER HELPERS ---
    const stopScanner = useCallback(async () => {
        if (scannerRef.current) {
            try { await scannerRef.current.stop(); } catch (_) { }
            try { scannerRef.current.clear(); } catch (_) { }
            scannerRef.current = null;
        }
    }, []);

    const handleQrScanSuccess = useCallback(async (decodedText) => {
        await stopScanner();
        setScanLoading(false);
        setScanStatus('scanning');
        try {
            const { data: appointment, error: aptError } = await supabase
                .from('appointments')
                .select('*, profiles:user_id (id, full_name)')
                .eq('id', decodedText.trim())
                .single();

            if (aptError || !appointment) {
                setScanStatus('error');
                setScanMessage('Invalid QR or Not Found');
                return;
            }

            setSelectedApt(appointment);
            setScanStatus('found');
        } catch (err) { setScanStatus('error'); }
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
                    await html5Qrcode.start({ facingMode: 'environment' }, { fps: 10, qrbox: 250 }, handleQrScanSuccess, () => { });
                    setScanLoading(false);
                } catch (err) { setScanStatus('error'); }
            }, 300);
            return () => clearTimeout(timer);
        }
        if (activeTab !== 'scan') stopScanner();
    }, [activeTab, scanStatus, handleQrScanSuccess, stopScanner]);

    // --- SEARCH LOGIC ---
    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setSearching(true);
        setHasSearched(true);
        try {
            const todayStr = new Date().toISOString().split('T')[0];
            const { data: matchedProfiles } = await supabase.from('profiles').select('id').ilike('full_name', `%${searchQuery}%`);
            const matchedUserIds = (matchedProfiles || []).map(p => p.id);

            let query = supabase.from('appointments').select('*, profiles:user_id (id, full_name)')
                .eq('appointment_date', todayStr)
                .not('status', 'in', '("COMPLETED","ON_CASHIER","ON_DOCTOR")');

            if (matchedUserIds.length > 0) {
                query = query.or(`user_id.in.(${matchedUserIds.join(',')}),purpose.ilike.%${searchQuery}%`);
            } else {
                query = query.ilike('purpose', `%${searchQuery}%`);
            }

            const { data } = await query.order('appointment_time', { ascending: true });
            setSearchResults(data || []);
        } catch (err) { console.error(err); }
        finally { setSearching(false); }
    };

    const handleCompleteCheckIn = async () => {
        if (!selectedApt || !allProceduresDone) return;
        setIsCheckingIn(true);
        try {
            // THE CRITICAL FIX: Explicitly update status to ON_CASHIER
            const { error } = await supabase
                .from('appointments')
                .update({
                    status: 'ON_CASHIER',
                    updated_at: new Date().toISOString()
                })
                .eq('id', selectedApt.id);

            if (error) throw error;

            setCheckInSuccess(true);
            setTimeout(() => {
                navigate('/staff/queue');
            }, 2000);
        } catch (err) {
            alert("Check-in failed: " + err.message);
        } finally {
            setIsCheckingIn(false);
        }
    };

    const toggleProcedure = (key) => setProcedures(prev => ({ ...prev, [key]: !prev[key] }));

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/staff/dashboard' },
        { name: 'Client Check-in', icon: UserCheck, path: '/staff/check-in' },
        { name: 'Client Queue', icon: Users, path: '/staff/queue' },
        { name: 'Appointments', icon: CalendarDays, path: '/staff/appointments' },
        { name: 'Payment Record', icon: CreditCard, path: '/staff/payments' },
        { name: 'Client Record', icon: FileText, path: '/staff/records' },
        { name: 'New Client', icon: UserPlus, path: '/staff/new-client' },
    ];

    return (
        <PageTransition>
            <div className="staff-layout">
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
                                <Link key={item.name} to={item.path} className={`staff-nav-link ${location.pathname === item.path ? 'staff-nav-link--active' : ''}`}>
                                    <item.icon size={20} className={location.pathname === item.path ? 'staff-nav-icon--active' : 'staff-nav-icon'} />
                                    <span className="staff-nav-label">{item.name}</span>
                                </Link>
                            ))}
                        </nav>
                    </div>
                    <div className="staff-sidebar-bottom">
                        <div className="staff-user-section">
                            <div className="staff-user-avatar">{staffName?.charAt(0)}</div>
                            <span className="staff-user-name truncate w-24">{staffName}</span>
                            <button onClick={() => supabase.auth.signOut()} className="staff-logout-btn"><LogOut size={18} /></button>
                        </div>
                    </div>
                </aside>

                <main className="staff-main-sm">
                    <div className="staff-header">
                        <h1 className="staff-page-title-sm uppercase font-black tracking-tighter italic">Client Check-in</h1>
                    </div>

                    <div className="staff-grid-12">
                        <div className="col-span-7 space-y-8">
                            <div className="checkin-scanner-card bg-white rounded-[2.5rem] border-2 border-slate-50 overflow-hidden shadow-sm">
                                <div className="checkin-tab-bar flex border-b">
                                    <button onClick={() => setActiveTab('scan')} className={`flex-1 p-6 font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 ${activeTab === 'scan' ? 'bg-black text-white' : 'text-slate-400'}`}>
                                        <Camera size={18} /> Scan QR
                                    </button>
                                    <button onClick={() => setActiveTab('manual')} className={`flex-1 p-6 font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 ${activeTab === 'manual' ? 'bg-black text-white' : 'text-slate-400'}`}>
                                        <Search size={18} /> Manual Search
                                    </button>
                                </div>

                                <div className="p-8">
                                    {activeTab === 'scan' ? (
                                        <div id={scannerContainerId} className="aspect-square bg-slate-50 rounded-3xl overflow-hidden relative">
                                            {scanLoading && <div className="absolute inset-0 flex items-center justify-center bg-black/10"><Loader2 className="animate-spin" /></div>}
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="flex gap-2">
                                                <input type="text" placeholder="Search patient name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 p-4 bg-slate-50 border-2 border-transparent focus:border-black rounded-2xl outline-none font-bold transition-all" />
                                                <button onClick={handleSearch} className="bg-black text-white px-8 rounded-2xl font-black uppercase text-[10px]">Find</button>
                                            </div>
                                            <div className="max-height-[300px] overflow-y-auto space-y-2">
                                                {searchResults.map(apt => (
                                                    <button key={apt.id} onClick={() => setSelectedApt(apt)} className={`w-full p-4 border-2 rounded-2xl text-left transition-all ${selectedApt?.id === apt.id ? 'border-black bg-slate-50' : 'border-slate-50'}`}>
                                                        <p className="font-black uppercase text-sm">{apt.profiles?.full_name}</p>
                                                        <p className="text-[10px] font-bold text-slate-400">{apt.appointment_time} • {apt.purpose}</p>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="col-span-5">
                            {selectedApt && !checkInSuccess && (
                                <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-50 shadow-sm space-y-6">
                                    <div className="flex justify-between items-center border-b pb-6">
                                        <div>
                                            <p className="text-[10px] font-black text-emerald-500 uppercase">Selected Patient</p>
                                            <h3 className="text-2xl font-black uppercase tracking-tight">{selectedApt.profiles?.full_name}</h3>
                                        </div>
                                        <button onClick={() => setSelectedApt(null)} className="text-slate-300 hover:text-black"><X size={24} /></button>
                                    </div>

                                    <div className="space-y-3">
                                        {['verifyIdentity', 'updateContact', 'consentSigned', 'collectPayment'].map(key => (
                                            <button key={key} onClick={() => toggleProcedure(key)} className={`w-full p-4 border-2 rounded-2xl flex justify-between items-center transition-all ${procedures[key] ? 'border-black bg-slate-50' : 'border-slate-50 hover:border-slate-200'}`}>
                                                <span className={`text-[10px] font-black uppercase ${procedures[key] ? 'text-black' : 'text-slate-400'}`}>
                                                    {key.replace(/([A-Z])/g, ' $1')}
                                                </span>
                                                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center ${procedures[key] ? 'bg-black border-black text-white' : 'border-slate-100'}`}>
                                                    {procedures[key] && <CheckCircle2 size={14} />}
                                                </div>
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        disabled={!allProceduresDone || isCheckingIn}
                                        onClick={handleCompleteCheckIn}
                                        className="w-full py-5 bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest disabled:opacity-20 shadow-xl"
                                    >
                                        {isCheckingIn ? "Processing..." : "Move to Cashier Queue"}
                                    </button>
                                </div>
                            )}

                            {checkInSuccess && (
                                <div className="bg-emerald-500 text-white p-10 rounded-[2.5rem] text-center shadow-xl animate-in zoom-in">
                                    <Sparkles size={48} className="mx-auto mb-4" />
                                    <h3 className="text-xl font-black uppercase italic">Handed to Cashier</h3>
                                    <p className="text-emerald-100 text-[10px] uppercase font-bold mt-2">Status Updated: ON_CASHIER</p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </PageTransition>
    );
}