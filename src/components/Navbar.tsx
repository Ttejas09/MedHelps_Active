import { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';

// The component now accepts 'navigate' and 'onLogout' functions as props from App.tsx
interface NavbarProps {
  navigate: (page: string) => void;
  onLogout: () => void;
}

export default function Navbar({ navigate, onLogout }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // This function is for scrolling to sections on the homepage.
  // It first ensures the user is on the homepage, then scrolls.
  const scrollToSection = (id: string) => {
    navigate('home');
    
    // Use a short timeout to allow the homepage to render before scrolling
    setTimeout(() => {
        const element = document.getElementById(id);
        element?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-lg' : 'bg-white/80 backdrop-blur-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* UPDATED: This now uses the navigate function to go to the homepage */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('home')}>
            <Activity className="w-8 h-8 text-blue-600" strokeWidth={2.5} />
            <span className="text-2xl font-bold text-gray-800">MedHelps</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {/* UPDATED: This button now navigates directly to the homepage */}
            <button onClick={() => navigate('home')} className="text-charcoal hover:text-blue-600 transition-colors font-medium">
              Home
            </button>
            {/* These buttons will navigate to the homepage and then scroll to the correct section */}
            <button onClick={() => scrollToSection('features')} className="text-charcoal hover:text-blue-600 transition-colors font-medium">
              Features
            </button>
            <button onClick={() => scrollToSection('about')} className="text-charcoal hover:text-blue-600 transition-colors font-medium">
              About Us
            </button>
            <button onClick={() => scrollToSection('contact')} className="text-charcoal hover:text-blue-600 transition-colors font-medium">
              Contact
            </button>
          </div>

          {/* UPDATED: Replaced "Download App" with a "Logout" button */}
          <button 
            onClick={onLogout}
            className="bg-red-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-red-600 hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

