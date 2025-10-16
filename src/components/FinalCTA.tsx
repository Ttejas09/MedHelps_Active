import { Download, Smartphone } from 'lucide-react';

export default function FinalCTA() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Take Control of Your <span className="text-gradient">Health Journey</span> Today
        </h2>
        <p className="text-xl text-gray-600 mb-10">
          Join thousands of users who are already experiencing smarter healthcare
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="flex items-center justify-center gap-3 bg-black text-white px-8 py-4 rounded-xl font-semibold hover:bg-gray-800 transition-all duration-300 hover:scale-105 shadow-lg">
            <Download className="w-5 h-5" />
            Download on App Store
          </button>
          <button className="flex items-center justify-center gap-3 bg-black text-white px-8 py-4 rounded-xl font-semibold hover:bg-gray-800 transition-all duration-300 hover:scale-105 shadow-lg">
            <Smartphone className="w-5 h-5" />
            Get it on Google Play
          </button>
        </div>
      </div>
    </section>
  );
}
