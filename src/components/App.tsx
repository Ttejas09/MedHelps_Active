import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Hero from './Hero';
import SocialProof from './SocialProof';
import Features from './Features';
import HowItWorks from './HowItWorks';
import Testimonials from './Testimonials';
import FinalCTA from './FinalCTA';
import FeaturesDetailed from './FeaturesDetailed';
import About from './About';
import Contact from './Contact';
import Footer from './Footer';
import QuerySystem from './QuerySystem';
import AIHealthTracker from './AIHealthTracker';
import EmergencyHelp from './EmergencyHelp';
import MedicineAlerts from './MedicineAlerts';
import Login from './Login'; // Import the new Login page

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [token, setToken] = useState<string | null>(null);

  // Check if a token is stored in the browser on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem('medhelps_token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const handleLoginSuccess = (newToken: string) => {
    localStorage.setItem('medhelps_token', newToken);
    setToken(newToken);
  };
  
  const handleLogout = () => {
    localStorage.removeItem('medhelps_token');
    setToken(null);
    setCurrentPage('home'); // Go back to home on logout
  };

  const navigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  // If there's no token, show the Login page
  if (!token) {
    return <Login onLoginSuccess={handleLoginSuccess} navigate={navigate} />;
  }

  // --- If logged in, show the main application ---
  const renderContent = () => {
    switch (currentPage) {
      case 'querySystem':
        return <QuerySystem navigate={navigate} token={token} />;
      case 'aiHealthTracker':
        return <AIHealthTracker navigate={navigate} />;
      case 'emergencyHelp':
        return <EmergencyHelp navigate={navigate} token={token} />;
      case 'medicineAlerts':
        return <MedicineAlerts navigate={navigate} token={token} />;
      case 'home':
      default:
        return (
          <>
            <Hero />
            <SocialProof />
            <Features navigate={navigate} />
            <HowItWorks />
            <Testimonials />
            <FinalCTA />
            <FeaturesDetailed />
            <About />
            <Contact />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar navigate={navigate} onLogout={handleLogout} />
      <main>
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
}

export default App;

