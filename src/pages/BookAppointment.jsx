import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, CalendarPlus, ClipboardList, Settings,
    LogOut, ShieldCheck, User, ChevronLeft, ChevronRight, Check, Clock, Printer, Download, Loader2, QrCode, AlertCircle
} from 'lucide-react';
import QRCode from 'qrcode';
import { supabase } from '../supabaseClient';
import { useToast } from '../lib/ToastContext.jsx';
import PageTransition from "../components/layout/PageTransition.jsx";
import ClientLayout from "../components/layout/ClientLayout.jsx";
import '../styles/client-portal.css';
import './BookAppointment.css';

export default function BookAppointment() {
    const location = useLocation();
    const navigate = useNavigate();
    const toast = useToast();
    const today = new Date();

    // Check if we are rescheduling an existing appointment
    const rescheduleData = location.state?.rescheduleData;

    // --- AUTH & PROFILE STATE ---
    const [userName, setUserName] = useState("User");
    const [isUserLoading, setIsUserLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // --- BOOKING STATES ---
    const [currentStep, setCurrentStep] = useState(1);
    const [purpose, setPurpose] = useState('Student');
    const [selectedDate, setSelectedDate] = useState(today.getDate());
    const [selectedTime, setSelectedTime] = useState('08:00 AM');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [monthIndex, setMonthIndex] = useState(today.getMonth());
    const [appointmentId, setAppointmentId] = useState(null);
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState(null);
    const [bookingError, setBookingError] = useState(null);
    const [bookedSlots, setBookedSlots] = useState([]);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);

    // --- PRE-FILL DATA IF RESCHEDULING ---
    useEffect(() => {
        if (rescheduleData) {
            // Remove " Medical" suffix if it exists to match the button labels
            const cleanPurpose = rescheduleData.purpose.replace(' Medical', '');
            setPurpose(cleanPurpose);
            setPaymentMethod(rescheduleData.payment_method);
            // We keep the current date/time as default so the user can pick a NEW one
        }
    }, [rescheduleData]);

    // --- CLEAR BOOKING ERROR ON DATE/TIME CHANGE ---
    useEffect(() => {
        setBookingError(null);
    }, [selectedDate, selectedTime, monthIndex, currentYear]);

    // --- FETCH BOOKED SLOTS FOR SELECTED DATE ---
    useEffect(() => {
        const fetchBookedSlots = async () => {
            setIsLoadingSlots(true);
            try {
                const formattedDate = `${currentYear}-${(monthIndex + 1).toString().padStart(2, '0')}-${selectedDate.toString().padStart(2, '0')}`;
                const { data, error } = await supabase
                    .from('appointments')
                    .select('appointment_time')
                    .eq('appointment_date', formattedDate)
                    .not('status', 'in', '("CANCELLED","EXPIRED")');

                if (error) throw error;
                setBookedSlots(data ? data.map(a => a.appointment_time) : []);
            } catch (err) {
                console.error('Error fetching booked slots:', err.message);
                setBookedSlots([]);
            } finally {
                setIsLoadingSlots(false);
            }
        };

        fetchBookedSlots();
    }, [selectedDate, monthIndex, currentYear]);

    // --- FETCH USER PROFILE ---
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    navigate('/login');
                    return;
                }

                const { data, error } = await supabase
                    .from('profiles')
                    .select('full_name')
                    .eq('id', user.id)
                    .single();

                if (error) throw error;
                if (data) setUserName(data.full_name);
            } catch (err) {
                console.error("Profile fetch error:", err.message);
            } finally {
                setIsUserLoading(false);
            }
        };
        fetchProfile();
    }, [navigate]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    // --- DATABASE SUBMISSION (INSERT OR UPDATE) ---
    const handleConfirmBooking = async () => {
        setIsSaving(true);
        setBookingError(null);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                toast.error("Please log in to book an appointment");
                navigate('/login');
                return;
            }

            const formattedDate = `${currentYear}-${(monthIndex + 1).toString().padStart(2, '0')}-${selectedDate.toString().padStart(2, '0')}`;

            // --- DUPLICATE BOOKING CHECK (new bookings only) ---
            if (!rescheduleData) {
                // Check 1: Same user already has this slot
                const { data: ownConflict } = await supabase
                    .from('appointments')
                    .select('id')
                    .eq('user_id', user.id)
                    .eq('appointment_date', formattedDate)
                    .eq('appointment_time', selectedTime)
                    .not('status', 'in', '("CANCELLED","EXPIRED")')
                    .maybeSingle();

                if (ownConflict) {
                    setBookingError('You already have an appointment at this date and time. Please choose a different schedule.');
                    setIsSaving(false);
                    return;
                }

                // Check 2: Another client already booked this slot (global conflict)
                const { data: globalConflict } = await supabase
                    .from('appointments')
                    .select('id')
                    .eq('appointment_date', formattedDate)
                    .eq('appointment_time', selectedTime)
                    .not('status', 'in', '("CANCELLED","EXPIRED")')
                    .maybeSingle();

                if (globalConflict) {
                    setBookingError('This time slot has just been taken by another client. Please select a different time.');
                    setIsSaving(false);
                    // Refresh booked slots so the UI reflects the latest state
                    const { data: refreshed } = await supabase
                        .from('appointments')
                        .select('appointment_time')
                        .eq('appointment_date', formattedDate)
                        .not('status', 'in', '("CANCELLED","EXPIRED")');
                    if (refreshed) setBookedSlots(refreshed.map(a => a.appointment_time));
                    return;
                }
            }

            let result;

            if (rescheduleData) {
                // --- UPDATE LOGIC ---
                result = await supabase
                    .from('appointments')
                    .update({
                        purpose: `${purpose} Medical`,
                        appointment_date: formattedDate,
                        appointment_time: selectedTime,
                        status: 'PENDING' // Reset to pending for staff re-verification
                    })
                    .eq('id', rescheduleData.id)
                    .select();
            } else {
                // --- INSERT LOGIC ---
                result = await supabase
                    .from('appointments')
                    .insert([
                        {
                            user_id: user.id,
                            purpose: `${purpose} Medical`,
                            appointment_date: formattedDate,
                            appointment_time: selectedTime,
                            payment_method: paymentMethod,
                            amount: 600,
                            status: 'PENDING'
                        }
                    ])
                    .select();
            }

            if (result.error) throw result.error;

            if (result.data && result.data[0]) {
                const aptId = result.data[0].id;
                setAppointmentId(aptId.slice(0, 8).toUpperCase());

                // --- QR CODE GENERATION (encodes only the appointment ID) ---
                try {
                    const qrDataUrl = await QRCode.toDataURL(aptId, {
                        width: 280,
                        margin: 2,
                        color: { dark: '#000000', light: '#ffffff' }
                    });
                    setQrCodeDataUrl(qrDataUrl);

                    // Store QR code in Supabase appointments table
                    await supabase
                        .from('appointments')
                        .update({ qr_code: qrDataUrl })
                        .eq('id', aptId);
                } catch (qrErr) {
                    console.error('QR Code generation error:', qrErr);
                    // Non-blocking — booking still succeeds even if QR fails
                }
            }

            setCurrentStep(4);
        } catch (error) {
            console.error("Booking Error:", error);
            toast.error("Error saving appointment: " + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    // --- CALENDAR & TIME HELPERS ---
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

    const paymentOptions = [
        { id: 'gcash', name: 'GCash', img: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/GCash_logo.svg' },
        { id: 'maya', name: 'Maya', img: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Maya_logo.7ca0979f.png' },
        { id: 'cash', name: 'Cash / Clinic', img: 'https://www.svgrepo.com/show/475631/money-cash.svg' }
    ];

    const selectedPaymentData = paymentOptions.find(o => o.id === paymentMethod);

    return (
        <PageTransition>
            <ClientLayout title={rescheduleData ? 'Reschedule Appointment' : 'Book Appointment'}>
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 w-full max-w-7xl mx-auto">
                    <div className="flex-1 space-y-8 md:space-y-12">
                        {currentStep < 4 && (
                            <>
                                <header className="book-header">
                                    <h1 className="page-title">{rescheduleData ? 'Reschedule Appointment' : 'Book an Appointment'}</h1>
                                    <p className="book-step-text">Step {currentStep} of 4</p>
                                </header>
                                <div className="stepper flex-wrap gap-y-4">
                                    {['PURPOSE', 'DATE & TIME', 'PAYMENT', 'CONFIRM'].map((label, idx) => (
                                        <div key={label} className="flex items-center gap-2 md:gap-3">
                                            <div className={`stepper-circle ${currentStep >= idx + 1 ? 'stepper-circle--active' : 'stepper-circle--inactive'}`}>
                                                {currentStep > idx + 1 ? <Check size={14} /> : idx + 1}
                                            </div>
                                            <span className={`stepper-label hidden sm:inline-block ${currentStep >= idx + 1 ? 'text-black' : 'text-slate-400'}`}>{label}</span>
                                            {idx !== 3 && <div className={`stepper-connector hidden md:block ${currentStep > idx + 1 ? 'bg-black' : 'bg-slate-100'}`} />}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* STEP 1: PURPOSE */}
                        {currentStep === 1 && (
                            <section className="step-animate-fade">
                                <h3 className="section-title mb-6"><ClipboardList size={20} /> Step 1: Purpose</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {['Student', 'Non-Professional', 'Professional', 'Conversion'].map((p) => (
                                        <button key={p} onClick={() => setPurpose(p)} className={`purpose-card w-full text-left ${purpose === p ? 'purpose-card--selected' : ''}`}>{p}</button>
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
                                                <ChevronLeft size={20} className="calendar-arrow" onClick={() => {
                                                    if (monthIndex === 0) { setMonthIndex(11); setCurrentYear(prev => prev - 1); }
                                                    else { setMonthIndex(prev => prev - 1); }
                                                }} />
                                                <ChevronRight size={20} className="calendar-arrow" onClick={() => {
                                                    if (monthIndex === 11) { setMonthIndex(0); setCurrentYear(prev => prev + 1); }
                                                    else { setMonthIndex(prev => prev + 1); }
                                                }} />
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
                                                return <button key={day} disabled={disabled} onClick={() => setSelectedDate(day)} className={`calendar-day ${selectedDate === day ? 'calendar-day--selected' : disabled ? 'calendar-day--disabled' : ''}`}>{day}</button>;
                                            })}
                                        </div>
                                    </div>
                                </section>
                                <section className="space-y-6">
                                    <h3 className="section-title"><Clock size={20} /> Select Time</h3>
                                    <div className="time-slots-grid">
                                        {isLoadingSlots ? (
                                            <p className="text-slate-400 text-sm col-span-3">Loading availability...</p>
                                        ) : (
                                            timeSlots.map(time => {
                                                const isBooked = bookedSlots.includes(time);
                                                return (
                                                    <button
                                                        key={time}
                                                        onClick={() => !isBooked && setSelectedTime(time)}
                                                        disabled={isBooked}
                                                        title={isBooked ? 'This slot is already taken' : ''}
                                                        className={`time-slot ${
                                                            isBooked
                                                                ? 'time-slot--booked'
                                                                : selectedTime === time
                                                                    ? 'time-slot--selected'
                                                                    : ''
                                                        }`}
                                                    >
                                                        {time}
                                                        {isBooked && <span className="time-slot-taken-label">Taken</span>}
                                                    </button>
                                                );
                                            })
                                        )}
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
                                <div className="confirm-icon"><Check size={48} strokeWidth={3} /></div>
                                <div className="text-center space-y-3">
                                    <h2 className="confirm-heading">{rescheduleData ? 'Reschedule Confirmed' : 'Booking Confirmed'}</h2>
                                    <p className="confirm-subtext">Thank you, {userName}! Your evaluation is {rescheduleData ? 'updated' : 'scheduled'}.</p>
                                </div>
                                <div className="card-confirmation">
                                    <ShieldCheck className="receipt-watermark" />
                                    <div className="receipt-header">
                                        <div className="space-y-1"><p className="receipt-id-label">ID</p><p className="receipt-id-value">#{appointmentId || 'MJY-88-PENDING'}</p></div>
                                        <div className="text-right"><p className="receipt-payment-label">Payment Method</p><p className="receipt-payment-value">{selectedPaymentData?.name || 'Pending'}</p></div>
                                    </div>
                                    <div className="receipt-details">
                                        <div className="grid grid-cols-2 gap-8">
                                            <div><p className="confirm-label">Date</p><p className="confirm-value">{months[monthIndex]} {selectedDate}, {currentYear}</p></div>
                                            <div><p className="confirm-label">Time</p><p className="confirm-value">{selectedTime}</p></div>
                                        </div>
                                        <div><p className="confirm-label">Purpose</p><p className="confirm-value">{purpose} Medical</p></div>
                                    </div>

                                    {/* --- QR CODE DISPLAY --- */}
                                    {qrCodeDataUrl && (
                                        <div className="qr-code-section">
                                            <div className="qr-code-container">
                                                <div className="qr-code-badge">
                                                    <QrCode size={14} />
                                                    <span>Check-in QR</span>
                                                </div>
                                                <img
                                                    src={qrCodeDataUrl}
                                                    alt="Appointment QR Code"
                                                    className="qr-code-image"
                                                />
                                                <p className="qr-code-instruction">
                                                    Please show this QR code to the staff at the clinic for check-in.
                                                </p>
                                                <button
                                                    onClick={() => {
                                                        const link = document.createElement('a');
                                                        link.download = `CareSync-QR-${appointmentId}.png`;
                                                        link.href = qrCodeDataUrl;
                                                        link.click();
                                                    }}
                                                    className="qr-download-btn"
                                                >
                                                    <Download size={16} /> Download QR Code
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="receipt-actions">
                                        <button className="confirm-btn-download"><Download size={16} /> Download</button>
                                        <button className="confirm-btn-print"><Printer size={16} /> Print</button>
                                    </div>
                                </div>
                                <Link to="/dashboard" className="back-to-dashboard flex items-center justify-center gap-2 mt-8 text-black font-medium hover:underline">
                                    <ChevronLeft size={14} /> Back to Dashboard
                                </Link>
                            </section>
                        )}

                        {/* FOOTER ACTIONS */}
                        {currentStep < 4 && (
                            <>
                            {bookingError && (
                                <div className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-sm font-bold shadow-sm mb-4">
                                    <AlertCircle size={18} className="shrink-0" />
                                    {bookingError}
                                </div>
                            )}
                            <div className="footer-actions">
                                <button onClick={() => setCurrentStep(prev => prev - 1)} className={`back-link ${currentStep === 1 ? 'invisible' : ''}`} disabled={isSaving}><ChevronLeft size={16} /> Back</button>
                                <div className="flex gap-4">
                                    {currentStep < 3 ? (
                                        <button onClick={() => setCurrentStep(prev => prev + 1)} className="btn-primary bg-black text-white hover:bg-slate-800">Next <ChevronRight size={18} /></button>
                                    ) : (
                                        <button onClick={handleConfirmBooking} disabled={!paymentMethod || isSaving} className="btn-confirm bg-black text-white hover:bg-slate-800 flex items-center justify-center gap-2">
                                            {isSaving ? <Loader2 className="animate-spin" size={18} /> : (rescheduleData ? "Update Appointment" : "Confirm and Continue")}
                                        </button>
                                    )}
                                </div>
                            </div>
                            </>
                        )}
                    </div>

                    {/* SUMMARY SIDEBAR */}
                    {currentStep < 4 && (
                        <aside className="w-full lg:w-80 space-y-6 lg:space-y-8 h-fit lg:sticky lg:top-8 mt-8 lg:mt-0 order-first lg:order-none mb-8 lg:mb-0">
                            <div className="summary-card">
                                <h4 className="form-label">Summary</h4>
                                <div className="space-y-4">
                                    <div className="summary-item"><p className="summary-item-label">Patient</p><p className="summary-item-value">{isUserLoading ? "..." : userName}</p></div>
                                    <div className="summary-item"><p className="summary-item-label">Purpose</p><p className="summary-item-value">{purpose} Medical</p></div>
                                    <div className="summary-item">
                                        <p className="summary-item-label">Schedule</p>
                                        <p className="summary-item-value">{months[monthIndex]} {selectedDate || '--'}, {currentYear}</p>
                                        <p className="text-[10px] text-slate-400 mt-1">{selectedTime}</p>
                                    </div>
                                </div>
                                <div className="summary-total-row flex justify-between items-center mt-6 pt-6 border-t border-slate-200"><p className="summary-total-label font-bold">Total</p><p className="summary-total-value font-black text-xl">₱{totalDue}.00</p></div>
                            </div>
                        </aside>
                    )}
                </div>
            </ClientLayout>
        </PageTransition>
    );
}