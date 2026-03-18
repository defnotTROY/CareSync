import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Layout components
import Navbar from "./components/layout/Navbar.jsx";
import Footer from "./components/layout/Footer.jsx";

// Home components
import Hero from "./components/home/Hero.jsx";
import Specializations from "./components/home/Specializations.jsx";
import WhyChooseUs from "./components/home/WhyChooseUs.jsx";

// Pages
import Login from "./pages/Login.jsx";
import SignUp from "./pages/SignUp.jsx";
import ClientDashboard from "./pages/ClientDashboard.jsx";
import BookAppointment from "./pages/BookAppointment.jsx";
import MyAppointments from "./pages/MyAppointments.jsx";

// Staff Pages
import StaffDashboard from "./pages/staff/StaffDashboard.jsx";
import ClientCheckIn from "./pages/staff/ClientCheckIn.jsx";
import ClientQueue from "./pages/staff/ClientQueue.jsx";
import StaffAppointments from "./pages/staff/StaffAppointments.jsx";
import PaymentRecords from "./pages/staff/PaymentRecords.jsx";
import StaffSettings from "./pages/staff/StaffSettings.jsx";
import ClientRecords from "./pages/staff/ClientRecords.jsx";
import NewClient from "./pages/staff/NewClient.jsx";

// Doctor Pages
import DoctorDashboard from "./pages/doctor/DoctorDashboard.jsx";
import DoctorQueue from "./pages/doctor/DoctorQueue.jsx"; // Added Doctor Queue Import
import Consultation from "./pages/doctor/Consultation.jsx";
import DoctorRecords from "./pages/doctor/DoctorRecords.jsx";

function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Specializations />
        <WhyChooseUs />
      </main>
      <Footer />
    </>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Patient Dashboard Routes */}
        <Route path="/dashboard" element={<ClientDashboard />} />
        <Route path="/book" element={<BookAppointment />} />
        <Route path="/appointments" element={<MyAppointments />} />

        {/* Staff / Reception Terminal Routes */}
        <Route path="/staff/dashboard" element={<StaffDashboard />} />
        <Route path="/staff/check-in" element={<ClientCheckIn />} />
        <Route path="/staff/queue" element={<ClientQueue />} />
        <Route path="/staff/appointments" element={<StaffAppointments />} />
        <Route path="/staff/payments" element={<PaymentRecords />} />
        <Route path="/staff/settings" element={<StaffSettings />} />
        <Route path="/staff/records" element={<ClientRecords />} />
        <Route path="/staff/new-client" element={<NewClient />} />

        {/* Doctor Terminal Routes */}
        <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
        <Route path="/doctor/queue" element={<DoctorQueue />} /> {/* Added Doctor Queue Route */}
        <Route path="/doctor/consultation" element={<Consultation />} />
        <Route path="/doctor/records" element={<DoctorRecords />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <div className="w-full min-h-screen bg-white text-slate-900">
        <AnimatedRoutes />
      </div>
    </Router>
  );
}

export default App;