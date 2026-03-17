import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from "./components/Navbar.jsx";
import Hero from "./components/Hero.jsx";
import Specializations from "./components/Specializations.jsx";
import WhyChooseUs from "./components/WhyChooseUs.jsx";
import Footer from "./components/Footer.jsx";
import Login from "./pages/Login.jsx"; // Import the Login page

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

function App() {
  return (
    <Router>
      <div className="w-full min-h-screen bg-white text-slate-900">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;