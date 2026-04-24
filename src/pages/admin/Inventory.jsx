import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Users, BadgeDollarSign, Warehouse,
    Wrench, Settings, LogOut, Search,
    Plus, MoreVertical, AlertCircle, PackageCheck, Truck, X, Loader2,
    Archive, Edit3, ChevronUp, ChevronDown, RotateCcw, Eye, EyeOff
} from 'lucide-react';
import { supabase } from '../../lib/supabase.js';
import PageTransition from "../../components/layout/PageTransition.jsx";

export default function Inventory() {
    const location = useLocation();
    const navigate = useNavigate();

    // Data States
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [activeMenu, setActiveMenu] = useState(null);
    const [showArchived, setShowArchived] = useState(false); // NEW: State for Archive View

    // Form State
    const [formData, setFormData] = useState({
        id: null, sku: '', name: '', category: 'Pharmacy', stock_quantity: 0, unit: 'Tabs', min_stock_level: 10
    });

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
        { name: 'Staff Management', icon: Users, path: '/admin/staff' },
        { name: 'Revenue', icon: BadgeDollarSign, path: '/admin/revenue' },
        { name: 'Inventory', icon: Warehouse, path: '/admin/inventory' },
        { name: 'Maintenance', icon: Wrench, path: '/admin/maintenance' },
    ];

    useEffect(() => {
        fetchInventory();
    }, [showArchived]); // Refetch whenever toggle changes

    async function fetchInventory() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('inventory')
                .select('*')
                .eq('is_archived', showArchived) // Dynamically filter based on toggle
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

    const getStatus = (stock, min) => {
        if (stock === 0) return { label: 'OUT OF STOCK', color: 'bg-red-50 text-red-600 border-red-100' };
        if (stock <= min) return { label: 'CRITICAL', color: 'bg-orange-50 text-orange-600 border-orange-100' };
        return { label: 'IN STOCK', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' };
    };

    return (
        <PageTransition>
            <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900 font-sans relative" onClick={() => setActiveMenu(null)}>

                {/* SIDEBAR */}
                <aside className="w-72 bg-black flex flex-col justify-between py-10 px-6 shrink-0 h-screen sticky top-0">
                    <div className="space-y-10">
                        <div className="flex items-center gap-3 px-2">
                            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center font-bold text-white text-xl italic shadow-lg">C</div>
                            <div className="flex flex-col text-white font-black uppercase tracking-tight leading-none italic">
                                <span className="text-lg tracking-tighter">CareSync</span>
                                <span className="text-slate-500 text-[10px] tracking-widest mt-1 uppercase">Admin Portal</span>
                            </div>
                        </div>
                        <nav className="space-y-1">
                            {navItems.map((item) => (
                                <Link key={item.name} to={item.path} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${location.pathname === item.path ? 'bg-white text-black font-bold shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                                    <item.icon size={20} className={location.pathname === item.path ? 'text-black' : 'text-slate-400'} />
                                    <span className="text-sm">{item.name}</span>
                                </Link>
                            ))}
                        </nav>
                    </div>
                </aside>

                <main className="flex-1 p-12 space-y-10 overflow-y-auto pb-40">
                    <header className="flex justify-between items-center">
                        <div className="space-y-1">
                            <h1 className="text-5xl font-black text-slate-950 uppercase tracking-tighter leading-none italic">
                                {showArchived ? "Archived Items" : "Inventory"}
                            </h1>
                            <p className="text-slate-500 font-medium uppercase text-[10px] tracking-[0.2em]">
                                {showArchived ? "Inactive Medical Stock" : "Medical Supply Archive & Management"}
                            </p>
                        </div>
                        <div className="flex gap-4">
                            {/* NEW: Archive Toggle Button */}
                            <button
                                onClick={() => setShowArchived(!showArchived)}
                                className={`px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 transition-all shadow-xl ${showArchived ? 'bg-emerald-500 text-white' : 'bg-white border-2 border-slate-100 text-slate-400'}`}
                            >
                                {showArchived ? <Eye size={18} /> : <EyeOff size={18} />}
                                {showArchived ? "View Active" : "View Archives"}
                            </button>

                            {!showArchived && (
                                <button onClick={() => { setIsEditMode(false); setIsModalOpen(true); }} className="px-8 py-4 bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:bg-emerald-500 transition-all shadow-xl">
                                    <Plus size={18} /> Add New Item
                                </button>
                            )}
                        </div>
                    </header>

                    <div className="bg-white border-2 border-slate-50 rounded-[3rem] shadow-sm overflow-visible">
                        {loading ? (
                            <div className="flex justify-center py-24"><Loader2 className="animate-spin text-emerald-500" size={48} /></div>
                        ) : (
                            <table className="w-full text-left">
                                <thead className="bg-black text-white">
                                    <tr>
                                        <th className="px-10 py-7 text-[10px] uppercase tracking-widest text-slate-400 font-bold">Item Detail</th>
                                        <th className="px-10 py-7 text-[10px] uppercase tracking-widest text-slate-400 font-bold">Category</th>
                                        <th className="px-10 py-7 text-[10px] uppercase tracking-widest text-slate-400 font-bold">Stock</th>
                                        <th className="px-10 py-7 text-[10px] uppercase tracking-widest text-slate-400 font-bold">Status</th>
                                        <th className="px-10 py-7 text-[10px] uppercase tracking-widest text-slate-400 font-bold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {items.length > 0 ? items.map((item) => {
                                        const status = getStatus(item.stock_quantity, item.min_stock_level);
                                        return (
                                            <tr key={item.id} className="group hover:bg-slate-50/50 transition-all font-bold italic">
                                                <td className="px-10 py-8">
                                                    <p className="font-black text-slate-950 uppercase text-sm">{item.name}</p>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">SKU: {item.sku}</p>
                                                </td>
                                                <td className="px-10 py-8 font-black uppercase text-[10px] text-slate-500 tracking-widest">{item.category}</td>
                                                <td className="px-10 py-8">
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-black text-slate-950 text-base">{item.stock_quantity} {item.unit}</span>
                                                        {!showArchived && (
                                                            <div className="flex flex-col gap-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button onClick={() => updateStock(item.id, item.stock_quantity, 1)} className="p-0.5 hover:bg-emerald-50 text-emerald-600 rounded"><ChevronUp size={16} /></button>
                                                                <button onClick={() => updateStock(item.id, item.stock_quantity, -1)} className="p-0.5 hover:bg-red-50 text-red-600 rounded"><ChevronDown size={16} /></button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${status.color}`}>
                                                        {status.label}
                                                    </span>
                                                </td>
                                                <td className="px-10 py-8 text-right relative overflow-visible">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === item.id ? null : item.id); }}
                                                        className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:text-black transition-all relative z-10"
                                                    >
                                                        <MoreVertical size={18} />
                                                    </button>

                                                    {activeMenu === item.id && (
                                                        <div
                                                            className="absolute right-10 top-full -mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-[999] p-2 animate-in fade-in slide-in-from-top-2"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            {showArchived ? (
                                                                <button
                                                                    onClick={() => archiveItem(item.id, true)}
                                                                    className="w-full text-left px-4 py-3 text-[10px] font-black uppercase flex items-center gap-3 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                                                >
                                                                    <RotateCcw size={14} /> Restore Item
                                                                </button>
                                                            ) : (
                                                                <>
                                                                    <button
                                                                        onClick={() => openEditModal(item)}
                                                                        className="w-full text-left px-4 py-3 text-[10px] font-black uppercase flex items-center gap-3 text-slate-600 hover:bg-slate-50 rounded-lg transition-all"
                                                                    >
                                                                        <Edit3 size={14} /> Edit Details
                                                                    </button>
                                                                    <div className="h-[1px] bg-slate-50 my-1"></div>
                                                                    <button
                                                                        onClick={() => archiveItem(item.id, false)}
                                                                        className="w-full text-left px-4 py-3 text-[10px] font-black uppercase flex items-center gap-3 text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                                                                    >
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
                                            <td colSpan="5" className="text-center py-20 text-slate-300 font-black uppercase tracking-widest">
                                                {showArchived ? "No archived items found" : "No active inventory items"}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </main>

                {/* MODAL (ADD/EDIT) remains the same as before */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
                        <div className="bg-white w-full max-w-lg rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                            {/* ... (Same Modal Content) ... */}
                        </div>
                    </div>
                )}
            </div>
        </PageTransition>
    );
}