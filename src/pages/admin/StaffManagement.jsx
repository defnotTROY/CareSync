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

    // --- VIEW ARCHIVE STATE ---
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

    // --- UPDATED ARCHIVE/UNARCHIVE LOGIC ---
    const handleArchiveToggle = async (id, currentRole) => {
        const isRestoring = currentRole === 'archived';
        const confirmMsg = isRestoring
            ? "Unarchive this personnel? They will be restored to active status."
            : "Archive this personnel? They will lose access to all terminals.";

        if (!window.confirm(confirmMsg)) return;

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: isRestoring ? 'staff' : 'archived' })
                .eq('id', id);

            if (error) throw error;
            fetchStaff();
        } catch (err) {
            alert(err.message);
        } finally {
            setActiveDropdown(null);
        }
    };

    // Form Handlers
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
            role: staff.role.toLowerCase()
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
                                    className={`px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 transition-all border-2 ${viewArchived
                                            ? 'bg-white border-black text-black shadow-xl shadow-black/5'
                                            : 'bg-slate-50 border-slate-100 text-slate-400 hover:text-black hover:border-black'
                                        }`}
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
                                                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black tracking-widest border-2 ${staff.role === 'doctor' ? 'border-emerald-100 text-emerald-600 bg-emerald-50' :
                                                            staff.role === 'admin' ? 'border-black bg-black text-white' :
                                                                'border-slate-100 bg-slate-50 text-slate-400'
                                                        }`}>
                                                        {staff.role}
                                                    </span>
                                                </td>
                                                <td className="px-10 py-7 text-right relative">
                                                    <button
                                                        onClick={() => setActiveDropdown(activeDropdown === staff.id ? null : staff.id)}
                                                        className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:text-black transition-all"
                                                    >
                                                        <MoreVertical size={18} />
                                                    </button>

                                                    {activeDropdown === staff.id && (
                                                        <div ref={dropdownRef} className="absolute right-10 top-16 w-48 bg-white border-2 border-slate-100 rounded-3xl shadow-2xl z-[50] overflow-hidden animate-in fade-in zoom-in-95 py-2">
                                                            <button
                                                                onClick={() => openEditModal(staff)}
                                                                className="w-full px-6 py-4 flex items-center gap-3 text-slate-600 hover:bg-slate-50 transition-colors font-black uppercase text-[10px] tracking-widest"
                                                            >
                                                                <Edit3 size={14} className="text-black" /> Edit Profile
                                                            </button>
                                                            {/* --- UPDATED DYNAMIC ACTION LABEL --- */}
                                                            <button
                                                                onClick={() => handleArchiveToggle(staff.id, staff.role)}
                                                                className={`w-full px-6 py-4 flex items-center gap-3 font-black uppercase text-[10px] tracking-widest border-t border-slate-50 transition-colors ${viewArchived ? 'text-emerald-600 hover:bg-emerald-50' : 'text-red-500 hover:bg-red-50'
                                                                    }`}
                                                            >
                                                                {viewArchived ? <RotateCcw size={14} /> : <Archive size={14} />}
                                                                {viewArchived ? 'Unarchive' : 'Archive'}
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="4" className="text-center py-20 text-slate-300 italic font-black uppercase tracking-[0.2em] text-[10px]">
                                                    No {viewArchived ? 'archived records' : 'personnel data'} available
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </main>
                </div>
            </div>
            {/* Modal Logic (isEditModalOpen, isModalOpen, showSuccessModal) remains exactly as in your previous code */}
        </PageTransition>
    );
}