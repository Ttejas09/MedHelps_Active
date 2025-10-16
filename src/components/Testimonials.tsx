import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Patient',
    quote: 'MedHelps transformed how I manage my health. Booking appointments is now effortless, and having all my medical records in one place gives me peace of mind.',
    rating: 5,
  },
  {
    name: 'Dr. Rajesh Kumar',
    role: 'Cardiologist',
    quote: 'As a healthcare provider, I appreciate how MedHelps streamlines patient communication and record keeping. It truly bridges the gap between doctors and patients.',
    rating: 5,
  },
  {
    name: 'Amit Patel',
    role: 'Patient',
    quote: 'The emergency SOS feature is a lifesaver. Knowing I can get immediate help with just one tap makes me feel secure, especially when traveling.',
    rating: 5,
  },
  {
    name: 'Sneha Desai',
    role: 'Patient',
    quote: 'Never miss a medication again! The smart reminders have been incredibly helpful in maintaining my treatment schedule. Highly recommend this app!',
    rating: 5,
  },
];

export default function Testimonials() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const next = () => setCurrent((prev) => (prev + 1) % testimonials.length);
  const prev = () => setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-teal-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            What Our <span className="text-gradient">Users Say</span>
          </h2>
          <p className="text-xl text-gray-600">Real experiences from real people</p>
        </div>

        <div className="relative bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          <Quote className="absolute top-8 left-8 w-12 h-12 text-accent opacity-20" />

          <div className="relative min-h-[200px] flex flex-col justify-center">
            <p className="text-xl md:text-2xl text-gray-700 leading-relaxed mb-8 italic">
              "{testimonials[current].quote}"
            </p>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {testimonials[current].name.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-lg text-charcoal">{testimonials[current].name}</p>
                <p className="text-gray-600">{testimonials[current].role}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-8">
            <button
              onClick={prev}
              className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-charcoal" />
            </button>

            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrent(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === current ? 'w-8 gradient-primary' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-charcoal" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
