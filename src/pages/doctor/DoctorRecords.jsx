import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Users, ClipboardList, FileText,
    Settings, LogOut, Bell, Search, Filter,
    ExternalLink, Activity, Calendar, Loader2,
    X, CreditCard, Printer, Eye, Ear, CheckCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabase.js';
import { useAuth } from '../../lib/AuthContext.jsx';
import PageTransition from "../../components/layout/PageTransition.jsx";

export default function DoctorRecords() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, signOut } = useAuth();

    const [loading, setLoading] = useState(true);
    const [records, setRecords] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const [selectedRecord, setSelectedRecord] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/doctor/dashboard' },
        { name: 'Client Queue', icon: Users, path: '/doctor/queue' },
        { name: 'Consultation', icon: ClipboardList, path: '/doctor/consultation' },
        { name: 'Client Record', icon: FileText, path: '/doctor/records' },
    ];

    useEffect(() => {
        if (user) {
            fetchRecords();
        }
    }, [user]);

    async function fetchRecords() {
        try {
            setLoading(true);

            // FIX: Added !patient_id to tell Supabase exactly which link to use.
            // REMOVED: date_of_birth and gender from the sub-select to prevent "column not found" errors.
            const { data: consultations, error } = await supabase
                .from('consultations')
                .select(`
                    *,
                    profiles!patient_id (
                        full_name
                    )
                `)
                .eq('doctor_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const patientMap = new Map();
            if (consultations) {
                consultations.forEach((c) => {
                    const patientId = c.patient_id;
                    if (!patientMap.has(patientId)) {
                        patientMap.set(patientId, {
                            ...c,
                            name: c.profiles?.full_name || 'Name not found',
                            lastVisit: c.created_at,
                        });
                    }
                });
            }
            setRecords(Array.from(patientMap.values()));
        } catch (err) {
            console.error('Records fetch error:', err.message);
        } finally {
            setLoading(false);
        }
    }

    const handleLogout = async () => {
        if (signOut) await signOut();
        navigate('/login');
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const filteredRecords = records.filter((r) =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <PageTransition>
            <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
                {/* SIDEBAR */}
                <aside className="w-72 bg-black flex flex-col justify-between py-10 px-6 shrink-0 h-screen sticky top-0">
                    <div className="space-y-10">
                        <div className="flex items-center gap-3 px-2">
                            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center font-bold text-white text-xl shadow-lg">M</div>
                            <div className="flex flex-col text-white font-black uppercase tracking-tight">
                                <span className="text-lg leading-none">CareSync</span>
                                <span className="text-slate-500 text-[10px] tracking-widest mt-1 leading-none">Doctor Terminal</span>
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
                    <button onClick={handleLogout} className="p-4 text-slate-500 hover:text-red-400 flex items-center gap-3 font-bold uppercase text-[10px] tracking-widest">
                        <LogOut size={18} /> Logout
                    </button>
                </aside>

                <main className="flex-1 p-12 space-y-10 overflow-y-auto">
                    <div className="flex justify-between items-center">
                        <div className="space-y-1">
                            <h1 className="text-5xl font-black text-slate-950 uppercase tracking-tighter leading-none">Medical Records</h1>
                            <p className="text-slate-500 font-medium uppercase text-[10px] tracking-[0.2em]">Patient health history & archives</p>
                        </div>
                        <input
                            type="text"
                            placeholder="Search Patient Name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-6 pr-6 py-4 bg-white border-2 border-slate-50 rounded-2xl focus:border-black outline-none w-72 text-sm font-bold shadow-sm transition-all"
                        />
                    </div>

                    <div className="bg-white border-2 border-slate-50 rounded-[2.5rem] shadow-sm overflow-hidden">
                        {loading ? (
                            <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-emerald-500" size={48} /></div>
                        ) : filteredRecords.length === 0 ? (
                            <div className="p-12 text-center text-slate-300 font-bold uppercase tracking-widest">No Records Found</div>
                        ) : (
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-50">
                                        <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Full Name</th>
                                        <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Diagnosis</th>
                                        <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Date</th>
                                        <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredRecords.map((record) => (
                                        <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-10 py-7">
                                                <p className="font-black text-slate-950 uppercase tracking-tight">{record.name}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">ID: #{record.patient_id.slice(0, 8)}</p>
                                            </td>
                                            <td className="px-10 py-7 font-bold text-sm text-slate-900 uppercase italic truncate max-w-[250px]">
                                                {record.diagnosis}
                                            </td>
                                            <td className="px-10 py-7 text-xs font-bold text-slate-500 uppercase">
                                                {formatDate(record.lastVisit)}
                                            </td>
                                            <td className="px-10 py-7 text-right">
                                                <button onClick={() => { setSelectedRecord(record); setIsModalOpen(true); }} className="p-3 bg-slate-100 rounded-xl hover:bg-black hover:text-white transition-all shadow-sm">
                                                    <ExternalLink size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </main>

                {/* MODAL SECTION */}
                {isModalOpen && selectedRecord && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm">
                        <div className="bg-white w-full max-w-5xl max-h-[92vh] rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col">
                            <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1">Official Medical Record</p>
                                    <h2 className="text-4xl font-black uppercase tracking-tighter text-slate-950">{selectedRecord.name}</h2>
                                    <p className="text-xs font-bold text-slate-400 mt-1">Visit Date: {formatDate(selectedRecord.lastVisit)}</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center hover:bg-black hover:text-white transition-all"><X size={20} /></button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-12 space-y-12">
                                {/* ASSESSMENT GRID */}
                                <div className="grid grid-cols-2 gap-12">
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-black uppercase text-slate-400 flex items-center gap-2"><Eye size={16} /> Vision</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-5 bg-slate-50 rounded-2xl"><p className="text-[8px] font-black text-slate-400 uppercase">LE</p><p className="font-black text-slate-900">{selectedRecord.visual_acuity_le || 'N/A'}</p></div>
                                            <div className="p-5 bg-slate-50 rounded-2xl"><p className="text-[8px] font-black text-slate-400 uppercase">RE</p><p className="font-black text-slate-900">{selectedRecord.visual_acuity_re || 'N/A'}</p></div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-black uppercase text-slate-400 flex items-center gap-2"><Ear size={16} /> Auditory</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-5 bg-slate-50 rounded-2xl"><p className="text-[8px] font-black text-slate-400 uppercase">Left</p><p className="font-black text-slate-900">{selectedRecord.auditory_left || 'N/A'}</p></div>
                                            <div className="p-5 bg-slate-50 rounded-2xl"><p className="text-[8px] font-black text-slate-400 uppercase">Right</p><p className="font-black text-slate-900">{selectedRecord.auditory_right || 'N/A'}</p></div>
                                        </div>
                                    </div>
                                </div>
                                {/* PHYSICAL SECTION */}
                                <div className="space-y-6">
                                    <h4 className="text-xs font-black uppercase text-slate-400 flex items-center gap-2 border-b pb-2"><Activity size={16} /> Physical Exam</h4>
                                    <div className="grid grid-cols-4 gap-4">
                                        <div className={`p-4 rounded-xl border text-center ${selectedRecord.extremities_upper ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-300'}`}><span className="text-[10px] font-bold uppercase">Upper</span></div>
                                        <div className={`p-4 rounded-xl border text-center ${selectedRecord.extremities_lower ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-300'}`}><span className="text-[10px] font-bold uppercase">Lower</span></div>
                                        <div className={`p-4 rounded-xl border text-center ${selectedRecord.range_of_motion ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-300'}`}><span className="text-[10px] font-bold uppercase">ROM</span></div>
                                        <div className={`p-4 rounded-xl border text-center ${selectedRecord.gait_analysis ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-300'}`}><span className="text-[10px] font-bold uppercase">Gait</span></div>
                                    </div>
                                    <div className="p-6 bg-slate-50 rounded-2xl">
                                        <p className="text-[8px] font-black text-slate-400 uppercase mb-2">Physician Remarks</p>
                                        <p className="text-sm font-bold text-slate-800 italic leading-relaxed uppercase">{selectedRecord.physical_remarks || 'No remarks recorded'}</p>
                                    </div>
                                </div>
                                {/* DIAGNOSIS */}
                                <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-50">
                                    <div className="p-8 bg-black rounded-[2.5rem] text-white">
                                        <p className="text-[10px] font-black uppercase text-slate-500 mb-3">Diagnosis</p>
                                        <h5 className="text-2xl font-black uppercase tracking-tight italic underline decoration-emerald-500">{selectedRecord.diagnosis}</h5>
                                        <p className="mt-4 text-[10px] font-bold text-slate-500">ICD-10: {selectedRecord.icd_code || 'N/A'}</p>
                                    </div>
                                    <div className="p-8 bg-slate-50 border-2 border-slate-100 rounded-[2.5rem]">
                                        <p className="text-[10px] font-black uppercase text-slate-400 mb-3">Medications & Plan</p>
                                        <p className="text-sm font-bold text-slate-800 uppercase">{selectedRecord.medications}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-8 border-t bg-slate-50/50 flex justify-end">
                                <button onClick={() => window.print()} className="px-10 py-5 bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 hover:bg-emerald-600 transition-all shadow-xl"><Printer size={18} /> Print Record</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </PageTransition>
    );
}