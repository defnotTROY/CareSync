import { ShieldCheck } from 'lucide-react';

export default function Footer() {
    return (
        <footer id="footer" className="px-6 py-12 lg:px-20 bg-white">
            {/* 1. Black CTA Box */}
            <div className="w-full bg-black rounded-[2.5rem] p-10 lg:p-20 text-center relative overflow-hidden mb-20">
                {/* Subtle Background Pattern/Icon */}
                <ShieldCheck className="absolute right-[-20px] bottom-[-20px] text-white/5 w-64 h-64 rotate-12" />

                <div className="relative z-10 space-y-6">
                    <h2 className="text-3xl lg:text-5xl font-extrabold text-white tracking-tight">
                        READY TO GET BACK ON THE ROAD?
                    </h2>
                    <p className="text-slate-400 max-w-2xl mx-auto text-sm lg:text-base">
                        Join thousands of drivers who trust MJY 88 Medical Services for their licensing requirements.
                        Get your medical certificate fast and hassle-free.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 pt-4">
                        <button className="px-8 py-4 bg-white text-black rounded-xl font-bold hover:bg-slate-100 transition-all">
                            Book an Appointment Now
                        </button>
                        <button className="px-8 py-4 border border-slate-700 text-white rounded-xl font-bold hover:bg-slate-900 transition-all">
                            Contact Support
                        </button>
                    </div>
                </div>
            </div>

            {/* 2. Actual Footer Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-12 border-b border-slate-100">
                <div className="space-y-4">
                    <h4 className="font-black text-xl tracking-tighter">MJY 88</h4>
                    <p className="text-slate-500 text-xs leading-relaxed uppercase font-semibold">
                        LTO-Accredited Medical Clinic providing fast and reliable medical certifications
                        for student permits and driver's licenses. Committed to road safety and efficient service.
                    </p>
                </div>

                <div className="space-y-4">
                    <h4 className="font-bold text-xs uppercase tracking-widest text-slate-400">Services</h4>
                    <ul className="text-sm text-slate-600 space-y-2 font-medium">
                        <li>Medical Evaluation</li>
                        <li>Visual Acuity & Color Blindness Test</li>
                        <li>LTO IT System Encoding</li>
                        <li>Physical Examination</li>
                    </ul>
                </div>

                <div className="space-y-4">
                    <h4 className="font-bold text-xs uppercase tracking-widest text-slate-400">Business</h4>
                    <ul className="text-sm text-slate-600 space-y-2 font-medium">
                        <li className="flex justify-between"><span>Mon - Fri</span> <span>08:00 AM - 3:30 PM</span></li>
                        <li className="flex justify-between text-slate-400"><span>Saturday</span> <span>Closed</span></li>
                        <li className="flex justify-between text-slate-400"><span>Sunday</span> <span>Closed</span></li>
                    </ul>
                </div>

                <div className="space-y-4">
                    <h4 className="font-bold text-xs uppercase tracking-widest text-slate-400">Contact Us</h4>
                    <p className="text-sm text-slate-600 font-medium leading-relaxed">
                        Bldg. 368-A Canal Road, Central Business District,<br />
                        Subic Bay Freeport Zone, 2222
                    </p>
                </div>
            </div>
        </footer>
    );
}