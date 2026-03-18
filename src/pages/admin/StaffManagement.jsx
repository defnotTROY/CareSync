import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Users, BadgeDollarSign, Warehouse,
    Wrench, Settings, LogOut, Bell, Search,
    UserPlus, Filter, MoreVertical, Mail, Phone, ShieldCheck, X, Lock, ChevronRight
} from 'lucide-react';
import PageTransition from "../../components/layout/PageTransition.jsx";

export default function StaffManagement() {
    const location = useLocation();
    const navigate = useNavigate();

    // UI States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    // Form States
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        role: 'Staff'
    });
    const [adminAuthPassword, setAdminAuthPassword] = useState('');

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
        { name: 'Staff Management', icon: Users, path: '/admin/staff' },
        { name: 'Revenue', icon: BadgeDollarSign, path: '/admin/revenue' },
        { name: 'Inventory', icon: Warehouse, path: '/admin/inventory' },
        { name: 'Maintenance', icon: Wrench, path: '/admin/maintenance' },
    ];

    const allStaff = [
        { id: 'STF-001', name: 'Dr. Santos', role: 'Doctor', dept: 'Consultation', status: 'ACTIVE', email: 'santos@caresync.com' },
        { id: 'STF-002', name: 'Juan Dela Cruz', role: 'Staff', dept: 'Front Desk', status: 'ACTIVE', email: 'juan.dc@caresync.com' },
        { id: 'STF-003', name: 'Maria Clara', role: 'Staff', dept: 'Triage', status: 'ON LEAVE', email: 'm.clara@caresync.com' },
        { id: 'STF-004', name: 'Dr. Rizal', role: 'Doctor', dept: 'Cardiology', status: 'INACTIVE', email: 'j.rizal@caresync.com' },
    ];

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleNextStep = (e) => {
        e.preventDefault();
        setIsVerifying(true);
    };

    const handleFinalConfirm = (e) => {
        e.preventDefault();
        console.log("Authorized. Saving Staff:", formData);
        // Reset states
        setIsModalOpen(false);
        setIsVerifying(false);
        setAdminAuthPassword('');
        setFormData({ fullName: '', email: '', phone: '', password: '', role: 'Staff' });
    };

    return (
        <PageTransition>
            <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900 font-sans relative">

                {/* SIDEBAR */}
                <aside className="w-72 bg-black flex flex-col justify-between py-10 px-6 shrink-0 h-screen sticky top-0">
                    <div className="space-y-10">
                        <div className="flex items-center gap-3 px-2">
                            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center font-bold text-white text-xl">M</div>
                            <div className="flex flex-col text-white font-black uppercase tracking-tight leading-none">
                                <span className="text-lg">CareSync</span>
                                <span className="text-slate-500 text-[10px] tracking-widest mt-1">Admin Portal</span>
                            </div>
                        </div>
                        <nav className="space-y-1">
                            {navItems.map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link key={item.name} to={item.path} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${isActive ? 'bg-white text-black font-bold shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                                        <item.icon size={20} className={isActive ? 'text-black' : 'text-slate-400'} />
                                        <span className="text-sm">{item.name}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="pt-6 border-t border-white/10 space-y-2 px-2 text-white">
                        <Link to="/admin/settings" className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all">
                            <Settings size={20} />
                            <span className="text-sm">Settings</span>
                        </Link>
                        <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-slate-800 rounded-full flex items-center justify-center text-[10px] font-bold">JD</div>
                                <div className="flex flex-col">
                                    <span className="text-[11px] font-bold uppercase leading-none">Juan D.</span>
                                    <span className="text-slate-500 text-[8px] font-bold uppercase tracking-widest mt-1">Super Admin</span>
                                </div>
                            </div>
                            <button onClick={() => navigate('/login')} className="p-2 text-slate-500 hover:text-red-400 transition-all"><LogOut size={18} /></button>
                        </div>
                    </div>
                </aside>

                <main className="flex-1 p-12 space-y-10 overflow-y-auto">
                    <header className="flex justify-between items-center">
                        <div className="space-y-1">
                            <h1 className="text-5xl font-black text-slate-950 uppercase tracking-tighter leading-none">Staff Directory</h1>
                            <p className="text-slate-500 font-medium uppercase text-[10px] tracking-[0.2em]">Personnel & Role Management</p>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="px-8 py-4 bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:bg-emerald-500 transition-all shadow-xl shadow-black/10"
                        >
                            <UserPlus size={18} /> Add New Staff
                        </button>
                    </header>

                    {/* TABLE PLACEHOLDER (Use your existing table logic here) */}
                    <div className="bg-white border-2 border-slate-50 rounded-[2.5rem] shadow-sm overflow-hidden p-10 text-center font-bold text-slate-300 uppercase tracking-widest">
                        Table content active...
                    </div>
                </main>

                {/* --- ADD STAFF MODAL --- */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
                        <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                            <div className="bg-black p-10 text-white flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-black uppercase tracking-tighter">
                                        {!isVerifying ? "New Staff Member" : "Security Check"}
                                    </h2>
                                    <p className="text-emerald-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">
                                        {!isVerifying ? "Official Registration" : "Authorization Required"}
                                    </p>
                                </div>
                                <button onClick={() => { setIsModalOpen(false); setIsVerifying(false); }} className="p-3 hover:bg-white/10 rounded-full transition-all">
                                    <X size={20} />
                                </button>
                            </div>

                            {!isVerifying ? (
                                /* STEP 1: DATA ENTRY */
                                <form onSubmit={handleNextStep} className="p-10 space-y-5">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Full Name</label>
                                        <input required name="fullName" value={formData.fullName} onChange={handleInputChange} type="text" placeholder="Dr. Jose Rizal" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-black outline-none font-bold text-sm transition-all" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Email Address</label>
                                            <input required name="email" value={formData.email} onChange={handleInputChange} type="email" placeholder="rizal@caresync.com" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-black outline-none font-bold text-sm transition-all" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Phone Number</label>
                                            <input required name="phone" value={formData.phone} onChange={handleInputChange} type="tel" placeholder="+63 9xx" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-black outline-none font-bold text-sm transition-all" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Staff Password</label>
                                            <input required name="password" value={formData.password} onChange={handleInputChange} type="password" placeholder="••••••••" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-black outline-none font-bold text-sm transition-all" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Role</label>
                                            <select name="role" value={formData.role} onChange={handleInputChange} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-black outline-none font-bold text-sm transition-all cursor-pointer">
                                                <option value="Staff">Staff</option>
                                                <option value="Doctor">Doctor</option>
                                                <option value="Admin">Admin</option>
                                            </select>
                                        </div>
                                    </div>

                                    <button type="submit" className="w-full py-5 bg-black text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-emerald-500 transition-all shadow-lg flex items-center justify-center gap-2 mt-4">
                                        Continue <ChevronRight size={16} />
                                    </button>
                                </form>
                            ) : (
                                /* STEP 2: ADMIN VERIFICATION */
                                <form onSubmit={handleFinalConfirm} className="p-10 space-y-8 animate-in slide-in-from-right-4 duration-300">
                                    <div className="flex flex-col items-center text-center space-y-4">
                                        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-900">
                                            <Lock size={28} />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="font-black uppercase text-sm tracking-tight">Confirm Identity</h4>
                                            <p className="text-slate-400 text-[10px] font-bold uppercase leading-relaxed max-w-[200px]">Enter your Admin Password to authorize this user creation.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <input
                                            autoFocus
                                            required
                                            type="password"
                                            value={adminAuthPassword}
                                            onChange={(e) => setAdminAuthPassword(e.target.value)}
                                            placeholder="ADMIN PASSWORD"
                                            className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 outline-none font-black text-center text-lg transition-all"
                                        />
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setIsVerifying(false)}
                                            className="flex-1 py-4 border-2 border-slate-100 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-all"
                                        >
                                            Back
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-[2] py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                                        >
                                            Confirm Registration
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </PageTransition>
    );
}