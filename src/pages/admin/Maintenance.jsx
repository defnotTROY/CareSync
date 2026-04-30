import { useState, useEffect, useRef } from 'react';
import {
    Plus, MoreVertical, Loader2, X, RefreshCw, Trash2, CheckCircle2, AlertCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabase.js';
import PageTransition from "../../components/layout/PageTransition.jsx";
import AdminSidebar from "../../components/layout/AdminSidebar.jsx";
import AdminHeader from "../../components/layout/AdminHeader.jsx";

export default function Maintenance() {
    // UI & Sidebar States
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [activeMenu, setActiveMenu] = useState(null);
    const dropdownRef = useRef(null);

    // Data States
    const [tasks, setTasks] = useState([]);
    const [formData, setFormData] = useState({
        title: '', description: '', priority: 'Normal', status: 'Pending'
    });

    useEffect(() => {
        fetchTasks();
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setActiveMenu(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    async function fetchTasks() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('maintenance_logs')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTasks(data || []);
        } catch (err) {
            console.error("Fetch error:", err.message);
        } finally {
            setLoading(false);
        }
    }

    const handleAddTask = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('maintenance_logs')
                .insert([formData]);
            if (error) throw error;

            setFormData({ title: '', description: '', priority: 'Normal', status: 'Pending' });
            setIsModalOpen(false);
            fetchTasks();
        } catch (err) {
            alert("Database Error: " + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const updateTaskStatus = async (id, currentStatus) => {
        const nextStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
        try {
            const { error } = await supabase
                .from('maintenance_logs')
                .update({ status: nextStatus })
                .eq('id', id);
            if (error) throw error;
            fetchTasks();
            setActiveMenu(null);
        } catch (err) {
            console.error(err.message);
        }
    };

    const [confirmModal, setConfirmModal] = useState({ isOpen: false, taskId: null });

    const confirmDeleteTask = (id) => {
        setConfirmModal({ isOpen: true, taskId: id });
        setActiveMenu(null);
    };

    const executeDeleteTask = async () => {
        const id = confirmModal.taskId;
        if (!id) return;
        try {
            const { error } = await supabase
                .from('maintenance_logs')
                .delete()
                .eq('id', id);
            if (error) throw error;
            fetchTasks();
            setConfirmModal({ isOpen: false, taskId: null });
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <PageTransition>
            <div className="flex min-h-screen bg-[#F8FAFC]">
                <AdminSidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

                <div className="flex-1 flex flex-col min-w-0 md:ml-20 lg:ml-72">
                    <AdminHeader title="System Maintenance" onMenuClick={() => setSidebarOpen(true)} />

                    <main className="p-6 lg:p-12 space-y-10">
                        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
                            <div className="space-y-1">
                                <h1 className="text-4xl lg:text-6xl font-black text-slate-950 uppercase tracking-tighter leading-none italic">Maintenance</h1>
                                <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.3em]">Facility & Equipment Service Logs</p>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={fetchTasks} className="p-4 bg-white border-2 border-slate-100 rounded-2xl text-slate-400 hover:text-black hover:border-black transition-all shadow-sm">
                                    <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                                </button>
                                <button onClick={() => setIsModalOpen(true)} className="px-8 py-4 bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:bg-emerald-600 transition-all shadow-xl">
                                    <Plus size={18} /> New Request
                                </button>
                            </div>
                        </header>

                        <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] shadow-sm overflow-visible w-full sm:w-fit min-w-full">
                                {loading ? (
                                    <div className="flex justify-center py-24"><Loader2 className="animate-spin text-black" size={48} /></div>
                                ) : (
                                    <table className="w-full text-left min-w-[800px]">
                                        <thead className="bg-black text-white text-[9px] font-black uppercase tracking-[0.2em]">
                                            <tr>
                                                <th className="px-10 py-6 rounded-tl-[2.5rem]">Maintenance Task</th>
                                                <th className="px-10 py-6 text-center">Priority</th>
                                                <th className="px-10 py-6 text-center">Status</th>
                                                <th className="px-10 py-6 text-right rounded-tr-[2.5rem]">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50 text-[10px] font-black uppercase tracking-tight">
                                            {tasks.length > 0 ? tasks.map((task) => (
                                                <tr key={task.id} className="hover:bg-slate-50 transition-colors group">
                                                    <td className="px-10 py-8">
                                                        <div className="max-w-[300px]">
                                                            <p className="text-slate-900 text-sm italic font-black uppercase leading-tight">{task.title}</p>
                                                            <p className="text-[8px] text-slate-400 tracking-widest mt-1 uppercase font-black break-words">{task.description}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-8 text-center">
                                                        <span className={`px-3 py-1 rounded-lg text-[8px] border-2 font-black uppercase ${task.priority === 'High' ? 'border-red-100 text-red-500 bg-red-50' : 'border-slate-100 text-slate-400'}`}>
                                                            {task.priority}
                                                        </span>
                                                    </td>
                                                    <td className="px-10 py-8 text-center">
                                                        <span className={`px-4 py-2 rounded-xl text-[8px] tracking-widest border-2 font-black uppercase ${task.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                                                            {task.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-10 py-8 text-right relative overflow-visible">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === task.id ? null : task.id); }}
                                                            className={`p-3 rounded-xl transition-all relative z-10 ${activeMenu === task.id ? 'bg-black text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:text-black'}`}
                                                        >
                                                            <MoreVertical size={18} />
                                                        </button>

                                                        {activeMenu === task.id && (
                                                            <div
                                                                ref={dropdownRef}
                                                                className="absolute right-10 top-1/2 -translate-y-full mb-2 w-48 bg-white border-2 border-slate-100 rounded-3xl shadow-2xl z-[100] overflow-hidden animate-in fade-in zoom-in-95 py-2 origin-bottom-right"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        updateTaskStatus(task.id, task.status);
                                                                    }}
                                                                    className="w-full text-left px-6 py-4 text-[9px] font-black uppercase flex items-center gap-3 text-slate-600 hover:bg-slate-50 transition-all"
                                                                >
                                                                    {task.status === 'Completed' ? <RefreshCw size={16} /> : <CheckCircle2 size={16} />}
                                                                    {task.status === 'Completed' ? 'Mark Pending' : 'Mark Complete'}
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        confirmDeleteTask(task.id);
                                                                    }}
                                                                    className="w-full text-left px-6 py-4 text-[9px] font-black uppercase flex items-center gap-3 text-red-500 hover:bg-red-50 border-t border-slate-50 transition-all"
                                                                >
                                                                    <Trash2 size={16} /> Delete Log
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan="4" className="text-center py-24 text-slate-300 italic font-black uppercase tracking-widest text-[10px]">No maintenance tasks recorded</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                )}
                        </div>
                    </main>

                    {/* MODAL MOVED INSIDE THE MAIN DIV WRAPPER */}
                    {isModalOpen && (
                        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                            <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
                                <div className="bg-black p-8 text-white flex justify-between items-center">
                                    <div>
                                        <h3 className="text-xl font-black uppercase italic tracking-tighter leading-none">New Service Log</h3>
                                        <p className="text-[8px] text-slate-500 uppercase tracking-widest mt-1 font-black">Technical Support Entry</p>
                                    </div>
                                    <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
                                </div>
                                <form onSubmit={handleAddTask} className="p-8 space-y-6">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">Task Title</label>
                                            <input required placeholder="E.G. EQUIPMENT CALIBRATION" className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-sm outline-none focus:border-black transition-all" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value.toUpperCase() })} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">Service Description</label>
                                            <textarea placeholder="DESCRIBE THE MAINTENANCE ACTIONS..." className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-sm outline-none focus:border-black transition-all h-32 resize-none" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value.toUpperCase() })} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">Priority Level</label>
                                            <select className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-sm outline-none focus:border-black transition-all cursor-pointer appearance-none" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>
                                                <option value="Normal">NORMAL PRIORITY</option>
                                                <option value="High">HIGH PRIORITY</option>
                                            </select>
                                        </div>
                                    </div>
                                    <button disabled={isSaving} className="w-full py-5 bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-600 transition-all shadow-xl flex items-center justify-center gap-3 active:scale-[0.98]">
                                        {isSaving ? <Loader2 className="animate-spin" size={18} /> : "Finalize Log Entry"}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* CONFIRMATION MODAL */}
                    {confirmModal.isOpen && (
                        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                            <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 p-8 text-center space-y-6">
                                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <Trash2 size={32} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900">Delete Log?</h3>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-2 font-bold leading-relaxed">This action cannot be undone. The maintenance record will be permanently removed.</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-8">
                                    <button 
                                        onClick={() => setConfirmModal({ isOpen: false, taskId: null })}
                                        className="py-4 bg-slate-50 text-slate-600 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-100 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={executeDeleteTask}
                                        className="py-4 bg-red-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-500/30"
                                    >
                                        Delete
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