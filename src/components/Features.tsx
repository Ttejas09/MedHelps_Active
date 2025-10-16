import { Calendar, Shield, Siren, Pill } from 'lucide-react';

const features = [
  {
    icon: Calendar,
    title: 'Query System',
    description: 'A real-time dashboard for submitting and managing user queries.',
    gradient: 'from-blue-500 to-blue-600',
    link: 'querySystem', // This tells the component where to navigate
  },
  {
    icon: Shield,
    title: 'AI Health Tracker',
    description: 'Get information and tips for common health concerns.',
    gradient: 'from-teal-500 to-teal-600',
    link: 'aiHealthTracker', // UPDATED: Link to the AI Health Tracker page
  },
  {
    icon: Siren,
    title: 'Instant Emergency Help',
    description: 'Send a real-time emergency alert to all users.',
    gradient: 'from-red-500 to-red-600',
    link: 'emergencyHelp', // UPDATED: Link to the Emergency Help page
  },
  {
    icon: Pill,
    title: 'Medicine Alerts',
    description: 'Track and manage your medication schedule.',
    gradient: 'from-purple-500 to-purple-600',
    link: 'medicineAlerts', // UPDATED: Link to the Medicine Alerts page
  },
];

// The component now accepts 'navigate' as a prop from App.tsx
export default function Features({ navigate }: { navigate: (page: string) => void }) {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            A New Standard for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-600">Your Health</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to take control of your healthcare journey, in one powerful app.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              // When a card with a 'link' is clicked, it calls the navigate function
              onClick={() => feature.link && navigate(feature.link)}
              className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer"
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-charcoal">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

