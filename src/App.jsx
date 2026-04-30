import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Providers & Protections
import { AuthProvider } from './lib/AuthContext.jsx';
import { ToastProvider } from './lib/ToastContext.jsx';
import ProtectedRoute from './components/layout/ProtectedRoute.jsx';

// Layout components (kept eager — used on landing page)
import Navbar from "./components/layout/Navbar.jsx";
import Footer from "./components/layout/Footer.jsx";
import ChatBot from "./components/ChatBot.jsx";

// Home components (kept eager — used on landing page)
import Hero from "./components/home/Hero.jsx";
import Specializations from "./components/home/Specializations.jsx";
import WhyChooseUs from "./components/home/WhyChooseUs.jsx";

// --- Lazy-loaded Pages ---
const Login = lazy(() => import("./pages/Login.jsx"));
const SignUp = lazy(() => import("./pages/SignUp.jsx"));
const ClientDashboard = lazy(() => import("./pages/ClientDashboard.jsx"));
const BookAppointment = lazy(() => import("./pages/BookAppointment.jsx"));
const MyAppointments = lazy(() => import("./pages/MyAppointments.jsx"));

// Staff Pages
const StaffDashboard = lazy(() => import("./pages/staff/StaffDashboard.jsx"));
const ClientCheckIn = lazy(() => import("./pages/staff/ClientCheckIn.jsx"));
const ClientQueue = lazy(() => import("./pages/staff/ClientQueue.jsx"));
const StaffAppointments = lazy(() => import("./pages/staff/StaffAppointments.jsx"));
const PaymentRecords = lazy(() => import("./pages/staff/PaymentRecords.jsx"));
const StaffSettings = lazy(() => import("./pages/staff/StaffSettings.jsx"));
const ClientRecords = lazy(() => import("./pages/staff/ClientRecords.jsx"));
const NewClient = lazy(() => import("./pages/staff/NewClient.jsx"));

// Doctor Pages
const DoctorDashboard = lazy(() => import("./pages/doctor/DoctorDashboard.jsx"));
const DoctorQueue = lazy(() => import("./pages/doctor/DoctorQueue.jsx"));
const Consultation = lazy(() => import("./pages/doctor/Consultation.jsx"));
const DoctorRecords = lazy(() => import("./pages/doctor/DoctorRecords.jsx"));
const DoctorSettings = lazy(() => import("./pages/doctor/DoctorSettings.jsx"));

// Admin Pages
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard.jsx"));
const StaffManagement = lazy(() => import("./pages/admin/StaffManagement.jsx"));
const RevenueTracker = lazy(() => import("./pages/admin/RevenueTracker.jsx"));
const Inventory = lazy(() => import("./pages/admin/Inventory.jsx"));
const Maintenance = lazy(() => import("./pages/admin/Maintenance.jsx"));

// --- UPDATED LOADER ---
function PageLoader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
      <div className="w-16 h-16 mb-4 relative">
        {/* Static Background Circle */}
        <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
        {/* Animated Spinning Top Border */}
        <div className="absolute inset-0 border-4 border-black rounded-full border-t-transparent animate-spin"></div>
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
        CareSync Terminals
      </p>
    </div>
  );
}

import LiveQueue from "./components/home/LiveQueue.jsx";

// --- KEEP YOUR LANDING PAGE BELOW IT ---
function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Specializations />
        <LiveQueue />
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
        <Route path="/doctor/settings" element={<ProtectedRoute allowedRoles={['doctor', 'admin']}><DoctorSettings /></ProtectedRoute>} />

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

// Only show chatbot on client-facing pages (not staff/doctor/admin)
function ClientChatBot() {
  const location = useLocation();
  const isStaffOrDoctorOrAdmin =
    location.pathname.startsWith('/staff') ||
    location.pathname.startsWith('/doctor') ||
    location.pathname.startsWith('/admin');

  if (isStaffOrDoctorOrAdmin) return null;
  return <ChatBot />;
}

function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <div className="w-full min-h-screen bg-white text-slate-900">
            <Suspense fallback={<PageLoader />}>
              <AnimatedRoutes />
            </Suspense>
            <ClientChatBot />
          </div>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;