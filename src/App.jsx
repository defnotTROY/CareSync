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
import MyAppointments from "./pages/MyAppointments.jsx"; // 1. Added MyAppointments import

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

// Wrapper component to handle location-based animations
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      {/* key={location.pathname} ensures the transition triggers on every route change */}
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Patient Dashboard Routes */}
        <Route path="/dashboard" element={<ClientDashboard />} />
        <Route path="/book" element={<BookAppointment />} />
        <Route path="/appointments" element={<MyAppointments />} /> {/* 2. Added Appointments Route */}
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