import { useState } from 'react';
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
import Login from './login'; // Your animated login page component

function App() {
  // --- STATE MANAGEMENT ---
  // The current page being displayed (e.g., 'home', 'aiHealthTracker')
  const [currentPage, setCurrentPage] = useState('home');
  // The authentication token. Initial state is read from localStorage.
  const [token, setToken] = useState<string | null>(localStorage.getItem('jwtToken'));

  // --- AUTHENTICATION HANDLERS ---
  
  /** 
   * Called by the Login component on a successful login.
   * @param newToken The JWT received from the backend.
   */
  const handleLoginSuccess = (newToken: string) => {
    // 1. Store the token in the browser's local storage for persistence
    localStorage.setItem('jwtToken', newToken);
    // 2. Update the application's state with the new token
    setToken(newToken);
    // 3. Navigate the user to the main landing page
    setCurrentPage('home');
  };
  
  /**
   * Handles user logout. Can be called from the Navbar or if a session expires.
   */
  const handleLogout = () => {
    // 1. Remove the token from local storage
    localStorage.removeItem('jwtToken');
    // 2. Clear the token from the application's state
    setToken(null);
    // 3. Send the user back to the home/login view
    setCurrentPage('home');
  };

  /**
   * Main navigation function passed to child components.
   * @param page The key of the page to navigate to.
   */
  const navigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo(0, 0); // Scroll to the top of the page on navigation
  };

  // --- RENDER LOGIC ---

  // If there is no token, the user is not logged in. Render the Login page.
  if (!token) {
    return <Login onLoginSuccess={handleLoginSuccess} navigate={navigate} />;
  }

  /**
   * Renders the main content of the page based on the `currentPage` state.
   * This is only called when the user is logged in.
   */
  const renderContent = () => {
    switch (currentPage) {
      case 'querySystem':
        // The '!' tells TypeScript that we know `token` is a string here, fixing the warning.
        return <QuerySystem navigate={navigate} token={token!} />;
      
      case 'aiHealthTracker':
        // Pass the handleLogout function so the tracker can log out on session expiry.
        return <AIHealthTracker navigate={navigate} onSessionExpired={handleLogout} />;
        
      case 'emergencyHelp':
        return <EmergencyHelp navigate={navigate} />;
        
      case 'medicineAlerts':
        return <MedicineAlerts navigate={navigate} />;
        
      case 'home':
      default:
        // This is the main landing page content.
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

  // If a token exists, render the main application layout.
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

