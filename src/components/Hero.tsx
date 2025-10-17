import { Download, Smartphone } from 'lucide-react';

export default function Hero() {
  return (
    // CHANGE 1: Applied hero-background, made it full-screen (h-screen),
    // and removed old padding/background.
    <section id="home" className="h-screen px-4 sm:px-6 lg:px-8 hero-background">
      
      {/* CHANGE 2: Added classes to vertically center your content grid in the 'h-screen' section. */}
      <div className="max-w-7xl mx-auto h-full flex items-center">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in">
            
            {/* CHANGE 3: Added 'text-white' to make the heading visible. */}
            <h1 className="text-5xl md:text-6xl font-bold leading-tight text-white">
              Your Health,{' '}
              <span className="text-gradient">Simplified</span>
            </h1>
            
            {/* CHANGE 4: Changed text to 'text-gray-200' for visibility. */}
            <p className="text-xl text-gray-200 leading-relaxed">
              Book appointments, manage health records, and get emergency help instantly with our intelligent, all-in-one app.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {/* CHANGE 5: Changed buttons to use your 'gradient-primary' for a better look. */}
              <button className="flex items-center justify-center gap-3 gradient-primary text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:opacity-90 shadow-lg">
                <Download className="w-5 h-5" />
                Download on App Store
              </button>
              <button className="flex items-center justify-center gap-3 gradient-primary text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:opacity-90 shadow-lg">
                <Smartphone className="w-5 h-5" />
                Get it on Google Play
              </button>
            </div>
          </div>

          <div className="relative">
            {/* This mockup part is unchanged and will look great. */}
            <div className="absolute inset-0 gradient-primary opacity-20 blur-3xl rounded-full"></div>
            <div className="relative bg-gradient-to-br from-primary to-accent p-8 rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-500">
              <div className="bg-white rounded-2xl p-8 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 gradient-primary rounded-full"></div>
                  <div className="flex-1 h-4 bg-gray-200 rounded"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="h-24 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl"></div>
                  <div className="h-24 bg-gradient-to-br from-teal-100 to-teal-50 rounded-xl"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}