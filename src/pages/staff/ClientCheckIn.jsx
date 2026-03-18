import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, UserCheck, Users, CalendarDays,
    CreditCard, FileText, Camera, Search, Bell, LogOut,
    CheckCircle2, Settings, UserPlus // Added these
} from 'lucide-react';
import PageTransition from "../../components/layout/PageTransition.jsx";

export default function ClientCheckIn() {
    const [activeTab, setActiveTab] = useState('scan');
    const location = useLocation();
    const navigate = useNavigate();

    // Logic for Logout Redirect
    const handleLogout = () => {
        navigate('/login');
    };

    const [procedures, setProcedures] = useState({
        verifyIdentity: true,
        updateContact: false,
        consentSigned: false,
        collectPayment: false
    });

    const toggleProcedure = (key) => {
        setProcedures(prev => ({ ...prev, [key]: !prev[key] }));
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

    return (
        <PageTransition>
            <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">

                {/* SIDEBAR (Standardized) */}
                <aside className="w-72 bg-black flex flex-col justify-between py-10 px-6 shrink-0 h-screen sticky top-0">
                    <div className="space-y-10">
                        {/* Branding */}
                        <div className="flex items-center gap-3 px-2">
                            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-emerald-500/20">M</div>
                            <div className="flex flex-col text-white font-black uppercase tracking-tight leading-none">
                                <span className="text-lg">CareSync</span>
                                <span className="text-slate-500 text-[10px] tracking-widest mt-1">Staff Terminal</span>
                            </div>
                        </div>

                        {/* Navigation Links */}
                        <nav className="space-y-1">
                            {navItems.map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.path}
                                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${isActive
                                            ? 'bg-white text-black font-bold shadow-lg shadow-white/5'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        <item.icon size={20} className={isActive ? 'text-black' : 'text-slate-400'} />
                                        <span className="text-sm">{item.name}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Bottom Sidebar Actions */}
                    <div className="pt-6 border-t border-white/10 space-y-2 px-2">
                        {/* Settings Button */}
                        <Link
                            to="/staff/settings"
                            className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${location.pathname === '/staff/settings'
                                ? 'bg-white text-black font-bold shadow-lg shadow-white/5'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <Settings size={20} className={location.pathname === '/staff/settings' ? 'text-black' : 'text-slate-400'} />
                            <span className="text-sm">Settings</span>
                        </Link>

                        {/* Profile & Logout */}
                        <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-slate-800 rounded-full flex items-center justify-center text-[10px] text-white font-bold">JD</div>
                                <div className="flex flex-col">
                                    <span className="text-white text-[11px] font-bold uppercase leading-none">Juan D.</span>
                                    <span className="text-slate-500 text-[8px] font-bold uppercase tracking-widest mt-1">Admin</span>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                                title="Logout"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    </div>
                </aside>

                {/* MAIN CONTENT */}
                <main className="flex-1 p-12 space-y-8 overflow-y-auto">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <div className="space-y-1">
                            <h1 className="text-4xl font-black text-slate-950 uppercase tracking-tighter">Client Check-in</h1>
                            <p className="text-slate-500 font-medium">Verify and initiate patient clinical journey</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Terminal Active</span>
                            </div>
                            <button className="p-3 bg-white border border-slate-200 rounded-full text-slate-400 hover:text-black shadow-sm relative">
                                <Bell size={20} />
                                <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-12 gap-8">
                        {/* Scanner / Manual Search */}
                        <div className="col-span-7 space-y-8">
                            <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
                                <div className="flex border-b border-slate-100">
                                    <button onClick={() => setActiveTab('scan')} className={`flex-1 py-5 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 ${activeTab === 'scan' ? 'bg-white border-b-2 border-black' : 'bg-slate-50 text-slate-400'}`}>
                                        <Camera size={18} /> Scan QR Code
                                    </button>
                                    <button onClick={() => setActiveTab('manual')} className={`flex-1 py-5 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 ${activeTab === 'manual' ? 'bg-white border-b-2 border-black' : 'bg-slate-50 text-slate-400'}`}>
                                        <Search size={18} /> Manual Entry
                                    </button>
                                </div>
                                <div className="p-16 flex flex-col items-center justify-center space-y-8">
                                    <div className="w-72 h-72 border-4 border-dashed border-slate-200 rounded-[3rem] flex items-center justify-center relative group">
                                        <div className="absolute inset-0 border-4 border-black rounded-[3rem] opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <Camera size={64} className="text-slate-200" />
                                    </div>
                                    <div className="text-center space-y-2">
                                        <p className="font-black uppercase tracking-tight text-xl">Ready to Scan</p>
                                        <p className="text-slate-400 text-sm max-w-[280px]">Position the patient's QR code within the frame.</p>
                                    </div>
                                    <button className="px-10 py-4 bg-black text-white rounded-2xl font-bold uppercase text-xs tracking-widest">Activate Camera</button>
                                </div>
                            </div>
                        </div>

                        {/* Right Sidebar Procedures */}
                        <div className="col-span-5 space-y-8">
                            <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-10 space-y-8 shadow-sm">
                                <h3 className="font-black uppercase text-sm tracking-widest flex items-center gap-2"><FileText size={18} /> Standard Procedure</h3>
                                <div className="space-y-4">
                                    {[
                                        { id: 'verifyIdentity', label: 'Verify Identity' },
                                        { id: 'updateContact', label: 'Update Contact Info' },
                                        { id: 'consentSigned', label: 'Consent Form Signed' },
                                        { id: 'collectPayment', label: 'Collect Co-payment' }
                                    ].map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => toggleProcedure(item.id)}
                                            className="w-full flex gap-4 p-4 rounded-2xl border-2 text-left transition-all"
                                            style={{ borderColor: procedures[item.id] ? '#000' : '#F1F5F9' }}
                                        >
                                            <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center ${procedures[item.id] ? 'bg-black border-black text-white' : 'border-slate-200'}`}>
                                                {procedures[item.id] && <CheckCircle2 size={14} />}
                                            </div>
                                            <p className={`font-bold text-sm uppercase ${procedures[item.id] ? 'text-black' : 'text-slate-400'}`}>
                                                {item.label}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                                <button className="w-full py-5 bg-black text-white rounded-3xl font-black uppercase text-xs tracking-widest hover:bg-slate-800 transition-all shadow-lg">
                                    Complete Check-in
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </PageTransition>
    );
}