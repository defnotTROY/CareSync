import { Search, Bell, Menu } from 'lucide-react';

export default function AdminHeader({ onMenuClick, title }) {
    return (
        <header className="top-bar p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-30">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="md:hidden p-2 text-slate-400 hover:text-black hover:bg-slate-50 rounded-lg transition-colors"
                    aria-label="Open menu"
                >
                    <Menu size={24} />
                </button>

                {title && (
                    <h2 className="top-bar-title font-black uppercase italic tracking-tighter text-slate-950 md:block hidden lg:block">
                        {title}
                    </h2>
                )}
            </div>

            <div className="flex items-center gap-4">
                <div className="admin-topbar-search relative hidden sm:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search system data..."
                        className="search-input pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-1 focus:ring-black outline-none w-48 md:w-64 font-bold"
                    />
                </div>

                <button className="btn-icon p-2 hover:bg-slate-100 rounded-full transition-colors relative">
                    <Bell size={20} className="text-slate-600" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-black rounded-full border border-white shadow-sm"></span>
                </button>
            </div>
        </header>
    );
}