import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Users, ClipboardList, FileText,
    Settings, LogOut, Bell, Stethoscope, Eye,
    Droplets, CalendarClock, History, CheckSquare, Save, X, Loader2
} from 'lucide-react';
import { supabase } from '../../lib/supabase.js';
import { useAuth } from '../../lib/AuthContext.jsx';
import { useToast } from '../../lib/ToastContext.jsx';
import PageTransition from "../../components/layout/PageTransition.jsx";

export default function Consultation() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const toast = useToast();

    const appointment = location.state?.appointment;
    const [loading, setLoading] = useState(false);
    const [patientData, setPatientData] = useState(null);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        // Visual Acuity
        visual_acuity_le: '',
        visual_acuity_re: '',
        // Color perception
        color_perception: '',
        // Auditory
        auditory_left: '',
        auditory_right: '',
        auditory_notes: '',
        // Physical
        extremities_upper: false,
        extremities_lower: false,
        range_of_motion: false,
        gait_analysis: false,
        physical_remarks: '',
        // Diagnosis
        diagnosis: '',
        icd_code: '',
        // Treatment
        treatment_plan: '',
        medications: '',
        // Follow-up
        follow_up_date: '',
        follow_up_notes: '',
    });

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/doctor/dashboard' },
        { name: 'Client Queue', icon: Users, path: '/doctor/queue' },
        { name: 'Consultation', icon: ClipboardList, path: '/doctor/consultation' },
        { name: 'Client Record', icon: FileText, path: '/doctor/records' },
    ];

    useEffect(() => {
        if (!appointment) {
            toast.error('No appointment selected');
            navigate('/doctor/queue');
            return;
        }
        loadPatientData();
    }, [appointment]);

    async function loadPatientData() {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', appointment.user_id)
                .single();

            if (error) throw error;
            setPatientData(data);
        } catch (err) {
            console.error('Error loading patient data:', err);
            toast.error('Failed to load patient data');
        }
    }

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleCheckbox = (field) => {
        setFormData((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    const handleSubmit = async () => {
        try {
            setSaving(true);

            const consultationData = {
                appointment_id: appointment.id,
                doctor_id: user.id,
                patient_id: appointment.user_id,
                visual_acuity_le: formData.visual_acuity_le || null,
                visual_acuity_re: formData.visual_acuity_re || null,
                color_perception: formData.color_perception || null,
                auditory_left: formData.auditory_left || null,
                auditory_right: formData.auditory_right || null,
                auditory_notes: formData.auditory_notes || null,
                extremities_upper: formData.extremities_upper,
                extremities_lower: formData.extremities_lower,
                range_of_motion: formData.range_of_motion,
                gait_analysis: formData.gait_analysis,
                physical_remarks: formData.physical_remarks || null,
                diagnosis: formData.diagnosis || null,
                icd_code: formData.icd_code || null,
                treatment_plan: formData.treatment_plan || null,
                medications: formData.medications || null,
                follow_up_date: formData.follow_up_date || null,
                follow_up_notes: formData.follow_up_notes || null,
                created_at: new Date().toISOString(),
            };

            const { error } = await supabase
                .from('consultations')
                .insert([consultationData]);

            if (error) throw error;

            // Update appointment status
            await supabase
                .from('appointments')
                .update({ status: 'COMPLETED' })
                .eq('id', appointment.id);

            toast.success('Consultation saved successfully');
            navigate('/doctor/queue');
        } catch (err) {
            console.error('Error saving consultation:', err);
            toast.error('Failed to save consultation: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => navigate('/login');

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const calculateAge = (birthDate) => {
        if (!birthDate) return 'N/A';
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
        return age;
    };

    return (
        <PageTransition>
            <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
                {/* SIDEBAR */}
                <aside className="w-72 bg-black flex flex-col justify-between py-10 px-6 shrink-0 h-screen sticky top-0">
                    <div className="space-y-10">
                        <div className="flex items-center gap-3 px-2">
                            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-emerald-500/20">M</div>
                            <div className="flex flex-col text-white font-black uppercase tracking-tight leading-none">
                                <span className="text-lg">CareSync</span>
                                <span className="text-slate-500 text-[10px] tracking-widest mt-1">Doctor Terminal</span>
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

                    <div className="pt-6 border-t border-white/10 space-y-2 px-2">
                        <Link
                            to="/doctor/settings"
                            className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${location.pathname === '/doctor/settings' ? 'bg-white text-black font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <Settings size={20} className={location.pathname === '/doctor/settings' ? 'text-black' : 'text-slate-400'} />
                            <span className="text-sm">Settings</span>
                        </Link>

                        <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-slate-800 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                                    {patientData?.full_name?.[0] || 'D'}
                                </div>
                                <div className="flex flex-col text-white">
                                    <span className="text-[11px] font-bold uppercase leading-none">Doctor</span>
                                    <span className="text-slate-500 text-[8px] font-bold uppercase tracking-widest mt-1">Terminal</span>
                                </div>
                            </div>
                            <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-red-400 transition-all">
                                <LogOut size={18} />
                            </button>
                        </div>
                    </div>
                </aside>

                <main className="flex-1 p-12 space-y-12 overflow-y-auto">
                    {/* HEADER */}
                    <header className="flex justify-between items-center border-b border-slate-100 pb-8">
                        <div className="space-y-1">
                            <h1 className="text-5xl font-black text-slate-950 uppercase tracking-tighter leading-none">Examination Workspace</h1>
                            <p className="text-slate-500 font-medium uppercase text-[10px] tracking-[0.2em]">
                                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()} |
                                {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }).toUpperCase()}
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/doctor/queue')}
                            className="px-8 py-4 bg-white border-2 border-slate-50 rounded-2xl font-black uppercase text-[10px] tracking-widest text-slate-400 hover:text-black hover:border-black transition-all shadow-sm flex items-center gap-2"
                        >
                            <History size={16} /> Previous History
                        </button>
                    </header>

                    {/* PATIENT BANNER */}
                    {patientData ? (
                        <div className="bg-white border-2 border-slate-50 rounded-[2.5rem] p-10 flex items-center gap-12 shadow-sm">
                            <div className="grid grid-cols-4 gap-x-12 flex-1">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Patient Name</p>
                                    <h3 className="text-2xl font-black uppercase tracking-tight text-slate-950">{patientData.full_name || 'Unknown'}</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        {patientData.gender || 'N/A'} | {calculateAge(patientData.date_of_birth)} Y/O
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Contact</p>
                                    <p className="font-bold text-slate-950">{patientData.phone || 'N/A'}</p>
                                    <p className="text-[10px] font-bold text-slate-400">{patientData.email || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Appointment Type</p>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 rounded-full font-black uppercase text-[10px] tracking-widest border border-slate-200">
                                        {appointment?.appointment_type || 'General'}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Last Visit</p>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 rounded-full font-black uppercase text-[10px] tracking-widest border border-slate-200">
                                        <CalendarClock size={12} /> {formatDate(patientData.last_visit)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white border-2 border-slate-50 rounded-[2.5rem] p-10 flex items-center justify-center shadow-sm">
                            <Loader2 className="animate-spin text-slate-300" size={48} />
                        </div>
                    )}

                    {/* MEDICAL TESTS BLOCK */}
                    <section className="space-y-10">
                        <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                            <Stethoscope className="text-slate-400" size={28} />
                            <h2 className="text-2xl font-black uppercase tracking-tight">Medical Tests</h2>
                        </div>

                        <div className="grid grid-cols-12 gap-8">
                            <div className="col-span-12 bg-white border-2 border-slate-50 p-8 rounded-[2rem] space-y-6 shadow-sm">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                    <Eye size={16} /> Visual Acuity (Snellen Chart)
                                </p>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="flex items-center gap-4">
                                        <label className="text-[11px] font-black text-slate-400 uppercase w-8">LE:</label>
                                        <input
                                            type="text"
                                            value={formData.visual_acuity_le}
                                            onChange={(e) => handleInputChange('visual_acuity_le', e.target.value)}
                                            placeholder="20/20"
                                            className="flex-1 p-5 bg-slate-50 border-2 border-transparent focus:border-black rounded-xl font-bold transition-all"
                                        />
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <label className="text-[11px] font-black text-slate-400 uppercase w-8">RE:</label>
                                        <input
                                            type="text"
                                            value={formData.visual_acuity_re}
                                            onChange={(e) => handleInputChange('visual_acuity_re', e.target.value)}
                                            placeholder="20/25"
                                            className="flex-1 p-5 bg-slate-50 border-2 border-transparent focus:border-black rounded-xl font-bold transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="col-span-12 bg-white border-2 border-slate-50 p-8 rounded-[2rem] shadow-sm grid grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Ishihara Color Test</label>
                                    <select
                                        value={formData.color_perception}
                                        onChange={(e) => handleInputChange('color_perception', e.target.value)}
                                        className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-black rounded-2xl outline-none font-bold text-sm transition-all"
                                    >
                                        <option value="">Select result</option>
                                        <option value="Normal">Normal Perception</option>
                                        <option value="Red-Green Deficiency">Red-Green Deficiency</option>
                                        <option value="Monochromacy">Monochromacy</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Auditory Screening</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            value={formData.auditory_left}
                                            onChange={(e) => handleInputChange('auditory_left', e.target.value)}
                                            placeholder="Left: Pass/Fail"
                                            className="p-5 bg-slate-50 border-2 border-transparent focus:border-black rounded-xl font-bold text-sm transition-all"
                                        />
                                        <input
                                            type="text"
                                            value={formData.auditory_right}
                                            onChange={(e) => handleInputChange('auditory_right', e.target.value)}
                                            placeholder="Right: Pass/Fail"
                                            className="p-5 bg-slate-50 border-2 border-transparent focus:border-black rounded-xl font-bold text-sm transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="col-span-12 space-y-2 bg-white border-2 border-slate-50 p-8 rounded-[2rem] shadow-sm">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Auditory Notes</label>
                                <textarea
                                    value={formData.auditory_notes}
                                    onChange={(e) => handleInputChange('auditory_notes', e.target.value)}
                                    placeholder="Note any specific frequency response issues..."
                                    className="w-full p-6 bg-slate-50 border-2 border-transparent focus:border-black rounded-2xl outline-none font-bold text-sm transition-all h-28 resize-none"
                                />
                            </div>
                        </div>
                    </section>

                    {/* PHYSICAL ASSESSMENT BLOCK */}
                    <section className="space-y-10">
                        <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                            <CheckSquare className="text-slate-400" size={28} />
                            <h2 className="text-2xl font-black uppercase tracking-tight">Physical Assessment</h2>
                        </div>

                        <div className="grid grid-cols-12 gap-8">
                            <div className="col-span-4 bg-white border-2 border-slate-50 p-8 rounded-[2rem] space-y-5 shadow-sm">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Extremities Checklist</p>
                                {[
                                    { label: 'Upper Extremities (N)', field: 'extremities_upper' },
                                    { label: 'Lower Extremities (N)', field: 'extremities_lower' },
                                    { label: 'Range of Motion (Full)', field: 'range_of_motion' },
                                    { label: 'Gait Analysis (Steady)', field: 'gait_analysis' }
                                ].map((item) => (
                                    <div
                                        key={item.label}
                                        onClick={() => handleCheckbox(item.field)}
                                        className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
                                    >
                                        <div className={`w-6 h-6 rounded flex items-center justify-center border-2 ${formData[item.field] ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-200'}`}>
                                            {formData[item.field] && <X size={16} />}
                                        </div>
                                        <span className="text-xs font-bold uppercase tracking-tight text-slate-950">{item.label}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="col-span-8 bg-white border-2 border-slate-50 p-8 rounded-[2rem] shadow-sm space-y-2 flex flex-col">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest flex-none">Physical Remarks & Findings</label>
                                <textarea
                                    value={formData.physical_remarks}
                                    onChange={(e) => handleInputChange('physical_remarks', e.target.value)}
                                    placeholder="Document comprehensive physical examination findings here..."
                                    className="w-full p-6 bg-slate-50 border-2 border-transparent focus:border-black rounded-2xl outline-none font-bold text-sm transition-all flex-1 resize-none"
                                />
                            </div>
                        </div>
                    </section>

                    {/* DIAGNOSIS & TREATMENT BLOCK */}
                    <section className="space-y-10">
                        <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                            <ClipboardList className="text-slate-400" size={28} />
                            <h2 className="text-2xl font-black uppercase tracking-tight">Diagnosis & Treatment</h2>
                        </div>

                        <div className="grid grid-cols-12 gap-8">
                            <div className="col-span-6 bg-white border-2 border-slate-50 p-8 rounded-[2rem] shadow-sm space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Diagnosis</label>
                                    <input
                                        type="text"
                                        value={formData.diagnosis}
                                        onChange={(e) => handleInputChange('diagnosis', e.target.value)}
                                        placeholder="Primary diagnosis"
                                        className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-black rounded-xl font-bold transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">ICD-10 Code</label>
                                    <input
                                        type="text"
                                        value={formData.icd_code}
                                        onChange={(e) => handleInputChange('icd_code', e.target.value)}
                                        placeholder="e.g., J06.9"
                                        className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-black rounded-xl font-bold transition-all"
                                    />
                                </div>
                            </div>

                            <div className="col-span-6 bg-white border-2 border-slate-50 p-8 rounded-[2rem] shadow-sm space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Medications</label>
                                    <textarea
                                        value={formData.medications}
                                        onChange={(e) => handleInputChange('medications', e.target.value)}
                                        placeholder="Prescribed medications..."
                                        className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-black rounded-xl font-bold transition-all h-24 resize-none"
                                    />
                                </div>
                            </div>

                            <div className="col-span-12 bg-white border-2 border-slate-50 p-8 rounded-[2rem] shadow-sm space-y-5">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Treatment Plan</label>
                                <textarea
                                    value={formData.treatment_plan}
                                    onChange={(e) => handleInputChange('treatment_plan', e.target.value)}
                                    placeholder="Detailed treatment plan and recommendations..."
                                    className="w-full p-6 bg-slate-50 border-2 border-transparent focus:border-black rounded-2xl outline-none font-bold text-sm transition-all h-32 resize-none"
                                />
                            </div>
                        </div>
                    </section>

                    {/* FOLLOW-UP BLOCK */}
                    <section className="space-y-10">
                        <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                            <CalendarClock className="text-slate-400" size={28} />
                            <h2 className="text-2xl font-black uppercase tracking-tight">Follow-up</h2>
                        </div>

                        <div className="grid grid-cols-12 gap-8">
                            <div className="col-span-4 bg-white border-2 border-slate-50 p-8 rounded-[2rem] shadow-sm space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Follow-up Date</label>
                                <input
                                    type="date"
                                    value={formData.follow_up_date}
                                    onChange={(e) => handleInputChange('follow_up_date', e.target.value)}
                                    className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-black rounded-xl font-bold transition-all"
                                />
                            </div>
                            <div className="col-span-8 bg-white border-2 border-slate-50 p-8 rounded-[2rem] shadow-sm space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Follow-up Notes</label>
                                <input
                                    type="text"
                                    value={formData.follow_up_notes}
                                    onChange={(e) => handleInputChange('follow_up_notes', e.target.value)}
                                    placeholder="Instructions for next visit..."
                                    className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-black rounded-xl font-bold transition-all"
                                />
                            </div>
                        </div>
                    </section>

                    <footer className="pt-10 border-t border-slate-100 grid grid-cols-3 gap-6">
                        <button
                            onClick={() => navigate('/doctor/queue')}
                            className="p-5 bg-white border-2 border-slate-50 rounded-3xl font-black uppercase text-[11px] tracking-widest text-slate-400 hover:text-black hover:border-black transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={saving}
                            className="p-5 bg-white border border-slate-200 rounded-3xl font-black uppercase text-[11px] tracking-widest hover:border-black transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            {saving ? 'Saving...' : 'Save Progress'}
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={saving}
                            className="p-5 bg-black text-white rounded-3xl font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-500 transition-all shadow-lg disabled:opacity-50"
                        >
                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            {saving ? 'Submitting...' : 'Finalize & Submit'}
                        </button>
                    </footer>
                </main>
            </div>
        </PageTransition>
    );
}
