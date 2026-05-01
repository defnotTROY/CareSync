import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Stethoscope, Eye, History, CheckSquare,
    Save, Loader2, Check, Menu
} from 'lucide-react';
import { supabase } from '../../lib/supabase.js';
import { useAuth } from '../../lib/AuthContext.jsx';
import { useToast } from '../../lib/ToastContext.jsx';
import PageTransition from "../../components/layout/PageTransition.jsx";
import DoctorSidebar from "../../components/layout/DoctorSidebar.jsx";
import '../../styles/staff-portal.css';

export default function Consultation() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const toast = useToast();

    // The appointment data passed from the Doctor Queue
    const appointment = location.state?.appointment;

    // Added ONLY for the new sidebar layout
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const [loading, setLoading] = useState(true);
    const [patientData, setPatientData] = useState(null);
    const [saving, setSaving] = useState(false);

    // Initial state matching your database schema (Removed follow_up_date)
    const [formData, setFormData] = useState({
        visual_acuity_le: '',
        visual_acuity_re: '',
        color_perception: '',
        auditory_left: '',
        auditory_right: '',
        auditory_notes: '',
        extremities_upper: false,
        extremities_lower: false,
        range_of_motion: false,
        gait_analysis: false,
        physical_remarks: '',
        diagnosis: '',
        icd_code: '',
        treatment_plan: '',
        medications: ''
    });

    useEffect(() => {
        if (!appointment) {
            toast.error('No active appointment selected');
            navigate('/doctor/queue');
            return;
        }
        loadPatientData();
    }, [appointment]);

    async function loadPatientData() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', appointment.user_id)
                .single();

            if (error) throw error;
            setPatientData(data);
        } catch (err) {
            console.error('Error loading patient data:', err);
            toast.error('Failed to load patient profile');
        } finally {
            setLoading(false);
        }
    }

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleCheckbox = (field) => {
        setFormData((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    const handleSubmit = async () => {
        if (!appointment || !user || !patientData) {
            toast.error("Missing session data");
            return;
        }

        try {
            setSaving(true);

            // 1. Prepare data for the 'consultations' table
            const consultationData = {
                appointment_id: appointment.id,
                doctor_id: user.id,
                patient_id: appointment.user_id,
                ...formData
            };

            // 2. Insert into database
            const { error: consultError } = await supabase
                .from('consultations')
                .insert([consultationData]);

            if (consultError) throw consultError;

            // 3. Update appointment status to COMPLETED
            const { error: apptError } = await supabase
                .from('appointments')
                .update({
                    status: 'COMPLETED',
                    updated_at: new Date().toISOString()
                })
                .eq('id', appointment.id);

            if (apptError) throw apptError;

            toast.success('Consultation Finalized Successfully');
            navigate('/doctor/queue');
        } catch (err) {
            console.error('Submission error:', err);
            toast.error('Failed to save: ' + err.message);
        } finally {
            setSaving(false);
        }
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

                {/* NEW SIDEBAR COMPONENT */}
                <DoctorSidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

                {/* WRAPPER ADDED TO PREVENT OVERLAP WITH FIXED SIDEBAR */}
                <div className="flex-1 flex flex-col min-w-0 md:ml-20 lg:ml-72">
                    <main className="flex-1 p-6 lg:p-12 space-y-12 overflow-y-auto">

                        {/* HEADER */}
                        <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-100 pb-8 gap-6">
                            <div className="flex items-center gap-4">
                                {/* Mobile Sidebar Toggle */}
                                <button
                                    onClick={() => setSidebarOpen(true)}
                                    className="md:hidden p-2 -ml-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-black hover:border-black transition-colors"
                                >
                                    <Menu size={24} />
                                </button>

                                <div className="space-y-1">
                                    <h1 className="staff-page-title">Examination</h1>
                                    <p className="text-slate-500 font-medium uppercase text-[10px] tracking-[0.2em] mt-1">Medical Assessment Entry</p>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate('/doctor/records')}
                                className="w-full md:w-auto px-8 py-4 bg-white border-2 border-slate-50 rounded-2xl font-black uppercase text-[10px] tracking-widest text-slate-400 hover:text-black hover:border-black transition-all shadow-sm flex items-center justify-center gap-2 shrink-0"
                            >
                                <History size={16} /> Patient History
                            </button>
                        </header>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-96 gap-4">
                                <Loader2 className="animate-spin text-emerald-500" size={48} />
                                <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Loading Patient Profile...</p>
                            </div>
                        ) : (
                            <>
                                {/* PATIENT BANNER */}
                                <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 lg:p-10 flex flex-col lg:flex-row items-start lg:items-center gap-8 lg:gap-12 shadow-sm">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-12 w-full flex-1">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Patient</p>
                                            <h3 className="text-xl lg:text-2xl font-black uppercase tracking-tight text-slate-950 mt-1">
                                                {patientData?.first_name ? `${patientData.first_name} ${patientData.last_name || ''}`.trim() : patientData?.full_name || 'Patient'}
                                            </h3>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                                {patientData?.gender} | {calculateAge(patientData?.date_of_birth)} Y/O
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Type</p>
                                            <span className="inline-block mt-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full font-black uppercase text-[10px] tracking-widest">
                                                {appointment?.appointment_type || 'General'}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</p>
                                            <p className="font-bold text-slate-950 uppercase text-xs mt-2">In Consultation</p>
                                        </div>
                                    </div>
                                </div>

                                {/* CLINICAL TESTS */}
                                <section className="space-y-8">
                                    <div className="flex items-center gap-4">
                                        <Stethoscope className="text-emerald-500" size={24} />
                                        <h2 className="text-xl font-black uppercase tracking-tight">Clinical Tests</h2>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                        <div className="lg:col-span-12 bg-white border border-slate-100 p-6 lg:p-8 rounded-[2rem] space-y-6">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                                <Eye size={16} /> Visual Acuity
                                            </p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Left Eye (LE)</label>
                                                    <input
                                                        type="text"
                                                        value={formData.visual_acuity_le}
                                                        onChange={(e) => handleInputChange('visual_acuity_le', e.target.value)}
                                                        placeholder="e.g., 20/20"
                                                        className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-black rounded-2xl font-bold transition-all outline-none"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Right Eye (RE)</label>
                                                    <input
                                                        type="text"
                                                        value={formData.visual_acuity_re}
                                                        onChange={(e) => handleInputChange('visual_acuity_re', e.target.value)}
                                                        placeholder="e.g., 20/20"
                                                        className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-black rounded-2xl font-bold transition-all outline-none"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="lg:col-span-6 bg-white border border-slate-100 p-6 lg:p-8 rounded-[2rem] space-y-4">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Ishihara Color Perception</label>
                                            <select
                                                value={formData.color_perception}
                                                onChange={(e) => handleInputChange('color_perception', e.target.value)}
                                                className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-black rounded-2xl font-bold outline-none appearance-none"
                                            >
                                                <option value="">Select Perception</option>
                                                <option value="Normal">Normal</option>
                                                <option value="Deficient">Deficient</option>
                                            </select>
                                        </div>

                                        <div className="lg:col-span-6 bg-white border border-slate-100 p-6 lg:p-8 rounded-[2rem] space-y-4">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Auditory (L/R)</label>
                                            <div className="flex gap-4">
                                                <input
                                                    type="text"
                                                    placeholder="Left"
                                                    value={formData.auditory_left}
                                                    onChange={(e) => handleInputChange('auditory_left', e.target.value)}
                                                    className="w-1/2 p-5 bg-slate-50 border-2 border-transparent focus:border-black rounded-2xl font-bold outline-none"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Right"
                                                    value={formData.auditory_right}
                                                    onChange={(e) => handleInputChange('auditory_right', e.target.value)}
                                                    className="w-1/2 p-5 bg-slate-50 border-2 border-transparent focus:border-black rounded-2xl font-bold outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* PHYSICAL ASSESSMENT */}
                                <section className="space-y-8">
                                    <div className="flex items-center gap-4">
                                        <CheckSquare className="text-emerald-500" size={24} />
                                        <h2 className="text-xl font-black uppercase tracking-tight">Physical Evaluation</h2>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                        <div className="lg:col-span-5 bg-white border border-slate-100 p-6 lg:p-8 rounded-[2rem] space-y-3">
                                            {[
                                                { label: 'Upper Extremities', field: 'extremities_upper' },
                                                { label: 'Lower Extremities', field: 'extremities_lower' },
                                                { label: 'Range of Motion', field: 'range_of_motion' },
                                                { label: 'Steady Gait', field: 'gait_analysis' }
                                            ].map((item) => (
                                                <button
                                                    key={item.field}
                                                    onClick={() => handleCheckbox(item.field)}
                                                    className="w-full flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-100"
                                                >
                                                    <span className="text-xs font-bold uppercase text-slate-600">{item.label}</span>
                                                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all ${formData[item.field] ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-slate-200'}`}>
                                                        {formData[item.field] && <Check size={14} className="text-white" strokeWidth={4} />}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>

                                        <div className="lg:col-span-7 bg-white border border-slate-100 p-6 lg:p-8 rounded-[2rem]">
                                            <textarea
                                                value={formData.physical_remarks}
                                                onChange={(e) => handleInputChange('physical_remarks', e.target.value)}
                                                placeholder="Physical examination notes and findings..."
                                                className="w-full h-full min-h-[200px] bg-slate-50 border-2 border-transparent focus:border-black rounded-2xl p-6 font-bold text-sm outline-none resize-none"
                                            />
                                        </div>
                                    </div>
                                </section>

                                {/* SUBMIT SECTION */}
                                <section className="bg-white border border-slate-100 p-6 lg:p-10 rounded-[3rem] space-y-8 shadow-sm">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Clinical Diagnosis</label>
                                            <input
                                                type="text"
                                                value={formData.diagnosis}
                                                onChange={(e) => handleInputChange('diagnosis', e.target.value)}
                                                className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-black rounded-2xl font-bold outline-none"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Medications / Plan</label>
                                            <textarea
                                                value={formData.medications}
                                                onChange={(e) => handleInputChange('medications', e.target.value)}
                                                className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-black rounded-2xl font-bold outline-none h-16 resize-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-8 border-t border-slate-50 flex flex-col sm:flex-row justify-end gap-4 w-full">
                                        <button
                                            onClick={() => navigate('/doctor/queue')}
                                            className="w-full sm:w-auto px-10 py-5 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all text-center"
                                        >
                                            Discard
                                        </button>
                                        <button
                                            onClick={handleSubmit}
                                            disabled={saving}
                                            className="w-full sm:w-auto px-12 py-5 bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all shadow-xl disabled:opacity-50"
                                        >
                                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                            {saving ? 'Saving...' : 'Finalize Consultation'}
                                        </button>
                                    </div>
                                </section>
                            </>
                        )}
                    </main>
                </div>
            </div>
        </PageTransition>
    );
}