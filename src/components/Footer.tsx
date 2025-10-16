import { Activity, Mail, MapPin, Heart } from 'lucide-react';

export default function Footer() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-charcoal text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Activity className="w-8 h-8 text-accent" strokeWidth={2.5} />
              <span className="text-2xl font-bold">MedHelps</span>
            </div>
            <p className="text-gray-400">
              Intelligent Healthcare at Your Fingertips
            </p>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <button onClick={() => scrollToSection('home')} className="text-gray-400 hover:text-accent transition-colors">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('features')} className="text-gray-400 hover:text-accent transition-colors">
                  Features
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('about')} className="text-gray-400 hover:text-accent transition-colors">
                  About Us
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('contact')} className="text-gray-400 hover:text-accent transition-colors">
                  Contact
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-accent transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-accent transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-accent transition-colors">
                  HIPAA Compliance
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Contact Info</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-gray-400">
                <Mail className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <span>contact@medhelps.com</span>
              </li>
              <li className="flex items-start gap-2 text-gray-400">
                <MapPin className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <span>IIIT Nagpur, Maharashtra, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
          <p className="flex items-center justify-center gap-2">
            Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> by the MedHelps Team
          </p>
          <p className="mt-2">
            &copy; 2025 MedHelps. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
