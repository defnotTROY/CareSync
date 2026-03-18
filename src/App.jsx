import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Providers & Protections
import { AuthProvider } from './lib/AuthContext.jsx';
import ProtectedRoute from './components/layout/ProtectedRoute.jsx';

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
import DoctorQueue from "./pages/doctor/DoctorQueue.jsx";
import Consultation from "./pages/doctor/Consultation.jsx";
import DoctorRecords from "./pages/doctor/DoctorRecords.jsx";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import StaffManagement from "./pages/admin/StaffManagement.jsx";
import RevenueTracker from "./pages/admin/RevenueTracker.jsx";
import Inventory from "./pages/admin/Inventory.jsx";
import Maintenance from "./pages/admin/Maintenance.jsx";

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
        <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['client', 'admin']}><ClientDashboard /></ProtectedRoute>} />
        <Route path="/book" element={<ProtectedRoute allowedRoles={['client', 'admin']}><BookAppointment /></ProtectedRoute>} />
        <Route path="/appointments" element={<ProtectedRoute allowedRoles={['client', 'admin']}><MyAppointments /></ProtectedRoute>} />

        {/* Staff / Reception Terminal Routes */}
        <Route path="/staff/dashboard" element={<ProtectedRoute allowedRoles={['staff', 'admin']}><StaffDashboard /></ProtectedRoute>} />
        <Route path="/staff/check-in" element={<ProtectedRoute allowedRoles={['staff', 'admin']}><ClientCheckIn /></ProtectedRoute>} />
        <Route path="/staff/queue" element={<ProtectedRoute allowedRoles={['staff', 'admin']}><ClientQueue /></ProtectedRoute>} />
        <Route path="/staff/appointments" element={<ProtectedRoute allowedRoles={['staff', 'admin']}><StaffAppointments /></ProtectedRoute>} />
        <Route path="/staff/payments" element={<ProtectedRoute allowedRoles={['staff', 'admin']}><PaymentRecords /></ProtectedRoute>} />
        <Route path="/staff/settings" element={<ProtectedRoute allowedRoles={['staff', 'admin']}><StaffSettings /></ProtectedRoute>} />
        <Route path="/staff/records" element={<ProtectedRoute allowedRoles={['staff', 'admin']}><ClientRecords /></ProtectedRoute>} />
        <Route path="/staff/new-client" element={<ProtectedRoute allowedRoles={['staff', 'admin']}><NewClient /></ProtectedRoute>} />

        {/* Doctor Terminal Routes */}
        <Route path="/doctor/dashboard" element={<ProtectedRoute allowedRoles={['doctor', 'admin']}><DoctorDashboard /></ProtectedRoute>} />
        <Route path="/doctor/queue" element={<ProtectedRoute allowedRoles={['doctor', 'admin']}><DoctorQueue /></ProtectedRoute>} />
        <Route path="/doctor/consultation" element={<ProtectedRoute allowedRoles={['doctor', 'admin']}><Consultation /></ProtectedRoute>} />
        <Route path="/doctor/records" element={<ProtectedRoute allowedRoles={['doctor', 'admin']}><DoctorRecords /></ProtectedRoute>} />

        {/* Admin Terminal Routes */}
        <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/staff" element={<ProtectedRoute allowedRoles={['admin']}><StaffManagement /></ProtectedRoute>} />
        <Route path="/admin/revenue" element={<ProtectedRoute allowedRoles={['admin']}><RevenueTracker /></ProtectedRoute>} />
        <Route path="/admin/inventory" element={<ProtectedRoute allowedRoles={['admin']}><Inventory /></ProtectedRoute>} />
        <Route path="/admin/maintenance" element={<ProtectedRoute allowedRoles={['admin']}><Maintenance /></ProtectedRoute>} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="w-full min-h-screen bg-white text-slate-900">
          <AnimatedRoutes />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;