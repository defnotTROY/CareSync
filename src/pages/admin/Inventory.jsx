import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Plus, MoreVertical, Archive, Edit3, ChevronUp, ChevronDown, RotateCcw,
    Eye, EyeOff, Loader2, X, Search
} from 'lucide-react';
import { supabase } from '../../lib/supabase.js';
import PageTransition from "../../components/layout/PageTransition.jsx";
import AdminSidebar from "../../components/layout/AdminSidebar.jsx";
import AdminHeader from "../../components/layout/AdminHeader.jsx";

export default function Inventory() {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [activeMenu, setActiveMenu] = useState(null);
    const [showArchived, setShowArchived] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const dropdownRef = useRef(null);

    const [items, setItems] = useState([]);
    const [formData, setFormData] = useState({
        id: null, sku: '', name: '', category: 'Pharmacy', stock_quantity: 0, unit: 'Tabs', min_stock_level: 10
    });

    useEffect(() => {
        fetchInventory();
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setActiveDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
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
            const payload = {
                sku: formData.sku,
                name: formData.name,
                category: formData.category,
                stock_quantity: formData.stock_quantity,
                unit: formData.unit,
                min_stock_level: formData.min_stock_level
            };

            if (isEditMode) {
                const { error } = await supabase.from('inventory').update(payload).eq('id', formData.id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('inventory').insert([payload]);
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

    const [confirmModal, setConfirmModal] = useState({ isOpen: false, itemId: null, status: null });

    const confirmArchiveItem = (id, status) => {
        setConfirmModal({ isOpen: true, itemId: id, status: status });
        setActiveMenu(null);
    };

    const executeArchiveItem = async () => {
        const { itemId, status } = confirmModal;
        if (!itemId) return;
        try {
            const { error } = await supabase
                .from('inventory')
                .update({ is_archived: !status })
                .eq('id', itemId);
            if (error) throw error;
            fetchInventory();
            setConfirmModal({ isOpen: false, itemId: null, status: null });
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

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <PageTransition>
            <div className="flex min-h-screen bg-[#F8FAFC]">
                <AdminSidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

                <div className="flex-1 flex flex-col min-w-0 md:ml-20 lg:ml-72">
                    <AdminHeader title={showArchived ? "Archived Inventory" : "System Inventory"} onMenuClick={() => setSidebarOpen(true)} />

                    <main className="p-6 lg:p-12 space-y-10">
                        <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
                            <div className="space-y-1">
                                <h1 className="text-4xl lg:text-6xl font-black text-slate-950 uppercase tracking-tighter leading-none italic">
                                    {showArchived ? "Archives" : "Inventory"}
                                </h1>
                                <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.3em]">
                                    {showArchived ? "Inactive Medical Stock" : "Medical Supply Management"}
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
                                <div className="relative flex-1 min-w-[240px] xl:w-80 group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-black transition-colors" size={18} />
                                    <input
                                        type="text"
                                        placeholder="SEARCH BY NAME OR SKU..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest outline-none focus:border-black transition-all shadow-sm"
                                    />
                                </div>

                                <button
                                    onClick={() => setShowArchived(!showArchived)}
                                    className={`px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 transition-all border-2 ${showArchived ? 'bg-black text-white border-black shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'}`}
                                >
                                    {showArchived ? <Eye size={18} /> : <EyeOff size={18} />}
                                    {showArchived ? "Active" : "Archives"}
                                </button>

                                {!showArchived && (
                                    <button onClick={() => { setIsEditMode(false); setIsModalOpen(true); }} className="px-8 py-4 bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:bg-emerald-500 transition-all shadow-xl">
                                        <Plus size={18} /> Add Item
                                    </button>
                                )}
                            </div>
                        </header>

                        <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] shadow-sm overflow-visible w-full sm:w-fit min-w-full">
                                {loading ? (
                                    <div className="flex justify-center py-24"><Loader2 className="animate-spin text-black" size={48} /></div>
                                ) : (
                                    <table className="w-full text-left min-w-[900px]">
                                        <thead className="bg-black text-white text-[9px] font-black uppercase tracking-[0.2em]">
                                            <tr>
                                                <th className="px-10 py-6 rounded-tl-[2.5rem]">Item Detail</th>
                                                <th className="px-10 py-6 text-center">Category</th>
                                                <th className="px-10 py-6 text-center">Stock</th>
                                                <th className="px-10 py-6 text-center">Status</th>
                                                <th className="px-10 py-6 text-right rounded-tr-[2.5rem]">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50 text-[10px] font-black uppercase tracking-tight">
                                            {filteredItems.length > 0 ? filteredItems.map((item) => {
                                                const status = getStatus(item.stock_quantity, item.min_stock_level);
                                                return (
                                                    <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                                                        <td className="px-10 py-8">
                                                            {/* FITTED BOX CONSTRAINTS */}
                                                            <div className="max-w-[250px]">
                                                                <p className="text-slate-900 text-sm italic font-black break-words leading-tight uppercase">
                                                                    {item.name}
                                                                </p>
                                                                <p className="text-[8px] text-slate-300 font-mono tracking-widest mt-1">
                                                                    SKU: {item.sku}
                                                                </p>
                                                            </div>
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
                                                        <td className="px-10 py-8 text-right overflow-visible">
                                                            <div className="relative inline-block text-left">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setActiveMenu(activeMenu === item.id ? null : item.id);
                                                                    }}
                                                                    className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:text-black transition-all relative z-10"
                                                                >
                                                                    <MoreVertical size={18} />
                                                                </button>

                                                                {activeMenu === item.id && (
                                                                    <div
                                                                        ref={dropdownRef}
                                                                        className="absolute right-0 top-full mt-2 w-48 bg-white border-2 border-slate-100 rounded-3xl shadow-2xl z-[100] overflow-hidden animate-in fade-in zoom-in-95 py-2 origin-top-right"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                    >
                                                                        {showArchived ? (
                                                                            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); confirmArchiveItem(item.id, true); }} className="w-full text-left px-6 py-4 flex items-center gap-3 text-emerald-600 hover:bg-emerald-50 transition-colors font-black uppercase text-[10px] tracking-widest">
                                                                                <RotateCcw size={14} /> Unarchive
                                                                            </button>
                                                                        ) : (
                                                                            <>
                                                                                <button onClick={() => openEditModal(item)} className="w-full text-left px-6 py-4 flex items-center gap-3 text-slate-600 hover:bg-slate-50 transition-colors font-black uppercase text-[10px] tracking-widest">
                                                                                    <Edit3 size={14} className="text-black" /> Edit Details
                                                                                </button>
                                                                                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); confirmArchiveItem(item.id, false); }} className="w-full text-left px-6 py-4 flex items-center gap-3 font-black uppercase text-[10px] tracking-widest transition-colors text-red-500 hover:bg-red-50 border-t border-slate-50">
                                                                                    <Archive size={14} /> Archive Item
                                                                                </button>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            }) : (
                                                <tr>
                                                    <td colSpan="5" className="text-center py-24 text-slate-300 italic font-black uppercase tracking-widest text-[10px]">
                                                        {showArchived ? "NO ARCHIVED RECORDS" : "NO ACTIVE RECORDS FOUND"}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                )}
                        </div>
                    </main>
                </div>

                {/* MODAL SYSTEM */}
                    {/* ADD/EDIT MODAL */}
                    {isModalOpen && (
                        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                            <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
                                <div className="bg-black p-8 text-white flex justify-between items-center">
                                    <div>
                                        <h3 className="text-xl font-black uppercase italic tracking-tighter leading-none">{isEditMode ? 'Update Item' : 'Add Inventory'}</h3>
                                        <p className="text-[8px] text-slate-500 uppercase tracking-widest mt-1 font-black">Medical Supply Record</p>
                                    </div>
                                    <button onClick={closeModal} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
                                </div>

                                <form onSubmit={handleSaveItem} className="p-8 space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">SKU Code</label>
                                            <input required type="text" placeholder="E.G. MED-001" value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-sm outline-none focus:border-black transition-all" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">Category</label>
                                            <select required value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-sm outline-none focus:border-black transition-all cursor-pointer">
                                                <option value="Pharmacy">PHARMACY</option>
                                                <option value="Equipment">EQUIPMENT</option>
                                                <option value="Supplies">SUPPLIES</option>
                                                <option value="Other">OTHER</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">Item Name</label>
                                        <input required type="text" placeholder="E.G. PARACETAMOL 500MG" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-sm outline-none focus:border-black transition-all" />
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">Initial Stock</label>
                                            <input required type="number" min="0" value={formData.stock_quantity} onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) })} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-sm outline-none focus:border-black transition-all" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">Min Level</label>
                                            <input required type="number" min="0" value={formData.min_stock_level} onChange={(e) => setFormData({ ...formData, min_stock_level: parseInt(e.target.value) })} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-sm outline-none focus:border-black transition-all" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">Unit</label>
                                            <input required type="text" placeholder="BOX/PCS" value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value.toUpperCase() })} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-sm outline-none focus:border-black transition-all" />
                                        </div>
                                    </div>

                                    <button disabled={isSaving} type="submit" className="w-full py-5 bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-500 transition-all shadow-xl flex items-center justify-center gap-3 active:scale-[0.98]">
                                        {isSaving ? <Loader2 className="animate-spin" size={18} /> : (isEditMode ? 'Update Record' : 'Save Record')}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* CONFIRMATION MODAL */}
                    {confirmModal.isOpen && (
                        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                            <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 p-8 text-center space-y-6">
                                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-2 ${!confirmModal.status ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'}`}>
                                    {!confirmModal.status ? <Archive size={32} /> : <RotateCcw size={32} />}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900">{!confirmModal.status ? 'Archive Item?' : 'Restore Item?'}</h3>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-2 font-bold leading-relaxed">
                                        {!confirmModal.status 
                                            ? "This item will be moved to the archives and won't appear in active inventory." 
                                            : "This item will be restored and appear back in the active inventory."}
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-8">
                                    <button 
                                        onClick={() => setConfirmModal({ isOpen: false, itemId: null, status: null })}
                                        className="py-4 bg-slate-50 text-slate-600 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-100 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={executeArchiveItem}
                                        className={`py-4 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-lg ${!confirmModal.status ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30' : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30'}`}
                                    >
                                        {!confirmModal.status ? 'Archive' : 'Restore'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
        </PageTransition>
    );
}