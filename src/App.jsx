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

// 1. Create a wrapper component to handle the location-based animation
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      {/* We add 'location' and a unique 'key' so Framer Motion tracks the swap */}
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
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