import { Calendar, Shield, Siren, Pill, CheckCircle } from 'lucide-react';

const detailedFeatures = [
  {
    icon: Calendar,
    title: 'Book in Seconds',
    description: 'Finding and scheduling appointments with healthcare providers has never been easier. Our intelligent search connects you with top specialists in your area.',
    benefits: [
      'Search by specialty, location, and availability',
      'Real-time appointment booking',
      'Instant confirmation and reminders',
      'Easy rescheduling and cancellation',
    ],
    gradient: 'from-blue-500 to-blue-600',
  },
  {
    icon: Shield,
    title: 'Your Health History, Secured',
    description: 'Keep all your medical information in one secure, encrypted vault. Access your health records anytime, anywhere, with complete peace of mind.',
    benefits: [
      'Military-grade encryption for all data',
      'Store prescriptions, lab reports, and medical history',
      'Easy sharing with healthcare providers',
      'Automatic backup and sync across devices',
    ],
    gradient: 'from-teal-500 to-teal-600',
  },
  {
    icon: Siren,
    title: 'Instant Emergency Help',
    description: 'In critical moments, every second counts. Our SOS feature provides immediate access to emergency services and alerts your trusted contacts.',
    benefits: [
      'One-tap emergency alert system',
      'Automatic location sharing with emergency contacts',
      'Find nearest hospitals and clinics',
      'Critical medical information readily available for first responders',
    ],
    gradient: 'from-red-500 to-red-600',
  },
  {
    icon: Pill,
    title: 'Never Miss a Dose',
    description: 'Stay on track with your medications through intelligent reminders and comprehensive medication management tools.',
    benefits: [
      'Customizable medication schedules',
      'Smart notifications at the right time',
      'Track adherence and refill reminders',
      'Drug interaction warnings and information',
    ],
    gradient: 'from-purple-500 to-purple-600',
  },
];

export default function FeaturesDetailed() {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Features in <span className="text-gradient">Detail</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover how MedHelps empowers you with cutting-edge technology for comprehensive healthcare management
          </p>
        </div>

        <div className="space-y-24">
          {detailedFeatures.map((feature, index) => (
            <div
              key={index}
              className={`grid md:grid-cols-2 gap-12 items-center ${
                index % 2 === 1 ? 'md:flex-row-reverse' : ''
              }`}
            >
              <div className={`space-y-6 ${index % 2 === 1 ? 'md:order-2' : ''}`}>
                <div className={`w-20 h-20 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center shadow-lg`}>
                  <feature.icon className="w-10 h-10 text-white" />
                </div>

                <h3 className="text-3xl md:text-4xl font-bold text-charcoal">
                  {feature.title}
                </h3>

                <p className="text-lg text-gray-600 leading-relaxed">
                  {feature.description}
                </p>

                <ul className="space-y-3">
                  {feature.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={`${index % 2 === 1 ? 'md:order-1' : ''}`}>
                <div className={`relative bg-gradient-to-br ${feature.gradient} p-8 rounded-3xl shadow-2xl`}>
                  <div className="bg-white rounded-2xl p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-lg`}></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-2 bg-gray-100 rounded w-1/2"></div>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-2 bg-gray-200 rounded w-full"></div>
                            <div className="h-2 bg-gray-100 rounded w-2/3"></div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4">
                      <div className={`h-12 bg-gradient-to-r ${feature.gradient} rounded-xl opacity-20`}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
