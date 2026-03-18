import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Users, ClipboardList, FileText,
    Settings, LogOut, Bell, Stethoscope, Eye,
    Droplets, CalendarClock, History, CheckSquare, Save, X
} from 'lucide-react';
import PageTransition from "../../components/layout/PageTransition.jsx";

export default function Consultation() {
    const location = useLocation();
    const navigate = useNavigate();

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/doctor/dashboard' },
        { name: 'Client Queue', icon: Users, path: '/doctor/queue' },
        { name: 'Consultation', icon: ClipboardList, path: '/doctor/consultation' },
        { name: 'Client Record', icon: FileText, path: '/doctor/records' },
    ];

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

                    {/* SETTINGS & LOGOUT SECTION */}
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
                                <div className="w-9 h-9 bg-slate-800 rounded-full flex items-center justify-center text-[10px] text-white font-bold">JD</div>
                                <div className="flex flex-col text-white">
                                    <span className="text-[11px] font-bold uppercase leading-none">Juan D.</span>
                                    <span className="text-slate-500 text-[8px] font-bold uppercase tracking-widest mt-1">Doctor Admin</span>
                                </div>
                            </div>
                            <button onClick={() => navigate('/login')} className="p-2 text-slate-500 hover:text-red-400 transition-all">
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
                            <p className="text-slate-500 font-medium uppercase text-[10px] tracking-[0.2em]">OCT 24, 2023 | 09:42 AM | STATION: ALPHA-01</p>
                        </div>
                        <button className="px-8 py-4 bg-white border-2 border-slate-50 rounded-2xl font-black uppercase text-[10px] tracking-widest text-slate-400 hover:text-black hover:border-black transition-all shadow-sm">
                            <History size={16} className="inline mr-2" /> Previous History
                        </button>
                    </header>

                    {/* PATIENT BANNER */}
                    <div className="bg-white border-2 border-slate-50 rounded-[2.5rem] p-10 flex items-center gap-12 shadow-sm">
                        <div className="grid grid-cols-4 gap-x-12 flex-1">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Patient Name</p>
                                <h3 className="text-2xl font-black uppercase tracking-tight text-slate-950">John Doe</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: #98234-AX | 34 Y/O</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Physical Metrics</p>
                                <p className="font-bold text-slate-950">H: 182 CM | W: 84 KG</p>
                                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">BMI: 25.4 (Normal)</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Blood Type</p>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 rounded-full font-black uppercase text-[10px] tracking-widest border border-red-100">
                                    <Droplets size={12} /> O Positive
                                </span>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Last Checkup</p>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 rounded-full font-black uppercase text-[10px] tracking-widest border border-slate-200">
                                    <CalendarClock size={12} /> 12 MAR 2023
                                </span>
                                <p className="text-[10px] font-medium text-slate-400 italic mt-1">Routine Physical</p>
                            </div>
                        </div>
                    </div>

                    {/* MEDICAL TESTS BLOCK */}
                    <section className="space-y-10">
                        <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                            <Stethoscope className="text-slate-400" size={28} />
                            <h2 className="text-2xl font-black uppercase tracking-tight">Medical Tests</h2>
                        </div>

                        <div className="grid grid-cols-12 gap-8">
                            <div className="col-span-12 bg-white border-2 border-slate-50 p-8 rounded-[2rem] space-y-6 shadow-sm">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><Eye size={16} /> Visual Acuity (Snellen Chart)</p>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="flex items-center gap-4">
                                        <label className="text-[11px] font-black text-slate-400 uppercase w-8">LE:</label>
                                        <input type="text" placeholder="20/20" className="flex-1 p-5 bg-slate-50 border-2 border-transparent focus:border-black rounded-xl font-bold transition-all" />
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <label className="text-[11px] font-black text-slate-400 uppercase w-8">RE:</label>
                                        <input type="text" placeholder="20/25" className="flex-1 p-5 bg-slate-50 border-2 border-transparent focus:border-black rounded-xl font-bold transition-all" />
                                    </div>
                                </div>
                            </div>

                            <div className="col-span-12 bg-white border-2 border-slate-50 p-8 rounded-[2rem] shadow-sm grid grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Ishihara Color Test</label>
                                    <select className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-black rounded-2xl outline-none font-bold text-sm transition-all appearance-none">
                                        <option>Normal Perception</option>
                                        <option>Red-Green Deficiency</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Auditory Screening</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button className="p-5 bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest">Pass</button>
                                        <button className="p-5 bg-slate-100 text-slate-400 border border-slate-200 rounded-2xl font-black uppercase text-[10px] tracking-widest">Fail</button>
                                    </div>
                                </div>
                            </div>

                            <div className="col-span-12 space-y-2 bg-white border-2 border-slate-50 p-8 rounded-[2rem] shadow-sm">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Auditory Notes</label>
                                <textarea placeholder="Note any specific frequency response issues..." className="w-full p-6 bg-slate-50 border-2 border-transparent focus:border-black rounded-2xl outline-none font-bold text-sm transition-all h-28 resize-none" />
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
                                    { label: 'Upper Extremities (N)', checked: false },
                                    { label: 'Lower Extremities (N)', checked: true },
                                    { label: 'Range of Motion (Full)', checked: true },
                                    { label: 'Gait Analysis (Steady)', checked: true }
                                ].map((item) => (
                                    <div key={item.label} className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-xl transition-all">
                                        <div className={`w-6 h-6 rounded flex items-center justify-center border-2 ${item.checked ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-200'}`}>
                                            {item.checked && <X size={16} />}
                                        </div>
                                        <span className="text-xs font-bold uppercase tracking-tight text-slate-950">{item.label}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="col-span-8 bg-white border-2 border-slate-50 p-8 rounded-[2rem] shadow-sm space-y-2 flex flex-col">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest flex-none">Physical Remarks & Findings</label>
                                <textarea placeholder="Document comprehensive physical examination findings here..." className="w-full p-6 bg-slate-50 border-2 border-transparent focus:border-black rounded-2xl outline-none font-bold text-sm transition-all flex-1 resize-none" />
                            </div>
                        </div>
                    </section>

                    <footer className="pt-10 border-t border-slate-100 grid grid-cols-3 gap-6">
                        <button onClick={() => navigate('/doctor/queue')} className="p-5 bg-white border-2 border-slate-50 rounded-3xl font-black uppercase text-[11px] tracking-widest text-slate-400 hover:text-black hover:border-black transition-all">Cancel Examination</button>
                        <button className="p-5 bg-white border border-slate-200 rounded-3xl font-black uppercase text-[11px] tracking-widest hover:border-black transition-all shadow-sm">Save Progress</button>
                        <button className="p-5 bg-black text-white rounded-3xl font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-500 transition-all shadow-lg">
                            <Save size={16} /> Finalize & Submit
                        </button>
                    </footer>
                </main>
            </div>
        </PageTransition>
    );
}