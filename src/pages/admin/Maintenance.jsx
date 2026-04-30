import { useState, useEffect } from 'react';

import {
    Plus, MoreVertical, Loader2, X, RefreshCw
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

    // Data States
    const [tasks, setTasks] = useState([]);
    const [formData, setFormData] = useState({
        title: '', description: '', priority: 'Normal', status: 'Pending'
    });

    useEffect(() => {
        fetchTasks();
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
            alert(err.message);
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
        } catch (err) {
            console.error(err.message);
        }
    };

    return (
        <PageTransition>
            <div className="flex min-h-screen bg-[#F8FAFC]">
                <AdminSidebar
                    isOpen={isSidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />

                <div className="flex-1 flex flex-col min-w-0 md:ml-20 lg:ml-72">
                    <AdminHeader
                        title="System Maintenance"
                        onMenuClick={() => setSidebarOpen(true)}
                    />

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

                        <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] shadow-sm overflow-x-auto">
                            {loading ? (
                                <div className="flex justify-center py-24"><Loader2 className="animate-spin text-black" size={48} /></div>
                            ) : (
                                <table className="w-full text-left min-w-[800px]">
                                    <thead className="bg-black text-white text-[9px] font-black uppercase tracking-[0.2em]">
                                        <tr>
                                            <th className="px-10 py-6">Maintenance Task</th>
                                            <th className="px-10 py-6 text-center">Priority</th>
                                            <th className="px-10 py-6 text-center">Status</th>
                                            <th className="px-10 py-6 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 text-[10px] font-black uppercase tracking-tight">
                                        {tasks.length > 0 ? tasks.map((task) => (
                                            <tr key={task.id} className="hover:bg-slate-50 transition-colors group">
                                                <td className="px-10 py-8">
                                                    <p className="text-slate-900 text-sm italic font-black">{task.title}</p>
                                                    <p className="text-[8px] text-slate-400 tracking-widest mt-1 uppercase font-black">{task.description}</p>
                                                </td>
                                                <td className="px-10 py-8 text-center">
                                                    <span className={`px-3 py-1 rounded-lg text-[8px] border-2 font-black uppercase ${task.priority === 'High' ? 'border-red-100 text-red-500 bg-red-50' : 'border-slate-100 text-slate-400'
                                                        }`}>
                                                        {task.priority}
                                                    </span>
                                                </td>
                                                <td className="px-10 py-8 text-center">
                                                    <button
                                                        onClick={() => updateTaskStatus(task.id, task.status)}
                                                        className={`px-4 py-2 rounded-xl text-[8px] tracking-widest border-2 font-black uppercase transition-all ${task.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 font-black' : 'bg-slate-50 text-slate-400 border-slate-100'
                                                            }`}
                                                    >
                                                        {task.status}
                                                    </button>
                                                </td>
                                                <td className="px-10 py-8 text-right">
                                                    <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:text-black transition-all">
                                                        <MoreVertical size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="4" className="text-center py-24 text-slate-300 italic font-black uppercase tracking-widest">No maintenance tasks recorded</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </main>
                </div>

                {/* ADD TASK MODAL */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
                            <div className="bg-black p-8 text-white flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-black uppercase italic tracking-tighter">New Service Log</h3>
                                    <p className="text-[8px] text-slate-500 uppercase tracking-widest mt-1 font-black">Technical Support Entry</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
                            </div>
                            <form onSubmit={handleAddTask} className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <input required placeholder="Task Title" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-sm outline-none focus:border-black transition-all" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                                    <textarea placeholder="Service Description" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-sm outline-none focus:border-black transition-all h-32 resize-none" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                                    <select className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-sm outline-none focus:border-black transition-all cursor-pointer" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>
                                        <option value="Normal">Normal Priority</option>
                                        <option value="High">High Priority</option>
                                    </select>
                                </div>
                                <button disabled={isSaving} className="w-full py-4 bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-600 transition-all shadow-xl flex items-center justify-center gap-3">
                                    {isSaving ? <Loader2 className="animate-spin" size={18} /> : "Finalize Log Entry"}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </PageTransition>
    );
}