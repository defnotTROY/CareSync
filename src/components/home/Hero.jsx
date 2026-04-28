// src/components/Hero.jsx
import { ArrowRight } from 'lucide-react';

export default function Hero() {
    return (
        // Changed bg color to match the monochrome look
        <section className="relative px-6 py-12 lg:px-20 lg:py-20 flex flex-col lg:flex-row items-center gap-12 bg-white">
            {/* Left Content */}
            <div className="flex-1 space-y-6">
                {/* Replaced bg-blue-50 with bg-slate-100 */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold tracking-wider uppercase">
                    {/* Changed dot color from sky-500 to black */}
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-900"></span>
                    </span>
                    Trusted Healthcare Excellence
                </div>

                <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-tight">
                    Your Partner in <br />
                    {/* Stripped sky-500 and sky-200. Replaced with black and underline decoration */}
                    <span className="text-black underline decoration-slate-300">Road Readiness</span>
                </h1>

                <p className="text-lg text-slate-600 max-w-lg leading-relaxed">
                    At MJY 88 Medical Clinic, we provide top-tier medical services to ensure
                    you are healthy and compliant for all your professional needs.
                </p>

                <div className="flex flex-wrap gap-4">
                    <button className="px-8 py-4 bg-slate-900 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all">
                        Book Appointment <ArrowRight size={18} />
                    </button>
                    <a href="#live-queue" className="px-8 py-4 border-2 border-slate-200 text-slate-900 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center">
                        View Live Queue
                    </a>
                </div>
            </div>

            {/* Right Image (Uses the automatic CSS grayscale filter we defined) */}
            <div className="flex-1 relative">
                <div className="w-full aspect-[4/3] bg-slate-100 rounded-[2rem] overflow-hidden border-8 border-white shadow-2xl">
                    <img
                        src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1000"
                        alt="Clinic Interior"
                        className="w-full h-full object-cover"
                    />
                </div>
                {/* Floating Stat Card (Keep as White/Black) */}
                <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl border border-slate-100">
                    <p className="text-3xl font-bold text-slate-900">15+</p>
                    <p className="text-sm text-slate-500 font-medium">Years of Experience</p>
                </div>
            </div>
        </section>
    )
}