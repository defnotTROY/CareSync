import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Users, ClipboardList, FileText,
    Settings, LogOut, Bell, User, Mail, Phone,
    Calendar, Clock, MapPin, Save, X
} from 'lucide-react';
import PageTransition from "../../components/layout/PageTransition.jsx";
import { useAuth } from '../../lib/AuthContext.jsx';
import { supabase } from '../../lib/supabase.js';

export default function DoctorSettings() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/doctor/dashboard' },
        { name: 'Client Queue', icon: Users, path: '/doctor/queue' },
        { name: 'Consultation', icon: ClipboardList, path: '/doctor/consultation' },
        { name: 'Client Record', icon: FileText, path: '/doctor/records' },
    ];

    const [formData, setFormData] = useState({
        full_name: '',
        email: user?.email || '',
        phone: '',
        specialization: '',
        consultation_fee: '',
        availability: {
            monday: true,
            tuesday: true,
            wednesday: true,
            thursday: true,
            friday: true,
            saturday: false,
            sunday: false,
        },
        start_time: '09:00',
        end_time: '17:00',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleToggleDay = (day) => {
        setFormData((prev) => ({
            ...prev,
            availability: {
                ...prev.availability,
                [day]: !prev.availability[day],
            },
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    full_name: formData.full_name,
                    phone: formData.phone,
                    specialization: formData.specialization,
                    consultation_fee: parseFloat(formData.consultation_fee) || 0,
                    availability: formData.availability,
                    start_time: formData.start_time,
                    end_time: formData.end_time,
                    updated_at: new Date().toISOString(),
                });

            if (error) throw error;

            alert('Settings saved successfully!');
            navigate('/doctor/dashboard');
        } catch (err) {
            console.error('Error saving settings:', err.message);
            alert('Error saving settings: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <PageTransition>
            <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
                {/* SIDEBAR */}
                <aside className="w-72 bg-black flex flex-col justify-between py-10 px-6 shrink-0 h-screen sticky top-0">
                    <div className="space-y-10">
                        <div className="flex items-center gap-3 px-2">
                            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center font-bold text-white text-xl">M</div>
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

                    <div className="pt-6 border-t border-white/10 space-y-2 px-2">
                        <Link to="/doctor/settings" className="flex items-center gap-4 px-4 py-3 rounded-xl text-white bg-white/10 font-bold">
                            <Settings size={20} />
                            <span className="text-sm">Settings</span>
                        </Link>
                        <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-slate-800 rounded-full flex items-center justify-center text-[10px] text-white font-bold">JD</div>
                                <div className="flex flex-col">
                                    <span className="text-white text-[11px] font-bold uppercase leading-none">Juan D.</span>
                                    <span className="text-slate-500 text-[8px] font-bold uppercase tracking-widest mt-1">Doctor Admin</span>
                                </div>
                            </div>
                            <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-red-400 transition-all">
                                <LogOut size={18} />
                            </button>
                        </div>
                    </div>
                </aside>

                {/* MAIN CONTENT */}
                <main className="flex-1 p-12 space-y-10 overflow-y-auto">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <h1 className="text-4xl font-black text-slate-950 uppercase tracking-tighter leading-none">Settings</h1>
                            <p className="text-slate-500 font-medium text-xs uppercase tracking-widest">Manage your profile and availability</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
                        {/* Profile Section */}
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                            <h2 className="text-xl font-black uppercase tracking-tight mb-6">Profile Information</h2>
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                        <input
                                            type="text"
                                            name="full_name"
                                            value={formData.full_name}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-black focus:ring-2 focus:ring-black/5 outline-none transition-all"
                                            placeholder="Dr. Juan Dela Cruz"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            disabled
                                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Phone</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-black focus:ring-2 focus:ring-black/5 outline-none transition-all"
                                            placeholder="+63 9XX XXX XXXX"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Specialization</label>
                                    <select
                                        name="specialization"
                                        value={formData.specialization}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-black focus:ring-2 focus:ring-black/5 outline-none transition-all bg-white"
                                    >
                                        <option value="">Select specialization</option>
                                        <option value="General Practitioner">General Practitioner</option>
                                        <option value="Pediatrician">Pediatrician</option>
                                        <option value="Cardiologist">Cardiologist</option>
                                        <option value="Dermatologist">Dermatologist</option>
                                        <option value="Orthopedic Surgeon">Orthopedic Surgeon</option>
                                        <option value="Neurologist">Neurologist</option>
                                        <option value="OB-GYN">OB-GYN</option>
                                        <option value="Dentist">Dentist</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Consultation Fee (₱)</label>
                                    <input
                                        type="number"
                                        name="consultation_fee"
                                        value={formData.consultation_fee}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-black focus:ring-2 focus:ring-black/5 outline-none transition-all"
                                        placeholder="1500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Availability Section */}
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                            <h2 className="text-xl font-black uppercase tracking-tight mb-6">Availability</h2>

                            <div className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Working Days</label>
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(formData.availability).map(([day, enabled]) => (
                                            <button
                                                key={day}
                                                type="button"
                                                onClick={() => handleToggleDay(day)}
                                                className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${
                                                    enabled
                                                        ? 'bg-black text-white'
                                                        : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                                }`}
                                            >
                                                {day.slice(0, 3)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Start Time</label>
                                        <div className="relative">
                                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                            <input
                                                type="time"
                                                name="start_time"
                                                value={formData.start_time}
                                                onChange={handleChange}
                                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-black focus:ring-2 focus:ring-black/5 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">End Time</label>
                                        <div className="relative">
                                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                            <input
                                                type="time"
                                                name="end_time"
                                                value={formData.end_time}
                                                onChange={handleChange}
                                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-black focus:ring-2 focus:ring-black/5 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 bg-black text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <Save size={20} />
                                {isLoading ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/doctor/dashboard')}
                                className="px-8 py-4 rounded-xl font-bold uppercase tracking-widest border-2 border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-500 transition-all flex items-center justify-center gap-2"
                            >
                                <X size={20} />
                                Cancel
                            </button>
                        </div>
                    </form>
                </main>
            </div>
        </PageTransition>
    );
}
