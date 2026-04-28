import { useLiveQueue } from '../../hooks/useLiveQueue.js';
import { Loader2, Wallet, Users, Clock } from 'lucide-react';

export default function LiveQueue() {
    const { waitingQueue, servingNow, loading } = useLiveQueue();

    return (
        <section id="live-queue" className="px-6 py-16 lg:px-20 lg:py-24 bg-slate-50">
            <div className="max-w-7xl mx-auto space-y-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold tracking-wider uppercase">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                            </span>
                            Live Updates
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
                            Live Clinic Queue
                        </h2>
                        <p className="text-slate-500 text-lg max-w-2xl">
                            Check our real-time queue to see how many patients are currently waiting. 
                            Information updates automatically.
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200">
                        <Loader2 size={40} className="animate-spin text-emerald-500 mb-4" />
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Syncing Data...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Pending Payment Panel */}
                        <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm">
                            <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
                                <h3 className="flex items-center gap-3 text-lg font-bold text-slate-800">
                                    <Wallet className="text-amber-500" size={24} /> 
                                    Pending Payment
                                </h3>
                                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold">
                                    {waitingQueue.length} Waiting
                                </span>
                            </div>

                            <div className="space-y-4">
                                {waitingQueue.length > 0 ? (
                                    waitingQueue.map((patient) => (
                                        <div key={patient.id} className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center font-bold text-slate-600">
                                                    {patient.profiles?.full_name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-900">{patient.profiles?.full_name}</h4>
                                                    <p className="text-xs text-slate-500 mt-1">{patient.purpose || 'Check-up'}</p>
                                                </div>
                                            </div>
                                            <div className="text-xs font-medium text-slate-400 flex items-center gap-1">
                                                <Clock size={12} /> {patient.appointment_time}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-12 text-center text-slate-400">
                                        <p className="font-medium">No one in line right now</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Hallway Panel */}
                        <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm">
                            <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
                                <h3 className="flex items-center gap-3 text-lg font-bold text-slate-800">
                                    <Users className="text-blue-500" size={24} /> 
                                    Hallway
                                </h3>
                                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold">
                                    {servingNow.length} Waiting
                                </span>
                            </div>

                            <div className="space-y-4">
                                {servingNow.length > 0 ? (
                                    servingNow.map((patient) => {
                                        const inRoom = patient.status === 'ON_DOCTOR' || patient.status === 'IN_PROGRESS';
                                        return (
                                            <div key={patient.id} className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center font-bold text-slate-600">
                                                        {patient.profiles?.full_name?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-900">{patient.profiles?.full_name}</h4>
                                                        <p className="text-xs text-slate-500 mt-1">{patient.purpose || 'Check-up'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${inRoom ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                                                        {inRoom ? 'With Doctor' : 'Waiting'}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="py-12 text-center text-slate-400">
                                        <p className="font-medium">Hallway is clear</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
