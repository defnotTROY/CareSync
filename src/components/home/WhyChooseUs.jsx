import { ShieldCheck, Zap, Clock } from 'lucide-react';

export default function WhyChooseUs() {
    const features = [
        {
            title: "LTO-Accredited Excellence",
            desc: "We ensure all medical evaluations strictly follow LTO standards for a guaranteed valid certification.",
            icon: <ShieldCheck className="text-white" size={20} />
        },
        {
            title: "Modern & Efficient Process",
            desc: "Utilizing the latest LTO-integrated systems for real-time data encoding and faster transactions.",
            icon: <Zap className="text-white" size={20} />
        },
        {
            title: "Live Queue Management",
            desc: "Save time with our real-time tracking system. No more waiting aimlessly in clinics.",
            icon: <Clock className="text-white" size={20} />
        }
    ];

    return (
        /* Added id="about" for the link and scroll-mt-20 for spacing */
        <section id="about" className="px-6 py-20 lg:px-20 bg-white scroll-mt-20">
            <div className="flex flex-col lg:flex-row gap-16 items-center">

                {/* Left Side: Text and Features */}
                <div className="flex-1 space-y-8">
                    <div>
                        <h2 className="text-sm font-bold tracking-widest text-slate-400 uppercase">Why Choose</h2>
                        <h3 className="text-4xl font-black text-slate-900 mt-1">MJY 88 MEDICAL CLINIC</h3>
                    </div>

                    <div className="space-y-8">
                        {features.map((f, i) => (
                            <div key={i} className="flex gap-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-black rounded-full flex items-center justify-center">
                                    {f.icon}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 uppercase text-sm tracking-tight">{f.title}</h4>
                                    <p className="text-slate-500 text-sm mt-1 leading-relaxed max-w-md">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Side: The Image/Stat Grid */}
                <div className="flex-1 grid grid-cols-2 gap-4">
                    <div className="space-y-4 mt-8">
                        <div className="bg-slate-200 aspect-square rounded-2xl overflow-hidden relative">
                            <img src="https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=500" className="object-cover w-full h-full opacity-80" alt="Doctor" />
                        </div>
                        <div className="bg-black p-8 rounded-2xl text-white">
                            <p className="text-3xl font-bold">15+</p>
                            <p className="text-xs uppercase tracking-widest opacity-60">Years Experience</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="bg-slate-900 p-8 rounded-2xl text-white">
                            <p className="text-3xl font-bold">20k</p>
                            <p className="text-xs uppercase tracking-widest opacity-60">Happy Patients</p>
                        </div>
                        <div className="bg-slate-200 aspect-[3/4] rounded-2xl overflow-hidden relative">
                            <img src="https://images.unsplash.com/photo-1581594658210-c5c85a9d6da1?auto=format&fit=crop&q=80&w=500" className="object-cover w-full h-full" alt="Medical Office" />
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}