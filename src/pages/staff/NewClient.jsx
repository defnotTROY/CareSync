import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, UserCheck, Users, CalendarDays,
    CreditCard, FileText, Bell, LogOut, Settings,
    UserPlus, ArrowRight, Save, X, ChevronRight
} from 'lucide-react';
import PageTransition from "../../components/layout/PageTransition.jsx";
import '../../styles/staff-portal.css';
import './NewClient.css';

export default function NewClient() {
    const location = useLocation();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);

    const handleLogout = () => navigate('/login');

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
                        <Link to="/staff/settings" className="staff-settings-link">
                            <Settings size={20} />
                            <span className="staff-nav-label">Settings</span>
                        </Link>
                        <div className="staff-user-section">
                            <div className="staff-user-info">
                                <div className="staff-user-avatar">JD</div>
                                <div className="flex flex-col">
                                    <span className="staff-user-name">Juan D.</span>
                                    <span className="staff-user-role">Admin</span>
                                </div>
                            </div>
                            <button onClick={handleLogout} className="staff-logout-btn"><LogOut size={18} /></button>
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

                    {/* PROGRESS TRACKER */}
                    <div className="staff-progress-bar">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className={`newclient-progress-step ${step >= s ? 'bg-black' : 'bg-slate-200'}`} />
                        ))}
                    </div>

                    <div className="staff-grid-12-lg">
                        <div className="newclient-form-card">

                            {/* STEP 1: PERSONAL INFO */}
                            {step === 1 && (
                                <div className="space-y-8" style={{ animation: 'slideInBottom 0.5s ease-out' }}>
                                    <h3 className="newclient-step-title">Personal Details</h3>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="staff-form-label">First Name</label>
                                            <input type="text" placeholder="e.g. Juan" className="newclient-input" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="staff-form-label">Last Name</label>
                                            <input type="text" placeholder="e.g. Dela Cruz" className="newclient-input" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="staff-form-label">Date of Birth</label>
                                            <input type="date" className="newclient-input text-slate-500" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="staff-form-label">Gender</label>
                                            <select className="newclient-select">
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
                                            <input type="email" placeholder="client@email.com" className="newclient-input" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="staff-form-label">Phone Number</label>
                                            <input type="tel" placeholder="+63 900 000 0000" className="newclient-input" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: TYPE & CONFIRMATION */}
                            {step === 3 && (
                                <div className="space-y-8" style={{ animation: 'slideInRight 0.5s ease-out' }}>
                                    <h3 className="newclient-step-title">Categorization</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {['Student', 'Professional', 'Non-Professional', 'Senior'].map((type) => (
                                            <button key={type} className="newclient-type-btn">
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* NAVIGATION BUTTONS */}
                            <div className="newclient-nav-footer">
                                <button
                                    onClick={() => setStep(s => Math.max(1, s - 1))}
                                    className={`newclient-back-btn ${step === 1 ? 'invisible' : ''}`}
                                >
                                    Back
                                </button>
                                {step < 3 ? (
                                    <button
                                        onClick={() => setStep(s => Math.min(3, s + 1))}
                                        className="staff-btn-primary-xl"
                                    >
                                        Next Step <ChevronRight size={16} />
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => navigate('/staff/records')}
                                        className="staff-btn-confirm"
                                    >
                                        Register Client <Save size={16} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* SIDE INFO */}
                        <div className="col-span-4 space-y-6">
                            <div className="staff-dark-panel">
                                <div className="staff-dark-panel-glow-top" />
                                <h3 className="newclient-info-title">Quick Note</h3>
                                <p className="newclient-info-text">Ensure the patient's ID matches the entered details for clinical records.</p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </PageTransition>
    );
}