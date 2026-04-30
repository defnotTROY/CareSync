import { useState, useEffect } from 'react';
import {
    Lock, Shield, Loader2, Save, UserCircle, AlertTriangle, X, Eye, EyeOff, Check, Mail, Phone
} from 'lucide-react';
import { supabase } from '../../supabaseClient'; // Adjusted path to your client
import { useToast } from '../../lib/ToastContext.jsx';
import PageTransition from "../../components/layout/PageTransition.jsx";
import AdminSidebar from "../../components/layout/AdminSidebar.jsx";
import AdminHeader from "../../components/layout/AdminHeader.jsx";

export default function AdminSettings() {
    const toast = useToast();

    // UI & Sidebar States
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [showWarning, setShowWarning] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    // Password Visibility Toggles
    const [showCurrentPass, setShowCurrentPass] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);

    // Form States
    const [profile, setProfile] = useState({
        first_name: '',
        last_name: '',
        phone: '',
        email: '',
        name_updated: false
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Password Logic
    const requirements = [
        { label: "At least 8 characters", met: passwordData.newPassword.length >= 8 },
        { label: "Contains a number", met: /[0-9]/.test(passwordData.newPassword) },
        { label: "Contains a capital letter", met: /[A-Z]/.test(passwordData.newPassword) },
        { label: "Contains a special character", met: /[!@#$%^&*(),.?":{}|<>]/.test(passwordData.newPassword) },
    ];

    const strength = requirements.filter(req => req.met).length + (passwordData.newPassword.length > 0 ? 1 : 0);
    const passwordsMatch = passwordData.newPassword === passwordData.confirmPassword && passwordData.confirmPassword !== "";

    useEffect(() => {
        fetchProfile();
    }, []);

    async function fetchProfile() {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('first_name, last_name, phone, email, name_updated')
                    .eq('id', user.id)
                    .single();

                if (error) throw error;
                if (data) {
                    setProfile({
                        first_name: data.first_name || '',
                        last_name: data.last_name || '',
                        phone: data.phone || '',
                        email: data.email || user.email,
                        name_updated: data.name_updated || false
                    });
                }
            }
        } catch (error) {
            toast.error("Error loading profile settings");
        } finally {
            setLoading(false);
        }
    }

    const triggerWarning = (e) => {
        e.preventDefault();
        if (profile.name_updated) {
            toast.info("Name changes are no longer permitted.");
            return;
        }
        setShowWarning(true);
    };

    async function handleUpdateProfile() {
        setShowWarning(false);
        setUpdating(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            const { error } = await supabase
                .from('profiles')
                .update({
                    first_name: profile.first_name,
                    last_name: profile.last_name,
                    full_name: `${profile.first_name} ${profile.last_name}`.trim(),
                    name_updated: true
                })
                .eq('id', user.id);

            if (error) throw error;

            toast.success("Administrative credentials locked successfully");
            setProfile(prev => ({ ...prev, name_updated: true }));
        } catch (error) {
            toast.error(error.message);
        } finally {
            setUpdating(false);
        }
    }

    async function handleChangePassword(e) {
        e.preventDefault();
        if (strength < 5 || !passwordsMatch) return;

        setUpdating(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            const { error: authError } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: passwordData.currentPassword,
            });

            if (authError) throw new Error("Current password incorrect.");

            const { error: updateError } = await supabase.auth.updateUser({
                password: passwordData.newPassword
            });

            if (updateError) throw updateError;

            toast.success("Security credentials updated");
            setShowPasswordModal(false);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            toast.error(error.message);
        } finally {
            setUpdating(false);
        }
    }

    return (
        <PageTransition>
            <div className="flex min-h-screen bg-[#F8FAFC]">
                <AdminSidebar
                    isOpen={isSidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />

                <div className="flex-1 flex flex-col min-w-0 md:ml-20 lg:ml-72">
                    <AdminHeader
                        title="Terminal Settings"
                        onMenuClick={() => setSidebarOpen(true)}
                    />

                    <main className="p-6 lg:p-12 space-y-12">
                        <header className="space-y-1">
                            <h1 className="text-4xl lg:text-6xl font-black text-slate-950 uppercase tracking-tighter leading-none italic">Settings</h1>
                            <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.3em]">System Configuration & Identity</p>
                        </header>

                        <div className="max-w-4xl space-y-10">
                            {/* IDENTITY SECTION */}
                            <section className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-10 shadow-sm space-y-8">
                                <div className="flex items-center gap-3 border-b border-slate-50 pb-6">
                                    <UserCircle className="text-black" size={24} />
                                    <h2 className="text-xl font-black uppercase italic tracking-tighter">Identity Management</h2>
                                </div>

                                {profile.name_updated && (
                                    <div className="bg-slate-50 p-5 rounded-2xl border-2 border-slate-100 flex items-center gap-3">
                                        <AlertTriangle size={18} className="text-amber-500" />
                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
                                            Official administrative details are locked for security compliance.
                                        </p>
                                    </div>
                                )}

                                <form onSubmit={triggerWarning} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">First Name</label>
                                        <input
                                            type="text"
                                            disabled={profile.name_updated}
                                            className={`w-full p-5 border-2 rounded-2xl outline-none font-bold text-sm transition-all ${profile.name_updated ? 'bg-slate-100 border-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-50 border-slate-100 focus:border-black'}`}
                                            value={profile.first_name}
                                            onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Last Name</label>
                                        <input
                                            type="text"
                                            disabled={profile.name_updated}
                                            className={`w-full p-5 border-2 rounded-2xl outline-none font-bold text-sm transition-all ${profile.name_updated ? 'bg-slate-100 border-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-50 border-slate-100 focus:border-black'}`}
                                            value={profile.last_name}
                                            onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">System Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                            <input type="email" disabled className="w-full p-5 pl-14 bg-slate-100 border-2 border-slate-100 rounded-2xl font-bold text-sm text-slate-400 cursor-not-allowed" value={profile.email} />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Phone</label>
                                        <div className="relative">
                                            <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                            <input type="text" disabled className="w-full p-5 pl-14 bg-slate-100 border-2 border-slate-100 rounded-2xl font-bold text-sm text-slate-400 cursor-not-allowed" value={profile.phone} />
                                        </div>
                                    </div>

                                    {!profile.name_updated && (
                                        <div className="md:col-span-2 pt-4">
                                            <button type="submit" disabled={updating} className="flex items-center justify-center gap-3 bg-black text-white px-10 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-600 transition-all shadow-xl disabled:bg-slate-200">
                                                {updating ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                                Confirm and Lock Identity
                                            </button>
                                        </div>
                                    )}
                                </form>
                            </section>

                            {/* SECURITY SECTION */}
                            <section className="bg-black rounded-[2.5rem] p-10 text-white shadow-2xl space-y-8">
                                <div className="flex items-center gap-3 border-b border-white/10 pb-6">
                                    <Shield className="text-emerald-500" size={24} />
                                    <h2 className="text-xl font-black uppercase italic tracking-tighter">Security Terminal</h2>
                                </div>
                                <div onClick={() => setShowPasswordModal(true)} className="p-6 bg-white/5 rounded-3xl border border-white/10 flex items-center justify-between group hover:bg-white/10 transition-all cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white/10 rounded-xl text-slate-400 group-hover:text-emerald-400 transition-colors"><Lock size={20} /></div>
                                        <div>
                                            <h4 className="text-xs font-black uppercase tracking-tight">Change Password</h4>
                                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Update Security Credentials</p>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </main>
                </div>
            </div>

            {/* --- WARNING MODAL --- */}
            {showWarning && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowWarning(false)} />
                    <div className="relative bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95">
                        <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-4 text-slate-900">Final Audit</h3>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-10 leading-relaxed">
                            This action will permanently lock your administrative identity. It can <span className="text-red-500 underline decoration-2">only be performed once</span> for system integrity.
                        </p>
                        <button onClick={handleUpdateProfile} className="w-full py-5 bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-600 transition-all shadow-xl">
                            Confirm and Finalize
                        </button>
                    </div>
                </div>
            )}

            {/* --- PASSWORD MODAL --- */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowPasswordModal(false)} />
                    <form onSubmit={handleChangePassword} className="relative bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900">Security Update</h3>
                            <X className="cursor-pointer text-slate-300 hover:text-black transition-colors" onClick={() => setShowPasswordModal(false)} />
                        </div>

                        <div className="space-y-5">
                            <div className="relative">
                                <input
                                    required
                                    type={showCurrentPass ? "text" : "password"}
                                    placeholder="Current Password"
                                    className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold text-sm focus:border-black"
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                />
                                <div
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 cursor-pointer hover:text-black"
                                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                                >
                                    {showCurrentPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                </div>
                            </div>

                            <div className="h-px bg-slate-50 my-2" />

                            <div className="relative">
                                <input
                                    required
                                    type={showPass ? "text" : "password"}
                                    placeholder="New Password"
                                    className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold text-sm focus:border-black"
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                />
                                <div
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 cursor-pointer hover:text-black"
                                    onClick={() => setShowPass(!showPass)}
                                >
                                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                </div>
                            </div>

                            {passwordData.newPassword.length > 0 && (
                                <div className="space-y-4 px-1">
                                    <div className="flex gap-1.5">
                                        {[1, 2, 3, 4, 5].map((level) => (
                                            <div key={level} className={`h-1 w-full rounded-full transition-all duration-500 ${level <= strength ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-slate-100"}`} />
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        {requirements.map((req, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <div className={`p-0.5 rounded-full ${req.met ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-300'}`}>
                                                    <Check size={8} strokeWidth={5} />
                                                </div>
                                                <span className={`text-[8px] font-black uppercase tracking-tight ${req.met ? 'text-slate-900' : 'text-slate-400'}`}>{req.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="relative">
                                <input
                                    required
                                    type={showConfirmPass ? "text" : "password"}
                                    placeholder="Confirm New Password"
                                    className={`w-full p-5 bg-slate-50 border-2 rounded-2xl outline-none font-bold text-sm transition-all focus:border-black ${passwordData.confirmPassword.length > 0 ? (passwordsMatch ? "border-emerald-200 bg-emerald-50/30" : "border-red-100") : "border-slate-100"}`}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                />
                                <div
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 cursor-pointer hover:text-black"
                                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                                >
                                    {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                </div>
                            </div>
                        </div>

                        <button type="submit" disabled={updating || strength < 5 || !passwordsMatch}
                            className={`w-full py-5 mt-10 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-xl ${strength === 5 && passwordsMatch ? 'bg-black text-white hover:bg-emerald-600 shadow-emerald-500/20' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}>
                            {updating ? <Loader2 className="animate-spin mx-auto" size={18} /> : "Update Credentials"}
                        </button>
                    </form>
                </div>
            )}
        </PageTransition>
    );
}