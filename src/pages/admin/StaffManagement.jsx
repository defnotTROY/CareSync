import { useState, useEffect, useRef } from 'react';
import {
    UserPlus, MoreVertical, ShieldCheck, X, Lock,
    Loader2, CheckCircle2, AlertCircle, ChevronRight,
    Edit3, Archive, RotateCcw, Users
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

    const [viewArchived, setViewArchived] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const dropdownRef = useRef(null);

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
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setActiveDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [viewArchived]);

    async function fetchStaff() {
        try {
            setLoading(true);
            const rolesToFetch = viewArchived ? ['archived'] : ['staff', 'doctor', 'admin'];
            const { data, error } = await supabase
                .from('profiles')
                .select('id, first_name, last_name, email, role, phone')
                .in('role', rolesToFetch)
                .order('first_name', { ascending: true });

            if (error) throw error;
            setStaffList(data || []);
        } catch (err) {
            console.error("Fetch error:", err.message);
        } finally {
            setLoading(false);
        }
    }

    const [confirmModal, setConfirmModal] = useState({ isOpen: false, staffId: null, currentRole: null });

    const confirmArchiveToggle = (id, currentRole) => {
        setConfirmModal({ isOpen: true, staffId: id, currentRole: currentRole });
        setActiveDropdown(null);
    };

    const executeArchiveToggle = async () => {
        const { staffId, currentRole } = confirmModal;
        const isRestoring = currentRole === 'archived';
        if (!staffId) return;
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: isRestoring ? 'staff' : 'archived' })
                .eq('id', staffId);
            if (error) throw error;
            fetchStaff();
            setConfirmModal({ isOpen: false, staffId: null, currentRole: null });
        } catch (err) {
            alert(err.message);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'phone' && !value.startsWith('+63')) {
            setFormData({ ...formData, phone: '+63' });
            return;
        }
        setFormData({ ...formData, [name]: value });
    };

    const openEditModal = (staff) => {
        setSelectedStaff(staff);
        setFormData({
            firstName: staff.first_name,
            lastName: staff.last_name,
            email: staff.email,
            phone: staff.phone || '+63',
            role: (staff.role || 'staff').toLowerCase()
        });
        setIsEditModalOpen(true);
        setActiveDropdown(null);
    };

    const handleUpdateStaff = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                    role: formData.role,
                    phone: formData.phone
                })
                .eq('id', selectedStaff.id);
            if (error) throw error;
            setIsEditModalOpen(false);
            fetchStaff();
        } catch (err) {
            alert(err.message);
        } finally {
            setIsSaving(false);
        }
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
            }, 3000);
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
                                <h1 className="text-4xl lg:text-6xl font-black text-slate-950 uppercase tracking-tighter leading-none italic">
                                    {viewArchived ? 'Archived' : 'Personnel'}
                                </h1>
                                <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.3em]">
                                    {viewArchived ? 'Deactivated Accounts' : 'Access Control & Directory'}
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setViewArchived(!viewArchived)}
                                    className={`px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 transition-all border-2 ${viewArchived ? 'bg-white border-black text-black shadow-xl shadow-black/5' : 'bg-slate-50 border-slate-100 text-slate-400 hover:text-black hover:border-black'}`}
                                >
                                    {viewArchived ? <Users size={18} /> : <Archive size={18} />}
                                    {viewArchived ? 'View Active' : 'View Archive'}
                                </button>

                                {!viewArchived && (
                                    <button
                                        onClick={() => { setIsModalOpen(true); setIsVerifying(false); setAuthError(false); }}
                                        className="px-8 py-4 bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:bg-emerald-500 transition-all shadow-xl"
                                    >
                                        <UserPlus size={18} /> Add New Staff
                                    </button>
                                )}
                            </div>
                        </header>

                        <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] shadow-sm overflow-visible w-full sm:w-fit min-w-full">
                                {loading ? (
                                    <div className="flex justify-center py-24"><Loader2 className="animate-spin text-black" size={48} /></div>
                                ) : (
                                    <table className="w-full text-left min-w-[800px]">
                                        <thead className="bg-black text-white text-[9px] font-black uppercase tracking-[0.2em]">
                                            <tr>
                                                <th className="px-10 py-6 rounded-tl-[2.5rem]">Staff Member</th>
                                                <th className="px-10 py-6">Email Contact</th>
                                                <th className="px-10 py-6 text-center">Role</th>
                                                <th className="px-10 py-6 text-right rounded-tr-[2.5rem]">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50 text-[10px] font-black uppercase tracking-tight">
                                            {staffList.length > 0 ? staffList.map((staff) => (
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
                                                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black tracking-widest border-2 ${staff.role === 'doctor' ? 'border-emerald-100 text-emerald-600 bg-emerald-50' : staff.role === 'admin' ? 'border-black bg-black text-white' : 'border-slate-100 bg-slate-50 text-slate-400'}`}>
                                                            {staff.role}
                                                        </span>
                                                    </td>
                                                    <td className="px-10 py-7 text-right overflow-visible">
                                                        <div className="relative inline-block text-left">
                                                            <button
                                                                onClick={() => setActiveDropdown(activeDropdown === staff.id ? null : staff.id)}
                                                                className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:text-black transition-all relative z-10"
                                                            >
                                                                <MoreVertical size={18} />
                                                            </button>

                                                            {activeDropdown === staff.id && (
                                                                <div ref={dropdownRef} className="absolute right-0 top-full mt-2 w-48 bg-white border-2 border-slate-100 rounded-3xl shadow-2xl z-[100] overflow-hidden animate-in fade-in zoom-in-95 py-2 origin-top-right">
                                                                    {!viewArchived && (
                                                                        <button onClick={() => openEditModal(staff)} className="w-full px-6 py-4 flex items-center gap-3 text-slate-600 hover:bg-slate-50 transition-colors font-black uppercase text-[10px] tracking-widest">
                                                                            <Edit3 size={14} className="text-black" /> Edit Profile
                                                                        </button>
                                                                    )}
                                                                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); confirmArchiveToggle(staff.id, staff.role); }} className={`w-full px-6 py-4 flex items-center gap-3 font-black uppercase text-[10px] tracking-widest transition-colors ${viewArchived ? 'text-emerald-600 hover:bg-emerald-50' : 'text-red-500 hover:bg-red-50 border-t border-slate-50'}`}>
                                                                        {viewArchived ? <RotateCcw size={14} /> : <Archive size={14} />}
                                                                        {viewArchived ? 'Unarchive' : 'Archive'}
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan="4" className="text-center py-20 text-slate-300 italic font-black uppercase tracking-[0.2em] text-[10px]">
                                                        No personnel data available
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                )}
                        </div>
                    </main>

                {/* --- MODALS & OVERLAYS --- */ }
    {
        isEditModalOpen && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
                    <div className="bg-black p-8 text-white flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-black uppercase italic tracking-tighter leading-none">Modify Access</h3>
                            <p className="text-[8px] text-slate-500 uppercase tracking-widest mt-1 font-black">Updating terminal privileges</p>
                        </div>
                        <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
                    </div>
                    <form onSubmit={handleUpdateStaff} className="p-8 space-y-6">
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <input required name="firstName" placeholder="First Name" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-sm outline-none focus:border-black transition-all" value={formData.firstName} onChange={handleInputChange} />
                                <input required name="lastName" placeholder="Last Name" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-sm outline-none focus:border-black transition-all" value={formData.lastName} onChange={handleInputChange} />
                            </div>
                            <input disabled name="email" type="email" className="w-full p-4 bg-slate-100 border-2 border-slate-100 rounded-2xl font-black text-sm text-slate-400 cursor-not-allowed" value={formData.email} />
                            <div className="grid grid-cols-2 gap-4">
                                <input required name="phone" placeholder="Phone" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-sm outline-none focus:border-black transition-all" value={formData.phone} onChange={handleInputChange} />
                                <select name="role" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-sm outline-none focus:border-black transition-all cursor-pointer" value={formData.role} onChange={handleInputChange}>
                                    <option value="staff">Staff Member</option>
                                    <option value="doctor">Medical Doctor</option>
                                    <option value="admin">System Admin</option>
                                </select>
                            </div>
                        </div>
                        <button disabled={isSaving} className="w-full py-4 bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-600 transition-all shadow-xl flex items-center justify-center gap-2">
                            {isSaving ? <Loader2 className="animate-spin" size={16} /> : <><CheckCircle2 size={16} /> Update Privileges</>}
                        </button>
                    </form>
                </div>
            </div>
        )
    }

    {
        isModalOpen && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
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
                                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Confirm Identity</p>
                                </div>
                                <input autoFocus type="password" placeholder="Enter Admin Password" className={`w-full p-4 border-2 rounded-2xl font-black text-sm outline-none transition-all text-center ${authError ? 'border-red-500 bg-red-50' : 'bg-slate-50 border-slate-100 focus:border-black'}`} value={adminAuthPassword} onChange={(e) => setAdminAuthPassword(e.target.value)} />
                                <button disabled={isSaving} onClick={handleFinalConfirm} className="w-full py-4 bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-600 transition-all shadow-xl flex items-center justify-center gap-2">
                                    {isSaving ? <Loader2 className="animate-spin" size={16} /> : "Authorize Registration"}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        )
    }

    {
        showSuccessModal && (
            <div className="fixed bottom-10 right-10 z-[300] animate-in slide-in-from-right-10 duration-500">
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
        )
    }

                    {/* CONFIRMATION MODAL */}
                    {confirmModal.isOpen && (
                        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                            <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 p-8 text-center space-y-6">
                                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-2 ${confirmModal.currentRole !== 'archived' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'}`}>
                                    {confirmModal.currentRole !== 'archived' ? <Archive size={32} /> : <RotateCcw size={32} />}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900">{confirmModal.currentRole !== 'archived' ? 'Archive Staff?' : 'Unarchive Staff?'}</h3>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-2 font-bold leading-relaxed">
                                        {confirmModal.currentRole !== 'archived'
                                            ? "This personnel will be moved to the archives and won't have active access." 
                                            : "This personnel will be restored and granted active system access."}
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-8">
                                    <button 
                                        onClick={() => setConfirmModal({ isOpen: false, staffId: null, currentRole: null })}
                                        className="py-4 bg-slate-50 text-slate-600 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-100 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={executeArchiveToggle}
                                        className={`py-4 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-lg ${confirmModal.currentRole !== 'archived' ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30' : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30'}`}
                                    >
                                        {confirmModal.currentRole !== 'archived' ? 'Archive' : 'Unarchive'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </PageTransition>
    );
}