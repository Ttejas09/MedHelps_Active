export default function Hero() {
  return (
    // Your background and layout classes are perfect.
    <section id="home" className="h-screen px-4 sm:px-6 lg:px-8 hero-background">
      <div className="max-w-7xl mx-auto h-full flex items-center">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          
          {/* ----- LEFT COLUMN (Your code - This is perfect) ----- */}
          <div className="space-y-8 animate-fade-in">
            <h1 className="text-5xl font-extrabold text-gray-900">
              Your Health,
              <span className="block text-gray-700"> Simplified</span>
            </h1>
            
            <p className="text-xl text-gray-700 leading-relaxed">
              Book appointments, manage health records, and get emergency help instantly with our intelligent, all-in-one place.
            </p>
            
            <div className="mt-10">
              <a 
                href="#ai-assistant" 
                className="gradient-primary text-white py-3 px-8 rounded-lg font-bold text-lg hover:opacity-90 transition-opacity transform hover:scale-105"
              >
                Get AI Advice Now
              </a>
            </div>
          </div>

          {/* ----- RIGHT COLUMN (Replaced with new Chat UI) ----- */}
          <div className="flex items-center justify-center p-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            {/* New Chat UI Mockup - Adjusted size and background */}
<div className="w-full max-w-lg bg-white/20 backdrop-blur-md rounded-xl p-8 shadow-2xl border border-white/10">
  {/* User Chat Bubble - Darker background, slightly larger text */}
  <div className="flex justify-end mb-6">
  <div className="bg-blue-600 text-white p-4 rounded-xl rounded-br-none max-w-[75%] shadow-lg">
    <p className="text-base">I have a persistent dry cough and a slight headache...</p>
  </div>
  </div>

  {/* AI Chat Bubble - Lighter background, better contrast, larger dots */}
  <div className="flex justify-start">
  <div className="bg-gray-100 text-gray-800 p-4 rounded-xl rounded-bl-none max-w-[75%] shadow-lg">
    {/* Typing Animation */}
    <div className="flex items-center space-x-2"> {/* Increased space-x */}
    <span className="w-2.5 h-2.5 bg-gray-600 rounded-full animate-bounce"></span> {/* Larger dots, darker color */}
    <span className="w-2.5 h-2.5 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
    <span className="w-2.5 h-2.5 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
    </div>
  </div>
  </div>
</div>
          </div>

        </div>
      </div>
    </section>
  );
}