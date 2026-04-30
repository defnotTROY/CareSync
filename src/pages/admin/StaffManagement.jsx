import { useState, useEffect } from 'react';
import {
    UserPlus, MoreVertical, ShieldCheck, X, Lock,
    Loader2, CheckCircle2, AlertCircle, ChevronRight
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase.js';
import PageTransition from "../../components/layout/PageTransition.jsx";
import AdminSidebar from "../../components/layout/AdminSidebar.jsx";
import AdminHeader from "../../components/layout/AdminHeader.jsx";

export default function StaffManagement() {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [authError, setAuthError] = useState(false);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '+63',
        password: '',
        role: 'staff'
    });
    const [adminAuthPassword, setAdminAuthPassword] = useState('');

    useEffect(() => {
        fetchStaff();
    }, []);

    async function fetchStaff() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('id, first_name, last_name, email, role, phone')
                .in('role', ['staff', 'doctor', 'admin', 'STAFF', 'DOCTOR', 'ADMIN'])
                .order('first_name', { ascending: true });

            if (error) throw error;
            setStaffList(data || []);
        } catch (err) {
            console.error("Fetch error:", err.message);
        } finally {
            setLoading(false);
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'phone' && !value.startsWith('+63')) {
            setFormData({ ...formData, phone: '+63' });
            return;
        }
        setFormData({ ...formData, [name]: value });
    };

    const handleFinalConfirm = async (e) => {
        e.preventDefault();
        setAuthError(false);
        setIsSaving(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            const { error: verifyError } = await supabase.auth.signInWithPassword({
                email: user?.email,
                password: adminAuthPassword,
            });

            if (verifyError) {
                setAuthError(true);
                setIsSaving(false);
                setTimeout(() => setAuthError(false), 2000);
                return;
            }

            const adminClient = createClient(
                import.meta.env.VITE_SUPABASE_URL,
                import.meta.env.VITE_SUPABASE_ANON_KEY,
                { auth: { autoRefreshToken: false, persistSession: false } }
            );

            const { data: authData, error: signupError } = await adminClient.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        first_name: formData.firstName,
                        last_name: formData.lastName,
                        role: formData.role.toLowerCase()
                    }
                }
            });

            if (signupError) throw signupError;

            if (authData?.user) {
                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({
                        role: formData.role.toLowerCase(),
                        first_name: formData.firstName,
                        last_name: formData.lastName,
                        phone: formData.phone
                    })
                    .eq('id', authData.user.id);

                if (updateError) throw updateError;
            }

            setIsVerifying(false);
            setIsModalOpen(false);
            setShowSuccessModal(true);
            setAdminAuthPassword('');
            setFormData({ firstName: '', lastName: '', email: '', phone: '+63', password: '', role: 'staff' });
            setTimeout(() => {
                setShowSuccessModal(false);
                fetchStaff();
            }, 3000); // Auto-hide the success toast after 3 seconds
        } catch (err) {
            alert("Error: " + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <PageTransition>
            <div className="flex min-h-screen bg-[#F8FAFC]">
                <AdminSidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

                <div className="flex-1 flex flex-col min-w-0 md:ml-20 lg:ml-72">
                    <AdminHeader title="Staff Management" onMenuClick={() => setSidebarOpen(true)} />

                    <main className="p-6 lg:p-12 space-y-10">
                        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="space-y-1">
                                <h1 className="text-4xl lg:text-6xl font-black text-slate-950 uppercase tracking-tighter leading-none italic">Personnel</h1>
                                <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.3em]">Access Control & Directory</p>
                            </div>
                            <button
                                onClick={() => { setIsModalOpen(true); setIsVerifying(false); setAuthError(false); }}
                                className="px-8 py-4 bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:bg-emerald-500 transition-all shadow-xl"
                            >
                                <UserPlus size={18} /> Add New Staff
                            </button>
                        </header>

                        <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] shadow-sm overflow-x-auto">
                            {loading ? (
                                <div className="flex justify-center py-24"><Loader2 className="animate-spin text-black" size={48} /></div>
                            ) : (
                                <table className="w-full text-left min-w-[800px]">
                                    <thead className="bg-black text-white text-[9px] font-black uppercase tracking-[0.2em]">
                                        <tr>
                                            <th className="px-10 py-6">Staff Member</th>
                                            <th className="px-10 py-6">Email Contact</th>
                                            <th className="px-10 py-6 text-center">Role</th>
                                            <th className="px-10 py-6 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 text-[10px] font-black uppercase tracking-tight">
                                        {staffList.map((staff) => (
                                            <tr key={staff.id} className="hover:bg-slate-50 transition-colors group">
                                                <td className="px-10 py-7 flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-sm group-hover:bg-emerald-500 transition-colors">
                                                        {(staff.first_name || 'U').charAt(0)}
                                                    </div>
                                                    <div>
                                                        <span className="font-black text-slate-900 block capitalize">{staff.first_name} {staff.last_name}</span>
                                                        <span className="text-[9px] text-slate-400 italic">#{staff.id.slice(0, 8)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-7 text-slate-500 lowercase font-bold tracking-normal italic">{staff.email}</td>
                                                <td className="px-10 py-7 text-center">
                                                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black tracking-widest border-2 ${staff.role?.toLowerCase() === 'doctor' ? 'border-emerald-100 text-emerald-600 bg-emerald-50' :
                                                            staff.role?.toLowerCase() === 'admin' ? 'border-black bg-black text-white' :
                                                                'border-slate-100 bg-slate-50 text-slate-400'
                                                        }`}>
                                                        {staff.role}
                                                    </span>
                                                </td>
                                                <td className="px-10 py-7 text-right">
                                                    <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:text-black transition-all">
                                                        <MoreVertical size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </main>
                </div>

                {/* --- REGISTRATION MODAL --- */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
                            {!isVerifying ? (
                                <>
                                    <div className="bg-black p-8 text-white flex justify-between items-center">
                                        <div>
                                            <h3 className="text-xl font-black uppercase italic tracking-tighter leading-none">Registration</h3>
                                            <p className="text-[8px] text-slate-500 uppercase tracking-widest mt-1 font-black">Step 1: Account Credentials</p>
                                        </div>
                                        <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
                                    </div>
                                    <form onSubmit={(e) => { e.preventDefault(); setIsVerifying(true); }} className="p-8 space-y-6">
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <input required name="firstName" placeholder="First Name" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-sm outline-none focus:border-black transition-all" value={formData.firstName} onChange={handleInputChange} />
                                                <input required name="lastName" placeholder="Last Name" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-sm outline-none focus:border-black transition-all" value={formData.lastName} onChange={handleInputChange} />
                                            </div>
                                            <input required name="email" type="email" placeholder="Email Address" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-sm outline-none focus:border-black transition-all" value={formData.email} onChange={handleInputChange} />
                                            <div className="grid grid-cols-2 gap-4">
                                                <input required name="phone" placeholder="Phone" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-sm outline-none focus:border-black transition-all" value={formData.phone} onChange={handleInputChange} />
                                                <select name="role" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-sm outline-none focus:border-black transition-all cursor-pointer" value={formData.role} onChange={handleInputChange}>
                                                    <option value="staff">Staff Member</option>
                                                    <option value="doctor">Medical Doctor</option>
                                                    <option value="admin">System Admin</option>
                                                </select>
                                            </div>
                                            <input required name="password" type="password" placeholder="Account Password" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-sm outline-none focus:border-black transition-all" value={formData.password} onChange={handleInputChange} />
                                        </div>
                                        <button className="w-full py-4 bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-600 transition-all shadow-xl flex items-center justify-center gap-2">
                                            Verification Step <ChevronRight size={16} />
                                        </button>
                                    </form>
                                </>
                            ) : (
                                <>
                                    <div className="bg-emerald-600 p-8 text-white flex justify-between items-center">
                                        <div>
                                            <h3 className="text-xl font-black uppercase italic tracking-tighter leading-none">Security Check</h3>
                                            <p className="text-[8px] text-emerald-200 uppercase tracking-widest mt-1 font-black">Step 2: Admin Authentication</p>
                                        </div>
                                        <button onClick={() => setIsVerifying(false)} className="p-2 hover:bg-black/10 rounded-full transition-colors"><X size={20} /></button>
                                    </div>
                                    <div className="p-8 space-y-6">
                                        <div className="flex flex-col items-center text-center space-y-4 py-4">
                                            <div className={`p-4 rounded-full border-2 transition-all ${authError ? 'bg-red-50 border-red-100 text-red-500 animate-shake' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                                                {authError ? <AlertCircle size={32} /> : <ShieldCheck size={32} />}
                                            </div>
                                            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Confirm Identity to proceed</p>
                                        </div>
                                        <input
                                            autoFocus
                                            type="password"
                                            placeholder="Enter Admin Password"
                                            className={`w-full p-4 border-2 rounded-2xl font-black text-sm outline-none transition-all text-center ${authError ? 'border-red-500 bg-red-50' : 'bg-slate-50 border-slate-100 focus:border-black'}`}
                                            value={adminAuthPassword}
                                            onChange={(e) => setAdminAuthPassword(e.target.value)}
                                        />
                                        <button
                                            disabled={isSaving}
                                            onClick={handleFinalConfirm}
                                            className="w-full py-4 bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-600 transition-all shadow-xl flex items-center justify-center gap-2"
                                        >
                                            {isSaving ? <Loader2 className="animate-spin" size={16} /> : "Authorize Registration"}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* --- COMPACT SUCCESS TOAST (Replaced Full Modal) --- */}
                {showSuccessModal && (
                    <div className="fixed bottom-10 right-10 z-[120] animate-in slide-in-from-right-10 duration-500">
                        <div className="bg-black text-white p-6 rounded-[2rem] shadow-2xl border-2 border-white/10 flex items-center gap-5 min-w-[320px]">
                            <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg">
                                <CheckCircle2 size={24} />
                            </div>
                            <div>
                                <h3 className="text-sm font-black uppercase italic tracking-tighter leading-none">Personnel Authorized</h3>
                                <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black mt-1">Credentials provisioned successfully</p>
                            </div>
                            <button onClick={() => setShowSuccessModal(false)} className="ml-auto p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X size={16} className="text-slate-500" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </PageTransition>
    );
}