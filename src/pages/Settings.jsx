import { useState, useEffect } from 'react';
import {
    Lock, Shield, Loader2, Save, UserCircle, AlertTriangle, X, Eye, EyeOff, Check
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useToast } from '../lib/ToastContext.jsx';
import PageTransition from "../components/layout/PageTransition.jsx";
import ClientLayout from "../components/layout/ClientLayout.jsx";

export default function Settings() {
    const toast = useToast();

    // UI States
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [showWarning, setShowWarning] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    // Individual toggles for each password field
    const [showCurrentPass, setShowCurrentPass] = useState(false); //
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

    // Password Restrictions Logic
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
                    name_updated: true
                })
                .eq('id', user.id);

            if (error) throw error;

            toast.success("Name updated and locked successfully");
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

            toast.success("Password updated successfully");
            setShowPasswordModal(false);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            toast.error(error.message);
        } finally {
            setUpdating(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="animate-spin text-slate-300" size={48} />
            </div>
        );
    }

    return (
        <PageTransition>
            <ClientLayout title="Account Settings">
                <div className="max-w-4xl mx-auto space-y-10">

                    {/* PERSONAL INFORMATION SECTION */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                            <UserCircle className="text-black" size={24} />
                            <h2 className="text-xl font-black uppercase italic tracking-tighter">Personal Information</h2>
                        </div>

                        {profile.name_updated && (
                            <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-100 flex items-center gap-3">
                                <AlertTriangle size={18} className="text-amber-500" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    Official profile details are locked for security compliance.
                                </p>
                            </div>
                        )}

                        <form onSubmit={triggerWarning} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">First Name</label>
                                <input
                                    type="text"
                                    disabled={profile.name_updated}
                                    className={`w-full p-4 border-2 rounded-2xl outline-none font-bold text-sm transition-all ${profile.name_updated ? 'bg-slate-100 border-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-50 border-slate-100 focus:border-black'}`}
                                    value={profile.first_name}
                                    onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Last Name</label>
                                <input
                                    type="text"
                                    disabled={profile.name_updated}
                                    className={`w-full p-4 border-2 rounded-2xl outline-none font-bold text-sm transition-all ${profile.name_updated ? 'bg-slate-100 border-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-50 border-slate-100 focus:border-black'}`}
                                    value={profile.last_name}
                                    onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email (Read Only)</label>
                                <input type="email" disabled className="w-full p-4 bg-slate-100 border-2 border-slate-100 rounded-2xl font-bold text-sm text-slate-400 cursor-not-allowed" value={profile.email} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Phone (Read Only)</label>
                                <input type="text" disabled className="w-full p-4 bg-slate-100 border-2 border-slate-100 rounded-2xl font-bold text-sm text-slate-400 cursor-not-allowed" value={profile.phone} />
                            </div>

                            {!profile.name_updated && (
                                <div className="md:col-span-2 pt-4">
                                    <button type="submit" disabled={updating} className="flex items-center justify-center gap-2 bg-black text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-600 transition-all shadow-lg disabled:bg-slate-200">
                                        {updating ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                        Save Official Name
                                    </button>
                                </div>
                            )}
                        </form>
                    </section>

                    {/* SECURITY SECTION */}
                    <section className="space-y-6 pt-10 border-t border-slate-100">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                            <Shield className="text-black" size={24} />
                            <h2 className="text-xl font-black uppercase italic tracking-tighter">Security</h2>
                        </div>
                        <div onClick={() => setShowPasswordModal(true)} className="p-6 bg-slate-50 rounded-3xl border-2 border-slate-100 flex items-center justify-between group hover:border-black transition-all cursor-pointer">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white rounded-xl shadow-sm text-slate-400 group-hover:text-black transition-colors"><Lock size={20} /></div>
                                <div>
                                    <h4 className="text-xs font-black uppercase tracking-tight">Change Password</h4>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Update security credentials</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* --- WARNING MODAL --- */}
                {showWarning && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowWarning(false)} />
                        <div className="relative bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95">
                            <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-2 text-slate-900">Final Notice</h3>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-8 leading-relaxed">
                                This action will lock your official name. It can <span className="text-red-500 underline">only be done once</span> for documentation integrity.
                            </p>
                            <button onClick={handleUpdateProfile} className="w-full py-4 bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-600 transition-all shadow-xl">
                                Confirm and Lock
                            </button>
                        </div>
                    </div>
                )}

                {/* --- PASSWORD MODAL --- */}
                {showPasswordModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowPasswordModal(false)} />
                        <form onSubmit={handleChangePassword} className="relative bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900">Security Update</h3>
                                <X className="cursor-pointer" onClick={() => setShowPasswordModal(false)} />
                            </div>

                            <div className="space-y-4">
                                {/* Current Password with Eye Icon */}
                                <div className="relative">
                                    <input
                                        required
                                        type={showCurrentPass ? "text" : "password"}
                                        placeholder="Current Password"
                                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold text-sm focus:border-black"
                                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    />
                                    <div
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 cursor-pointer hover:text-black"
                                        onClick={() => setShowCurrentPass(!showCurrentPass)}
                                    >
                                        {showCurrentPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </div>
                                </div>

                                <div className="h-px bg-slate-100 my-2" />

                                <div className="relative">
                                    <input
                                        required
                                        type={showPass ? "text" : "password"}
                                        placeholder="New Password"
                                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold text-sm focus:border-black"
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    />
                                    <div
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 cursor-pointer hover:text-black"
                                        onClick={() => setShowPass(!showPass)}
                                    >
                                        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </div>
                                </div>

                                {/* Strength Checklist */}
                                {passwordData.newPassword.length > 0 && (
                                    <div className="space-y-3 px-1">
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map((level) => (
                                                <div key={level} className={`h-1 w-full rounded-full transition-all duration-500 ${level <= strength ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-slate-100"}`} />
                                            ))}
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
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
                                        className={`w-full p-4 bg-slate-50 border-2 rounded-2xl outline-none font-bold text-sm transition-all focus:border-black ${passwordData.confirmPassword.length > 0 ? (passwordsMatch ? "border-emerald-200 bg-emerald-50/30" : "border-red-100") : "border-slate-100"}`}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    />
                                    <div
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 cursor-pointer hover:text-black"
                                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                                    >
                                        {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </div>
                                </div>
                            </div>

                            <button type="submit" disabled={updating || strength < 5 || !passwordsMatch}
                                className={`w-full py-4 mt-8 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-xl ${strength === 5 && passwordsMatch ? 'bg-black text-white hover:bg-emerald-600' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}>
                                {updating ? <Loader2 className="animate-spin mx-auto" size={18} /> : "Update Password"}
                            </button>
                        </form>
                    </div>
                )}
            </ClientLayout>
        </PageTransition>
    );
}