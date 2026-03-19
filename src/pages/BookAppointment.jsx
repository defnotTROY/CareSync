import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, CalendarPlus, ClipboardList, Settings,
    LogOut, ShieldCheck, User, ChevronLeft, ChevronRight, Check, Clock, Printer, Download, X
} from 'lucide-react';
import PageTransition from "../components/layout/PageTransition.jsx";
import '../styles/client-portal.css';
import './BookAppointment.css';

export default function BookAppointment() {
    const location = useLocation();

    const today = new Date();

    const [currentStep, setCurrentStep] = useState(1);
    const [purpose, setPurpose] = useState('Student');
    const [selectedDate, setSelectedDate] = useState(today.getDate());
    const [selectedTime, setSelectedTime] = useState('08:00 AM');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [monthIndex, setMonthIndex] = useState(today.getMonth());

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
        },
        {
            id: 'cash',
            name: 'Cash / Clinic',
            img: 'https://www.svgrepo.com/show/475631/money-cash.svg'
        }
    ];

    const selectedPaymentData = paymentOptions.find(o => o.id === paymentMethod);

    return (
        <PageTransition>
            <div className="client-layout">

                {/* SIDEBAR */}
                <aside className="client-sidebar">
                    <div className="space-y-10">
                        <Link to="/" className="flex items-center gap-3 px-2 group">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 overflow-hidden shrink-0">
                                <img
                                    src="/mjylogo.png"
                                    alt="M"
                                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                />
                            </div>

                            <div className="flex flex-col text-white font-black uppercase tracking-tight leading-none">
                                <span className="text-lg tracking-tighter">CareSync</span>
                                <span className="text-slate-500 text-[9px] tracking-[0.2em] mt-1 font-black">
                                    Client Portal
                                </span>
                            </div>
                        </Link>

                        <nav className="sidebar-nav">
                            {navItems.map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.path}
                                        className={`sidebar-nav-link ${isActive ? 'sidebar-nav-link--active' : ''}`}
                                    >
                                        <item.icon size={20} className={isActive ? 'sidebar-nav-icon--active' : 'sidebar-nav-icon'} />
                                        <span className="sidebar-nav-label">{item.name}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="sidebar-bottom">
                        <Link to="/settings" className="sidebar-settings-link">
                            <Settings size={20} />
                            <span className="text-sm font-medium">Settings</span>
                        </Link>

                        <div className="sidebar-user-section">
                            <div className="flex items-center gap-3">
                                <div className="sidebar-avatar">
                                    <User className="text-slate-400" size={20} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="sidebar-user-name">Juan Dela Cruz</span>
                                    <span className="sidebar-user-role">Patient Account</span>
                                </div>
                            </div>
                            <Link to="/login" className="sidebar-logout-btn inline-flex items-center justify-center transition-all hover:text-red-400">
                                <LogOut size={18} />
                            </Link>
                        </div>
                    </div>
                </aside>

                <main className="main-content-split">
                    <div className="flex-1 space-y-12">
                        {currentStep < 4 && (
                            <>
                                <header className="book-header">
                                    <h1 className="page-title">Book an Appointment</h1>
                                    <p className="book-step-text">Step {currentStep} of 4</p>
                                </header>

                                {/* STEPPER UI */}
                                <div className="stepper">
                                    {['PURPOSE', 'DATE & TIME', 'PAYMENT METHOD', 'CONFIRMATION'].map((label, idx) => (
                                        <div key={label} className="flex items-center gap-3">
                                            <div className={`stepper-circle ${currentStep >= idx + 1 ? 'stepper-circle--active' : 'stepper-circle--inactive'}`}>
                                                {currentStep > idx + 1 ? <Check size={14} /> : idx + 1}
                                            </div>
                                            <span className={`stepper-label ${currentStep >= idx + 1 ? 'text-black' : 'text-slate-400'}`}>{label}</span>
                                            {idx !== 3 && <div className={`stepper-connector ${currentStep > idx + 1 ? 'bg-black' : 'bg-slate-100'}`} />}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* STEP 1: PURPOSE */}
                        {currentStep === 1 && (
                            <section className="step-animate-fade">
                                <h3 className="section-title"><ClipboardList size={20} /> Step 1: Purpose</h3>
                                <div className="purpose-grid">
                                    {['Student', 'Non-Professional', 'Professional', 'Conversion'].map((p) => (
                                        <button key={p} onClick={() => setPurpose(p)} className={`purpose-card ${purpose === p ? 'purpose-card--selected' : ''}`}>{p}</button>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* STEP 2: DATE & TIME */}
                        {currentStep === 2 && (
                            <div className="date-time-grid">
                                <section className="space-y-6">
                                    <h3 className="section-title"><CalendarPlus size={20} /> Select Date</h3>
                                    <div className="calendar-container">
                                        <div className="calendar-nav">
                                            <h4 className="calendar-header">{months[monthIndex]} {currentYear}</h4>
                                            <div className="flex gap-4">
                                                <ChevronLeft size={20} className="calendar-arrow" onClick={() => setMonthIndex(prev => prev - 1)} />
                                                <ChevronRight size={20} className="calendar-arrow" onClick={() => setMonthIndex(prev => prev + 1)} />
                                            </div>
                                        </div>
                                        <div className="calendar-day-label">
                                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => <div key={day}>{day}</div>)}
                                        </div>
                                        <div className="calendar-grid">
                                            {[...Array(firstDayOfMonth)].map((_, i) => <div key={`pad-${i}`} />)}
                                            {[...Array(daysInMonth)].map((_, i) => {
                                                const day = i + 1;
                                                const disabled = isDateDisabled(day);
                                                return (
                                                    <button key={day} disabled={disabled} onClick={() => setSelectedDate(day)} className={`calendar-day ${selectedDate === day ? 'calendar-day--selected' : disabled ? 'calendar-day--disabled' : ''}`}>{day}</button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </section>
                                <section className="space-y-6">
                                    <h3 className="section-title"><Clock size={20} /> Select Time</h3>
                                    <div className="time-slots-grid">
                                        {timeSlots.map(time => (
                                            <button key={time} onClick={() => setSelectedTime(time)} className={`time-slot ${selectedTime === time ? 'time-slot--selected' : ''}`}>{time}</button>
                                        ))}
                                    </div>
                                </section>
                            </div>
                        )}

                        {/* STEP 3: PAYMENT */}
                        {currentStep === 3 && (
                            <section className="step-animate-slide">
                                <h3 className="section-title-lg">Step 3: Select Payment Method</h3>
                                <div className="payment-grid">
                                    {paymentOptions.map((option) => (
                                        <button key={option.id} onClick={() => setPaymentMethod(option.id)} className={`payment-option ${paymentMethod === option.id ? 'payment-option--selected' : ''}`}>
                                            <div className="payment-option-info">
                                                <img src={option.img} alt={option.name} className="payment-option-img" />
                                                <span className="payment-option-name">{option.name}</span>
                                            </div>
                                            <div className={`payment-radio ${paymentMethod === option.id ? 'payment-radio--selected' : ''}`}>
                                                {paymentMethod === option.id && <div className="payment-radio-dot" />}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* STEP 4: CONFIRMATION */}
                        {currentStep === 4 && (
                            <section className="confirm-section">
                                <div className="confirm-icon">
                                    <Check size={48} strokeWidth={3} />
                                </div>
                                <div className="text-center space-y-3">
                                    <h2 className="confirm-heading">Booking Confirmed</h2>
                                    <p className="confirm-subtext">Your evaluation is scheduled. See you at the clinic!</p>
                                </div>

                                <div className="card-confirmation">
                                    <ShieldCheck className="receipt-watermark" />
                                    <div className="receipt-header">
                                        <div className="space-y-1"><p className="receipt-id-label">ID</p><p className="receipt-id-value">#MJY-88-29402</p></div>
                                        <div className="text-right"><p className="receipt-payment-label">Payment Method</p><p className="receipt-payment-value">{selectedPaymentData?.name || 'Pending'}</p></div>
                                    </div>
                                    <div className="receipt-details">
                                        <div className="grid grid-cols-2 gap-8">
                                            <div><p className="confirm-label">Date</p><p className="confirm-value">{months[monthIndex]} {selectedDate}, {currentYear}</p></div>
                                            <div><p className="confirm-label">Time</p><p className="confirm-value">{selectedTime}</p></div>
                                        </div>
                                        <div><p className="confirm-label">Purpose</p><p className="confirm-value">{purpose} Medical</p></div>
                                    </div>
                                    <div className="receipt-actions">
                                        <button className="confirm-btn-download"><Download size={16} /> Download</button>
                                        <button className="confirm-btn-print"><Printer size={16} /> Print</button>
                                    </div>
                                </div>
                                <Link to="/dashboard" className="back-to-dashboard">
                                    <ChevronLeft size={14} /> Back to Dashboard
                                </Link>
                            </section>
                        )}

                        {/* FOOTER ACTIONS */}
                        {currentStep < 4 && (
                            <div className="footer-actions">
                                <button onClick={() => setCurrentStep(prev => prev - 1)} className={`back-link ${currentStep === 1 && 'invisible'}`}><ChevronLeft size={16} /> Back</button>
                                <div className="flex gap-4">
                                    {currentStep < 3 ? (
                                        <button onClick={() => setCurrentStep(prev => prev + 1)} className="btn-primary">Next <ChevronRight size={18} /></button>
                                    ) : (
                                        <button
                                            onClick={() => setCurrentStep(4)}
                                            disabled={!paymentMethod}
                                            className="btn-confirm"
                                        >
                                            Confirm and Continue
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* SUMMARY SIDEBAR */}
                    {currentStep < 4 && (
                        <aside className="summary-sidebar">
                            <div className="summary-card">
                                <h4 className="form-label">Summary</h4>
                                <div className="space-y-4">
                                    <div className="summary-item">
                                        <p className="summary-item-label">Purpose</p>
                                        <p className="summary-item-value">{purpose} Medical</p>
                                    </div>
                                    <div className="summary-item">
                                        <p className="summary-item-label">Schedule</p>
                                        <p className="summary-item-value">{months[monthIndex]} {selectedDate || '--'}, {currentYear}</p>
                                        <p className="text-[10px] text-slate-400 mt-1">{selectedTime}</p>
                                    </div>
                                </div>
                                <div className="summary-total-row">
                                    <p className="summary-total-label">Total</p>
                                    <p className="summary-total-value">₱{totalDue}.00</p>
                                </div>
                            </div>
                        </aside>
                    )}
                </main>
            </div>
        </PageTransition>
    );
}