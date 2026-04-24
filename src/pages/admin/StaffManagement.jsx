import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Users, BadgeDollarSign, Warehouse,
    Wrench, Settings, LogOut, Bell, Search,
    UserPlus, Filter, MoreVertical, Mail, Phone, ShieldCheck, X, Lock, ChevronRight,
    Loader2, CheckCircle2
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase.js';
import PageTransition from "../../components/layout/PageTransition.jsx";

export default function StaffManagement() {
    const location = useLocation();
    const navigate = useNavigate();

    // UI & Data States
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Form States
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        role: 'staff'
    });
    const [adminAuthPassword, setAdminAuthPassword] = useState('');

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
        { name: 'Staff Management', icon: Users, path: '/admin/staff' },
        { name: 'Revenue', icon: BadgeDollarSign, path: '/admin/revenue' },
        { name: 'Inventory', icon: Warehouse, path: '/admin/inventory' },
        { name: 'Maintenance', icon: Wrench, path: '/admin/maintenance' },
    ];

    useEffect(() => {
        fetchStaff();
    }, []);

    async function fetchStaff() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .in('role', ['staff', 'doctor', 'admin'])
                .order('full_name', { ascending: true });

            if (error) throw error;
            setStaffList(data || []);
        } catch (err) {
            console.error("Fetch error:", err.message);
        } finally {
            setLoading(false);
        }
    }

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleNextStep = (e) => {
        e.preventDefault();
        setIsVerifying(true);
    };

    const handleFinalConfirm = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const adminClient = createClient(
                import.meta.env.VITE_SUPABASE_URL,
                import.meta.env.VITE_SUPABASE_ANON_KEY,
                {
                    auth: {
                        autoRefreshToken: false,
                        persistSession: false
                    }
                }
            );

            const { data: authData, error: authError } = await adminClient.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName,
                        role: formData.role.toLowerCase(),
                    }
                }
            });

            if (authError) throw authError;

            if (authData?.user) {
                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({
                        role: formData.role.toLowerCase(),
                        full_name: formData.fullName,
                        phone: formData.phone
                    })
                    .eq('id', authData.user.id);

                if (updateError) console.error("Update failed:", updateError.message);
            }

            // SUCCESS FLOW
            setIsVerifying(false);
            setIsModalOpen(false);
            setShowSuccessModal(true); // Open the custom popup

            setAdminAuthPassword('');
            setFormData({ fullName: '', email: '', phone: '', password: '', role: 'staff' });

            setTimeout(() => fetchStaff(), 1000);

        } catch (err) {
            alert("Registration Error: " + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    return (
        <PageTransition>
            <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900 font-sans relative">

                {/* SIDEBAR */}
                <aside className="w-72 bg-black flex flex-col justify-between py-10 px-6 shrink-0 h-screen sticky top-0">
                    <div className="space-y-10">
                        <div className="flex items-center gap-3 px-2">
                            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center font-bold text-white text-xl shadow-lg italic">C</div>
                            <div className="flex flex-col text-white font-black uppercase tracking-tight leading-none">
                                <span className="text-lg italic tracking-tighter">CareSync</span>
                                <span className="text-slate-500 text-[10px] tracking-widest mt-1 uppercase">Admin Portal</span>
                            </div>
                        </div>
                        <nav className="space-y-1">
                            {navItems.map((item) => (
                                <Link key={item.name} to={item.path} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${location.pathname === item.path ? 'bg-white text-black font-bold shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                                    <item.icon size={20} className={location.pathname === item.path ? 'text-black' : 'text-slate-400'} />
                                    <span className="text-sm">{item.name}</span>
                                </Link>
                            ))}
                        </nav>
                    </div>
                    <div className="pt-6 border-t border-white/10 flex items-center justify-between px-2 text-white">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-slate-800 rounded-full flex items-center justify-center text-[10px] font-bold uppercase italic">AD</div>
                            <span className="text-[11px] font-bold uppercase truncate w-24">Super Admin</span>
                        </div>
                        <button onClick={handleLogout} className="text-slate-500 hover:text-red-400 transition-all"><LogOut size={18} /></button>
                    </div>
                </aside>

                <main className="flex-1 p-12 space-y-10 overflow-y-auto">
                    <header className="flex justify-between items-center">
                        <div className="space-y-1">
                            <h1 className="text-5xl font-black text-slate-950 uppercase tracking-tighter leading-none italic">Staff Management</h1>
                            <p className="text-slate-500 font-medium uppercase text-[10px] tracking-[0.2em]">Personnel & Access Control</p>
                        </div>
                        <button
                            onClick={() => { setIsModalOpen(true); setIsVerifying(false); }}
                            className="px-8 py-4 bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:bg-emerald-500 transition-all shadow-xl"
                        >
                            <UserPlus size={18} /> Add New Staff
                        </button>
                    </header>

                    <div className="bg-white border-2 border-slate-50 rounded-[2.5rem] shadow-sm overflow-hidden">
                        {loading ? (
                            <div className="flex justify-center py-24"><Loader2 className="animate-spin text-emerald-500" size={48} /></div>
                        ) : (
                            <table className="w-full text-left">
                                <thead className="bg-black text-white text-[10px] font-black uppercase tracking-widest">
                                    <tr>
                                        <th className="px-10 py-6">Staff Member</th>
                                        <th className="px-10 py-6">Email Address</th>
                                        <th className="px-10 py-6">Assigned Role</th>
                                        <th className="px-10 py-6 text-center">Manage</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 text-xs font-bold uppercase">
                                    {staffList.length > 0 ? staffList.map((staff) => (
                                        <tr key={staff.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-10 py-7 flex items-center gap-4">
                                                <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-sm">
                                                    {staff.full_name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <span className="font-black text-slate-900 block">{staff.full_name}</span>
                                                    <span className="text-[9px] text-slate-400 italic font-medium">#{staff.id.slice(0, 8)}</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-7 text-slate-500 lowercase font-medium">{staff.email}</td>
                                            <td className="px-10 py-7">
                                                <span className={`px-3 py-1 rounded-lg text-[9px] font-black tracking-widest ${staff.role === 'doctor' ? 'bg-emerald-100 text-emerald-600' :
                                                        staff.role === 'admin' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'
                                                    }`}>
                                                    {staff.role}
                                                </span>
                                            </td>
                                            <td className="px-10 py-7 text-center">
                                                <button className="p-2 text-slate-300 hover:text-black transition-all"><MoreVertical size={20} /></button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="4" className="text-center py-20 text-slate-300 font-black uppercase tracking-widest">No Records Found</td></tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </main>

                {/* MODAL SYSTEM: REGISTRATION */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
                        <div className="bg-white w-full max-w-lg rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                            <div className="bg-black p-10 text-white flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-black uppercase tracking-tighter italic">{!isVerifying ? "Register Staff" : "Master Authorization"}</h2>
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500 mt-1 italic">CareSync Secure Enrollment</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-4 hover:bg-white/10 rounded-full transition-all"><X size={24} /></button>
                            </div>

                            {!isVerifying ? (
                                <form onSubmit={handleNextStep} className="p-10 space-y-6">
                                    <input required name="fullName" value={formData.fullName} onChange={handleInputChange} type="text" placeholder="Full Name" className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] outline-none font-bold text-sm focus:border-black" />
                                    <div className="grid grid-cols-2 gap-5">
                                        <input required name="email" value={formData.email} onChange={handleInputChange} type="email" placeholder="Email Address" className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] outline-none font-bold text-sm focus:border-black" />
                                        <input required name="phone" value={formData.phone} onChange={handleInputChange} type="tel" placeholder="Phone" className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] outline-none font-bold text-sm focus:border-black" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-5">
                                        <input required name="password" value={formData.password} onChange={handleInputChange} type="password" placeholder="Password" className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] outline-none font-bold text-sm focus:border-black" />
                                        <select name="role" value={formData.role} onChange={handleInputChange} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] outline-none font-bold text-sm cursor-pointer focus:border-black">
                                            <option value="staff">Staff</option>
                                            <option value="doctor">Doctor</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <button type="submit" className="w-full py-5 bg-black text-white rounded-[1.5rem] font-black uppercase text-xs tracking-widest hover:bg-emerald-500 transition-all shadow-xl flex items-center justify-center gap-3 mt-4">Continue <ChevronRight size={18} /></button>
                                </form>
                            ) : (
                                <form onSubmit={handleFinalConfirm} className="p-10 space-y-8 text-center">
                                    <div className="flex flex-col items-center space-y-5">
                                        <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-900 border-2 border-slate-100 shadow-sm"><Lock size={32} /></div>
                                        <p className="text-slate-400 text-[10px] font-black uppercase leading-relaxed max-w-[220px]">Provide Admin Passkey</p>
                                    </div>
                                    <input autoFocus required type="password" value={adminAuthPassword} onChange={(e) => setAdminAuthPassword(e.target.value)} placeholder="ADMIN PASSKEY" className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] focus:border-emerald-500 outline-none font-black text-center text-xl transition-all shadow-inner" />
                                    <div className="flex gap-4">
                                        <button type="button" disabled={isSaving} onClick={() => setIsVerifying(false)} className="flex-1 py-5 border-2 border-slate-100 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest">Back</button>
                                        <button type="submit" disabled={isSaving} className="flex-[2] py-5 bg-emerald-500 text-white rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest hover:bg-emerald-600 shadow-xl">
                                            {isSaving ? <Loader2 className="animate-spin mx-auto" size={20} /> : "Verify & Save"}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                )}

                {/* SUCCESS POPUP MODAL */}
                {showSuccessModal && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                        <div className="bg-white w-full max-w-sm rounded-[3rem] shadow-2xl p-10 text-center space-y-6 animate-in zoom-in-95 duration-300">
                            <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                                <CheckCircle2 size={40} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900">Success!</h3>
                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                                    Personnel has been registered.<br />Admin session remains active.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowSuccessModal(false)}
                                className="w-full py-4 bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-500 transition-all shadow-lg"
                            >
                                Got it
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </PageTransition>
    );
}