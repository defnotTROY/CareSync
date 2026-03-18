import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Users, BadgeDollarSign, Warehouse,
    Wrench, Settings, LogOut, Bell, Search,
    Plus, Filter, MoreVertical, AlertCircle, PackageCheck, Truck
} from 'lucide-react';
import PageTransition from "../../components/layout/PageTransition.jsx";

export default function Inventory() {
    const location = useLocation();
    const navigate = useNavigate();

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
        { name: 'Staff Management', icon: Users, path: '/admin/staff' },
        { name: 'Revenue', icon: BadgeDollarSign, path: '/admin/revenue' },
        { name: 'Inventory', icon: Warehouse, path: '/admin/inventory' },
        { name: 'Maintenance', icon: Wrench, path: '/admin/maintenance' },
    ];

    const inventoryItems = [
        { id: 'INV-101', name: 'Paracetamol 500mg', category: 'Pharmacy', stock: 1240, status: 'IN STOCK', unit: 'Tabs' },
        { id: 'INV-102', name: 'Nitrile Gloves', category: 'Supplies', stock: 45, status: 'LOW STOCK', unit: 'Boxes' },
        { id: 'INV-103', name: 'Disposable Syringes', category: 'Supplies', stock: 850, status: 'IN STOCK', unit: 'Units' },
        { id: 'INV-104', name: 'Amoxicillin Syrup', category: 'Pharmacy', stock: 12, status: 'CRITICAL', unit: 'Bottles' },
    ];

    return (
        <PageTransition>
            <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">

                {/* SIDEBAR (Standardized) */}
                <aside className="w-72 bg-black flex flex-col justify-between py-10 px-6 shrink-0 h-screen sticky top-0">
                    <div className="space-y-10">
                        <div className="flex items-center gap-3 px-2">
                            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-emerald-500/20">M</div>
                            <div className="flex flex-col text-white font-black uppercase tracking-tight leading-none">
                                <span className="text-lg">CareSync</span>
                                <span className="text-slate-500 text-[10px] tracking-widest mt-1">Admin Portal</span>
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
                        <Link to="/admin/settings" className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${location.pathname === '/admin/settings' ? 'bg-white text-black font-bold shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                            <Settings size={20} className={location.pathname === '/admin/settings' ? 'text-black' : 'text-slate-400'} />
                            <span className="text-sm">Settings</span>
                        </Link>
                        <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-slate-800 rounded-full flex items-center justify-center text-[10px] text-white font-bold">JD</div>
                                <div className="flex flex-col text-white">
                                    <span className="text-[11px] font-bold uppercase leading-none">Juan D.</span>
                                    <span className="text-slate-500 text-[8px] font-bold uppercase tracking-widest mt-1">Super Admin</span>
                                </div>
                            </div>
                            <button onClick={() => navigate('/login')} className="p-2 text-slate-500 hover:text-red-400 transition-all"><LogOut size={18} /></button>
                        </div>
                    </div>
                </aside>

                <main className="flex-1 p-12 space-y-10 overflow-y-auto">
                    {/* HEADER */}
                    <header className="flex justify-between items-center">
                        <div className="space-y-1">
                            <h1 className="text-5xl font-black text-slate-950 uppercase tracking-tighter leading-none">Inventory</h1>
                            <p className="text-slate-500 font-medium uppercase text-[10px] tracking-[0.2em]">Medical Supplies & Equipment Stock</p>
                        </div>
                        <button className="px-8 py-4 bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:bg-emerald-500 transition-all shadow-xl shadow-black/10">
                            <Plus size={18} /> Add New Item
                        </button>
                    </header>

                    {/* QUICK STATS */}
                    <div className="grid grid-cols-3 gap-8">
                        <div className="bg-white p-6 rounded-3xl border-2 border-slate-50 flex items-center gap-6">
                            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center"><PackageCheck size={28} /></div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Well Stocked</p>
                                <p className="text-2xl font-black uppercase">182 Items</p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border-2 border-slate-50 flex items-center gap-6">
                            <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center"><AlertCircle size={28} /></div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Low Stock</p>
                                <p className="text-2xl font-black uppercase">12 Items</p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border-2 border-slate-50 flex items-center gap-6">
                            <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center"><Truck size={28} /></div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending Orders</p>
                                <p className="text-2xl font-black uppercase">5 Shipments</p>
                            </div>
                        </div>
                    </div>

                    {/* TABLE */}
                    <div className="bg-white border-2 border-slate-50 rounded-[2.5rem] shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 border-b border-slate-50">
                                <tr>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Item Detail</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Category</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Stock Level</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Status</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {inventoryItems.map((item) => (
                                    <tr key={item.id} className="group hover:bg-slate-50/30 transition-all">
                                        <td className="px-10 py-8">
                                            <p className="font-black text-slate-950 uppercase tracking-tight">{item.name}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SKU: {item.id}</p>
                                        </td>
                                        <td className="px-10 py-8 font-black uppercase text-xs text-slate-600">{item.category}</td>
                                        <td className="px-10 py-8">
                                            <p className="font-black text-slate-950">{item.stock} {item.unit}</p>
                                        </td>
                                        <td className="px-10 py-8">
                                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${item.status === 'IN STOCK' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                    item.status === 'LOW STOCK' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                                        'bg-red-50 text-red-600 border-red-100'
                                                }`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:text-black transition-all"><MoreVertical size={18} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>
        </PageTransition>
    );
}