import { useState, useEffect } from 'react';
import {
    User, Settings, Clock, Shield, Save,
    Camera, Phone, Mail, ChevronRight, LayoutDashboard,
    Users, ClipboardList, FileText, LogOut, Bell
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase.js';
import { useAuth } from '../../lib/AuthContext.jsx';
import PageTransition from "../../components/layout/PageTransition.jsx";
import '../../styles/staff-portal.css';
import './DoctorSettings.css';

export default function DoctorSettings() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, signOut } = useAuth();

    // UI States
    const [activeTab, setActiveTab] = useState('profile');
    const [saving, setSaving] = useState(false);
    const [doctorName, setDoctorName] = useState('Doctor');

    // Form States
    const [profile, setProfile] = useState({
        full_name: "",
        specialty: "General Practitioner / LTO Accredited",
        license_no: "Pending...",
        phone: "",
        email: ""
    });

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/doctor/dashboard' },
        { name: 'Client Queue', icon: Users, path: '/doctor/queue' },
        { name: 'Consultation', icon: ClipboardList, path: '/doctor/consultation' },
        { name: 'Client Record', icon: FileText, path: '/doctor/records' },
    ];

    useEffect(() => {
        if (user) {
            fetchDoctorProfile();
        }
    }, [user]);

    async function fetchDoctorProfile() {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) throw error;
            if (data) {
                setProfile({
                    full_name: data.full_name || "",
                    specialty: data.specialty || "General Practitioner / LTO Accredited",
                    license_no: data.license_no || "LTO-REG-000",
                    phone: data.phone || "",
                    email: data.email || user.email
                });
                setDoctorName(data.full_name?.split(' ')[0] || 'Doctor');
            }
        } catch (err) {
            console.error("Error fetching profile:", err.message);
        }
    }

    const handleSave = async () => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: profile.full_name,
                    phone: profile.phone
                })
                .eq('id', user.id);

            if (error) throw error;
        } catch (err) {
            console.error("Save error:", err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut();
            navigate('/login');
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    return (
        <PageTransition>
            <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">

                {/* --- SIDEBAR --- */}
                <aside className="w-72 bg-black flex flex-col justify-between py-10 px-6 shrink-0 h-screen sticky top-0">
                    <div className="space-y-10">
                        {/* MJY LOGO BRANDING */}
                        <div className="flex items-center gap-3 px-2">
                            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center font-black text-white text-xl italic shadow-lg">C</div>
                            <div className="flex flex-col text-white font-black uppercase tracking-tighter leading-none">
                                <span className="text-lg italic">CareSync</span>
                                <span className="text-slate-500 text-[8px] tracking-[0.2em] mt-1 font-bold">MJY 88 Medical Clinic</span>
                            </div>
                        </div>

                        <nav className="space-y-1">
                            {navItems.map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link key={item.name} to={item.path} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${isActive ? 'bg-white text-black font-bold shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                                        <item.icon size={20} className={isActive ? 'text-black' : 'text-slate-400'} />
                                        <span className="text-sm font-bold">{item.name}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="pt-6 border-t border-white/10 space-y-2 px-2">
                        <Link to="/doctor/settings" className="flex items-center gap-4 px-4 py-3 rounded-xl bg-white text-black font-bold shadow-lg">
                            <Settings size={20} className="text-black" />
                            <span className="text-sm font-bold">Settings</span>
                        </Link>
                        <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-slate-800 rounded-full flex items-center justify-center text-[10px] text-white font-bold uppercase">
                                    {doctorName[0]}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-white text-[11px] font-bold uppercase leading-none">{doctorName}</span>
                                    <span className="text-slate-500 text-[8px] font-bold uppercase tracking-widest mt-1">Doctor Terminal</span>
                                </div>
                            </div>
                            <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-red-400 transition-all">
                                <LogOut size={18} />
                            </button>
                        </div>
                    </div>
                </aside>

                {/* --- MAIN CONTENT --- */}
                <main className="flex-1 p-12 space-y-10 overflow-y-auto">
                    <div className="flex justify-between items-center">
                        <div className="space-y-1">
                            <h1 className="staff-page-title">Settings</h1>
                            <p className="text-slate-500 font-medium text-sm">Manage your professional profile and credentials.</p>
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-bold uppercase text-[10px] tracking-widest transition-all shadow-xl ${saving ? 'bg-slate-100 text-slate-400' : 'bg-black text-white hover:bg-slate-800'}`}
                        >
                            {saving ? 'Saving...' : <><Save size={18} /> Save Settings</>}
                        </button>
                    </div>

                    {/* Tab Navigation (Client-side style) */}
                    <div className="flex gap-8 border-b border-slate-200">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`pb-4 px-1 text-sm font-bold transition-all relative ${activeTab === 'profile' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Profile Details
                            {activeTab === 'profile' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black" />}
                        </button>
                        <button
                            onClick={() => setActiveTab('security')}
                            className={`pb-4 px-1 text-sm font-bold transition-all relative ${activeTab === 'security' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Security
                            {activeTab === 'security' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black" />}
                        </button>
                    </div>

                    {/* Form Sections */}
                    <div className="max-w-4xl">
                        {activeTab === 'profile' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-400">
                                <div className="space-y-6">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Full Name</label>
                                        <input
                                            type="text"
                                            value={profile.full_name}
                                            onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                            className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none font-bold text-sm focus:border-black transition-all"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Specialization</label>
                                        <input
                                            type="text"
                                            disabled
                                            value={profile.specialty}
                                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm text-slate-400 cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">License No.</label>
                                        <input
                                            type="text"
                                            disabled
                                            value={profile.license_no}
                                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm text-slate-400 cursor-not-allowed"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Contact Phone</label>
                                        <input
                                            type="text"
                                            value={profile.phone}
                                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                            className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none font-bold text-sm focus:border-black transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
                                <div className="flex items-center gap-4 pb-6 border-b border-slate-50">
                                    <div className="p-3 bg-slate-50 rounded-xl text-slate-600"><Shield size={24} /></div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">Security Credentials</h4>
                                        <p className="text-xs text-slate-500">Manage your terminal access and password.</p>
                                    </div>
                                </div>
                                <div className="space-y-3 pt-4">
                                    <button className="w-full text-left p-5 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-all flex items-center justify-between group">
                                        <span className="text-sm font-bold text-slate-700">Reset Account Password</span>
                                        <ChevronRight size={18} className="text-slate-300 group-hover:text-black" />
                                    </button>
                                    <button className="w-full text-left p-5 rounded-2xl border border-slate-100 hover:bg-red-50 transition-all flex items-center justify-between group">
                                        <span className="text-sm font-bold text-red-500">Sign out of all sessions</span>
                                        <LogOut size={18} className="text-red-300" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </PageTransition>
    );
}