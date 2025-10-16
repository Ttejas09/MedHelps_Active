import { Download, Users, Star } from 'lucide-react';

export default function SocialProof() {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white border-y border-gray-200">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center">
              <Download className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-3xl font-bold text-charcoal">10,000+</p>
              <p className="text-gray-600 font-medium">Downloads</p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-3xl font-bold text-charcoal">500+</p>
              <p className="text-gray-600 font-medium">Verified Doctors</p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center">
              <Star className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-3xl font-bold text-charcoal">4.8/5</p>
              <p className="text-gray-600 font-medium">User Rating</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
