import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Plus, MoreVertical, Archive, Edit3, ChevronUp, ChevronDown, RotateCcw,
    Eye, EyeOff, Loader2, X, RefreshCw
} from 'lucide-react';
import { supabase } from '../../lib/supabase.js';
import PageTransition from "../../components/layout/PageTransition.jsx";
import AdminSidebar from "../../components/layout/AdminSidebar.jsx";
import AdminHeader from "../../components/layout/AdminHeader.jsx";

export default function Inventory() {
    const location = useLocation();
    const navigate = useNavigate();

    // UI & Sidebar States
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [activeMenu, setActiveMenu] = useState(null);
    const [showArchived, setShowArchived] = useState(false);

    // Data State
    const [items, setItems] = useState([]);
    const [formData, setFormData] = useState({
        id: null, sku: '', name: '', category: 'Pharmacy', stock_quantity: 0, unit: 'Tabs', min_stock_level: 10
    });

    useEffect(() => {
        fetchInventory();
    }, [showArchived]);

    async function fetchInventory() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('inventory')
                .select('*')
                .eq('is_archived', showArchived)
                .order('name', { ascending: true });

            if (error) throw error;
            setItems(data || []);
        } catch (err) {
            console.error("Fetch error:", err.message);
        } finally {
            setLoading(false);
        }
    }

    const handleSaveItem = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (isEditMode) {
                const { error } = await supabase
                    .from('inventory')
                    .update({
                        sku: formData.sku,
                        name: formData.name,
                        category: formData.category,
                        stock_quantity: formData.stock_quantity,
                        unit: formData.unit,
                        min_stock_level: formData.min_stock_level
                    })
                    .eq('id', formData.id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('inventory').insert([{
                    sku: formData.sku,
                    name: formData.name,
                    category: formData.category,
                    stock_quantity: formData.stock_quantity,
                    unit: formData.unit,
                    min_stock_level: formData.min_stock_level
                }]);
                if (error) throw error;
            }
            closeModal();
            fetchInventory();
        } catch (err) {
            alert("Error: " + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const archiveItem = async (id, status) => {
        const action = status ? "restore" : "archive";
        if (!window.confirm(`Are you sure you want to ${action} this item?`)) return;
        try {
            const { error } = await supabase
                .from('inventory')
                .update({ is_archived: !status })
                .eq('id', id);
            if (error) throw error;
            fetchInventory();
            setActiveMenu(null);
        } catch (err) {
            alert("Action failed: " + err.message);
        }
    };

    const updateStock = async (id, currentStock, amount) => {
        const newStock = Math.max(0, currentStock + amount);
        try {
            const { error } = await supabase
                .from('inventory')
                .update({ stock_quantity: newStock })
                .eq('id', id);
            if (error) throw error;
            setItems(items.map(item => item.id === id ? { ...item, stock_quantity: newStock } : item));
        } catch (err) {
            console.error("Update failed:", err.message);
        }
    };

    const openEditModal = (item) => {
        setFormData(item);
        setIsEditMode(true);
        setIsModalOpen(true);
        setActiveMenu(null);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setIsEditMode(false);
        setFormData({ id: null, sku: '', name: '', category: 'Pharmacy', stock_quantity: 0, unit: 'Tabs', min_stock_level: 10 });
    };

    const getStatus = (stock, min) => {
        if (stock === 0) return { label: 'OUT OF STOCK', color: 'bg-red-50 text-red-600 border-red-100' };
        if (stock <= min) return { label: 'CRITICAL', color: 'bg-orange-50 text-orange-600 border-orange-100' };
        return { label: 'IN STOCK', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' };
    };

    return (
        <PageTransition>
            <div className="flex min-h-screen bg-[#F8FAFC]" onClick={() => setActiveMenu(null)}>
                <AdminSidebar
                    isOpen={isSidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />

                <div className="flex-1 flex flex-col min-w-0 md:ml-20 lg:ml-72">
                    <AdminHeader
                        title={showArchived ? "Archived Inventory" : "System Inventory"}
                        onMenuClick={() => setSidebarOpen(true)}
                    />

                    <main className="p-6 lg:p-12 space-y-10">
                        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
                            <div className="space-y-1">
                                <h1 className="text-4xl lg:text-6xl font-black text-slate-950 uppercase tracking-tighter leading-none italic">
                                    {showArchived ? "Archives" : "Inventory"}
                                </h1>
                                <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.3em]">
                                    {showArchived ? "Inactive Medical Stock" : "Medical Supply Management"}
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowArchived(!showArchived)}
                                    className={`px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 transition-all border-2 ${showArchived ? 'bg-black text-white border-black shadow-lg' : 'bg-white border-slate-100 text-slate-400'}`}
                                >
                                    {showArchived ? <Eye size={18} /> : <EyeOff size={18} />}
                                    {showArchived ? "Active" : "Archives"}
                                </button>

                                {!showArchived && (
                                    <button onClick={() => { setIsEditMode(false); setIsModalOpen(true); }} className="px-8 py-4 bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:bg-emerald-600 transition-all shadow-xl">
                                        <Plus size={18} /> Add Item
                                    </button>
                                )}
                            </div>
                        </header>

                        <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] shadow-sm overflow-x-auto">
                            {loading ? (
                                <div className="flex justify-center py-24"><Loader2 className="animate-spin text-black" size={48} /></div>
                            ) : (
                                <table className="w-full text-left min-w-[900px]">
                                    <thead className="bg-black text-white text-[9px] font-black uppercase tracking-[0.2em]">
                                        <tr>
                                            <th className="px-10 py-6">Item Detail</th>
                                            <th className="px-10 py-6 text-center">Category</th>
                                            <th className="px-10 py-6 text-center">Stock</th>
                                            <th className="px-10 py-6 text-center">Status</th>
                                            <th className="px-10 py-6 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 text-[10px] font-black uppercase tracking-tight">
                                        {items.length > 0 ? items.map((item) => {
                                            const status = getStatus(item.stock_quantity, item.min_stock_level);
                                            return (
                                                <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                                                    <td className="px-10 py-8">
                                                        <p className="text-slate-900 text-sm italic font-black">{item.name}</p>
                                                        <p className="text-[8px] text-slate-300 font-mono tracking-widest mt-1">SKU: {item.sku}</p>
                                                    </td>
                                                    <td className="px-10 py-8 text-center text-slate-400 tracking-widest">{item.category}</td>
                                                    <td className="px-10 py-8 text-center">
                                                        <div className="flex items-center justify-center gap-4">
                                                            <span className="text-slate-900 text-base font-black">{item.stock_quantity} <span className="text-[8px] text-slate-400">{item.unit}</span></span>
                                                            {!showArchived && (
                                                                <div className="flex flex-col gap-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <button onClick={() => updateStock(item.id, item.stock_quantity, 1)} className="p-1 hover:bg-emerald-50 text-emerald-600 rounded"><ChevronUp size={14} /></button>
                                                                    <button onClick={() => updateStock(item.id, item.stock_quantity, -1)} className="p-1 hover:bg-red-50 text-red-600 rounded"><ChevronDown size={14} /></button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-8 text-center">
                                                        <span className={`px-4 py-2 rounded-xl text-[8px] tracking-widest border-2 font-black uppercase ${status.color}`}>
                                                            {status.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-10 py-8 text-right relative">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === item.id ? null : item.id); }}
                                                            className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:text-black transition-all"
                                                        >
                                                            <MoreVertical size={18} />
                                                        </button>

                                                        {activeMenu === item.id && (
                                                            <div
                                                                className="absolute right-10 top-full -mt-2 w-48 bg-white border-2 border-slate-100 rounded-2xl shadow-xl z-[999] p-2 animate-in fade-in slide-in-from-top-2"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                {showArchived ? (
                                                                    <button onClick={() => archiveItem(item.id, true)} className="w-full text-left px-4 py-3 text-[9px] font-black uppercase flex items-center gap-3 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all">
                                                                        <RotateCcw size={14} /> Restore Item
                                                                    </button>
                                                                ) : (
                                                                    <>
                                                                        <button onClick={() => openEditModal(item)} className="w-full text-left px-4 py-3 text-[9px] font-black uppercase flex items-center gap-3 text-slate-600 hover:bg-slate-50 rounded-lg transition-all">
                                                                            <Edit3 size={14} /> Edit Details
                                                                        </button>
                                                                        <div className="h-[1px] bg-slate-50 my-1"></div>
                                                                        <button onClick={() => archiveItem(item.id, false)} className="w-full text-left px-4 py-3 text-[9px] font-black uppercase flex items-center gap-3 text-amber-600 hover:bg-amber-50 rounded-lg transition-all">
                                                                            <Archive size={14} /> Archive Item
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        }) : (
                                            <tr>
                                                <td colSpan="5" className="text-center py-24 text-slate-300 italic font-black uppercase tracking-widest">
                                                    {showArchived ? "No archived records" : "No active records"}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </main>
                </div>

                {/* MODAL (INSIDE WRAPPER) */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
                            <div className="bg-black p-8 text-white flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-black uppercase italic tracking-tighter">{isEditMode ? "Edit Item" : "New Entry"}</h3>
                                    <p className="text-[8px] text-slate-500 uppercase tracking-widest mt-1 font-black">Technical Update</p>
                                </div>
                                <button onClick={closeModal} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
                            </div>
                            <form onSubmit={handleSaveItem} className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <input required placeholder="Item Name" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-sm outline-none focus:border-black transition-all" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                                    <div className="grid grid-cols-2 gap-4">
                                        <input required placeholder="SKU ID" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-sm outline-none focus:border-black transition-all" value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} />
                                        <select className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-sm outline-none focus:border-black transition-all" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                                            <option value="Pharmacy">Pharmacy</option>
                                            <option value="Supplies">Supplies</option>
                                            <option value="Equipment">Equipment</option>
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <input type="number" placeholder="Stock" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-sm outline-none focus:border-black transition-all" value={formData.stock_quantity} onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) })} />
                                        <input placeholder="Unit" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-sm outline-none focus:border-black transition-all" value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} />
                                        <input type="number" placeholder="Min" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-sm outline-none focus:border-black transition-all" value={formData.min_stock_level} onChange={(e) => setFormData({ ...formData, min_stock_level: parseInt(e.target.value) })} />
                                    </div>
                                </div>
                                <button disabled={isSaving} className="w-full py-4 bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-600 transition-all shadow-xl flex items-center justify-center gap-3">
                                    {isSaving ? <Loader2 className="animate-spin" size={18} /> : "Finalize Entry"}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </PageTransition>
    );
}