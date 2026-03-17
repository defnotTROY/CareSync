// src/components/Navbar.jsx
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom'; // 1. Import Link

export default function Navbar() {
    return (
        <nav className="flex items-center justify-between px-6 py-4 lg:px-20 bg-white border-b border-slate-100">
            {/* Logo - Clicking this takes you back home */}
            <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">C</span>
                </div>
                <span className="font-bold text-xl tracking-tight text-slate-900">CareSync</span>
            </Link>

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
                <a href="#" className="hover:text-black hover:underline transition-all">Services</a>
                <a href="#" className="hover:text-black hover:underline transition-all">Live Queue</a>
                <a href="#" className="hover:text-black hover:underline transition-all">About Us</a>
                <a href="#" className="hover:text-black hover:underline transition-all">Contact</a>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3">
                {/* 2. Change the Login button to a Link */}
                <Link
                    to="/login"
                    className="px-5 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors text-center"
                >
                    Login
                </Link>

                <button className="px-5 py-2 text-sm font-bold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all shadow-sm">
                    Book Now
                </button>
            </div>
        </nav>
    );
}