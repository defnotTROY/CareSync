import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import {
    LayoutDashboard, UserCheck, Users, CalendarDays,
    CreditCard, FileText, Bell, LogOut, Settings,
    UserPlus, Save, X, ChevronRight, Loader2, Sparkles, CheckCircle2
} from 'lucide-react';
import { supabase } from '../../supabaseClient';
import PageTransition from "../../components/layout/PageTransition.jsx";
import '../../styles/staff-portal.css';
import './NewClient.css';

export default function NewClient() {
    const location = useLocation();
    const navigate = useNavigate();
    
    // --- STAFF IDENTITY ---
    const [staffName, setStaffName] = useState("Staff");
    const [staffLoading, setStaffLoading] = useState(true);

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
            } catch (err) {
                console.error("Staff info error:", err);
            } finally {
                setStaffLoading(false);
            }
        }
        fetchStaffInfo();
    }, []);

    // --- FORM STATE ---
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successData, setSuccessData] = useState(null);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        dob: "",
        gender: "Male",
        email: "",
        phone: "",
        category: ""
    });

    const updateForm = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setErrorMsg(""); // clear errors when typing
    };

    // --- VALIDATION ---
    const handleNext = () => {
        if (step === 1) {
            if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.dob) {
                setErrorMsg("Please fill in all personal details.");
                return;
            }
        } else if (step === 2) {
            if (!formData.email.trim() || !formData.phone.trim()) {
                setErrorMsg("Please provide both email and phone number.");
                return;
            }
            // Basic email validation
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                setErrorMsg("Please provide a valid email address.");
                return;
            }
        }
        setErrorMsg("");
        setStep(s => Math.min(3, s + 1));
    };

    // --- ACCOUNT CREATION LOGIC ---
    const handleRegister = async (selectedCategory) => {
        updateForm('category', selectedCategory);
        setLoading(true);
        setErrorMsg("");

        try {
            // 1. Create a specialized temporary Supabase client with persistSession: false
            // This ensures the current staff member's session is NOT destroyed when signing up the new user
            const tempClient = createClient(
                import.meta.env.VITE_SUPABASE_URL,
                import.meta.env.VITE_SUPABASE_ANON_KEY,
                {
                    auth: {
                        persistSession: false,
                        autoRefreshToken: false,
                        detectSessionInUrl: false
                    }
                }
            );

            // 2. Generate a default password for the patient
            const defaultPassword = 'CareSync2026!';
            const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`;
            // Format phone number
            const phoneStr = formData.phone.startsWith('+') ? formData.phone : `+63${formData.phone.replace(/^0+/, '')}`;

            // 3. Create the user
            const { data, error } = await tempClient.auth.signUp({
                email: formData.email,
                password: defaultPassword,
                options: {
                    data: {
                        full_name: fullName,
                        phone: phoneStr,
                        dob: formData.dob,
                        gender: formData.gender,
                        category: selectedCategory
                    }
                }
            });

            if (error) throw error;

            // 4. Show success format
            setSuccessData({
                name: fullName,
                email: formData.email,
                password: defaultPassword
            });

        } catch (err) {
            console.error("Registration error:", err.message);
            setErrorMsg(err.message);
        } finally {
            setLoading(false);
        }
    };

    // --- LOGOUT ---
    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
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

    const categories = ['Student', 'Professional', 'Non-Professional', 'Senior'];

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
                                    <Link key={item.name} to={item.path} className={`staff-nav-link ${isActive ? 'staff-nav-link--active' : ''}`}>
                                        <item.icon size={20} className={isActive ? 'staff-nav-icon--active' : 'staff-nav-icon'} />
                                        <span className="staff-nav-label">{item.name}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="staff-sidebar-bottom">
                        <Link to="/staff/settings" className={`staff-settings-link ${location.pathname === '/staff/settings' ? 'staff-settings-link--active' : ''}`}>
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
                            <button onClick={handleLogout} className="staff-logout-btn" title="Logout">
                                <LogOut size={18} />
                            </button>
                        </div>
                    </div>
                </aside>

                <main className="staff-main">

                    {/* HEADER */}
                    <div className="staff-header">
                        <div className="staff-header-info">
                            <h1 className="staff-page-title">Registration</h1>
                            <p className="staff-page-subtitle">Onboard a new patient to the system</p>
                        </div>
                        <button onClick={() => navigate('/staff/records')} className="staff-btn-close">
                            <X size={24} />
                        </button>
                    </div>

                    {successData ? (
                        /* SUCCESS STATE */
                        <div className="newclient-success-container" style={{ animation: 'scaleUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                            <div className="newclient-success-card">
                                <div className="newclient-success-icon">
                                    <CheckCircle2 size={40} />
                                </div>
                                <h2 className="newclient-success-title">Client Registered!</h2>
                                <p className="newclient-success-subtitle">
                                    <strong>{successData.name}</strong> has been successfully added to CareSync.
                                </p>

                                <div className="newclient-credentials-box">
                                    <p className="newclient-cred-label">Provide these login credentials to the patient:</p>
                                    <div className="newclient-cred-row">
                                        <span className="text-slate-500">Email:</span>
                                        <span className="font-bold text-black">{successData.email}</span>
                                    </div>
                                    <div className="newclient-cred-row">
                                        <span className="text-slate-500">Password:</span>
                                        <span className="font-mono font-bold bg-slate-200 px-2 py-0.5 rounded text-black tracking-wider">
                                            {successData.password}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-4 text-center">
                                        The patient can log in and change this password at any time.
                                    </p>
                                </div>

                                <div className="flex gap-4 w-full mt-8">
                                    <button 
                                        onClick={() => navigate('/staff/records')} 
                                        className="staff-btn-secondary flex-1"
                                    >
                                        View Records
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setSuccessData(null);
                                            setStep(1);
                                            setFormData({ firstName: "", lastName: "", dob: "", gender: "Male", email: "", phone: "", category: "" });
                                        }} 
                                        className="staff-btn-primary flex-1 justify-center"
                                    >
                                        <UserPlus size={16} /> Add Another
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* FORM WORKFLOW */
                        <>
                            {/* PROGRESS TRACKER */}
                            <div className="staff-progress-bar">
                                {[1, 2, 3].map((s) => (
                                    <div key={s} className={`newclient-progress-step ${step >= s ? 'bg-black' : 'bg-slate-200'}`} />
                                ))}
                            </div>

                            {errorMsg && (
                                <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-2xl font-medium mb-6 animate-pulse">
                                    {errorMsg}
                                </div>
                            )}

                            <div className="staff-grid-12-lg">
                                <div className="newclient-form-card">

                                    {/* STEP 1: PERSONAL INFO */}
                                    {step === 1 && (
                                        <div className="space-y-8" style={{ animation: 'slideInBottom 0.5s ease-out' }}>
                                            <h3 className="newclient-step-title">Personal Details</h3>
                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="staff-form-label">First Name</label>
                                                    <input 
                                                        type="text" 
                                                        value={formData.firstName}
                                                        onChange={(e) => updateForm('firstName', e.target.value)}
                                                        placeholder="e.g. Juan" 
                                                        className="newclient-input" 
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="staff-form-label">Last Name</label>
                                                    <input 
                                                        type="text" 
                                                        value={formData.lastName}
                                                        onChange={(e) => updateForm('lastName', e.target.value)}
                                                        placeholder="e.g. Dela Cruz" 
                                                        className="newclient-input" 
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="staff-form-label">Date of Birth</label>
                                                    <input 
                                                        type="date" 
                                                        value={formData.dob}
                                                        onChange={(e) => updateForm('dob', e.target.value)}
                                                        className="newclient-input text-slate-600" 
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="staff-form-label">Gender</label>
                                                    <select 
                                                        value={formData.gender}
                                                        onChange={(e) => updateForm('gender', e.target.value)}
                                                        className="newclient-select"
                                                    >
                                                        <option>Male</option>
                                                        <option>Female</option>
                                                        <option>Other</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* STEP 2: CONTACT & ACCOUNT */}
                                    {step === 2 && (
                                        <div className="space-y-8" style={{ animation: 'slideInRight 0.5s ease-out' }}>
                                            <h3 className="newclient-step-title">Account & Contact</h3>
                                            <div className="space-y-6">
                                                <div className="space-y-2">
                                                    <label className="staff-form-label">Email Address</label>
                                                    <input 
                                                        type="email" 
                                                        value={formData.email}
                                                        onChange={(e) => updateForm('email', e.target.value)}
                                                        placeholder="client@email.com" 
                                                        className="newclient-input" 
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="staff-form-label">Phone Number</label>
                                                    <div className="flex gap-2">
                                                        <span className="flex items-center justify-center bg-slate-100 rounded-2xl px-4 font-bold text-slate-500 border-2 border-transparent">+63</span>
                                                        <input 
                                                            type="tel" 
                                                            value={formData.phone}
                                                            onChange={(e) => updateForm('phone', e.target.value.replace(/\D/g, ""))}
                                                            placeholder="912 345 6789" 
                                                            maxLength="10"
                                                            className="newclient-input flex-1" 
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* STEP 3: TYPE & CONFIRMATION */}
                                    {step === 3 && (
                                        <div className="space-y-8" style={{ animation: 'slideInRight 0.5s ease-out' }}>
                                            <h3 className="newclient-step-title">Categorization</h3>
                                            <p className="text-slate-500 font-medium mb-4">Select the patient's ID categorization level</p>
                                            
                                            {loading ? (
                                                <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                                                    <Loader2 size={40} className="animate-spin mb-4 text-black" />
                                                    <p className="font-bold text-black animate-pulse">Registering patient to database...</p>
                                                    <p className="text-xs mt-2">Generating credentials securely</p>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-2 gap-4">
                                                    {categories.map((type) => (
                                                        <button 
                                                            key={type} 
                                                            onClick={() => handleRegister(type)}
                                                            className="newclient-type-btn"
                                                        >
                                                            {type}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* NAVIGATION BUTTONS */}
                                    {!loading && (
                                        <div className="newclient-nav-footer">
                                            <button
                                                onClick={() => setStep(s => Math.max(1, s - 1))}
                                                className={`newclient-back-btn ${step === 1 ? 'invisible' : ''}`}
                                            >
                                                Back
                                            </button>
                                            {step < 3 && (
                                                <button
                                                    onClick={handleNext}
                                                    className="staff-btn-primary-xl"
                                                >
                                                    Next Step <ChevronRight size={16} />
                                                </button>
                                            )}
                                            {/* Note: Step 3 action is handled by the category buttons directly */}
                                        </div>
                                    )}
                                </div>

                                {/* SIDE INFO */}
                                <div className="col-span-4 space-y-6">
                                    <div className="staff-dark-panel">
                                        <div className="staff-dark-panel-glow-top" />
                                        <h3 className="newclient-info-title">Quick Note</h3>
                                        {step === 1 && <p className="newclient-info-text">Ensure the patient's ID matches the entered details for clinical records.</p>}
                                        {step === 2 && <p className="newclient-info-text">A valid email is required as this acts as their CareSync login identifier.</p>}
                                        {step === 3 && <p className="newclient-info-text">The system will generate a secure default password for the patient automatically.</p>}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </main>
            </div>
        </PageTransition>
    );
}