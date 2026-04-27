import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Users, BadgeDollarSign, Warehouse,
    Wrench, Settings, LogOut, Search,
    Activity, Calendar, AlertTriangle, MoreVertical, X, Loader2, CheckCircle2,
    FileText, Trash2, Edit3, RotateCcw, Eye, EyeOff, Archive
} from 'lucide-react';
import { supabase } from '../../lib/supabase.js';
import PageTransition from "../../components/layout/PageTransition.jsx";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Maintenance() {
    const location = useLocation();
    const navigate = useNavigate();

    // Data States
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [activeMenu, setActiveMenu] = useState(null);
    const [showArchived, setShowArchived] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        id: null, equipment_id: '', name: '', zone: '',
        last_service: new Date().toISOString().split('T')[0],
        status: 'OPERATIONAL', health_score: 100
    });

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
        { name: 'Staff Management', icon: Users, path: '/admin/staff' },
        { name: 'Revenue', icon: BadgeDollarSign, path: '/admin/revenue' },
        { name: 'Inventory', icon: Warehouse, path: '/admin/inventory' },
        { name: 'Maintenance', icon: Wrench, path: '/admin/maintenance' },
    ];

    useEffect(() => {
        fetchAssets();
    }, [showArchived]);

    async function fetchAssets() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('maintenance_assets')
                .select('*')
                .eq('is_archived', showArchived)
                .order('health_score', { ascending: true });

            if (error) throw error;
            setAssets(data || []);
        } catch (err) {
            console.error("Fetch error:", err.message);
        } finally {
            setLoading(false);
        }
    }

    const handleSaveAsset = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (formData.id) {
                const { error } = await supabase
                    .from('maintenance_assets')
                    .update({
                        equipment_id: formData.equipment_id,
                        name: formData.name,
                        zone: formData.zone,
                        last_service: formData.last_service,
                        status: formData.status,
                        health_score: formData.health_score
                    })
                    .eq('id', formData.id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('maintenance_assets').insert([formData]);
                if (error) throw error;
            }
            setIsModalOpen(false);
            setFormData({ id: null, equipment_id: '', name: '', zone: '', last_service: new Date().toISOString().split('T')[0], status: 'OPERATIONAL', health_score: 100 });
            fetchAssets();
        } catch (err) {
            alert("Error: " + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const toggleArchiveStatus = async (id, currentStatus) => {
        const action = currentStatus ? "restore" : "archive";
        if (!window.confirm(`Are you sure you want to ${action} this equipment?`)) return;
        try {
            const { error } = await supabase
                .from('maintenance_assets')
                .update({ is_archived: !currentStatus })
                .eq('id', id);
            if (error) throw error;
            fetchAssets();
            setActiveMenu(null);
        } catch (err) {
            alert("Action failed: " + err.message);
        }
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text(`CARESYNC ${showArchived ? 'ARCHIVED' : 'ACTIVE'} ASSET REPORT`, 14, 22);

        const tableColumn = ["ID", "Name", "Zone", "Health", "Status", "Last Service"];
        const tableRows = filteredAssets.map(a => [
            a.equipment_id, a.name, a.zone, `${a.health_score}%`, a.status, a.last_service
        ]);

        autoTable(doc, {
            startY: 40,
            head: [tableColumn],
            body: tableRows,
            theme: 'grid',
            headStyles: { fillColor: [0, 0, 0] }
        });

        doc.save(`Asset_Report_${showArchived ? 'Archives' : 'Active'}.pdf`);
    };

    const getHealthColor = (score) => {
        if (score > 80) return 'bg-emerald-50 text-emerald-600 border-emerald-100';
        if (score > 40) return 'bg-orange-50 text-orange-600 border-orange-100';
        return 'bg-red-50 text-red-600 border-red-100';
    };

    const filteredAssets = assets.filter(a =>
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.equipment_id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const criticalAssets = assets.filter(a => a.health_score < 40 && !a.is_archived);

    return (
        <PageTransition>
            <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900 font-sans relative" onClick={() => setActiveMenu(null)}>

                {/* SIDEBAR - Updated to Sentence Case */}
                <aside className="w-72 bg-black flex flex-col justify-between py-10 px-6 shrink-0 h-screen sticky top-0">
                    <div className="space-y-10">
                        <div className="flex items-center gap-3 px-2">
                            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center font-bold text-white text-xl italic shadow-lg shadow-emerald-500/20">C</div>
                            <div className="flex flex-col text-white font-black uppercase tracking-tight leading-none italic">
                                <span className="text-lg tracking-tighter">CareSync</span>
                                <span className="text-slate-500 text-[10px] tracking-widest mt-1 uppercase font-bold">Admin Portal</span>
                            </div>
                        </div>

                        <nav className="space-y-1">
                            {navItems.map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.path}
                                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${isActive
                                                ? 'bg-white text-black font-black shadow-lg'
                                                : 'text-slate-400 hover:text-white hover:bg-white/5 font-bold'
                                            }`}
                                    >
                                        <item.icon size={20} className={isActive ? 'text-black' : 'text-slate-400'} />
                                        <span className="text-sm tracking-tight">{item.name}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="pt-6 border-t border-white/10 flex items-center justify-between px-2 text-white">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-slate-800 rounded-full flex items-center justify-center text-[10px] font-black italic uppercase">AD</div>
                            <div className="flex flex-col">
                                <span className="text-[11px] font-black uppercase tracking-tight leading-none">Super Admin</span>
                                <span className="text-slate-500 text-[8px] font-black uppercase tracking-widest mt-1">CareSync HQ</span>
                            </div>
                        </div>
                        <button onClick={() => navigate('/login')} className="p-2 text-slate-500 hover:text-red-400 transition-all"><LogOut size={18} /></button>
                    </div>
                </aside>

                <main className="flex-1 p-12 space-y-10 overflow-y-auto">
                    <header className="flex justify-between items-center">
                        <div className="space-y-1">
                            <h1 className="text-5xl font-black text-slate-950 uppercase tracking-tighter leading-none italic">
                                {showArchived ? "Maintenance Archives" : "Maintenance"}
                            </h1>
                            <p className="text-slate-500 font-medium uppercase text-[10px] tracking-[0.2em]">
                                {showArchived ? "Historic Asset Records" : "Equipment Health & Diagnostics"}
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowArchived(!showArchived); }}
                                className={`px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 transition-all shadow-xl ${showArchived ? 'bg-emerald-500 text-white' : 'bg-white border-2 border-slate-100 text-slate-400'}`}
                            >
                                {showArchived ? <Eye size={18} /> : <EyeOff size={18} />}
                                {showArchived ? "View Active" : "View Archives"}
                            </button>

                            <button onClick={exportToPDF} className="px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:border-black transition-all shadow-sm text-slate-600">
                                <FileText size={18} /> Export PDF
                            </button>

                            {!showArchived && (
                                <button onClick={() => { setFormData({ id: null, equipment_id: '', name: '', zone: '', last_service: new Date().toISOString().split('T')[0], status: 'OPERATIONAL', health_score: 100 }); setIsModalOpen(true); }} className="px-8 py-4 bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:bg-emerald-500 transition-all shadow-xl">
                                    <Wrench size={18} /> Register Asset
                                </button>
                            )}
                        </div>
                    </header>

                    <div className="grid grid-cols-12 gap-8">
                        <div className="col-span-8 bg-white border-2 border-slate-50 rounded-[3rem] shadow-sm p-10 space-y-8">
                            <div className="flex justify-between items-center px-2">
                                <h3 className="font-black uppercase text-lg tracking-tighter italic">
                                    {showArchived ? "Archived Units" : "Equipment Inventory"}
                                </h3>
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="SEARCH ASSETS..."
                                        className="pl-12 pr-6 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-[10px] font-black uppercase outline-none focus:border-black w-64 transition-all"
                                    />
                                </div>
                            </div>

                            {loading ? (
                                <div className="flex justify-center py-12"><Loader2 className="animate-spin text-emerald-500" size={40} /></div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredAssets.length > 0 ? filteredAssets.map((item) => (
                                        <div key={item.id} className="group border-2 border-slate-50 hover:border-black rounded-[2.5rem] p-6 transition-all flex items-center justify-between bg-white relative">
                                            <div className="flex items-center gap-6">
                                                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center font-black text-lg border-2 ${getHealthColor(item.health_score)}`}>
                                                    {item.health_score}%
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-950 uppercase tracking-tight italic">{item.name}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.zone} • {item.equipment_id}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-10">
                                                <div className="text-right">
                                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                                                    <p className="text-[10px] font-black uppercase tracking-tight">{item.status}</p>
                                                </div>
                                                <div className="relative overflow-visible">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === item.id ? null : item.id); }}
                                                        className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-black transition-all"
                                                    >
                                                        <MoreVertical size={18} />
                                                    </button>
                                                    {activeMenu === item.id && (
                                                        <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-2xl z-[999] p-2 animate-in fade-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
                                                            {showArchived ? (
                                                                <button
                                                                    onClick={() => toggleArchiveStatus(item.id, true)}
                                                                    className="w-full text-left px-4 py-3 text-[10px] font-black uppercase flex items-center gap-3 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                                                >
                                                                    <RotateCcw size={14} /> Restore Unit
                                                                </button>
                                                            ) : (
                                                                <>
                                                                    <button
                                                                        onClick={() => { setFormData(item); setIsModalOpen(true); setActiveMenu(null); }}
                                                                        className="w-full text-left px-4 py-3 text-[10px] font-black uppercase flex items-center gap-3 text-slate-600 hover:bg-slate-50 rounded-lg transition-all"
                                                                    >
                                                                        <Edit3 size={14} /> Update Health
                                                                    </button>
                                                                    <button
                                                                        onClick={() => toggleArchiveStatus(item.id, false)}
                                                                        className="w-full text-left px-4 py-3 text-[10px] font-black uppercase flex items-center gap-3 text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                                                                    >
                                                                        <Archive size={14} /> Archive Asset
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-center py-20 text-slate-300 font-black uppercase tracking-widest text-[10px]">
                                            {showArchived ? "No archived records found" : "No active equipment found"}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="col-span-4 space-y-6">
                            {criticalAssets.length > 0 ? (
                                <div className="bg-red-50 border-2 border-red-100 p-8 rounded-[2.5rem] space-y-4">
                                    <div className="flex items-center gap-3 text-red-600">
                                        <AlertTriangle size={24} />
                                        <h4 className="font-black uppercase text-xs tracking-widest italic">Critical Attention</h4>
                                    </div>
                                    <p className="text-[10px] font-bold text-red-900 leading-relaxed uppercase tracking-tight">
                                        Units requiring service: {criticalAssets.map(a => a.name).join(', ')}
                                    </p>
                                </div>
                            ) : (
                                <div className="bg-emerald-50 border-2 border-emerald-100 p-8 rounded-[2.5rem] space-y-4">
                                    <div className="flex items-center gap-3 text-emerald-600">
                                        <CheckCircle2 size={24} />
                                        <h4 className="font-black uppercase text-xs tracking-widest italic">System Nominal</h4>
                                    </div>
                                    <p className="text-[10px] font-bold text-emerald-900 uppercase tracking-tight">All facility equipment is performing correctly.</p>
                                </div>
                            )}

                            <div className="bg-black text-white p-8 rounded-[2.5rem] shadow-xl space-y-6">
                                <h4 className="font-black uppercase text-xs tracking-widest text-emerald-500 italic">Facility Logs</h4>
                                <div className="flex items-start gap-4">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full mt-1.5 shadow-[0_0_10px_#10b981]"></div>
                                    <p className="text-xs font-bold uppercase tracking-tight leading-relaxed">System-wide backup power test scheduled for end of month.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                {/* MODAL */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
                        <div className="bg-white w-full max-w-lg rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                            <div className="bg-black p-10 text-white flex justify-between items-center">
                                <h2 className="text-2xl font-black uppercase tracking-tighter italic">{formData.id ? "Update Health" : "Register Asset"}</h2>
                                <button onClick={() => setIsModalOpen(false)} className="p-4 hover:bg-white/10 rounded-full transition-all"><X size={24} /></button>
                            </div>
                            <form onSubmit={handleSaveAsset} className="p-10 space-y-6">
                                <div className="grid grid-cols-2 gap-5">
                                    <input required type="text" placeholder="EQ ID" value={formData.equipment_id} onChange={(e) => setFormData({ ...formData, equipment_id: e.target.value })} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold text-sm focus:border-black" />
                                    <input required type="text" placeholder="Asset Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold text-sm focus:border-black" />
                                </div>
                                <input required type="text" placeholder="Zone" value={formData.zone} onChange={(e) => setFormData({ ...formData, zone: e.target.value })} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold text-sm focus:border-black" />
                                <div className="grid grid-cols-2 gap-5">
                                    <input required type="number" placeholder="Health %" value={formData.health_score} onChange={(e) => setFormData({ ...formData, health_score: parseInt(e.target.value) })} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold text-sm focus:border-black" />
                                    <input required type="date" value={formData.last_service} onChange={(e) => setFormData({ ...formData, last_service: e.target.value })} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold text-sm focus:border-black" />
                                </div>
                                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold text-sm focus:border-black">
                                    <option value="OPERATIONAL">OPERATIONAL</option>
                                    <option value="NEEDS SERVICE">NEEDS SERVICE</option>
                                    <option value="REPAIR IN PROGRESS">REPAIR IN PROGRESS</option>
                                </select>
                                <button type="submit" disabled={isSaving} className="w-full py-6 bg-black text-white rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-emerald-500 transition-all shadow-xl flex items-center justify-center gap-3">
                                    {isSaving ? <Loader2 className="animate-spin" /> : "Authorize Diagnostic Entry"}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </PageTransition>
    );
}