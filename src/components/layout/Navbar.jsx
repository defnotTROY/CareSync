import { Link } from 'react-router-dom';

export default function Navbar() {
    return (
        <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 lg:px-20 bg-white/90 backdrop-blur-md border-b border-slate-100">

            <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
                {/* The Icon Container */}
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center overflow-hidden">
                    <img
                        src="/mjylogo.png"
                        alt="MJY 88 Logo"
                        className="w-5 h-5 object-contain"
                    />
                </div>

                {/* The Brand Name */}
                <span className="font-bold text-xl tracking-tight text-slate-900">CareSync</span>
            </Link>

            <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
                {/* Note: if you are on the Login page, these # links won't work unless you use "/#about" */}
                <a href="/#specializations" className="hover:text-black hover:underline transition-all">Services</a>
                <a href="/#live-queue" className="hover:text-black hover:underline transition-all">Live Queue</a>
                <a href="/#about" className="hover:text-black hover:underline transition-all">About Us</a>
                <a href="/#footer" className="hover:text-black hover:underline transition-all">Contact</a>
            </div>

            <div className="flex items-center gap-3">


                {/* Connected to /signup */}
                <Link
                    to="/login"
                    className="px-5 py-2 text-sm font-bold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all shadow-sm"
                >
                    Book Now
                </Link>
            </div>
        </nav>
    );
}