// src/components/Specializations.jsx
import { Eye, Stethoscope, ClipboardCheck } from 'lucide-react';

const specialties = [
    {
        title: "Vision Testing",
        description: "Comprehensive eye examinations for professional license requirements.",
        // Replaced sky-500 with text-slate-900
        icon: <Eye className="w-8 h-8 text-slate-900" />,
    },
    {
        title: "Physical Exam",
        description: "Complete physical assessments to ensure you are fit for duty.",
        icon: <Stethoscope className="w-8 h-8 text-slate-900" />,
    },
    {
        title: "Medical Certificate",
        description: "Quick and official medical certifications for work or licensing.",
        icon: <ClipboardCheck className="w-8 h-8 text-slate-900" />,
    },
];

export default function Specializations() {
    return (
        // Changed BG from bg-slate-50 to plain bg-white or border
        <section className="px-6 py-16 lg:px-20 bg-white border-y border-slate-100">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Our Specializations</h2>
                <p className="text-slate-500 mt-2 max-w-lg mx-auto leading-relaxed">Professional medical services tailored for your needs.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {specialties.map((item, index) => (
                    <div
                        key={index}
                        className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group"
                    >
                        {/* Swapped sky-50/sky-500 hover pattern for a subtle black/white pattern */}
                        <div className="mb-4 p-3 bg-slate-100 inline-block rounded-xl group-hover:bg-black group-hover:text-white transition-colors">
                            <div className="w-8 h-8 flex items-center justify-center group-hover:text-white transition-colors text-black">
                                {item.icon}
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                        <p className="text-slate-600 leading-relaxed text-sm">
                            {item.description}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}