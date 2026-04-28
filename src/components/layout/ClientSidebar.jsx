import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    CalendarPlus,
    ClipboardList,
    Settings,
    LogOut,
    User,
    Loader2,
    X
} from 'lucide-react';
import { supabase } from '../../supabaseClient';

export default function ClientSidebar({ isOpen, onClose }) {
    const location = useLocation();
    const navigate = useNavigate();

    const [userName, setUserName] = useState("User");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUser() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('full_name')
                        .eq('id', user.id)
                        .single();
                    if (profile) setUserName(profile.full_name);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchUser();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { name: 'Book Appointment', icon: CalendarPlus, path: '/book' },
        { name: 'My Appointments', icon: ClipboardList, path: '/appointments' },
    ];

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            <aside className={`
                fixed top-0 left-0 h-screen bg-black flex flex-col justify-between py-10 px-4 md:px-6 shrink-0 z-50
                transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0 w-72' : '-translate-x-full'}
                md:translate-x-0 md:w-20 md:items-center
                lg:w-72 lg:items-stretch lg:px-6
            `}>
                <div className="space-y-10 w-full flex flex-col items-center lg:items-stretch">
                    <div className="flex items-center justify-between w-full px-2">
                        <Link to="/" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg overflow-hidden shrink-0">
                                <img src="/mjylogo.png" alt="M" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex flex-col text-white font-black uppercase tracking-tight leading-none md:hidden lg:flex">
                                <span className="text-lg tracking-tighter">CareSync</span>
                                <span className="text-slate-500 text-[9px] tracking-[0.2em] mt-1 font-black">Client Portal</span>
                            </div>
                        </Link>
                        {/* Close button for mobile */}
                        <button onClick={onClose} className="text-white md:hidden p-2">
                            <X size={24} />
                        </button>
                    </div>

                    <nav className="sidebar-nav w-full space-y-2">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link 
                                    key={item.name} 
                                    to={item.path} 
                                    className={`
                                        flex items-center gap-4 py-3.5 rounded-xl transition-all w-full
                                        ${isActive ? 'bg-white text-black font-bold shadow-lg shadow-white/5' : 'text-slate-400 hover:text-white hover:bg-white/5'}
                                        px-4 justify-start
                                        md:justify-center md:px-0 lg:justify-start lg:px-4
                                    `}
                                    title={item.name}
                                >
                                    <item.icon size={20} className={isActive ? 'text-black' : 'text-slate-400'} />
                                    <span className="text-sm tracking-tight md:hidden lg:block whitespace-nowrap">
                                        {item.name}
                                    </span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="sidebar-bottom space-y-6 w-full flex flex-col items-center lg:items-stretch">
                    <Link to="/settings" className="flex items-center gap-4 px-4 py-3 text-slate-400 hover:text-white transition-colors w-full justify-start md:justify-center md:px-0 lg:justify-start lg:px-4" title="Settings">
                        <Settings size={20} /> 
                        <span className="text-sm font-medium md:hidden lg:block">Settings</span>
                    </Link>
                    
                    <div className="pt-6 border-t border-white/10 flex items-center justify-between w-full flex-col lg:flex-row gap-4 lg:gap-0 px-2 lg:px-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-800 flex items-center justify-center rounded-full overflow-hidden border border-white/10 shrink-0">
                                {loading ? <Loader2 size={16} className="animate-spin text-slate-500" /> : <User className="text-slate-400" size={20} />}
                            </div>
                            <div className="flex-col md:hidden lg:flex">
                                <span className="text-white text-sm font-bold truncate max-w-[100px]">
                                    {loading ? "..." : userName}
                                </span>
                                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-tighter">
                                    Client Account
                                </span>
                            </div>
                        </div>
                        <button onClick={handleLogout} className="text-slate-500 hover:text-red-400 transition-colors p-2" title="Logout">
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
