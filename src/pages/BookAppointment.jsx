import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, CalendarPlus, ClipboardList, Settings,
    LogOut, ShieldCheck, User, ChevronLeft, ChevronRight, Check, Clock, Printer, Download, X
} from 'lucide-react';
import PageTransition from "../components/layout/PageTransition.jsx";

export default function BookAppointment() {
    const location = useLocation();

    const [currentStep, setCurrentStep] = useState(1);
    const [purpose, setPurpose] = useState('Student');
    const [selectedDate, setSelectedDate] = useState(18);
    const [selectedTime, setSelectedTime] = useState('08:00 AM');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [showQR, setShowQR] = useState(false); // Controls the QR Modal

    const [monthIndex, setMonthIndex] = useState(2);
    const currentYear = 2026;
    const today = new Date(2026, 2, 18);

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const daysInMonth = new Date(currentYear, monthIndex + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, monthIndex, 1).getDay();

    const isDateDisabled = (day) => {
        const checkDate = new Date(currentYear, monthIndex, day);
        const dayOfWeek = checkDate.getDay();
        const isPast = checkDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        return isPast || isWeekend;
    };

    const generateTimeSlots = () => {
        const slots = [];
        let hour = 8;
        let minutes = 0;
        while (hour < 15 || (hour === 15 && minutes === 0)) {
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour > 12 ? hour - 12 : hour;
            const timeString = `${displayHour.toString().padStart(2, '0')}:${minutes === 0 ? '00' : '30'} ${ampm}`;
            slots.push(timeString);
            if (minutes === 30) { hour++; minutes = 0; } else { minutes = 30; }
        }
        return slots;
    };

    const timeSlots = generateTimeSlots();
    const totalDue = 600;

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { name: 'Book Appointment', icon: CalendarPlus, path: '/book' },
        { name: 'My Appointments', icon: ClipboardList, path: '/appointments' },
    ];

    const paymentOptions = [
        {
            id: 'gcash',
            name: 'GCash',
            img: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/GCash_logo.svg',
            qr: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=GCASH_PAYMENT_MJY88'
        },
        {
            id: 'maya',
            name: 'Maya',
            img: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Maya_logo.7ca0979f.png',
            qr: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=MAYA_PAYMENT_MJY88'
        }
    ];

    const selectedPaymentData = paymentOptions.find(o => o.id === paymentMethod);

    return (
        <PageTransition>
            <div className="flex min-h-screen bg-white text-slate-900 font-sans">

                {/* QR MODAL OVERLAY */}
                {showQR && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowQR(false)} />
                        <div className="relative bg-white w-full max-w-sm rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300 text-center space-y-6 border-2 border-black">
                            <button onClick={() => setShowQR(false)} className="absolute right-6 top-6 text-slate-400 hover:text-black"><X size={24} /></button>

                            <img src={selectedPaymentData?.img} alt="logo" className="h-8 mx-auto grayscale" />

                            <div className="space-y-2">
                                <h3 className="text-xl font-black uppercase tracking-tight">Scan to Pay</h3>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Total Amount: ₱{totalDue}.00</p>
                            </div>

                            <div className="bg-slate-50 p-6 rounded-3xl border-2 border-dashed border-slate-200">
                                <img src={selectedPaymentData?.qr} alt="QR Code" className="w-48 h-48 mx-auto mix-blend-multiply" />
                            </div>

                            <p className="text-[10px] text-slate-400 font-medium px-4">
                                Open your {selectedPaymentData?.name} app and scan the code above to complete your medical fee payment.
                            </p>

                            <button
                                onClick={() => { setShowQR(false); setCurrentStep(4); }}
                                className="w-full py-4 bg-black text-white rounded-2xl font-bold uppercase text-xs tracking-widest hover:bg-slate-800 transition-all shadow-lg"
                            >
                                I've Completed Payment
                            </button>
                        </div>
                    </div>
                )}

                {/* SIDEBAR */}
                <aside className="w-72 bg-black flex flex-col justify-between py-10 px-6 shrink-0 h-screen sticky top-0">
                    <div className="space-y-10">
                        <Link to="/" className="flex items-center gap-3 px-2">
                            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center"><ShieldCheck className="text-white" size={22} /></div>
                            <span className="text-white font-black text-lg uppercase tracking-tight">MJY 88</span>
                        </Link>
                        <nav className="space-y-2">
                            {navItems.map((item) => (
                                <Link key={item.name} to={item.path} className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${location.pathname === item.path ? 'bg-white text-black font-bold' : 'text-slate-400 hover:text-white'}`}>
                                    <item.icon size={20} /> <span className="text-sm">{item.name}</span>
                                </Link>
                            ))}
                        </nav>
                    </div>
                </aside>

                <main className="flex-1 p-16 flex gap-12 overflow-y-auto">
                    <div className="flex-1 space-y-12">
                        {currentStep < 4 && (
                            <>
                                <header className="space-y-2">
                                    <h1 className="text-5xl font-black text-slate-950 uppercase tracking-tighter">Book Appointment</h1>
                                    <p className="text-slate-500 font-medium tracking-tight">Step {currentStep} of 4</p>
                                </header>

                                {/* STEPPER UI */}
                                <div className="flex items-center gap-6">
                                    {['PURPOSE', 'DATE & TIME', 'PAYMENT', 'CONFIRMATION'].map((label, idx) => (
                                        <div key={label} className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${currentStep >= idx + 1 ? 'border-black bg-black text-white' : 'border-slate-200 text-slate-400'}`}>
                                                {currentStep > idx + 1 ? <Check size={14} /> : idx + 1}
                                            </div>
                                            <span className={`text-[10px] font-black tracking-widest ${currentStep >= idx + 1 ? 'text-black' : 'text-slate-400'}`}>{label}</span>
                                            {idx !== 3 && <div className={`w-12 h-[2px] ${currentStep > idx + 1 ? 'bg-black' : 'bg-slate-100'}`} />}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* STEP 1: PURPOSE */}
                        {currentStep === 1 && (
                            <section className="space-y-6 animate-in fade-in duration-500">
                                <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2"><ClipboardList size={20} /> Step 1: Purpose</h3>
                                <div className="grid grid-cols-4 gap-4">
                                    {['Student', 'Non-Professional', 'Professional', 'Conversion'].map((p) => (
                                        <button key={p} onClick={() => setPurpose(p)} className={`p-6 rounded-xl border-2 font-bold text-sm transition-all ${purpose === p ? 'border-black bg-slate-50 shadow-sm' : 'border-slate-100 hover:border-slate-300'}`}>{p}</button>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* STEP 2: DATE & TIME */}
                        {currentStep === 2 && (
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 animate-in slide-in-from-right duration-500">
                                <section className="space-y-6">
                                    <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2"><CalendarPlus size={20} /> Select Date</h3>
                                    <div className="p-8 border-2 border-slate-100 rounded-3xl bg-white shadow-sm">
                                        <div className="flex justify-between items-center mb-8">
                                            <h4 className="font-black text-slate-900 uppercase tracking-tighter">{months[monthIndex]} {currentYear}</h4>
                                            <div className="flex gap-4">
                                                <ChevronLeft size={20} className="cursor-pointer hover:text-emerald-500 transition-colors" onClick={() => setMonthIndex(prev => prev - 1)} />
                                                <ChevronRight size={20} className="cursor-pointer hover:text-emerald-500 transition-colors" onClick={() => setMonthIndex(prev => prev + 1)} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">
                                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => <div key={day}>{day}</div>)}
                                        </div>
                                        <div className="grid grid-cols-7 gap-2 text-center">
                                            {[...Array(firstDayOfMonth)].map((_, i) => <div key={`pad-${i}`} />)}
                                            {[...Array(daysInMonth)].map((_, i) => {
                                                const day = i + 1;
                                                const disabled = isDateDisabled(day);
                                                return (
                                                    <button key={day} disabled={disabled} onClick={() => setSelectedDate(day)} className={`p-2 rounded-lg font-bold text-sm transition-all ${selectedDate === day ? 'bg-black text-white' : disabled ? 'text-slate-200 cursor-not-allowed opacity-50' : 'text-slate-900 hover:bg-slate-50'}`}>{day}</button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </section>
                                <section className="space-y-6">
                                    <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2"><Clock size={20} /> Select Time</h3>
                                    <div className="grid grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">
                                        {timeSlots.map(time => (
                                            <button key={time} onClick={() => setSelectedTime(time)} className={`p-4 border-2 rounded-xl font-bold text-[11px] transition-all ${selectedTime === time ? 'border-black bg-slate-50 shadow-sm' : 'border-slate-100 hover:border-slate-300 text-slate-500'}`}>{time}</button>
                                        ))}
                                    </div>
                                </section>
                            </div>
                        )}

                        {/* STEP 3: PAYMENT */}
                        {currentStep === 3 && (
                            <section className="space-y-8 animate-in slide-in-from-right duration-500">
                                <h3 className="text-2xl font-black uppercase tracking-tight">Step 3: Payment Method</h3>
                                <div className="grid grid-cols-1 gap-4 max-w-md">
                                    {paymentOptions.map((option) => (
                                        <button key={option.id} onClick={() => setPaymentMethod(option.id)} className={`flex items-center justify-between p-6 border-2 rounded-2xl transition-all ${paymentMethod === option.id ? 'border-black bg-slate-50 shadow-md' : 'border-slate-100 hover:border-slate-200'}`}>
                                            <div className="flex items-center gap-4">
                                                <img src={option.img} alt={option.name} className="h-6 w-auto grayscale opacity-70" />
                                                <span className="font-bold text-sm uppercase tracking-wider">{option.name}</span>
                                            </div>
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === option.id ? 'border-black bg-black' : 'border-slate-200'}`}>
                                                {paymentMethod === option.id && <div className="w-2 h-2 bg-white rounded-full" />}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* STEP 4: CONFIRMATION */}
                        {currentStep === 4 && (
                            <section className="flex flex-col items-center justify-center space-y-10 animate-in zoom-in-95 duration-700 py-10">
                                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-inner">
                                    <Check size={48} strokeWidth={3} />
                                </div>
                                <div className="text-center space-y-3">
                                    <h2 className="text-5xl font-black uppercase tracking-tighter">Booking Confirmed</h2>
                                    <p className="text-slate-500 font-medium tracking-tight">Your evaluation is scheduled. See you at the clinic!</p>
                                </div>

                                <div className="w-full max-w-md bg-white border-2 border-black rounded-[2.5rem] p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] space-y-8 overflow-hidden relative">
                                    <ShieldCheck className="absolute -right-10 -bottom-10 text-slate-50 w-64 h-64 -rotate-12" />
                                    <div className="flex justify-between items-center relative z-10">
                                        <div className="space-y-1"><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">ID</p><p className="font-bold text-lg">#MJY-88-29402</p></div>
                                        <div className="text-right"><p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Status</p><p className="font-bold text-lg text-emerald-600 uppercase">Paid</p></div>
                                    </div>
                                    <div className="space-y-6 relative z-10 border-t border-b border-slate-100 py-8">
                                        <div className="grid grid-cols-2 gap-8">
                                            <div><p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Date</p><p className="font-bold text-sm uppercase">{months[monthIndex]} {selectedDate}, {currentYear}</p></div>
                                            <div><p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Time</p><p className="font-bold text-sm">{selectedTime}</p></div>
                                        </div>
                                        <div><p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Purpose</p><p className="font-bold text-sm uppercase">{purpose} Medical</p></div>
                                    </div>
                                    <div className="flex justify-center gap-4 relative z-10">
                                        <button className="flex-1 py-4 bg-black text-white rounded-2xl font-bold uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all"><Download size={16} /> Download</button>
                                        <button className="flex-1 py-4 border-2 border-slate-100 rounded-2xl font-bold uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50 transition-all"><Printer size={16} /> Print</button>
                                    </div>
                                </div>
                                <Link to="/dashboard" className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] hover:text-black transition-colors pt-4 flex items-center gap-2">
                                    <ChevronLeft size={14} /> Back to Dashboard
                                </Link>
                            </section>
                        )}

                        {/* FOOTER ACTIONS */}
                        {currentStep < 4 && (
                            <div className="flex justify-between items-center pt-8 border-t border-slate-100">
                                <button onClick={() => setCurrentStep(prev => prev - 1)} className={`text-slate-400 font-bold uppercase text-xs tracking-widest flex items-center gap-2 ${currentStep === 1 && 'invisible'}`}><ChevronLeft size={16} /> Back</button>
                                <div className="flex gap-4">
                                    {currentStep < 3 ? (
                                        <button onClick={() => setCurrentStep(prev => prev + 1)} className="px-10 py-4 bg-black text-white rounded-xl font-bold uppercase text-xs tracking-widest flex items-center gap-3 shadow-lg">Next <ChevronRight size={18} /></button>
                                    ) : (
                                        <button onClick={() => setShowQR(true)} disabled={!paymentMethod} className="px-10 py-4 bg-emerald-500 text-white rounded-xl font-bold uppercase text-xs tracking-widest flex items-center gap-3 disabled:opacity-50 shadow-lg shadow-emerald-100">Show QR & Pay ₱{totalDue}.00</button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* SUMMARY SIDEBAR */}
                    {currentStep < 4 && (
                        <aside className="w-80 space-y-8 h-fit sticky top-16">
                            <div className="p-8 border-2 border-slate-50 bg-slate-50/50 rounded-3xl space-y-6">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Summary</h4>
                                <div className="space-y-4">
                                    <div className="p-4 bg-white rounded-2xl border border-slate-100">
                                        <p className="text-[9px] font-black uppercase text-emerald-500 mb-1">Purpose</p>
                                        <p className="font-bold text-sm text-slate-900 leading-none">{purpose} Medical</p>
                                    </div>
                                    <div className="p-4 bg-white rounded-2xl border border-slate-100">
                                        <p className="text-[9px] font-black uppercase text-emerald-500 mb-1">Schedule</p>
                                        <p className="font-bold text-sm text-slate-900 leading-none">{months[monthIndex]} {selectedDate || '--'}, {currentYear}</p>
                                        <p className="text-[10px] text-slate-400 mt-1">{selectedTime}</p>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                                    <p className="text-sm font-black uppercase tracking-tight">Total</p>
                                    <p className="text-2xl font-black">₱{totalDue}.00</p>
                                </div>
                            </div>
                        </aside>
                    )}
                </main>
            </div>
        </PageTransition>
    );
}